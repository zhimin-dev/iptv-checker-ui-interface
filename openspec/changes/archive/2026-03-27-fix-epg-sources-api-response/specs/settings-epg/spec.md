## MODIFIED Requirements

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
