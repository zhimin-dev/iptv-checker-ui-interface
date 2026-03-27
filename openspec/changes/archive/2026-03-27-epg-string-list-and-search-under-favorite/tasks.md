## 1. EPG 源保存格式

- [x] 1.1 调整 `epg.jsx`（或等价模块）：加载时将 `list` 规范为字符串数组（兼容 `string[]` 与 `{url}` 对象）
- [x] 1.2 保存时 `POST` body 为 `{ list: string[] }`（trim、过滤空串），移除对象数组的 `toPayloadList` 行为

## 2. 拆分频道搜索页

- [x] 2.1 新建「EPG 频道搜索」页面组件，承载原 `epg.jsx` 中的频道查询与结果展示逻辑
- [x] 2.2 从 `epg.jsx` 删除频道查询相关 state、UI 与文案

## 3. 路由与侧栏

- [x] 3.1 将 `routes.jsx` 中 `/favorite` 改为带子路由结构（含 `index`、隐藏项策略与 `/favorite/epg-search`；按需增加 `/favorite/collect` 等，与 `design.md` 选定方案一致）
- [x] 3.2 更新 `menu.jsx`：为「想看的频道」增加展开状态（如 `openFavorite`）、`changePath` 分支、`Collapse` 子列表；为「EPG 频道搜索」注册图标字符串

## 4. 国际化与 spec 归档准备

- [x] 4.1 在 `zh.json`、`en.json` 增加「EPG 频道搜索」及新页面说明类 key
- [x] 4.2 联调保存与菜单导航后，执行 OpenSpec 归档并将 delta 合并进 `openspec/specs/settings-epg/spec.md` 与新建/更新 `favourite-epg-search` 主 spec（若采用独立能力）
