/** Package-owned invariant companion for the ZenTao REST gateway. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "host-zentao-cli-gateway-invariant";
/** Service required before the companion can reserve package ownership. */
export declare const inject: string[];
/** Register the gateway invariant companion.
 * @param ctx - Host context carrying the invariant registry.
 * @returns the registration disposer.
 */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map