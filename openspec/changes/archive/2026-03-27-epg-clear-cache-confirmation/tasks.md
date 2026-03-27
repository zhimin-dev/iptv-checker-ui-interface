## 1. UI Implementation

- [x] 1.1 Import `Dialog`, `DialogTitle`, `DialogContent`, `DialogContentText`, and `DialogActions` from `@mui/material` in `src/components/settings/epg.jsx`.
- [x] 1.2 Add a new boolean state `confirmDialogOpen` initialized to `false`.
- [x] 1.3 Create an `openConfirmDialog` function that sets `confirmDialogOpen` to `true`.
- [x] 1.4 Create a `closeConfirmDialog` function that sets `confirmDialogOpen` to `false`.
- [x] 1.5 Update the "清除已爬取的 EPG 信息" button's `onClick` handler to call `openConfirmDialog` instead of `handleClearCache`.
- [x] 1.6 Render the `Dialog` component in the JSX return, containing the confirmation message, and "取消" / "确认" buttons.
- [x] 1.7 Bind the "确认" button in the dialog to close the dialog and call the existing `handleClearCache` function.

## 2. Verification

- [x] 2.1 Verify that clicking the clear cache button opens the confirmation dialog.
- [x] 2.2 Verify that clicking "取消" closes the dialog without clearing the cache.
- [x] 2.3 Verify that clicking "确认" closes the dialog and successfully triggers the clear cache operation.
