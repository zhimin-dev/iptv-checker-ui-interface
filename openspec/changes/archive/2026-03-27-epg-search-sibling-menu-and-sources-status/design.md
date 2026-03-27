## Context

- 当前「想看的频道」为带子路由的父级（`openFavorite` + `Collapse`），子项含 `/favorite/collect` 与 `/favorite/epg-search`。
- `epg.jsx` 在加载后仅使用 `list`；「立即更新」独立在下方分隔区域。
- 后端将 `GET /epg/sources` 扩展为 `{ list, status }`。

## Goals / Non-Goals

**Goals:**

- 顶层侧栏两项并列：**想看的频道**、**EPG 频道搜索**（名称与 i18n 保持一致）。
- EPG 配置页：第一操作行：**添加 EPG 源** + **立即更新**（后者仅 `status === false`）。
- 兼容仅返回数组的旧响应（若有）：可归一化为 `list`，`status` 缺省时 **不展示**「立即更新」（保守策略，避免误显）。

**Non-Goals:**

- 不改变 `POST /epg/sources` body、`POST /epg/sync` 语义（除非后端另行约定）。
- 不重做全局侧栏架构（仍以现有 `routes` + `menu.jsx` 映射为主）。

## Decisions

1. **新顶层路径**  
   - 推荐使用 **`/epg-channel-search`**，避免与 `/favorite` 前缀耦合；菜单名仍用文案 key「EPG 频道搜索」。

2. **旧链接**  
   - 在路由层增加 **`/favorite/epg-search` → `/epg-channel-search`** 的 `Navigate` 重定向（或 `replace`），减少已收藏链接失效。

3. **`/favorite` 恢复**  
   - 删除 `children`，恢复单一 `element: <FavoriteSettings />`；删除 `/favorite/collect` 或将其与 index 合并（若不再需要 collect 路径，欢迎页 `/#/favorite` 保持即可）。

4. **`status` 判定**  
   - 使用 **`status === false`** 严格相等展示按钮；`true`、`undefined`、非布尔均 **不展示**（若产品要求 `true` 时显示「正在更新」等，可另开变更）。

5. **刷新后状态**  
   - 「立即更新」成功后可选择 **重新 GET `/epg/sources`** 刷新 `status`，以便后端将 `status` 置为 `true` 后隐藏按钮（若后端如此设计）；在 tasks 中实现。

## Risks / Trade-offs

- **[Risk] 去掉子菜单后用户找不到入口** → 同级项名称保持「EPG 频道搜索」+ 图标区分。  
- **[Risk] 旧后端无 `status`** → 不展示「立即更新」，需后端上线后再用。

## Migration Plan

- 部署后侧栏结构变化；书签 `/favorite/epg-search` 通过重定向恢复。

## Open Questions

1. `status` 缺省时是否改为默认展示「立即更新」？（当前设计：**不展示**。）
2. `POST /epg/sync` 成功后是否必须立刻重新拉取 `GET /epg/sources` 更新 `status`？（推荐：**是**。）
