/** Loopback RPC gateway from the Web shell to the ZenTao REST API v2, plus an
 * agent-facing `zentao` tool that reuses the same login and fetch logic. */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { RpcResult } from '@deepseek-ai/dsh-host-apiproxy/api'
import type {} from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-subprocess'

export const name = 'zentao-rest-gateway'
export const inject = ['connection', 'subprocess', 'tools', 'systemPrompt']

interface LoginPayload { server: string; account: string; password: string | undefined; token: string | undefined; role: string | undefined }
interface Profile { server: string; account: string }
type Kind = 'task' | 'bug' | 'story'
/** Raw ZenTao row plus its resolved kind; fields are kept verbatim for the client. */
interface ZentaoItem { id: string; kind: Kind; [key: string]: unknown }
interface Snapshot { profile: Profile; tasks: ZentaoItem[]; bugs: ZentaoItem[]; stories: ZentaoItem[]; fetchedAt: string }

const CONFIG_PATH = join(homedir(), '.zentao-sidebar-config.json')
const OUTPUT_CAP = 2 * 1024 * 1024
const MINE_ITEM_LIMIT = 20

function failure(message: string): RpcResult<unknown> {
  return { ok: false, error: { code: 'internal', message, details: {} } }
}

function object(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (url === '') return ''
  url = url.replace(/\/+$/, '')
  url = url.replace(/\/api\.php(\/v[0-9]+)?$/i, '')
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = `https://${url}`
  return url
}

function loginPayload(value: unknown): LoginPayload {
  const row = object(value)
  if (row === undefined) throw new Error('登录参数缺失')
  const server = row.server
  const account = row.account
  if (typeof server !== 'string' || typeof account !== 'string') throw new Error('服务器地址和账号均为必填项')
  const password = typeof row.password === 'string' && row.password !== '' ? row.password : undefined
  const token = typeof row.token === 'string' && row.token.trim() !== '' ? row.token : undefined
  const role = typeof row.role === 'string' && row.role.trim() !== '' ? row.role.trim() : undefined
  if (token === undefined && password === undefined) {
    throw new Error('需要提供密码或 Token')
  }
  const normalized = normalizeUrl(server)
  if (normalized === '') throw new Error('服务器地址格式不正确')
  return { server: normalized, account: account.trim(), password, token, role }
}

function respError(data: Record<string, unknown>): string | undefined {
  const status = data.status
  if (status === 'fail' || status === 'failed' || status === 'error') {
    const message = data.message ?? data.reason ?? data.error
    return typeof message === 'string' ? message : '请求失败'
  }
  return undefined
}

function extractList(data: Record<string, unknown>, getter: string): unknown[] {
  const direct = data[getter]
  if (Array.isArray(direct)) return direct
  const inner = object(data.data)
  if (inner !== undefined && Array.isArray(inner[getter])) return inner[getter] as unknown[]
  return []
}

function dedupe(list: unknown[]): unknown[] {
  const seen = new Set<string>()
  const out: unknown[] = []
  for (const candidate of list) {
    const row = object(candidate)
    const id = row === undefined ? undefined : row.id
    if (id === undefined || id === null) { out.push(candidate); continue }
    const key = String(id)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(candidate)
  }
  return out
}

async function runWithLimit<T>(items: T[], limit: number, worker: (item: T) => Promise<unknown[]>): Promise<unknown[][]> {
  const results: unknown[][] = new Array(items.length)
  let next = 0
  const runOne = async (): Promise<void> => {
    while (true) {
      const index = next
      next += 1
      if (index >= items.length) return
      const item = items[index]
      if (item === undefined) return
      results[index] = await worker(item)
    }
  }
  const runners: Promise<void>[] = []
  const count = Math.min(limit, items.length)
  for (let i = 0; i < count; i += 1) runners.push(runOne())
  await Promise.all(runners)
  return results
}

/** Strip a ZenTao rich-HTML field (e.g. steps) down to readable plain text. */
function htmlToText(input: unknown): string {
  if (typeof input !== 'string' || input.trim() === '') return ''
  return input
    .replace(/<img[^>]*>/gi, '')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function itemLabel(item: ZentaoItem): string {
  const id = item.id ?? '?'
  const title = typeof item.title === 'string' && item.title !== '' ? item.title : typeof item.name === 'string' ? item.name : '（无标题）'
  const status = typeof item.status === 'string' && item.status !== '' ? ` [${item.status}]` : ''
  const assignee = typeof item.assignedTo === 'string' && item.assignedTo !== '' ? ` @${item.assignedTo}` : ''
  return `- #${id}${status} ${title}${assignee}`
}

/** Render the "assigned to me" snapshot as model-facing markdown. */
function formatMine(snap: Snapshot): string {
  const header = `禅道「指派给我」@ ${snap.fetchedAt}\nserver: ${snap.profile.server}  账号: ${snap.profile.account}\n`
  const section = (title: string, items: ZentaoItem[]): string => {
    if (items.length === 0) return `\n## ${title}（0）\n（无）\n`
    const shown = items.slice(0, MINE_ITEM_LIMIT).map(itemLabel).join('\n')
    const more = items.length > MINE_ITEM_LIMIT ? `\n… 共 ${items.length} 条，仅显示 ${MINE_ITEM_LIMIT} 条` : ''
    return `\n## ${title}（${items.length}）\n${shown}${more}\n`
  }
  return header + section('任务', snap.tasks) + section('Bug', snap.bugs) + section('需求', snap.stories)
}

/** Render one task/bug/story detail as model-facing markdown. */
function formatDetail(kind: string, item: Record<string, unknown>): string {
  const id = item.id ?? '?'
  const title = typeof item.title === 'string' && item.title !== '' ? item.title : typeof item.name === 'string' ? item.name : '（无标题）'
  const status = typeof item.status === 'string' ? item.status : ''
  const assignedTo = typeof item.assignedTo === 'string' ? item.assignedTo : ''
  const openedBy = typeof item.openedBy === 'string' ? item.openedBy : ''
  const header = `禅道 ${kind} #${id}\n标题：${title}\n状态：${status}\n`
  const meta = [assignedTo !== '' ? `指派给：${assignedTo}` : '', openedBy !== '' ? `创建人：${openedBy}` : '']
    .filter(Boolean)
    .join('\n')
  const steps = htmlToText(item.steps ?? item.desc)
  return header + (meta !== '' ? `${meta}\n` : '') + (steps !== '' ? `\n描述/重现步骤：\n${steps}\n` : '')
}

/** Register the loopback ZenTao REST RPC channel and the agent-facing `zentao` tool. */
export function apply(ctx: Context): void {
  const state = { url: '', account: '', token: '', role: '' }

  try {
    const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Record<string, unknown>
    if (typeof cfg.url === 'string') state.url = cfg.url
    if (typeof cfg.account === 'string') state.account = cfg.account
    if (typeof cfg.token === 'string') state.token = cfg.token
    if (typeof cfg.role === 'string') state.role = cfg.role
  } catch {
    // First run or malformed config; the client drives login.
  }

  const persist = (): void => {
    try {
      writeFileSync(CONFIG_PATH, JSON.stringify({ url: state.url, account: state.account, token: state.token, role: state.role }))
    } catch {
      // Local persistence is best-effort; a failed write must not break login.
    }
  }

  const curl = async (method: string, path: string, body: unknown, signal: AbortSignal): Promise<Record<string, unknown>> => {
    const url = `${state.url}/api.php/v2${path}`
    const args = ['curl', '-sS', '--max-time', '25']
    if (method !== 'GET') args.push('-X', method)
    if (body !== undefined) {
      args.push('-H', 'Content-Type: application/json')
      args.push('--data-binary', JSON.stringify(body))
    }
    if (state.token !== '') args.push('-H', `Token: ${state.token}`)
    args.push(url)
    const executable = await ctx.subprocess.resolveExecutable('curl', undefined, signal)
    const handle = ctx.subprocess.spawn({
      argv: [executable, ...args],
      cwd: process.cwd(),
      signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
      graceMs: 3_000,
      stdio: {
        stdin: 'ignore',
        stdout: { maxBytes: OUTPUT_CAP },
        stderr: { maxBytes: 64 * 1024 },
      },
    })
    const outcome = await handle.done
    const stdout = handle.collected.stdout?.readFrom(0).text ?? ''
    const stderr = handle.collected.stderr?.readFrom(0).text ?? ''
    if (outcome.exitCode !== 0) throw new Error(stderr.trim() || stdout.trim() || 'curl 执行失败')
    return JSON.parse(stdout) as Record<string, unknown>
  }

  const httpGet = async (path: string, signal: AbortSignal): Promise<Record<string, unknown>> => {
    const data = await curl('GET', path, undefined, signal)
    const error = respError(data)
    if (error !== undefined) throw new Error(error)
    return data
  }

  const list = async (path: string, getter: string, signal: AbortSignal): Promise<unknown[]> => {
    const data = await httpGet(path, signal)
    return extractList(data, getter)
  }

  const doLogin = async (request: LoginPayload, signal: AbortSignal): Promise<Snapshot> => {
    if (request.token !== undefined) {
      state.token = request.token
    } else {
      const data = await curl('POST', '/users/login', { account: request.account, password: request.password ?? '' }, signal)
      if (data.status !== 'success' || typeof data.token !== 'string') {
        const reason = typeof data.reason === 'string' ? data.reason : '登录失败，请检查账号密码'
        throw new Error(reason)
      }
      state.token = data.token
      const user = object(data.user)
      if (user !== undefined && typeof user.account === 'string') state.account = user.account
    }
    state.url = request.server
    state.account = request.account
    if (request.role !== undefined) state.role = request.role
    persist()
    return { profile: { server: state.url, account: state.account }, tasks: [], bugs: [], stories: [], fetchedAt: new Date().toISOString() }
  }

  const doFetchMine = async (signal: AbortSignal): Promise<Snapshot> => {
    if (state.url === '') throw new Error('未配置禅道地址')
    if (state.token === '') throw new Error('未登录，请先配置账号')
    const account = state.account

    const products = await list('/products?recPerPage=1000&pageID=1', 'products', signal)
    const executions = await list('/executions?recPerPage=1000&pageID=1', 'executions', signal)

    interface Job { kind: Kind; id: unknown }
    const jobs: Job[] = []
    for (const candidate of products) {
      const id = object(candidate)?.id
      if (id !== undefined) { jobs.push({ kind: 'story', id }); jobs.push({ kind: 'bug', id }) }
    }
    for (const candidate of executions) {
      const row = object(candidate)
      if (row === undefined || row.status === 'closed') continue
      if (row.id !== undefined) jobs.push({ kind: 'task', id: row.id })
    }

    const results = await runWithLimit(jobs, 6, async (job) => {
      let base: string
      let browse: string
      let getter: string
      if (job.kind === 'task') { base = `/executions/${String(job.id)}/tasks`; browse = 'unclosed'; getter = 'tasks' }
      else if (job.kind === 'bug') { base = `/products/${String(job.id)}/bugs`; browse = 'assigntome'; getter = 'bugs' }
      else { base = `/products/${String(job.id)}/stories`; browse = 'assignedtome'; getter = 'stories' }
      return await list(`${base}?browseType=${browse}&recPerPage=200&pageID=1`, getter, signal)
    })

    const tasks: unknown[] = []
    const bugs: unknown[] = []
    const stories: unknown[] = []
    for (let index = 0; index < jobs.length; index += 1) {
      const job = jobs[index]
      if (job === undefined) continue
      const rows = results[index] ?? []
      const target = job.kind === 'task' ? tasks : job.kind === 'bug' ? bugs : stories
      for (const row of rows) {
        if (object(row)?.assignedTo !== account) continue
        target.push(row)
      }
    }

    return {
      profile: { server: state.url, account: state.account },
      tasks: dedupe(tasks) as ZentaoItem[],
      bugs: dedupe(bugs) as ZentaoItem[],
      stories: dedupe(stories) as ZentaoItem[],
      fetchedAt: new Date().toISOString(),
    }
  }

  const refresh = async (signal: AbortSignal): Promise<Snapshot> => {
    if (state.token === '') throw new Error('请先登录禅道账户')
    return await doFetchMine(signal)
  }

  const fetchDetail = async (kind: string, id: string, signal: AbortSignal): Promise<{ kind: string; item: Record<string, unknown> }> => {
    const map: Record<string, string> = { task: '/tasks', bug: '/bugs', story: '/stories' }
    const getter: Record<string, string> = { task: 'task', bug: 'bug', story: 'story' }
    const base = map[kind]
    const key = getter[kind]
    if (base === undefined || key === undefined) throw new Error(`未知类型：${kind}（支持 task | bug | story）`)
    const data = await httpGet(`${base}/${String(id)}`, signal)
    const item = object(data)?.[key] ?? data
    return { kind, item: object(item) ?? {} }
  }

  ctx.effect(() => ctx.connection.rpc.handle('/zentao', async (endpoint, payload, signal) => {
    try {
      if (endpoint === 'getConfig') {
        return { ok: true, value: { server: state.url, account: state.account, hasToken: state.token !== '', role: state.role } }
      }
      if (endpoint === 'login') {
        return { ok: true, value: await doLogin(loginPayload(payload), signal) }
      }
      if (endpoint === 'refresh') {
        return { ok: true, value: await refresh(signal) }
      }
      if (endpoint === 'fetchDetail') {
        const row = object(payload)
        const kind = row?.kind
        const id = row?.id
        if (typeof kind !== 'string' || typeof id !== 'string') return failure('缺少 kind 或 id')
        return { ok: true, value: await fetchDetail(kind, id, signal) }
      }
      if (endpoint === 'clearConfig') {
        state.url = ''
        state.account = ''
        state.token = ''
        state.role = ''
        try { writeFileSync(CONFIG_PATH, JSON.stringify({ url: '', account: '', token: '', role: '' })) } catch {}
        return { ok: true, value: null }
      }
      return failure(`未知禅道操作：${endpoint}`)
    } catch (error) {
      return failure(error instanceof Error ? error.message : String(error))
    }
  }, { authority: 'loopback' }))

  // Agent-facing tool: lets the LLM read ZenTao directly, reusing the same login
  // state as the sidebar (`~/.zentao-sidebar-config.json`).
  ctx.systemPrompt.section({
    name: 'tool:zentao',
    order: 103,
    text: 'Use the zentao tool (action=mine, the default) to list the tasks, bugs and stories assigned to you; use action=detail with kind (task|bug|story) and id to read one item. The login comes from the ZenTao sidebar, so log in there first if the tool reports you are not logged in.',
  })
  ctx.tools.register(defineTool({
    name: 'zentao',
    description: "List the ZenTao tasks/bugs/stories assigned to you, or read one item's detail, through the saved ZenTao login.",
    parameters: {
      action: {
        type: 'string',
        description: "What to fetch: 'mine' (default) lists your assigned tasks/bugs/stories; 'detail' reads one task/bug/story.",
      },
      kind: {
        type: 'string',
        description: 'Only with action=detail: the item type (task | bug | story).',
      },
      id: {
        type: 'string',
        description: 'Only with action=detail: the item id.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          content: { type: 'string', required: true },
        },
      },
      render: (args, value) => [{ type: 'text', text: value.content }],
    },
    async execute(args, exec) {
      if (state.token === '') {
        return {
          content: '未登录禅道。请先在右侧「禅道」侧边栏登录（server / 账号 / Token），或在本机 ~/.zentao-sidebar-config.json 写入 {"url":"...","account":"...","token":"..."} 后重试。',
        }
      }
      const action = args.action ?? 'mine'
      if (action === 'mine') {
        const snap = await refresh(exec.signal)
        return { content: formatMine(snap) }
      }
      if (action === 'detail') {
        const kind = args.kind
        const id = args.id
        if (typeof kind !== 'string' || typeof id !== 'string') {
          return { content: 'action=detail 需要同时提供 kind（task|bug|story）和 id。' }
        }
        const detail = await fetchDetail(kind, id, exec.signal)
        return { content: formatDetail(detail.kind, detail.item) }
      }
      return { content: `未知 action：${action}（支持 mine / detail）` }
    },
  }))
}
