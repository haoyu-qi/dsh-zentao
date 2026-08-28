//#region lib/types/invariant.js
const PACKAGE_NAME = "@haoyu-qi/dsh-host-zentao-cli-gateway";
/** Cordis companion plugin name. */
const name = "host-zentao-cli-gateway-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** No runtime invariant: each validated RPC request owns one bounded CLI process. */
const install = () => {};
/** Register the gateway invariant companion.
* @param ctx - Host context carrying the invariant registry.
* @returns the registration disposer.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
