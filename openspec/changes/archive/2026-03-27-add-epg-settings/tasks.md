## 1. 代理与 API 层

- [x] 1.1 在 `vite.config.js` 的 `server.proxy` 中增加 `^/epg` 转发到 `http://127.0.0.1:8089`（`changeOrigin: true`）
- [x] 1.2 在 `ApiTaskService` 中新增 `getEpgSources`、`saveEpgSources({ list })`（`POST /epg/sources`  body 为 `{ list: [] }`）、`getEpgByChannel(channel)`；按后端最终文档新增 `refreshEpg`（或等价命名）并写清注释中的 URL

## 2. 设置页面与路由

- [x] 2.1 新建 `src/components/settings/epg.jsx`：布局参考 `keywords.jsx`（说明区、可编辑列表、保存按钮、Snackbar）
- [x] 2.2 实现 `GET /epg/sources` 初始化状态；实现新增行、删除行；保存时 `POST /epg/sources` 且 body 为 `{ list: <数组> }`
- [x] 2.3 添加「立即更新 EPG」按钮并对接 `refreshEpg`；失败/成功提示
- [x] 2.4 在按钮下方添加频道搜索框与查询按钮，调用 `getEpgByChannel`，按响应类型展示结果（表格或 `pre`/Typography）
- [x] 2.5 在 `routes.jsx` 的 `/settings` children 中注册 `/settings/epg` 及菜单名称；在 `menu.jsx` 中注册对应图标字符串

## 3. 国际化与文档

- [x] 3.1 在 `zh.json`、`en.json` 中补充 EPG 相关文案 key（页面标题、按钮、占位符、空态/错误提示）
- [x] 3.2 联调后若 `list` 元素字段或刷新接口与 design 中 Open Questions 不一致，更新 `design.md` 对应段落

## 4. 验证

- [x] 4.1 已对 `127.0.0.1:8089` 联调：`GET/POST /epg/sources`、`GET /epg?channel=`、`POST /epg/sync` 可用；刷新接口由 `/epg/refresh` 更正为 **`/epg/sync`**
- [x] 4.2 `/settings` 父路由 `showMod: [0,1]`，`/settings/epg` 与同组子项 `handle` 一致，侧栏随「设置」展开显示
