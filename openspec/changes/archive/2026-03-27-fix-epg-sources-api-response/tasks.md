## 1. Data Parsing Logic

- [x] 1.1 Update `normalizeEpgUrlList` in `src/components/settings/epg.jsx` to handle nested `data.data.list` structures.
- [x] 1.2 Update `parseEpgSourcesResponse` in `src/components/settings/epg.jsx` to unwrap `data.data` if it exists before extracting `status` and calling `normalizeEpgUrlList`.

## 2. Testing and Verification

- [x] 2.1 Verify that the EPG settings page correctly loads and displays the list of URLs when the backend returns `{ "list": [...], "status": true }`.
- [x] 2.2 Verify that the "立即更新 EPG" button visibility correctly respects the `status` boolean (should be hidden if true, visible if false).
- [x] 2.3 Verify that saving the EPG sources still works correctly and sends the `{ "list": [...] }` payload.
