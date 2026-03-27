## Why

In the "Settings - Crawl Configuration" page, the "清理结果" (Clear Results) button immediately triggers the API call to clear the search folder. This action is destructive and can lead to accidental data loss if clicked by mistake. Adding a confirmation dialog will prevent users from unintentionally clearing their crawl results.

## What Changes

- Add a confirmation dialog that appears when the user clicks the "清理结果" (Clear Results) button.
- The dialog will ask the user to confirm the action before proceeding with the clear operation.
- If the user confirms, the existing `taskService.clearSearchFolder()` logic will execute. If they cancel, nothing happens.

## Capabilities

### New Capabilities

### Modified Capabilities
- `settings-search`: The requirement for clearing crawl results is modified to include a user confirmation step before execution.

## Impact

- `src/components/settings/search.jsx`: UI changes to include a confirmation dialog and state management for its visibility.
