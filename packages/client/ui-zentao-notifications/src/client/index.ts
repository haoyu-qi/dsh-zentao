/** Register the ZenTao floating work-center sidebar overlay. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { createElement } from 'react'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { ZentaoSidebar } from './ZentaoSidebar.tsx'

/** Services required by the ZenTao sidebar plugin. */
export const inject = ['slots', 'connection']

/** Mount the additive frame overlay entry and enable the AVCON theme hook.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  const connection = (ctx as ClientContext & { connection: ConnectionHandle }).connection
  ctx.effect(() => {
    document.body.dataset['avconZentao'] = ''
    return () => { delete document.body.dataset['avconZentao'] }
  })
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'zentao-sidebar',
    order: 10,
  }, props => createElement(ZentaoSidebar, { ...props, rpc: connection.rpc })))
}
