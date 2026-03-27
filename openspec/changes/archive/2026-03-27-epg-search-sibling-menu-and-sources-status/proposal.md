## Why

「EPG 频道搜索」与「想看的频道」业务并列，放在子菜单下不符合预期；应作为侧栏**同级**入口。同时后端 `GET /epg/sources` 增加 **`status`** 字段表示是否允许触发同步，前端需在 **EPG 配置** 页把「立即更新」与「添加 EPG 源」放在同一操作区，并**仅在 `status === false` 时**展示该按钮，避免在不可更新状态下误导用户。

## What Changes

- **路由与菜单**：将「EPG 频道搜索」从「想看的频道」子菜单迁出，改为与「想看的频道」**同级**的顶层菜单项（`showMod` 与现有一致，如 `[0]`）；「想看的频道」恢复为**单一路由**（去掉 `children` / 折叠逻辑）。新路径建议如 **`/epg-channel-search`**（或项目内统一命名），并对旧路径 **`/favorite/epg-search`** 做重定向或兼容说明（见 design）。
- **`GET /epg/sources` 响应**：约定为 `{ "list": string[], "status": boolean }`（示例：`status: false` 时可点「立即更新」）。前端加载后保存 `status` 与 `list`；若缺省 `status`，实现上视为不可展示「立即更新」或与后端再确认（见 design Open Questions）。
- **EPG 配置页 UI**：「立即更新 EPG」按钮移到「添加 EPG 源」**同一行（或同一工具条）**；**仅当**最近一次成功拉取到的 `status === false`**（严格相等）**时渲染该按钮**；`status === true` 时不展示。

## Capabilities

### New Capabilities

- （无）行为调整归入下列既有能力。

### Modified Capabilities

- `favourite-epg-search`：菜单与路由从「想看的频道」子级改为**顶层同级**；页面仍通过 `GET /epg?channel=` 查询节目。
- `settings-epg`：`GET /epg/sources` 须解析 **`list` + `status`**；「立即更新」的**位置**与**可见性**（仅 `status === false`）纳入需求。

## Impact

- `src/router/routes.jsx`、`src/components/layout/menu.jsx`（移除 `openFavorite` 及收藏子折叠；新增顶层项与图标）。
- `src/components/favourite/epg-search.jsx`：路由挂载点变更；可选 `Navigate` 兼容旧 URL。
- `src/components/settings/epg.jsx`：`getEpgSources` 解析 `status`；布局调整；条件渲染「立即更新」。
- `ApiTaskService.getEpgSources` 若需类型/注释可同步；`zh.json` / `en.json` 若有菜单文案调整。
- 主 spec：`openspec/specs/favourite-epg-search/spec.md`、`openspec/specs/settings-epg/spec.md` 在归档时合并 delta。
