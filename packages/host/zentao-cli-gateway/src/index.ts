/** Loopback RPC gateway from the Web shell to the ZenTao REST API v2. */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { RpcResult } from '@deepseek-ai/dsh-host-apiproxy/api'
import type {} from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-subprocess'

export const name = 'zentao-rest-gateway'
export const inject = ['connection', 'subprocess']

interface LoginPayload { server: string; account: string; password: string | undefined; token: string | undefined }
interface Profile { server: string; account: string }
type Kind = 'task' | 'bug' | 'story'
/** Raw ZenTao row plus its resolved kind; fields are kept verbatim for the client. */
interface ZentaoItem { id: string; kind: Kind; [key: string]: unknown }
interface Snapshot { profile: Profile; tasks: ZentaoItem[]; bugs: ZentaoItem[]; stories: ZentaoItem[]; fetchedAt: string }

const CONFIG_PATH = join(homedir(), '.zentao-sidebar-config.json')
const OUTPUT_CAP = 2 * 1024 * 1024

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
  if (token === undefined && password === undefined) {
    throw new Error('需要提供密码或 Token')
  }
  const normalized = normalizeUrl(server)
  if (normalized === '') throw new Error('服务器地址格式不正确')
  return { server: normalized, account: account.trim(), password, token }
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

/** Register the loopback-only ZenTao REST RPC channel. */
export function apply(ctx: Context): void {
  const state = { url: '', account: '', token: '' }

  try {
    const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Record<string, unknown>
    if (typeof cfg.url === 'string') state.url = cfg.url
    if (typeof cfg.account === 'string') state.account = cfg.account
    if (typeof cfg.token === 'string') state.token = cfg.token
  } catch {
    // First run or malformed config; the client drives login.
  }

  const persist = (): void => {
    try {
      writeFileSync(CONFIG_PATH, JSON.stringify({ url: state.url, account: state.account, token: state.token }))
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

  ctx.effect(() => ctx.connection.rpc.handle('/zentao', async (endpoint, payload, signal) => {
    try {
      if (endpoint === 'getConfig') {
        return { ok: true, value: { server: state.url, account: state.account, hasToken: state.token !== '' } }
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
        if (typeof kind !== 'string') return failure('未知类型')
        const map: Record<string, string> = { task: '/tasks', bug: '/bugs', story: '/stories' }
        const getter: Record<string, string> = { task: 'task', bug: 'bug', story: 'story' }
        const base = map[kind]
        const key = getter[kind]
        if (base === undefined || key === undefined) return failure('未知类型')
        const data = await httpGet(`${base}/${String(id)}`, signal)
        const item = object(data)?.[key] ?? data
        return { ok: true, value: { item } }
      }
      if (endpoint === 'clearConfig') {
        state.url = ''
        state.account = ''
        state.token = ''
        try { writeFileSync(CONFIG_PATH, JSON.stringify({ url: '', account: '', token: '' })) } catch {}
        return { ok: true, value: null }
      }
      return failure(`未知禅道操作：${endpoint}`)
    } catch (error) {
      return failure(error instanceof Error ? error.message : String(error))
    }
  }, { authority: 'loopback' }))
}
