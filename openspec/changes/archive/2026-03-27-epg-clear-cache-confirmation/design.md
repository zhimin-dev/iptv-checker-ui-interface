## Context

Currently, in the EPG settings page, clicking the "清除已爬取的 EPG 信息" (Clear crawled EPG info) button immediately triggers the API call to clear the cache. This can lead to accidental data loss.

## Goals / Non-Goals

**Goals:**
- Intercept the click on the clear cache button.
- Display a confirmation dialog asking the user if they are sure.
- Only proceed with the API call if the user confirms.

**Non-Goals:**
- Changing the backend API.
- Changing the logic of the "Refresh EPG" button.

## Decisions

- **UI Component**: Use Material-UI's `Dialog`, `DialogTitle`, `DialogContent`, `DialogContentText`, and `DialogActions` to create the confirmation modal. This matches the existing UI framework.
- **State Management**: Introduce a boolean state `confirmDialogOpen` in `src/components/settings/epg.jsx` to control the visibility of the dialog.
- **Flow**:
  1. User clicks the clear cache button.
  2. `confirmDialogOpen` is set to `true`.
  3. Dialog appears.
  4. If user clicks "取消" (Cancel), `confirmDialogOpen` is set to `false`.
  5. If user clicks "确认" (Confirm), `confirmDialogOpen` is set to `false`, and the existing `handleClearCache` logic is executed.

## Risks / Trade-offs

- None. This is a standard UI pattern for destructive actions.
