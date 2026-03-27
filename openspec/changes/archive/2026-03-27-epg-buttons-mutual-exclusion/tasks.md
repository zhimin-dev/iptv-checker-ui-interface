## 1. UI Logic Update

- [x] 1.1 In `src/components/settings/epg.jsx`, add `disabled={refreshing}` to the "清除已爬取的 EPG 信息" `LoadingButton`.
- [x] 1.2 In `src/components/settings/epg.jsx`, add `disabled={clearingCache}` to the "立即更新 EPG" `LoadingButton`.

## 2. Testing and Verification

- [x] 2.1 Verify that clicking "清除已爬取的 EPG 信息" disables the "立即更新 EPG" button while the request is in progress.
- [x] 2.2 Verify that clicking "立即更新 EPG" disables the "清除已爬取的 EPG 信息" button while the request is in progress.
