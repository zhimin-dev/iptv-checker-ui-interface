# IPTV Checker Web（iptv-checker-ui）

## 项目详情

- **名称 / 包名**：`iptv-checker-ui`（npm）
- **定位**：IPTV 订阅检测与管理的前端界面，与本地/远程 **iptv-checker 后端服务**（开发环境默认 `http://127.0.0.1:8089`）通过 HTTP API 交互。
- **能力概览**：
  - 源检测、详情与排序（M3U 等）
  - 定时检查任务（任务列表、表单、下载/订阅链接）
  - 在线观看（Video.js / HLS）
  - 系统设置（语言、Host、特殊字符替换开关、频道 Logo 等）
  - 「想看的频道」收藏与爬虫相关配置
  - 支持 **Web（Vite）** 与 **Tauri 2 桌面壳**（`src-tauri/`）双形态；路由使用 **Hash Router**，便于静态部署与桌面内嵌。
- **上游仓库**：见 `package.json` 中 `homepage_url`（zhimin-dev / iptv-checker 生态）。

## 技术栈

| 类别 | 选型 |
|------|------|
| 运行时 / 框架 | React 18、JavaScript（`.jsx`） |
| 构建 | Vite 7、`@vitejs/plugin-react` |
| 路由 | `react-router-dom` v7，`createHashRouter` |
| UI | MUI（`@mui/material` v7、`@mui/icons-material`、`@mui/lab`）、Emotion |
| 拖拽 / 排序 | `@dnd-kit/*` |
| 表格 / 虚拟列表 | `react-virtualized` |
| HTTP | `axios`（`ApiTaskService` 等封装） |
| 国际化 | `i18next`、`react-i18next`，文案在 `src/locals/zh.json`、`en.json` |
| 播放器 | `video.js`、`@videojs/http-streaming`、相关插件 |
| 桌面 | Tauri 2 + `@tauri-apps/plugin-*`（dialog、fs、http、os 等） |
| 开发代理 | Vite `server.proxy`：`/tasks`、`/system`、`/media`、`/check`、`/fetch`、`/static`、`/q` 等前缀转发到后端 |

## 目录与架构约定

- **`src/main.jsx`**：挂载根、`MainContextProvider`、`TaskProvider`、`RouterProvider`。
- **`src/router/routes.jsx`**：集中定义路由；子路由挂在 `components/layout/menu` 布局下；`handle.showMod` 等控制 Web/桌面模式下的菜单可见性。
- **`src/context/`**：`main.jsx`（全局设置、检测流程等）、`tasker.jsx`（任务相关）。
- **`src/services/`**：`apiTaskService.js` 等为 **相对根路径** 的 REST 调用（生产/代理由 Vite 或部署环境保证同源或代理）。
- **`src/components/`**：按功能分子目录（`task/`、`settings/`、`watch/`、`favourite/` 等）；页面级组件多为默认导出函数组件。
- **OpenSpec**：`openspec/config.yaml` 使用 `schema: spec-driven`；变更流程见 `.cursor/skills/openspec-*`。

## 编码与协作规范

1. **语言**：业务代码以 **中文注释 / 用户可见文案** 与 **英文 key**（i18n）并存；新增界面文案优先走 `t('…')`，并在 `zh.json` / `en.json` 补全。
2. **风格**：与现有文件一致——函数组件 + hooks；MUI 的 `Box`、`sx`、表单控件；避免在无约定处引入新 UI 库。
3. **API**：新增接口在 `ApiTaskService`（或同类 service）中集中定义，路径与后端保持一致；注意 Vite 代理前缀与生产部署反代一致。
4. **范围**：改动紧贴需求，避免无关大重构；删除功能时同步清理路由、菜单与引用。
5. **路由**：新页面需在 `routes.jsx` 注册，并在 `menu.jsx` 中如需图标则按现有字符串映射补充。

## 本地开发

- **Web**：`npm run dev`（默认 `http://localhost:5173`），需后端 `8089` 可访问或通过代理连通。
- **构建**：`npm run build`；`npm run preview` 预览产物。
- **Tauri**：`npm run tauri`（需本机 Rust/Tauri 环境）。

---

*本文档供 OpenSpec / AI 辅助变更时作为项目上下文；若与代码不一致，以仓库实现为准。*
