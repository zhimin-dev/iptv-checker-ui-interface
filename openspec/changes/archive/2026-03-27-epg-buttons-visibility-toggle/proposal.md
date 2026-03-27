## Why

The user requested that the "立即更新 EPG" (Refresh EPG) and "清除已爬取的 EPG 信息" (Clear EPG Cache) buttons should not be visible at the same time. If the system is in a state where it can be refreshed (e.g., `status === false`), the refresh button should appear and the clear button should be hidden. Conversely, if it can be cleared (e.g., `status === true`), the clear button should appear and the refresh button should be hidden. This makes the UI cleaner and prevents users from being confused by conflicting actions.

## What Changes

- Update the visibility logic in `src/components/settings/epg.jsx`.
- The "立即更新 EPG" button will only render when `sourcesStatus === false`. (This is already the case).
- The "清除已爬取的 EPG 信息" button will only render when `sourcesStatus === true`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `settings-epg`: The EPG settings page must conditionally render the "Refresh EPG" and "Clear EPG Cache" buttons based on the `status` returned from the backend, ensuring they are mutually exclusive in visibility.

## Impact

- `src/components/settings/epg.jsx`: JSX rendering logic for the two buttons will be updated.
