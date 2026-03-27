## MODIFIED Requirements

### Requirement: EPG 源列表在设置页可查看与编辑

系统在设置中 SHALL 提供「EPG 配置」页面。用户打开该页面时，系统 MUST 通过 `GET /epg/sources` 加载当前 EPG 源列表并在界面中展示。用户 MUST 能够新增源条目与删除已有条目。用户点击保存配置时，系统 MUST 通过 `POST /epg/sources` 提交 JSON 请求体，且 **MUST** 采用 `{ "list": [...] }` 形式，其中 **`list` MUST 为 UTF-8 字符串数组**，每一项为一条 EPG 源 URL（与后端 `{"list":["url1","url2"]}` 一致）。若 `GET /epg/sources` 返回的 `list` 元素为对象，前端 MUST 在展示前归一化为 URL 字符串（例如读取 `url` 字段）再供编辑；保存前 MUST 再次序列化为字符串数组（trim，并可过滤空字符串）。

#### Scenario: 进入页面加载成功

- **WHEN** 用户导航至 EPG 配置页面且接口返回成功
- **THEN** 界面展示从 `GET /epg/sources` 得到的源列表（可为空列表）

#### Scenario: 保存配置成功

- **WHEN** 用户修改列表后点击保存且 `POST /epg/sources` 返回成功
- **THEN** 系统向用户显示成功反馈（例如 Snackbar）

#### Scenario: 保存请求体格式

- **WHEN** 用户点击保存
- **THEN** 请求体为 JSON 对象，包含 `list` 属性，且 **`list` 的每个元素均为 string 类型**（可为 `[]`）

#### Scenario: 保存或加载失败

- **WHEN** `GET /epg/sources` 或 `POST /epg/sources` 失败
- **THEN** 系统向用户显示错误反馈且不谎称已保存

## REMOVED Requirements

### Requirement: 用户可按频道查询节目信息

**Reason**: 该能力迁至「想看的频道」分组下的独立菜单「EPG 频道搜索」，不再在 EPG 配置页提供。

**Migration**: 用户使用侧栏「想看的频道」展开后进入「EPG 频道搜索」页面，通过 `GET /epg?channel=` 查询节目信息。
