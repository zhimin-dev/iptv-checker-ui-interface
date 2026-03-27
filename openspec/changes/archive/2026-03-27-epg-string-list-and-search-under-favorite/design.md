## Context

- `epg.jsx` 保存时调用 `saveEpgSources({ list: toPayloadList(rows) })`，`toPayloadList` 产出 **对象数组**，与后端要求的 **`{ list: string[] }`** 不符。
- 「想看的频道」当前为单一路由 `path: "/favorite"` + `element: <FavoriteSettings />`；侧栏仅 **设置** 使用 `children` + `Collapse`，状态变量为 `openSettings`，点击带子项的父菜单只展开不导航。
- 主 spec `openspec/specs/settings-epg/spec.md` 仍将 `list` 描述为源对象数组，且把频道查询归在 EPG 配置页。

## Goals / Non-Goals

**Goals:**

- 保存 EPG 源时 **POST body** 严格为 `{"list":["url1",…]}`（非空字符串、trim；空串行不写入或过滤策略在实现中统一）。
- **GET /epg/sources** 兼容返回 `list` 为 `string[]` 或历史对象数组：若为对象则取 `url`（或其它约定字段）转成字符串再编辑。
- 从 EPG 配置页 **移除** 频道节目查询 UI。
- 「想看的频道」侧栏变为 **可展开父级**，子项包含原收藏配置页与 **「EPG 频道搜索」** 独立页（调用现有 `getEpgByChannel`）。

**Non-Goals:**

- 不改后端接口契约（除前端对齐外）。
- 不对侧栏做全局重构；优先以 **第二个 `openFavorite`（或与 `openSettings` 并列的布尔）** 镜像现有设置交互，必要时再提取通用「可展开菜单项」。

## Decisions

1. **路由结构**  
   - 将 `/favorite` 改为与 `/settings` 类似：**父级无 `element`**，仅 `children` + `handle`。  
   - 建议子路由：  
     - `index: true`，`element: <FavoriteSettings />`，`hideInMenu: true`（保持 `#/favorite` 直达收藏页，避免破坏书签）。  
     - `path: "/favorite/epg-search"`，`name: "EPG 频道搜索"`，`element: <EpgChannelSearch />`（新建组件）。  
   - 若需在子菜单中 **单独一行「想看的频道」** 与设置里「基础设置」对齐：可增加 `path: "/favorite/collect"` 等同 `FavoriteSettings`，并在菜单中显示；**或**仅展示「EPG 频道搜索」一项子菜单，主入口仍为点击展开后选 EPG（由产品偏好定夺）。**推荐**：子菜单两项——「想看的频道」→ `/favorite/collect`、`EPG 频道搜索`→`/favorite/epg-search`，`#/favorite` **index** 仍渲染 `FavoriteSettings` 或与 `/favorite/collect` 相同内容；实现可选用 `<Navigate replace />` 将 `/favorite` 重定向到 `/favorite/collect` 以统一高亮（可选）。

2. **侧栏状态**  
   - 新增 `openFavorite`（或按父 path 映射的展开 map）。  
   - `changePath`：若 `e.children` 且为设置 → 保持 `openSettings`；若为收藏父级 → 切换 `openFavorite`。  
   - `useEffect` 根据 `location.pathname` 匹配 `/favorite` 前缀时 `setOpenFavorite(true)` 并 `setNowSelectedMenu` 到对应 child。  
   - `Collapse`：`value.path === '/favorite' && value.children` 时使用 `in={openFavorite}`，子项 `ListItemButton` 与设置块同构；**图标**：为「EPG 频道搜索」选用 `SearchIcon` / `LiveTvIcon` 等并在 `menu.jsx` 注册字符串。

3. **保存 payload**  
   - `handleSave`：`list: rows.map(r => (typeof r === 'string' ? r : r.url).trim()).filter(Boolean)`（若内部已改为 `string[]` 则直接 `filter`）。  
   - 删除 `toPayloadList` 的对象形态输出。

4. **新页面**  
   - 从 `epg.jsx` 复制查询相关 state/UI 到 `EpgChannelSearch`（或拆共享 hook），仅保留频道输入 + 查询 + 结果 `pre`/表格。

## Risks / Trade-offs

- **[Risk] 菜单逻辑复制** → 设置与收藏两套 `if (value.path === '/settings')` 分支易发散；可抽小函数 `isExpandableParent(route)`。  
- **[Risk] 旧链接 `#/favorite`** → index 路由保留则可继续访问。  
- **[Trade-off] 子菜单出现两个入口指向同一收藏页**（`/favorite` 与 `/favorite/collect`）→ 文档中说明可选方案，实现选最简。

## Migration Plan

- 部署后用户需在侧栏展开「想看的频道」进入「EPG 频道搜索」；原设置内查询入口消失。  
- 无数据库迁移。

## Open Questions

1. 子菜单是否 **必须** 单独一行「想看的频道」指向 `/favorite/collect`，还是仅一项「EPG 频道搜索」即可？（影响路由与 redirect。）
