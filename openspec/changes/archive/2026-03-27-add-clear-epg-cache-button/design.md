## Context

The EPG configuration page currently allows users to manage EPG sources and trigger an immediate update. However, there is no way to clear the existing cached EPG data from the UI. The backend provides a `GET /epg/cache` endpoint to perform this action.

## Goals / Non-Goals

**Goals:**
- Add a button "清除已爬取的 EPG 信息" (Clear Crawled EPG Info) to the EPG settings page.
- Call the `GET /epg/cache` endpoint when the button is clicked.
- Provide visual feedback (loading state, success/error snackbar) to the user during and after the operation.

**Non-Goals:**
- Modifying the backend implementation of the cache clearing logic.
- Adding complex confirmation dialogs (a simple button with a loading state is sufficient for this utility function).

## Decisions

- **UI Placement**: The new button will be placed in the same flex container as the "添加 EPG 源" (Add EPG Source) and "立即更新 EPG" (Refresh EPG) buttons to keep all global actions together.
- **Component Choice**: We will use the Material-UI `LoadingButton` component (already imported in the file) to show a loading spinner while the request is in flight, preventing multiple accidental clicks.
- **API Integration**: A new method `clearEpgCache` will be added to `ApiTaskService` to handle the `GET /epg/cache` request.

## Risks / Trade-offs

- **Accidental Clicks**: A user might accidentally click the clear button. Since this is a settings page and the action just clears cache (which can be re-fetched), a confirmation dialog might be overkill, but we will use an outlined or text variant for the button to make it slightly less prominent than the primary "Save" or "Add" actions. We'll use `variant="outlined"` and `color="error"` to indicate it's a destructive/clear action.
