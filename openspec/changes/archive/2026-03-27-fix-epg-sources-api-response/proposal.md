## Why

The backend API for fetching EPG sources (`GET /epg/sources`) has changed its response format to include a `list` array and a `status` boolean (e.g., `{ "list": [...], "status": true }`). The frontend needs to be updated to correctly parse this new structure to display the EPG sources and their status.

## What Changes

- Update the data parsing logic in `src/components/settings/epg.jsx` to handle the new `{ list, status }` response structure, including potential API wrappers (e.g., `data.data`).
- Ensure the `status` field is correctly extracted and used to control the visibility of the "立即更新 EPG" (Refresh EPG) button.

## Capabilities

### New Capabilities

### Modified Capabilities
- `settings-epg`: The EPG settings page must correctly parse the new API response format (`{ list, status }`) to display the source URLs and the current update status.

## Impact

- `src/components/settings/epg.jsx`: Data parsing logic for `getEpgSources` will be updated.
