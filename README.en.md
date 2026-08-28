# DSH-ZENTAO

[中文](README.md) | English

A floating ZenTao work center for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). A floating 「禅道」 button on the right edge opens a right-side panel listing the **tasks, bugs and stories** assigned to the signed-in account. Items can be dragged into the chat input, opened at their original ZenTao URL, and refreshed automatically. The login state persists locally.

## Features

- Floating 「禅道」 button with a right-slide work-center panel.
- Three tabs: **Tasks / Bugs / Stories** (ZenTao "assigned to me" data).
- Click a card to view its details (status, priority, severity, description / reproduction steps, and more).
- Every card and the detail view carry an 「原地址」 link to the original ZenTao page.
- Drag a card (or the 「拖拽到聊天框」 button) into the chat input to insert an editable Markdown reference.
- Selectable auto-refresh interval (30 s / 1 min / 5 min / 10 min / 30 min / off).
- The login state (server, account, Token) persists to `~/.zentao-sidebar-config.json` and is restored after updates or restarts.
- DSH dark / red themes through the `overlay/` tree.

## How it works

The plugin talks to the **ZenTao RESTful API v2** directly (no `zentao-cli` dependency):

- Login: `POST /api.php/v2/users/login` returns a Token; later requests send it in the `Token` header.
- Data: because some ZenTao versions do not expose the `/my/*` endpoints, the gateway iterates products and executions with scoped endpoints plus `browseType`:
  - Stories: `/products/{id}/stories?browseType=assignedtome`
  - Bugs: `/products/{id}/bugs?browseType=assigntome` (ZenTao's spelling variant for bugs)
  - Tasks: `/executions/{id}/tasks?browseType=unclosed` filtered by `assignedTo`
- The Host gateway runs `curl` subprocesses and raises the stdout cap to 2 MB so large task lists are not truncated by the 64 KB default.

No ZenTao passwords, Tokens, or API keys are committed to this repository. The password is used only to obtain a Token; the Token is stored only in `~/.zentao-sidebar-config.json` on the local machine and is never uploaded.

## Compatibility

The npm packages are built against DeepSeek Harness `0.1.1-rc.2`; the optional `overlay/` UI replacement still targets `0.1.0-rc.5`. The installer rejects a directory that is not a DeepSeek Harness checkout. Review upstream changes before applying the overlay to a different revision.

## Install from npm

```sh
dsh plugin --profile web add @haoyu-qi/dsh-zentao
dsh web
```

The bundle installs `@haoyu-qi/dsh-host-zentao-cli-gateway` and `@haoyu-qi/dsh-client-ui-zentao-notifications` as runtime dependencies. The Web profile must already include the official `@deepseek-ai/dsh-web-app` package.

## Install from source

```sh
git clone https://github.com/haoyu-qi/dsh-zentao.git
cd dsh-zentao
node scripts/install.mjs /absolute/path/to/deepseek-harness
```

Build Harness and activate the single bundle:

```sh
cd /absolute/path/to/deepseek-harness
pnpm install
pnpm run build
node apps/cli/lib/bin.js plugin --profile web add \
  ./packages/bundle/zentao \
  ./packages/host/zentao-cli-gateway \
  ./packages/client/ui-zentao-notifications
node apps/cli/lib/bin.js web
```

The three local paths are passed in one command because package-manager links do not install a linked workspace package's dependencies into the target profile. Only `@haoyu-qi/dsh-zentao` declares `dsh.bundle`, so the profile activates one bundle.

## Remove

```sh
node apps/cli/lib/bin.js plugin --profile web remove @haoyu-qi/dsh-zentao
```

Removing the profile bundle removes the ZenTao runtime rows. The local `~/.zentao-sidebar-config.json` may still hold the server, account, and Token; delete it manually if desired.

## Repository layout

- `packages/bundle/zentao` — installable profile bundle and Cordis patch.
- `packages/host/zentao-cli-gateway` — loopback Host gateway that fetches tasks/bugs/stories through the REST API v2 and persists the login state.
- `packages/client/ui-zentao-notifications` — the browser-side floating work-center sidebar.
- `overlay` — DSH dark / red themes and responsive layout overrides.
- `scripts/install.mjs` — copies the three packages and the overlay into the Harness checkout and registers TypeScript project references.

## Release

Install only the plugin packages into a DeepSeek Harness `dsh-v0.1.1-rc.2` checkout, build them, and sync the allowlisted `lib/` artifacts back into this repository:

```sh
node scripts/install.mjs /absolute/path/to/deepseek-harness --packages-only
cd /absolute/path/to/deepseek-harness
pnpm install --no-frozen-lockfile
pnpm run build:lib
cd /absolute/path/to/dsh-zentao
npm run sync:built -- /absolute/path/to/deepseek-harness
npm run check:release
```

Publish the Host gateway first, the Client UI second, and the bundle last, so both dependencies are downloadable before the public bundle appears.

## License

MIT. See [LICENSE](LICENSE).
