## Why

Users need a way to manually clear the cached EPG data that has been crawled. Sometimes the cached data becomes stale or corrupted, and providing a button in the EPG configuration page allows users to reset the cache easily without waiting for automatic expiration or manually deleting files on the server.

## What Changes

- Add a new API method in `ApiTaskService` to call `GET /epg/cache`.
- Add a "清除已爬取的 EPG 信息" (Clear Crawled EPG Info) button next to the "添加 EPG 源" (Add EPG Source) button on the EPG settings page.
- Implement a loading state and success/error snackbar feedback when the user clicks the clear cache button.

## Capabilities

### New Capabilities

### Modified Capabilities
- `settings-epg`: The EPG settings page must provide a new button to clear the EPG cache via a `GET /epg/cache` API call.

## Impact

- `src/services/apiTaskService.js`: New method `clearEpgCache` will be added.
- `src/components/settings/epg.jsx`: UI will be updated with the new button and its corresponding handler logic.
