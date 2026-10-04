/** Register the ZenTao floating work-center sidebar overlay. */
import { createElement } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { ZentaoSidebar } from './ZentaoSidebar.tsx'

/** Services required by the ZenTao sidebar plugin. `uiWorkspace` owns session navigation. */
export const inject = ['slots', 'connection', 'sessions', 'workspaces', 'uiWorkspace']

/** Minimal conversation face we need: scope-addressed prompt send. */
interface ConversationSend { send: (text: string) => Promise<unknown> }

/** One row of the session list snapshot; `retainedBy.mainView` marks the session on screen. */
interface SessionRow { id: string; retainedBy?: { mainView?: number } }
/** Session list snapshot: rows are keyed by id; there is no separate `current` field. */
interface SessionsListSnapshot { byId: Record<string, SessionRow | undefined> }
/** A retained Agent-scoped context; `get` resolves the services mounted in that scope. */
interface SessionScope { get: (name: string) => unknown }
interface SessionsFace {
  list: { getSnapshot: () => SessionsListSnapshot }
  scope: (id: string) => SessionScope | undefined
  using: <T>(target: string, options: { source: string }, operation: () => Promise<T>) => Promise<T>
}
interface WorkspaceRow { workspaceId: string; sessionIds: string[] }
interface WorkspacesFace { list: { getSnapshot: () => { items: WorkspaceRow[] } } }
/** Navigation service: `connectWorkspace` resolves a session, `openSession` reveals it. */
interface UiWorkspaceFace {
  connectWorkspace: (workspaceId: string) => Promise<string>
  openSession: (sessionId: string) => void
}
/** Additive registration into a declared list slot. */
interface SlotsFace {
  inject: (name: string, register: () => unknown) => unknown
  register: (
    options: { name: string; id: string; order?: number },
    component: (props: Record<string, unknown>) => unknown,
  ) => unknown
}
/** The slice of the client root context this plugin actually uses (DSH 0.2.x service names). */
interface ClientContext {
  slots: SlotsFace
  connection: ConnectionHandle
  sessions: SessionsFace
  workspaces: WorkspacesFace
  uiWorkspace: UiWorkspaceFace
  effect: (callback: () => void | (() => void)) => unknown
}

/** Open a fresh conversation in the current workspace and send `text` verbatim. */
function buildHandlePrompt(ctx: ClientContext): (text: string) => Promise<void> {
  return async (text: string): Promise<void> => {
    const { sessions, workspaces, uiWorkspace } = ctx

    const list = sessions.list.getSnapshot()
    const ws = workspaces.list.getSnapshot()
    // DSH 0.2.x has no `current`/`recentWorkspaceId`: the session on screen is the
    // one the main view retains, and its workspace is the one that owns it.
    const current = Object.values(list.byId)
      .find((row) => row !== undefined && (row.retainedBy?.mainView ?? 0) > 0)?.id
    const target = (current === undefined
      ? undefined
      : ws.items.find((item) => item.sessionIds.includes(current))?.workspaceId) ?? ws.items[0]?.workspaceId
    if (target === undefined) throw new Error('未找到当前项目（workspace），请先打开一个项目')

    // `connectWorkspace` reuses a blank session or creates one, then `openSession` reveals it.
    const sessionId = await uiWorkspace.connectWorkspace(target)
    uiWorkspace.openSession(sessionId)

    // Sending requires the session scope to be live, so retain it for the duration of the send.
    await sessions.using(sessionId, { source: 'zentao' }, async () => {
      const scoped = sessions.scope(sessionId)
      if (scoped === undefined) throw new Error('新建会话失败：无法解析会话作用域')
      const conversation = scoped.get('conversation') as ConversationSend | undefined
      if (conversation === undefined) throw new Error('conversation 服务不可用，请确认 Web 对话插件已加载')
      await conversation.send(text)
    })
  }
}

/** Mount the additive frame overlay entry and enable the DSH theme hook.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  const handlePrompt = buildHandlePrompt(ctx)
  ctx.effect(() => {
    document.body.dataset['zentao'] = ''
    return () => { delete document.body.dataset['zentao'] }
  })
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'zentao-sidebar',
    order: 10,
  }, props => createElement(ZentaoSidebar, { ...props, rpc: ctx.connection.rpc, handlePrompt })))
}
