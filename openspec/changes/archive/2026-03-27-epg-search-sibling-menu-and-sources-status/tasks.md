## 1. 路由与侧栏

- [x] 1.1 将「想看的频道」恢复为无 `children` 的单一路由；移除 `openFavorite` 及与 `/favorite` 子菜单相关的 `Collapse` 分支
- [x] 1.2 新增顶层路由（如 `/epg-channel-search`）挂载现有 EPG 频道搜索组件，`showMod` 与「想看的频道」一致
- [x] 1.3 为旧路径 `/favorite/epg-search` 配置重定向至新路径（可选但推荐）
- [x] 1.4 在 `menu.jsx` 为顶层「EPG 频道搜索」注册图标（可复用 `LiveTvIcon` 等）

## 2. GET /epg/sources 与 EPG 配置 UI

- [x] 2.1 解析响应 `{ list, status }`；兼容仅数组的旧响应；维护 `status` 状态
- [x] 2.2 将「立即更新 EPG」移到「添加 EPG 源」旁同一操作行；**仅当 `status === false`** 时渲染
- [x] 2.3 `POST /epg/sync` 成功后重新 `GET /epg/sources` 更新 `list` 与 `status`（推荐）

## 3. 文案与 spec 归档

- [x] 3.1 确认 i18n 菜单名无需调整或补充顶层项说明
- [x] 3.2 实现完成后归档本变更并合并 `openspec/specs/favourite-epg-search/spec.md`、`openspec/specs/settings-epg/spec.md`
