/** Register the ZenTao floating work-center sidebar overlay. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { createElement } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { ZentaoSidebar } from './ZentaoSidebar.tsx'

/** Services required by the ZenTao sidebar plugin. */
export const inject = ['slots', 'connection']

/** Minimal conversation face we need: scope-addressed prompt send. */
interface ConversationSend { send: (text: string) => Promise<unknown> }

/** Open a fresh conversation in the current workspace and send `text` verbatim. */
function buildHandlePrompt(ctx: ClientContext): (text: string) => Promise<void> {
  return async (text: string): Promise<void> => {
    const sessions = ctx.sessions
    const workspaces = ctx.workspaces

    const ws = workspaces.list.getSnapshot()
    const current = sessions.list.getSnapshot().current
    const currentWorkspaceId = current === undefined
      ? undefined
      : ws.items.find((item) => item.sessionIds.includes(current))?.workspaceId
    const target = currentWorkspaceId ?? ws.recentWorkspaceId
    if (target === undefined) throw new Error('未找到当前项目（workspace），请先打开一个项目')

    const sessionId = await workspaces.connectWorkspace(target)
    sessions.open(sessionId)

    const scoped = sessions.scope(sessionId)
    if (scoped === undefined) throw new Error('新建会话失败：无法解析会话作用域')
    const conversation = scoped.get('conversation') as ConversationSend | undefined
    if (conversation === undefined) throw new Error('conversation 服务不可用，请确认 Web 对话插件已加载')
    await conversation.send(text)
  }
}

/** Mount the additive frame overlay entry and enable the DSH theme hook.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  const connection = (ctx as ClientContext & { connection: ConnectionHandle }).connection
  const handlePrompt = buildHandlePrompt(ctx)
  ctx.effect(() => {
    document.body.dataset['zentao'] = ''
    return () => { delete document.body.dataset['zentao'] }
  })
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'zentao-sidebar',
    order: 10,
  }, props => createElement(ZentaoSidebar, { ...props, rpc: connection.rpc, handlePrompt })))
}
