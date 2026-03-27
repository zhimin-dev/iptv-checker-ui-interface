## Why

The user wants to add a confirmation step when clicking the "清除已爬取的 EPG 信息" (Clear crawled EPG info) button in the EPG settings. This is to prevent accidental clicks that would clear the cache unintentionally, which could require time-consuming re-fetching of the data.

## What Changes

- Add a confirmation dialog that appears when the user clicks the clear EPG cache button.
- The dialog will ask the user to confirm the action before actually sending the clear cache request.

## Capabilities

### New Capabilities

### Modified Capabilities
- `settings-epg`: The requirement for clearing the EPG cache is modified to include a user confirmation step before execution.

## Impact

- `src/components/settings/epg.jsx`: UI changes to include a confirmation dialog and state management for its visibility.
