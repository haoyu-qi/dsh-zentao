//#region lib/types/invariant.js
const PACKAGE_NAME = "@haoyu-qi/dsh-zentao";
/** Cordis companion plugin name. */
const name = "zentao-bundle-invariant";
/** Service required before the companion can register. */
const inject = ["invariants"];
const install = () => {};
/** Register the package invariant companion.
* @param ctx - Cordis context carrying the invariant registry.
* @returns the registration disposer.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
