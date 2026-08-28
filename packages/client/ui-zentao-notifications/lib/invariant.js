//#region lib/types/invariant.js
/** Package-owned invariant companion for the ZenTao sidebar UI plugin. */
const PACKAGE_NAME = "@haoyu-qi/dsh-client-ui-zentao-notifications";
/** Cordis companion plugin name. */
const name = "client-ui-zentao-notifications-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** No runtime invariant: the browser plugin contributes one effect-owned shell overlay entry. */
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
