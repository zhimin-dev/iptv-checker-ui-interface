## 1. API Integration

- [x] 1.1 Add `clearEpgCache` method to `src/services/apiTaskService.js` that makes a `GET /epg/cache` request.

## 2. UI Implementation

- [x] 2.1 Add a `clearingCache` state boolean to `src/components/settings/epg.jsx` to track the loading state.
- [x] 2.2 Implement `handleClearCache` function in `src/components/settings/epg.jsx` to call `taskService.clearEpgCache()` and handle success/error snackbar messages.
- [x] 2.3 Add a `LoadingButton` (variant="outlined", color="error") with the text "清除已爬取的 EPG 信息" next to the "添加 EPG 源" button.

## 3. Testing and Verification

- [x] 3.1 Verify that clicking the "清除已爬取的 EPG 信息" button triggers the `GET /epg/cache` API call.
- [x] 3.2 Verify that the button shows a loading spinner while the request is in progress.
- [x] 3.3 Verify that a success or error snackbar is displayed appropriately after the request completes.
