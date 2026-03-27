## Context

The current EPG search page (`src/components/favourite/epg-search.jsx`) is a single-column layout where users must type a channel name into a text field to search. The backend now provides a `GET /epg/channel-list` endpoint returning `{ "list": [{ "name": "cctv", "channel": "9" }] }`. The user wants to leverage this to create a two-column layout: a scrollable list of channels on the left, and the EPG details on the right.

## Goals / Non-Goals

**Goals:**
- Rename the menu item to "EPG 频道".
- Fetch the channel list on component mount.
- Display the channel list on the left side (approx. 25-30% width) in a scrollable container.
- Display the existing EPG details view on the right side (approx. 70-75% width).
- Clicking a channel in the left list automatically triggers the EPG search for that channel and updates the right side.
- Keep the manual search input for flexibility, but place it above the list or in the right panel (we'll keep it on the right panel above the results for now, or above the list if it acts as a filter. For simplicity, we'll keep the existing search bar on the right side, but pre-fill it when a left item is clicked).

**Non-Goals:**
- Implementing pagination for the channel list (assuming the backend returns the full list or a sufficiently large default list).
- Changing the existing EPG parsing and rendering logic on the right side.

## Decisions

- **Layout Structure**: We will use Material-UI's `Grid` or `Box` with `display: 'flex'` to create the two-column layout.
  - Left Column: `width: '250px'`, `borderRight: 1`, `overflowY: 'auto'`, containing a `List` of `ListItemButton` elements.
  - Right Column: `flex: 1`, containing the existing search input and EPG results.
- **State Management**:
  - Add `channelList` state to store the fetched list.
  - Add `selectedChannel` state to track the currently active channel in the list (for highlighting).
- **Interaction**: Clicking a `ListItemButton` will update `channelQuery` state, set `selectedChannel`, and immediately call `handleQueryChannel()`.
- **Menu Rename**: Update `src/router/routes.jsx` and `src/components/layout/menu.jsx` (and i18n files if necessary) to change "EPG 频道搜索" to "EPG 频道".

## Risks / Trade-offs

- **List Performance**: If the channel list is extremely long (thousands of items), a simple map might cause slight rendering lag. However, for typical IPTV channel lists (hundreds), standard React rendering is fine. If it becomes an issue later, virtualization can be added.
