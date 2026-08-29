# DSH-ZENTAO

中文 | [English](README.en.md)

这是一个面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的禅道（ZenTao）悬浮工作台插件。它在网页右缘提供一个悬浮「禅道」按钮，点击后从右侧滑出面板，展示当前账户名下「指派给我」的**任务、Bug 与需求**，支持拖拽到对话输入框、查看原始链接、自动刷新，并把登录态持久化到本地。

## 功能

- 悬浮「禅道」按钮，点击从右侧滑出工作台面板；
- 三个标签页：**任务 / Bug / 需求**（对应禅道「指派给我」数据）；
- 点击卡片查看详情（状态、优先级、严重程度、描述 / 重现步骤等）；
- 每条卡片和详情页都带「原地址」链接，可直接打开禅道原始页面；
- 拖拽卡片（或「拖拽到聊天框」按钮）到对话输入框，自动插入可编辑的 Markdown 引用；
- 自动刷新间隔可选（30 秒 / 1 分 / 5 分 / 10 分 / 30 分 / 关闭）；
- 登录态（服务地址、账号、Token）持久化到本地 `~/.zentao-sidebar-config.json`，更新或重启后自动恢复；
- 登录时可选择职位（产品 / 测试 / 开发 / 管理），并预置四套角色提示词；
- 每条任务 / Bug / 需求（列表卡片与详情页）都带「处理」按钮，一键在当前项目新建对话并按角色预设提示词自动发出；
- Host 网关注册面向 agent 的 `zentao` 工具，模型可直接读取「指派给我」的数据或单条详情；
- DSH 深色 / 红色主题（通过 `overlay/` 覆盖上层界面样式）。

## 实现说明

插件通过 **禅道 RESTful API v2** 直接访问数据（不再依赖 `zentao-cli` 命令行）：

- 登录：`POST /api.php/v2/users/login` 换取 Token，后续请求通过 `Token` 头鉴权；
- 数据：由于部分禅道版本未开放 `/my/*` 接口，改为遍历产品与执行，用作用域接口 + `browseType` 过滤：
  - 需求：`/products/{id}/stories?browseType=assignedtome`
  - Bug：`/products/{id}/bugs?browseType=assigntome`（禅道 Bug 的拼写变体）
  - 任务：`/executions/{id}/tasks?browseType=unclosed` + 按 `assignedTo` 过滤
- Host 网关通过 `curl` 子进程发起请求，并把 stdout 上限提高到 2MB，避免任务列表响应被 64KB 默认上限截断；
- Host 网关还注册一个面向 agent 的 `zentao` 工具（`action=mine` 默认列出「指派给我」的任务 / Bug / 需求，`action=detail` + `kind` + `id` 读取单条详情），复用侧边栏的登录态。

仓库不包含任何禅道密码、Token 或 API 密钥。密码只用于换取 Token；Token 仅保存在本机 `~/.zentao-sidebar-config.json`，不会上传。

## 兼容性

当前 npm 包基于 DeepSeek Harness `0.1.1-rc.2` 构建；可选的 `overlay/` 界面覆盖仍针对 `0.1.0-rc.5`。安装器会拒绝非 DeepSeek Harness 目录。对其他版本应用 overlay 前，请先检查上游界面文件是否发生变化。

## 从 npm 安装

前置条件：已安装 [Node.js](https://nodejs.org/)、`pnpm`（`dsh plugin` 会转发给 pnpm）以及 DeepSeek Harness 的 `dsh` 命令。`dsh` 不是独立的 npm 包，而是包 `@deepseek-ai/dsh` 提供的命令；可全局安装后直接使用 `dsh`：

```sh
npm install -g pnpm @deepseek-ai/dsh
dsh plugin --profile web add @haoyu-qi/dsh-zentao
dsh web
```

如果不想全局安装，直接用 `npx @deepseek-ai/dsh` 代替上面的 `dsh`（不要用 `npx dsh`，那不是一个可执行的包）：

```sh
npx @deepseek-ai/dsh plugin --profile web add @haoyu-qi/dsh-zentao
npx @deepseek-ai/dsh web
```

组合包会安装 `@haoyu-qi/dsh-host-zentao-cli-gateway` 与 `@haoyu-qi/dsh-client-ui-zentao-notifications` 两个运行时依赖；`web` profile 首次使用时会自动初始化，其模板已包含官方的 `@deepseek-ai/dsh-web-app`。

## 从源码安装

克隆本仓库，并将插件应用到已有的 DeepSeek Harness 检出目录：

```sh
git clone https://github.com/haoyu-qi/dsh-zentao.git
cd dsh-zentao
node scripts/install.mjs /你的/deepseek-harness/绝对路径
```

进入 Harness 目录完成依赖安装、构建和 bundle 激活：

```sh
cd /你的/deepseek-harness/绝对路径
pnpm install
pnpm run build
node apps/cli/lib/bin.js plugin --profile web add \
  ./packages/bundle/zentao \
  ./packages/host/zentao-cli-gateway \
  ./packages/client/ui-zentao-notifications
node apps/cli/lib/bin.js web
```

源码安装时需要在一条命令中列出三个本地路径，因为包管理器的 link 不会把被链接 workspace 包的依赖安装到目标 profile。只有 `@haoyu-qi/dsh-zentao` 声明了 `dsh.bundle`，所以 profile 实际只会启用一个 bundle。

## 卸载

```sh
node apps/cli/lib/bin.js plugin --profile web remove @haoyu-qi/dsh-zentao
```

移除 bundle 后，禅道运行时记录会一起消失。本地 `~/.zentao-sidebar-config.json` 中可能仍保留服务地址、账号和 Token，可手动删除。

## 仓库结构

- `packages/bundle/zentao`：可安装的 profile bundle 与 Cordis patch；
- `packages/host/zentao-cli-gateway`：仅限回环访问的 Host 网关，通过 REST API v2 拉取任务 / Bug / 需求并持久化登录态；
- `packages/client/ui-zentao-notifications`：浏览器端悬浮工作台侧边栏；
- `overlay/`：DSH 深色 / 红色主题与响应式布局覆盖；
- `scripts/install.mjs`：把三个 package 与 overlay 拷贝进 Harness 检出目录并更新 tsconfig。

## 发布

在 DeepSeek Harness `dsh-v0.1.1-rc.2` 检出目录中只安装插件包并构建，然后把发布白名单中的 `lib/` 文件同步回来：

```sh
node scripts/install.mjs /你的/deepseek-harness/绝对路径 --packages-only
cd /你的/deepseek-harness/绝对路径
pnpm install --no-frozen-lockfile
pnpm run build:lib
cd /本仓库/绝对路径
npm run sync:built -- /你的/deepseek-harness/绝对路径
npm run check:release
```

发布顺序必须是 Host gateway、Client UI、最后是 bundle，确保公开 bundle 出现时两个依赖已经可下载。

## 许可证

MIT，见 [LICENSE](LICENSE)。
