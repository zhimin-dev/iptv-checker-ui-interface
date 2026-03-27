## Why

后端 `POST /epg/sources` 约定请求体为 **`{ "list": ["url1", "url2"] }`**（`list` 为 **字符串 URL 数组**），当前前端保存时发送的是对象数组（如 `{ url: "..." }`），与接口不一致。同时，频道节目查询与「想看的频道」使用场景更接近，应作为独立入口放在该分组下，而非留在「设置 → EPG 配置」页。

## What Changes

- **EPG 源保存格式**：加载后编辑仍可用行内 URL 输入；**保存时**将 `list` 规范为 **`string[]`**（去空行、trim），请求体 **`{ list: string[] }`**。`GET /epg/sources` 若返回对象数组，前端仅提取 `url` 字段映射为字符串列表再展示与保存。
- **设置 → EPG 配置页**：移除底部的「频道节目查询」区块（输入框、查询按钮、结果区）；保留源列表、保存、立即更新 EPG。
- **菜单与路由**：将「想看的频道」改为与「设置」类似的**可展开父级**（`showMod: [0]` 不变），子菜单包含：
  - 原「想看的频道」内容（路径需与现有一致或迁移为子路径，见 design）
  - 新菜单 **「EPG 频道搜索」**（独立页面，仅负责 `GET /epg?channel=` 查询与展示）。
- **i18n**：新增「EPG 频道搜索」等文案 key。

## Capabilities

### New Capabilities

- `favourite-epg-search`：在「想看的频道」分组下提供「EPG 频道搜索」页，按频道查询并展示 EPG 节目信息。

### Modified Capabilities

- `settings-epg`：保存请求体中 `list` MUST 为 URL **字符串数组**；从该能力中**移除**「在 EPG 配置页内提供频道节目查询」相关需求（查询迁至 `favourite-epg-search`）。

## Impact

- `src/components/settings/epg.jsx`：保存序列化、可选简化内部状态为 `string[]`；删除查询 UI。
- 新建页面组件（如 `src/components/favourite/epg-search.jsx` 或 `src/components/epg/EpgChannelSearch.jsx`）。
- `src/router/routes.jsx`：`/favorite` 调整为带 `children` 的路由结构。
- `src/components/layout/menu.jsx`：为「想看的频道」子菜单增加展开/折叠状态（当前仅 `openSettings` 处理设置子项，需扩展或泛化）。
- `openspec/specs/settings-epg/spec.md`：归档本变更时合并 delta。
- `zh.json` / `en.json`。
