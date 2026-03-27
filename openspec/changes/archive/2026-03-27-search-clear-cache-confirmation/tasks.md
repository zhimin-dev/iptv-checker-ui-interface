## 1. UI Implementation

- [x] 1.1 Import `DialogActions` and `DialogContentText` from `@mui/material` in `src/components/settings/search.jsx`.
- [x] 1.2 Add a new boolean state `confirmClearDialogOpen` initialized to `false`.
- [x] 1.3 Create an `openConfirmClearDialog` function that sets `confirmClearDialogOpen` to `true`.
- [x] 1.4 Create a `closeConfirmClearDialog` function that sets `confirmClearDialogOpen` to `false`.
- [x] 1.5 Update the "清理结果" button's `onClick` handler to call `openConfirmClearDialog` instead of `handleRunSpider`.
- [x] 1.6 Render a new `Dialog` component in the JSX return, containing the confirmation message, and "取消" / "确认" buttons.
- [x] 1.7 Create a `handleConfirmClearResults` function that closes the dialog and executes the clear logic (previously part of `handleRunSpider`).
- [x] 1.8 Refactor `handleRunSpider` to only handle the "立即爬取" (Fetch Now) logic, or keep it as is and just call the clear logic directly from `handleConfirmClearResults`.

## 2. Verification

- [x] 2.1 Verify that clicking the "清理结果" button opens the confirmation dialog.
- [x] 2.2 Verify that clicking "取消" closes the dialog without clearing the results.
- [x] 2.3 Verify that clicking "确认" closes the dialog and successfully triggers the clear results operation.
