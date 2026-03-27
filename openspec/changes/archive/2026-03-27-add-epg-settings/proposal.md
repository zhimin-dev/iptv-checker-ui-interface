## Why

用户需要在设置中集中管理 EPG（电子节目单）数据源 URL，并能在保存后手动触发更新，以及按频道名查询当前节目信息。后端已提供 `/epg/sources` 与 `/epg` 接口，前端缺少对应页面与代理，无法完成闭环操作。

## What Changes

- 在「设置」下新增子菜单 **EPG 配置**（交互与「特殊字符替换」类似：进入页拉取列表、可增删行、底部保存）。
- 页面加载时 **GET `/epg/sources`** 初始化 EPG 源列表。
- 用户可 **新增 / 删除** 源条目（具体字段与后端约定一致，见 design）。
- **POST `/epg/sources`** 提交完整配置以保存，请求体为 **`{ list: [] }`**（数组项字段与 GET 返回一致，见 design）。
- 增加 **「立即更新 EPG」** 按钮，调用后端提供的刷新接口（路径在 design 中约定，若后端仅通过 GET 触发则按实际 API 调整）。
- 按钮下方增加 **频道搜索框**，输入频道标识后 **GET `/epg?channel=<name>`**（示例：`CCTV1`），展示返回的节目信息（列表或结构化展示，依响应格式）。

## Capabilities

### New Capabilities

- `settings-epg`: 设置中的 EPG 源列表维护、保存、手动刷新与按频道查询节目单展示。

### Modified Capabilities

- （无）当前仓库 `openspec/specs/` 下无既有能力规范，本次不修改既有 spec。

## Impact

- **前端**：`src/router/routes.jsx`（新子路由）、`src/components/layout/menu.jsx`（图标映射，若需）、新建 `src/components/settings/epg.jsx`（或等价路径）、`src/services/apiTaskService.js`（新 API 方法）。
- **构建**：`vite.config.js` 增加 `^/epg` 代理到 `http://127.0.0.1:8089`（与现有 `/system`、`/tasks` 等一致）。
- **文案**：`src/locals/zh.json`、`en.json` 新增 i18n key。
- **后端**：假定已提供所述端点；若刷新 EPG 的 HTTP 方法与路径与假设不一致，实现阶段以实际 OpenAPI/文档为准微调 tasks。
