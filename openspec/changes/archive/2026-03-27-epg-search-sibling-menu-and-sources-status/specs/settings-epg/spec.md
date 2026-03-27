## MODIFIED Requirements

### Requirement: EPG 源列表在设置页可查看与编辑

系统在设置中 SHALL 提供「EPG 配置」页面。用户打开该页面时，系统 MUST 通过 `GET /epg/sources` 加载配置；响应 **MUST** 支持形如 `{ "list": string[], "status": boolean }`（`list` 为 EPG 源 URL 字符串数组，`status` 表示当前是否允许用户触发「立即更新」类操作）。界面 MUST 根据 `list` 展示可编辑的源列表；用户 MUST 能够新增源条目与删除已有条目。用户点击保存配置时，系统 MUST 通过 `POST /epg/sources` 提交 JSON 请求体，且 **MUST** 采用 `{ "list": [...] }` 形式，其中 **`list` MUST 为字符串数组**（trim、可过滤空串）。若 `GET` 仅返回数组（无对象包装），实现 MAY 将其视为 `list` 且不提供 `status`（此时「立即更新」可见性按 design 保守策略处理）。

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

#### Scenario: 刷新成功

- **WHEN** `status === false` 且用户点击立即更新且刷新接口返回成功
- **THEN** 系统显示成功反馈

#### Scenario: 刷新失败

- **WHEN** 用户点击立即更新但刷新接口失败或网络错误
- **THEN** 系统显示错误反馈

#### Scenario: 不可更新时不展示按钮

- **WHEN** 加载完成后 `status` 不为 `false`（含 `true`、字段缺失、或非布尔）
- **THEN** 系统不渲染「立即更新 EPG」按钮
