/** Personal ZenTao floating work center backed by the Host REST gateway. */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import css from './ZentaoSidebar.module.css'

type Kind = 'task' | 'bug' | 'story'

interface ZentaoItem {
  id: string
  name?: string
  title?: string
  status?: string
  pri?: string
  severity?: string
  assignedTo?: string
  deadline?: string
  estimate?: string
  left?: string
  consumed?: string
  desc?: string
  steps?: string
  spec?: string
  stage?: string
  source?: string
  openedBy?: string
  product?: string
  project?: string
  execution?: string
  resolution?: string
  [key: string]: unknown
}

interface Config { server: string; account: string; hasToken: boolean }

interface Snapshot {
  profile: { server: string; account: string }
  tasks: ZentaoItem[]
  bugs: ZentaoItem[]
  stories: ZentaoItem[]
  fetchedAt: string
}

export type ZentaoSidebarProps = PropsRuntime<'shell.overlay'> & { rpc: ClientConnectionRpc }

const TYPE_LABEL: Record<Kind, string> = { task: '任务', bug: 'BUG', story: '需求' }
const STATUS: Record<Kind, Record<string, string>> = {
  task: { wait: '未开始', doing: '进行中', done: '已完成', pause: '已暂停', cancel: '已取消', closed: '已关闭' },
  bug: { active: '激活', resolved: '已解决', closed: '已关闭' },
  story: { draft: '草稿', reviewing: '评审中', active: '激活', changing: '变更中', closed: '已关闭' },
}
const PRI: Record<string, string> = { '1': 'P1 最高', '2': 'P2 高', '3': 'P3 中', '4': 'P4 低' }
const SEVERITY: Record<string, string> = { '1': 'S1 致命', '2': 'S2 严重', '3': 'S3 一般', '4': 'S4 轻微' }

function stripHtml(value: unknown): string {
  if (value == null) return ''
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+\n/g, '\n')
    .trim()
}

function lab(map: Record<string, string> | undefined, value: unknown): string {
  if (value == null || value === '') return ''
  return map?.[String(value)] ?? String(value)
}

function itemUrl(url: string, type: Kind, id: unknown): string {
  if (url === '') return ''
  return `${url}/${type}-view-${String(id)}.html`
}

type Field = [string, string, string?]

function describeItem(type: Kind, item: ZentaoItem): Field[] {
  const fields: Field[] = []
  if (type === 'task') {
    fields.push(['状态', lab(STATUS.task, item.status)])
    fields.push(['优先级', lab(PRI, item.pri)])
    if (item.estimate != null && item.estimate !== '') fields.push(['最初预计', item.estimate, 'h'])
    if (item.left != null && item.left !== '') fields.push(['预计剩余', item.left, 'h'])
    if (item.consumed != null && item.consumed !== '') fields.push(['总计消耗', item.consumed, 'h'])
    fields.push(['截止日期', item.deadline])
    fields.push(['指派给', item.assignedTo])
    fields.push(['所属项目', item.project])
    fields.push(['所属执行', item.execution])
    fields.push(['任务描述', stripHtml(item.desc)])
  } else if (type === 'bug') {
    fields.push(['状态', lab(STATUS.bug, item.status)])
    fields.push(['严重程度', lab(SEVERITY, item.severity)])
    fields.push(['优先级', lab(PRI, item.pri)])
    fields.push(['指派给', item.assignedTo])
    fields.push(['由谁创建', item.openedBy])
    fields.push(['所属产品', item.product])
    fields.push(['解决方案', item.resolution])
    fields.push(['重现步骤', stripHtml(item.steps)])
  } else {
    fields.push(['状态', lab(STATUS.story, item.status)])
    fields.push(['优先级', lab(PRI, item.pri)])
    fields.push(['所处阶段', item.stage])
    if (item.estimate != null && item.estimate !== '') fields.push(['预计', item.estimate, 'h'])
    fields.push(['指派给', item.assignedTo])
    fields.push(['来源', item.source])
    fields.push(['所属产品', item.product])
    fields.push(['需求描述', stripHtml(item.spec ?? item.desc)])
  }
  return fields.filter(([, value]) => value != null && String(value).trim() !== '')
}

function buildMarkdown(type: Kind, item: ZentaoItem, url: string): string {
  const title = item.name ?? item.title ?? '(无标题)'
  const lines = [`【禅道${TYPE_LABEL[type]} #${item.id ?? '-'}】${title}`, '']
  for (const [label, value, unit] of describeItem(type, item)) {
    lines.push(`- ${label}：${value}${unit !== undefined ? ` ${unit}` : ''}`)
  }
  if (url !== '') lines.push('', `禅道原地址：${itemUrl(url, type, item.id)}`)
  return lines.join('\n')
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.top = '0'
      ta.style.left = '0'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

/** Render the account login, automatic refresh controls, and personal task/Bug/story lists. */
export function ZentaoSidebar({ rpc }: ZentaoSidebarProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'list' | 'config' | 'detail'>('list')
  const [tab, setTab] = useState<Kind>('task')
  const [config, setConfig] = useState<Config>({ server: '', account: '', hasToken: false })
  const [data, setData] = useState<{ tasks: ZentaoItem[]; bugs: ZentaoItem[]; stories: ZentaoItem[] }>({ tasks: [], bugs: [], stories: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<{ type: Kind; item: ZentaoItem; loading: boolean; error?: string }>()
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ server: '', account: '', password: '', token: '' })
  const [formMsg, setFormMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(0)
  const fetching = useRef(false)
  const toastTimer = useRef<number>()

  const call = useCallback(async (endpoint: string, payload: unknown): Promise<unknown> => {
    const result = await rpc.call('/zentao', endpoint, payload)
    if (!result.ok) throw new Error(result.error.message)
    return result.value
  }, [rpc])

  const showToast = useCallback((message: string): void => {
    setToast(message)
    if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => { setToast(''); toastTimer.current = undefined }, 2600)
  }, [])

  const refresh = useCallback(async (): Promise<void> => {
    if (fetching.current) return
    fetching.current = true
    setLoading(true)
    setError('')
    try {
      const snapshot = await call('refresh', {}) as Snapshot
      setData({ tasks: snapshot.tasks ?? [], bugs: snapshot.bugs ?? [], stories: snapshot.stories ?? [] })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setLoading(false)
      fetching.current = false
    }
  }, [call])

  useEffect(() => {
    void (async () => {
      try {
        const current = await call('getConfig', {}) as Config
        setConfig(current)
        setForm({ server: current.server ?? '', account: current.account ?? '', password: '', token: '' })
      } catch {
        // No saved config; the login form drives configuration.
      }
    })()
  }, [call])

  useEffect(() => {
    if (config.hasToken) void refresh()
  }, [config.hasToken, refresh])

  useEffect(() => {
    if (autoRefresh <= 0) return
    const timer = window.setInterval(() => { void refresh() }, autoRefresh * 1000)
    return () => { window.clearInterval(timer) }
  }, [autoRefresh, refresh])

  const openDetail = (type: Kind, item: ZentaoItem): void => {
    setView('detail')
    setDetail({ type, item, loading: true })
    void (async () => {
      try {
        const result = await call('fetchDetail', { kind: type, id: item.id }) as { item?: ZentaoItem }
        setDetail(result.item !== undefined ? { type, item: result.item, loading: false } : { type, item, loading: false })
      } catch (reason) {
        setDetail({ type, item, loading: false, error: reason instanceof Error ? reason.message : String(reason) })
      }
    })()
  }

  const onDragStart = (event: React.DragEvent<HTMLElement>, type: Kind, item: ZentaoItem): void => {
    const markdown = buildMarkdown(type, item, config.server)
    event.dataTransfer.effectAllowed = 'copy'
    try { event.dataTransfer.setData('text/plain', markdown) } catch {}
    try { event.dataTransfer.setData('application/x-dsh-zentao-item', JSON.stringify({ type, id: item.id })) } catch {}
    showToast('拖到聊天输入框释放即可附带内容')
  }

  const doCopy = (type: Kind, item: ZentaoItem): void => {
    void copyText(buildMarkdown(type, item, config.server)).then(ok => {
      showToast(ok ? '已复制，粘贴到聊天框即可提问' : '复制失败，请手动复制')
    })
  }

  const submitConfig = (): void => {
    setSaving(true)
    setFormMsg('')
    void (async () => {
      try {
        await call('login', { server: form.server, account: form.account, password: form.password, token: form.token })
        setFormMsg('登录成功')
        setConfig({ server: form.server, account: form.account, hasToken: true })
        setView('list')
      } catch (reason) {
        setFormMsg(reason instanceof Error ? reason.message : String(reason))
      } finally {
        setSaving(false)
      }
    })()
  }

  const clearConfig = (): void => {
    void (async () => {
      await call('clearConfig', {})
      setConfig({ server: '', account: '', hasToken: false })
      setData({ tasks: [], bugs: [], stories: [] })
      setError('')
      setFormMsg('已清除配置')
    })()
  }

  const badges = (type: Kind, item: ZentaoItem): React.ReactNode[] => {
    const out: React.ReactNode[] = []
    if (item.id != null) out.push(<span key="id" className={css.badge}>#{item.id}</span>)
    const st = lab(STATUS[type], item.status)
    if (st !== '') {
      const done = item.status === 'done' || item.status === 'closed' || item.status === 'resolved'
      out.push(<span key="st" className={done ? `${css.badge} ${css.badgeDone}` : css.badge}>{st}</span>)
    }
    if (item.pri === '1') out.push(<span key="pri" className={`${css.badge} ${css.badgePri1}`}>P1</span>)
    else if (item.pri === '2') out.push(<span key="pri" className={`${css.badge} ${css.badgePri2}`}>P2</span>)
    else if (item.pri != null && item.pri !== '') out.push(<span key="pri" className={css.badge}>P{item.pri}</span>)
    if (type === 'bug' && (item.severity === '1' || item.severity === '2')) {
      out.push(<span key="sev" className={`${css.badge} ${item.severity === '1' ? css.badgeSev1 : css.badgeSev2}`}>S{item.severity}</span>)
    } else if (type === 'bug' && item.severity != null && item.severity !== '') {
      out.push(<span key="sev" className={css.badge}>S{item.severity}</span>)
    }
    return out
  }

  const renderTabs = (): React.ReactNode => {
    const tabs: Array<{ key: Kind; label: string; count: number }> = [
      { key: 'task', label: '任务', count: data.tasks.length },
      { key: 'bug', label: 'BUG', count: data.bugs.length },
      { key: 'story', label: '需求', count: data.stories.length },
    ]
    return (
      <div className={css.tabs}>
        {tabs.map(t => (
          <button key={t.key} className={tab === t.key ? `${css.tab} ${css.tabActive}` : css.tab} onClick={() => { setTab(t.key) }}>
            {t.label}<span className={css.cnt}>{t.count}</span>
          </button>
        ))}
      </div>
    )
  }

  const renderList = (): React.ReactNode => {
    if (!config.hasToken) {
      return (
        <div>
          <div className={css.empty}>尚未配置禅道账号</div>
          <div className={css.actions} style={{ justifyContent: 'center' }}>
            <button className={`${css.btn} ${css.primary}`} onClick={() => { setView('config') }}>去配置</button>
          </div>
        </div>
      )
    }
    const list = tab === 'task' ? data.tasks : tab === 'bug' ? data.bugs : data.stories
    return (
      <div>
        {renderTabs()}
        {error !== '' && <div className={css.error}>{error}</div>}
        {loading && <div className={css.empty}><span className={css.spin} />加载中…</div>}
        {!loading && list.length === 0 && error === '' && <div className={css.empty}>暂无指派给我的{TYPE_LABEL[tab]}</div>}
        <div>
          {list.map(item => (
            <div key={item.id} className={css.card} draggable onDragStart={e => { onDragStart(e, tab, item) }} onClick={() => { openDetail(tab, item) }}>
              <div className={css.cardTitle}>{item.name ?? item.title ?? '(无标题)'}</div>
              <div className={css.cardMeta}>{badges(tab, item)}</div>
              <div className={css.cardFoot}>
                <span className={css.dragHint}>⠿ 拖拽 · 点击详情</span>
                <a className={css.link} href={itemUrl(config.server, tab, item.id)} target="_blank" rel="noreferrer" onClick={e => { e.stopPropagation() }}>原地址</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDetail = (): React.ReactNode => {
    if (detail === undefined) return null
    const { type, item } = detail
    const fields = describeItem(type, item)
    const link = itemUrl(config.server, type, item.id)
    return (
      <div>
        <div className={css.actions} style={{ marginTop: 0 }}>
          <button className={css.btn} onClick={() => { setView('list') }}>← 返回列表</button>
          {link !== '' && <a className={css.btn} href={link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>在禅道打开 ↗</a>}
        </div>
        <div style={{ height: '8px' }} />
        <div className={css.detailTitle}>{item.name ?? item.title ?? '(无标题)'}</div>
        <div className={css.hint}>禅道{TYPE_LABEL[type]} #{item.id ?? '-'}</div>
        {detail.loading && <div className={css.empty}><span className={css.spin} />加载详情…</div>}
        {detail.error !== undefined && <div className={css.error}>{detail.error}</div>}
        <div className={css.actions}>
          <button className={`${css.btn} ${css.primary}`} draggable onDragStart={e => { onDragStart(e, type, item) }}>⣿ 拖拽到聊天框</button>
          <button className={css.btn} onClick={() => { doCopy(type, item) }}>复制内容</button>
        </div>
        <div className={css.hint}>按住左侧按钮拖到聊天输入框，即可附带该{TYPE_LABEL[type]}内容进行提问；或点击「复制内容」后粘贴。</div>
        <div style={{ height: '16px' }} />
        <div>
          {fields.map(([label, value, unit], index) => (
            <div key={index} className={css.field}>
              <div className={css.fieldLabel}>{label}</div>
              <div className={css.fieldValue}>{value}{unit !== undefined ? ` ${unit}` : ''}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderConfig = (): React.ReactNode => {
    return (
      <div>
        <div className={css.hint} style={{ marginBottom: '10px' }}>配置禅道服务地址与账号（基于禅道 REST API v2）。</div>
        <div className={css.formRow}>
          <label>禅道地址</label>
          <input className={css.input} placeholder="https://zentao.example.com" value={form.server} onChange={e => { setForm({ ...form, server: e.target.value }) }} />
        </div>
        <div className={css.formRow}>
          <label>账号</label>
          <input className={css.input} placeholder="admin" value={form.account} onChange={e => { setForm({ ...form, account: e.target.value }) }} />
        </div>
        <div className={css.formRow}>
          <label>密码</label>
          <input className={css.input} type="password" placeholder="登录密码" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }) }} />
        </div>
        <div className={css.formRow}>
          <label>或直接粘贴 Token（可选）</label>
          <input className={css.input} placeholder="已有 Token 可跳过密码" value={form.token} onChange={e => { setForm({ ...form, token: e.target.value }) }} />
        </div>
        {formMsg !== '' && <div className={formMsg.includes('成功') || formMsg.includes('已') ? css.hint : css.error}>{formMsg}</div>}
        <div className={css.actions}>
          <button className={`${css.btn} ${css.primary}`} onClick={submitConfig} disabled={saving}>{saving ? '登录中…' : '登录并保存'}</button>
          {config.hasToken && <button className={css.btn} onClick={clearConfig}>清除配置</button>}
        </div>
        <div className={css.hint}>账号密码仅用于登录换取 Token；Token 会保存到本地（~/.zentao-sidebar-config.json），不会上传。</div>
      </div>
    )
  }

  const renderBody = (): React.ReactNode => {
    if (view === 'config') return renderConfig()
    if (view === 'detail') return renderDetail()
    return renderList()
  }

  return (
    <div className={css.root}>
      {!open && <button className={css.fab} onClick={() => { setOpen(true) }}>禅道</button>}
      {open && (
        <div className={css.panel}>
          <div className={css.head}>
            <span className={css.title}>禅道 · 我的工作</span>
            <div className={css.headBtns}>
              <button className={css.btn} onClick={() => { setView('config') }}>设置</button>
              {view === 'list' && <button className={css.btn} onClick={() => { void refresh() }}>刷新</button>}
              {view === 'list' && (
                <select className={css.select} value={autoRefresh} onChange={e => { setAutoRefresh(Number(e.target.value)) }} title="自动刷新间隔">
                  <option value={0}>自动:关</option>
                  <option value={30}>30秒</option>
                  <option value={60}>1分</option>
                  <option value={300}>5分</option>
                  <option value={600}>10分</option>
                  <option value={1800}>30分</option>
                </select>
              )}
              <button className={css.btn} onClick={() => { setOpen(false) }}>×</button>
            </div>
          </div>
          <div className={css.body}>{renderBody()}</div>
        </div>
      )}
      {toast !== '' && <div className={css.toast}>{toast}</div>}
    </div>
  )
}
