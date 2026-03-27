## Why

Currently, the EPG channel search page requires users to manually type the channel name to search for EPG data. This is not user-friendly. By providing a scrollable list of available channels on the left side of the page, users can easily browse and click to view EPG data for a specific channel, significantly improving the user experience. The menu name should also be simplified to "EPG 频道" (EPG Channels).

## What Changes

- Rename the sidebar menu item from "EPG 频道搜索" to "EPG 频道".
- Update the layout of `src/components/favourite/epg-search.jsx` to a two-column layout (left: channel list, right: EPG details).
- Add a new API method in `ApiTaskService` to fetch the channel list via `GET /epg/channel-list`.
- Render the fetched channel list on the left side. Clicking a channel will trigger the existing EPG search logic and display the results on the right side.

## Capabilities

### New Capabilities

### Modified Capabilities
- `favourite-epg-search`: The EPG channel page must display a scrollable list of channels on the left side, fetched from `/epg/channel-list`. Clicking a channel displays its EPG data on the right side. The menu name is changed to "EPG 频道".

## Impact

- `src/components/layout/menu.jsx`: Menu item name update.
- `src/router/routes.jsx`: Route name update (if applicable).
- `src/services/apiTaskService.js`: New method `getEpgChannelList`.
- `src/components/favourite/epg-search.jsx`: Complete layout redesign to support the two-column view.
