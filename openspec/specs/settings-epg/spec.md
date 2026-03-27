# settings-epg

> 由变更 `add-epg-settings`、`epg-string-list-and-search-under-favorite` 与 `epg-search-sibling-menu-and-sources-status` 合并至主 spec。

## Purpose
定义系统设置中 EPG 配置页面的功能，包括 EPG 源的管理、手动更新和缓存清理。
## Requirements
### Requirement: EPG 源列表在设置页可查看与编辑

系统在设置中 SHALL 提供「EPG 配置」页面。用户打开该页面时，系统 MUST 通过 `GET /epg/sources` 加载配置；响应 **MUST** 支持形如 `{ "list": string[], "status": boolean }`（`list` 为 EPG 源 URL 字符串数组，`status` 表示当前是否允许用户触发「立即更新」类操作），并且系统 MUST 能够处理响应被包裹在 `data` 字段中的情况（如 `{ "code": 200, "data": { "list": [...], "status": true } }`）。界面 MUST 根据 `list` 展示可编辑的源列表；用户 MUST 能够新增源条目与删除已有条目。用户点击保存配置时，系统 MUST 通过 `POST /epg/sources` 提交 JSON 请求体，且 **MUST** 采用 `{ "list": [...] }` 形式，其中 **`list` MUST 为字符串数组**（trim、可过滤空串）。若 `GET` 返回的 `list` 元素为对象，前端 MUST 在展示前归一化为 URL 字符串（例如读取 `url` 字段）；保存前 MUST 输出 `string[]`。若 `GET` 仅返回数组（无对象包装），实现 MAY 将其视为 `list` 且不提供 `status`（此时「立即更新」可见性按 design 保守策略处理）。

#### Scenario: 进入页面加载成功

- **WHEN** 用户导航至 EPG 配置页面且接口返回成功
- **THEN** 界面展示从响应中解析出的源列表（可为空列表），并保留解析出的 `status` 供控件可见性使用（若存在）

#### Scenario: 保存配置成功

- **WHEN** 用户修改列表后点击保存且 `POST /epg/sources` 返回成功
- **THEN** 系统向用户显示成功反馈（例如 Snackbar）

#### Scenario: 保存请求体格式

- **WHEN** 用户点击保存
- **THEN** 请求体为 JSON 对象，包含 `list` 属性，且 **`list` 的每个元素均为 string 类型**（可为 `[]`）

#### Scenario: 保存或加载失败

- **WHEN** `GET /epg/sources` 或 `POST /epg/sources` 失败
- **THEN** 系统向用户显示错误反馈且不谎称已保存

### Requirement: 用户可手动触发 EPG 数据更新

系统在 EPG 配置页面 SHALL 提供「立即更新 EPG」操作控件，且该控件 MUST 与「添加 EPG 源」控件处于**同一操作区域（同一行或紧邻工具条）**。该控件 **MUST 仅在** 最近一次成功加载的响应中 **`status === false`**（严格布尔假）时渲染；当 `status` 为 `true`、缺失或非布尔时，系统 MUST **不展示**该按钮。用户触发该操作时，系统 MUST 调用后端刷新接口（当前约定 **`POST /epg/sync`**），并根据结果显示成功或失败反馈；**推荐**在成功后再次请求 `GET /epg/sources` 以更新 `list` 与 `status`。
**此外，当「清除已爬取的 EPG 信息」操作正在进行时，该控件 MUST 处于禁用状态。**

#### Scenario: 刷新成功

- **WHEN** `status === false` 且用户点击立即更新且刷新接口返回成功
- **THEN** 系统显示成功反馈

#### Scenario: 刷新失败

- **WHEN** 用户点击立即更新但刷新接口失败或网络错误
- **THEN** 系统显示错误反馈

#### Scenario: 不可更新时不展示按钮

- **WHEN** 加载完成后 `status` 不为 `false`（含 `true`、字段缺失、或非布尔）
- **THEN** 系统不渲染「立即更新 EPG」按钮

#### Scenario: 清除缓存时禁用更新

- **WHEN** 用户触发了清除缓存操作且该操作尚未完成
- **THEN** 「立即更新 EPG」按钮处于禁用状态

### Requirement: 开发与构建环境可访问 EPG API

在本地 Vite 开发环境中，对以 `/epg` 为前缀的 API 请求 SHALL 被代理到与现有系统接口相同的后端目标（默认 `http://127.0.0.1:8089`），以便与 `GET /epg/sources`、`POST /epg/sources`、`GET /epg` 等路径一致工作。

#### Scenario: 开发代理

- **WHEN** 前端在开发模式下请求 `/epg/sources` 或 `/epg`
- **THEN** 请求被转发至配置的后端主机与端口

### Requirement: 用户可手动清除已爬取的 EPG 缓存

系统在 EPG 配置页面 SHALL 提供「清除已爬取的 EPG 信息」操作控件，且该控件 MUST 与「添加 EPG 源」控件处于同一操作区域。该控件 **MUST 仅在** 最近一次成功加载的响应中 **`status === true`**（严格布尔真）时渲染；当 `status` 为 `false`、缺失或非布尔时，系统 MUST **不展示**该按钮。
当用户点击该按钮时，系统 **MUST 弹出一个二次确认对话框**，询问用户是否确认清除。只有当用户在对话框中确认后，系统才 MUST 调用后端清除缓存接口（`GET /epg/cache`），并在操作期间展示加载状态。操作完成后，系统 MUST 根据结果显示成功或失败反馈。如果用户在对话框中选择取消，则不执行任何操作并关闭对话框。

#### Scenario: 触发清除缓存确认
- **WHEN** 用户点击「清除已爬取的 EPG 信息」按钮
- **THEN** 系统弹出一个确认对话框，询问用户是否确认清除

#### Scenario: 用户取消清除缓存
- **WHEN** 用户在确认对话框中点击取消
- **THEN** 对话框关闭，不调用清除缓存接口

#### Scenario: 清除缓存成功

- **WHEN** `status === true` 且用户在确认对话框中点击确认且接口返回成功
- **THEN** 系统在操作期间显示加载状态，完成后显示成功反馈

#### Scenario: 清除缓存失败

- **WHEN** 用户在确认对话框中点击确认但接口失败或网络错误
- **THEN** 系统在操作期间显示加载状态，完成后显示错误反馈

#### Scenario: 不可清除时不展示按钮

- **WHEN** 加载完成后 `status` 不为 `true`（含 `false`、字段缺失、或非布尔）
- **THEN** 系统不渲染「清除已爬取的 EPG 信息」按钮

