# @haoyu-qi/dsh-zentao

English | [中文](README.zh.md)

Installable Web-profile bundle for the DSH shell customization and floating ZenTao work center. One bundle layer mounts the loopback Host gateway and browser plugin together. The browser plugin activates the DSH dark/red palette, responsive shell decoration, ZenTao connection-state indicator, account login (with a product/test/dev/management role choice), automatic task/Bug/story retrieval, original links, composer drag references, and a per-item **Handle** action that starts a fresh conversation in the current project and runs a role-preset prompt. Removing the bundle removes both runtime rows and deactivates the bundle-scoped presentation.

## Install

From this checkout, build the repository once and add the bundle to the Web profile:

```sh
pnpm run build
node apps/cli/lib/bin.js plugin --profile web add ./packages/bundle/zentao ./packages/host/zentao-cli-gateway ./packages/client/ui-zentao-notifications
node apps/cli/lib/bin.js web
```

The source-checkout command lists the two local runtime package paths because a package-manager link does not install a linked workspace package's dependencies into the target profile. Only the bundle declares `dsh.bundle`; the Host and browser paths remain ordinary dependencies, so the profile still activates one bundle.

After publication, the profile command accepts the package name directly:

```sh
dsh plugin --profile web add @haoyu-qi/dsh-zentao
dsh web
```

The published-package command installs the bundle and its two runtime dependencies into the profile, then appends `@haoyu-qi/dsh-zentao` to `dsh.profile.bundles`. The Web profile must already include `@deepseek-ai/dsh-web-app`, because the bundle adds browser and Host rows to that surface.

## Remove

```sh
dsh plugin --profile web remove @haoyu-qi/dsh-zentao
```

The profile reconciler removes the bundle layer. Saved server/account convenience fields may remain in browser-local storage; passwords are never stored.

## Model Experience

The Host gateway also registers an agent-facing `zentao` tool, so the model can read your assigned ZenTao tasks/bugs/stories (action=mine, the default) or one item's detail (action=detail with kind + id) directly, reusing the same login as the sidebar. If the tool reports you are not logged in, log in from the sidebar first.

Each task/bug/story row and detail view has a **Handle** button. Clicking it builds a prompt from your login-time role (product/test/dev/management, four preset prompt templates) plus the item, then opens a fresh conversation in the current project and sends that prompt automatically, so the model starts processing it right away. Drag-to-chat and copy remain available as fallbacks.

Indirectly, through dsh-client-ui-zentao-notifications, which owns the draggable composer reference; the bundle itself is a patch-list carrier.

#### KV Cache effect

The bundle has no direct provider request; submitted composer text follows the existing conversation cache behavior.

## Known Limitations and Deferred Work

- **Web profile required** — installing into a profile without the Web bundle leaves the client overlay without its required slots and transport.
- **Published install depends on matching package versions** — the bundle, browser plugin, gateway, and Harness installation use the same release version.
