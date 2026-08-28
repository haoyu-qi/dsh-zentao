import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export type ZentaoSidebarProps = PropsRuntime<'shell.overlay'> & {
    rpc: ClientConnectionRpc;
};
/** Render the account login, automatic refresh controls, and personal task/Bug/story lists. */
export declare function ZentaoSidebar({ rpc }: ZentaoSidebarProps): import("react").JSX.Element;
//# sourceMappingURL=ZentaoSidebar.d.ts.map