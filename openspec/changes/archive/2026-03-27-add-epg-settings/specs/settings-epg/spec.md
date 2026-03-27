## ADDED Requirements

### Requirement: EPG 源列表在设置页可查看与编辑

系统在设置中 SHALL 提供「EPG 配置」页面。用户打开该页面时，系统 MUST 通过 `GET /epg/sources` 加载当前 EPG 源列表并在界面中展示。用户 MUST 能够新增源条目与删除已有条目。用户点击保存配置时，系统 MUST 通过 `POST /epg/sources` 提交 JSON 请求体，且 **MUST** 采用 `{ "list": [...] }` 形式，其中 `list` 为当前编辑后的源对象数组。

#### Scenario: 进入页面加载成功

- **WHEN** 用户导航至 EPG 配置页面且接口返回成功
- **THEN** 界面展示从 `GET /epg/sources` 得到的源列表（可为空列表）

#### Scenario: 保存配置成功

- **WHEN** 用户修改列表后点击保存且 `POST /epg/sources` 返回成功
- **THEN** 系统向用户显示成功反馈（例如 Snackbar）

#### Scenario: 保存请求体格式

- **WHEN** 用户点击保存
- **THEN** 请求体为包含 `list` 属性的 JSON 对象，且 `list` 为数组（可为空数组）

#### Scenario: 保存或加载失败

- **WHEN** `GET /epg/sources` 或 `POST /epg/sources` 失败
- **THEN** 系统向用户显示错误反馈且不谎称已保存

### Requirement: 用户可手动触发 EPG 数据更新

系统在 EPG 配置页面 SHALL 提供「立即更新 EPG」操作控件。用户触发该操作时，系统 MUST 调用后端刷新接口（当前约定 **`POST /epg/sync`**）以请求更新 EPG 数据，并根据结果显示成功或失败反馈。

#### Scenario: 刷新成功

- **WHEN** 用户点击立即更新且刷新接口返回成功
- **THEN** 系统显示成功反馈

#### Scenario: 刷新失败

- **WHEN** 刷新接口失败或网络错误
- **THEN** 系统显示错误反馈

### Requirement: 用户可按频道查询节目信息

系统在「立即更新」控件下方 SHALL 提供频道搜索输入能力。用户输入频道标识并发起查询时，系统 MUST 使用 `GET /epg?channel=<用户输入的频道标识>` 请求数据，并将返回的节目信息展示在页面中。

#### Scenario: 查询有结果

- **WHEN** 用户输入非空频道标识并触发查询且接口返回成功
- **THEN** 系统在页面中展示返回的节目信息（结构化或可读文本形式）

#### Scenario: 查询失败或空结果

- **WHEN** 接口错误或返回空数据
- **THEN** 系统展示明确提示（错误信息或「暂无数据」类文案），不崩溃

### Requirement: 开发与构建环境可访问 EPG API

在本地 Vite 开发环境中，对以 `/epg` 为前缀的 API 请求 SHALL 被代理到与现有系统接口相同的后端目标（默认 `http://127.0.0.1:8089`），以便与 `GET /epg/sources`、`POST /epg/sources`、`GET /epg` 等路径一致工作。

#### Scenario: 开发代理

- **WHEN** 前端在开发模式下请求 `/epg/sources` 或 `/epg`
- **THEN** 请求被转发至配置的后端主机与端口
