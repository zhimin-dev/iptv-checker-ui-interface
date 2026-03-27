## Context

- 设置子页「特殊字符替换」采用：`KeywordSettings` 组件、`ApiTaskService.getReplaceList` / `updateReplaceList`、MUI 列表 + 底部保存、Snackbar 反馈。
- 开发环境通过 Vite `server.proxy` 将 API 前缀转发到 `127.0.0.1:8089`；当前未包含 `/epg`。
- 用户描述的后端契约：
  - `GET /epg/sources` — 获取 EPG 源列表
  - `POST /epg/sources` — 保存完整源列表，**请求体固定为 `{ list: [...] }`**（`list` 为源对象数组）
  - `GET /epg?channel=<name>` — 按频道查询节目信息
  - 「立即更新」— 前端实现为 **`POST /epg/sync`**（空 JSON body `{}`）；若后端不同，改 `ApiTaskService.refreshEpg`。

## Goals / Non-Goals

**Goals:**

- 在设置下提供与「特殊字符替换」同级的 EPG 配置页：拉取、编辑（增删）、保存。
- 提供一键触发 EPG 数据更新（调用后端约定接口）。
- 提供频道搜索，展示 `/epg?channel=` 返回内容。

**Non-Goals:**

- 不实现后端 EPG 抓取/解析逻辑。
- 不要求与具体 EPG XMLTV 格式强绑定 UI；以通用 JSON/文本友好展示为主（若后端返回 HTML/纯文本，可用 `pre` 或表格适配）。

## Decisions

1. **路由与菜单位置**  
   - 在 `routes.jsx` 的 `/settings` `children` 中新增路径，例如 `/settings/epg`，名称「EPG 配置」，图标选用现有 MUI 图标字符串（如 `TvIcon` 或 `ScheduleIcon`），并在 `menu.jsx` 的 icon 映射中注册。

2. **组件与代码组织**  
   - 新建 `src/components/settings/epg.jsx`（默认导出），结构参考 `keywords.jsx`：顶部说明文案、`useEffect` 拉取、`LoadingButton`/`Button` 保存、Snackbar。

3. **API 封装**  
   - 在 `ApiTaskService` 增加：
     - `getEpgSources()` → `GET /epg/sources`
     - `saveEpgSources({ list })` → `POST /epg/sources`，body 为 `{ list: [...] }`
     - `getEpgByChannel(channel)` → `GET /epg`，`params: { channel }`
     - `refreshEpg()` → `POST /epg/sync`，body `{}`（与后端不一致时改 `apiTaskService.js`）。

4. **列表编辑模型**  
   - `GET /epg/sources` 的响应形状以实现联调为准；前端在内存中维护与 `list` 项一致的对象数组。  
   - **保存时**始终 `POST` JSON：`{ list: <当前编辑后的数组> }`，与后端约定一致。  
   - 若 GET 返回 `{ list: [...] }` 或顶层数组，加载时归一化为内部列表，保存前再包成 `{ list }`。

5. **频道查询展示**  
   - 搜索框 +「查询」按钮（或 debounce 可选）；请求成功后：若为数组对象，用 `Table` 或卡片列表；若为嵌套 JSON，用折叠 `pre`；错误时 Snackbar 或 Alert。

6. **代理**  
   - `vite.config.js` 增加 `'^/epg': { target: 'http://127.0.0.1:8089', changeOrigin: true }`（或与现有规则合并为更宽前缀，以不冲突为准）。

## Risks / Trade-offs

- **[Risk] 刷新 EPG 的 API 未在需求中明确** → 实现前与后端确认；临时可在 UI 上隐藏按钮或对接占位接口并文档化。  
- **[Risk] `list` 数组元素字段与 GET 返回不完全一致** → 联调时以 GET 样本为准定义行编辑字段；`{ list }` 外壳不变。  
- **[Trade-off] 频道查询结果格式多变** → 优先可读性（JSON 字符串化 + `pre`）再迭代表格视图。

## Migration Plan

- 纯前端增量；无数据迁移。部署时需保证生产环境反向代理包含 `/epg`（与 Vite 开发代理一致）。

## Open Questions

1. `list` 数组每一项的字段定义（例如是否仅 `url` 或含 `name`、`id` 等）？
2. ~~「立即更新 EPG」~~ 已实现为 `POST /epg/sync`；若后端变更请同步 `refreshEpg`。
3. `GET /epg?channel=` 的响应 Content-Type 与 JSON 结构（节目列表字段）？
