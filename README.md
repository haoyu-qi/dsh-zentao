# DSH AVCON 禅道插件

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
- AVCON 深色 / 红色主题（通过 `overlay/` 覆盖上层界面样式）。

## 实现说明

插件通过 **禅道 RESTful API v2** 直接访问数据（不再依赖 `zentao-cli` 命令行）：

- 登录：`POST /api.php/v2/users/login` 换取 Token，后续请求通过 `Token` 头鉴权；
- 数据：由于部分禅道版本未开放 `/my/*` 接口，改为遍历产品与执行，用作用域接口 + `browseType` 过滤：
  - 需求：`/products/{id}/stories?browseType=assignedtome`
  - Bug：`/products/{id}/bugs?browseType=assigntome`（禅道 Bug 的拼写变体）
  - 任务：`/executions/{id}/tasks?browseType=unclosed` + 按 `assignedTo` 过滤
- Host 网关通过 `curl` 子进程发起请求，并把 stdout 上限提高到 2MB，避免任务列表响应被 64KB 默认上限截断。

仓库不包含任何禅道密码、Token 或 API 密钥。密码只用于换取 Token；Token 仅保存在本机 `~/.zentao-sidebar-config.json`，不会上传。

## 兼容性

当前 overlay 针对 DeepSeek Harness `0.1.0-rc.5` 包版本。安装器会拒绝非 DeepSeek Harness 目录。对其他版本使用前，请先检查上游界面文件是否发生变化。

## 从源码安装

克隆本仓库，并将插件应用到已有的 DeepSeek Harness 检出目录：

```sh
git clone https://github.com/haoyu-qi/dsh-avcon-zentao.git
cd dsh-avcon-zentao
node scripts/install.mjs /你的/deepseek-harness/绝对路径
```

进入 Harness 目录完成依赖安装、构建和 bundle 激活：

```sh
cd /你的/deepseek-harness/绝对路径
pnpm install
pnpm run build
node apps/cli/lib/bin.js plugin --profile web add \
  ./packages/bundle/avcon-zentao \
  ./packages/host/zentao-cli-gateway \
  ./packages/client/ui-zentao-notifications
node apps/cli/lib/bin.js web
```

源码安装时需要在一条命令中列出三个本地路径，因为包管理器的 link 不会把被链接 workspace 包的依赖安装到目标 profile。只有 `@deepseek-ai/dsh-avcon-zentao` 声明了 `dsh.bundle`，所以 profile 实际只会启用一个 bundle。

## 卸载

```sh
node apps/cli/lib/bin.js plugin --profile web remove @deepseek-ai/dsh-avcon-zentao
```

移除 bundle 后，禅道运行时记录会一起消失。本地 `~/.zentao-sidebar-config.json` 中可能仍保留服务地址、账号和 Token，可手动删除。

## 仓库结构

- `packages/bundle/avcon-zentao`：可安装的 profile bundle 与 Cordis patch；
- `packages/host/zentao-cli-gateway`：仅限回环访问的 Host 网关，通过 REST API v2 拉取任务 / Bug / 需求并持久化登录态；
- `packages/client/ui-zentao-notifications`：浏览器端悬浮工作台侧边栏；
- `overlay/`：AVCON 深色 / 红色主题与响应式布局覆盖；
- `scripts/install.mjs`：把三个 package 与 overlay 拷贝进 Harness 检出目录并更新 tsconfig。

## 许可证

MIT，见 [LICENSE](LICENSE)。
