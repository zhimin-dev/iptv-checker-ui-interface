## Context

In `src/components/settings/search.jsx`, the button labeled "清理结果" (Clear Results) is rendered when `config.today_fetch` is true. Clicking this button currently calls `handleRunSpider()`, which checks `config.today_fetch` and immediately calls `taskService.clearSearchFolder()`. This immediate execution can cause accidental loss of crawled data.

## Goals / Non-Goals

**Goals:**
- Intercept the click on the "清理结果" button.
- Display a confirmation dialog asking the user if they are sure they want to clear the results.
- Only proceed with the `taskService.clearSearchFolder()` API call if the user confirms.

**Non-Goals:**
- Changing the backend API.
- Altering the "立即爬取" (Fetch Now) logic, which shares the `handleRunSpider` function.

## Decisions

- **UI Component**: Use Material-UI's `Dialog`, `DialogTitle`, `DialogContent`, `DialogContentText`, and `DialogActions` to create the confirmation modal, consistent with the rest of the application.
- **State Management**: 
  - Introduce a boolean state `confirmClearDialogOpen` in `src/components/settings/search.jsx` to control the dialog visibility.
- **Flow Refactoring**:
  - Currently, `handleRunSpider` handles both "清理结果" and "立即爬取" based on `config.today_fetch`.
  - We will split this logic. "立即爬取" will call a new `handleFetchNow` function (or keep a modified `handleRunSpider`).
  - "清理结果" will open the confirmation dialog.
  - The "确认" (Confirm) button in the dialog will call a new `executeClearResults` function that performs the actual clearing logic.

## Risks / Trade-offs

- None. This is a standard UI pattern for destructive actions.
