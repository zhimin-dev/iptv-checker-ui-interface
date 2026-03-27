## 1. UI Rendering Logic

- [x] 1.1 In `src/components/settings/epg.jsx`, wrap the "清除已爬取的 EPG 信息" `LoadingButton` in a conditional block `{sourcesStatus === true ? (...) : null}`.

## 2. Testing and Verification

- [x] 2.1 Verify that when `sourcesStatus` is `false`, only the "立即更新 EPG" button is visible.
- [x] 2.2 Verify that when `sourcesStatus` is `true`, only the "清除已爬取的 EPG 信息" button is visible.
- [x] 2.3 Verify that when `sourcesStatus` is `null` (e.g., during initial load or error), neither button is visible.
