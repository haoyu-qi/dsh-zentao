/** Package-owned invariant companion for the DSH ZenTao bundle. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "zentao-bundle-invariant";
/** Service required before the companion can register. */
export declare const inject: string[];
/** Register the package invariant companion.
 * @param ctx - Cordis context carrying the invariant registry.
 * @returns the registration disposer.
 */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map