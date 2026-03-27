## 1. Menu and Routing Updates

- [x] 1.1 Update the menu item name in `src/components/layout/menu.jsx` from "EPG 频道搜索" (or equivalent translation key) to "EPG 频道".
- [x] 1.2 Ensure `src/locals/zh.json` and `src/locals/en.json` have the correct translation for "EPG 频道".

## 2. API Integration

- [x] 2.1 Add `getEpgChannelList()` method to `src/services/apiTaskService.js` that performs a `GET /epg/channel-list` request.

## 3. UI Layout Implementation

- [x] 3.1 In `src/components/favourite/epg-search.jsx`, add state variables for `channelList` (array), `channelListLoading` (boolean), and `selectedChannel` (string/object).
- [x] 3.2 Add a `useEffect` hook to call `taskService.getEpgChannelList()` on component mount and populate `channelList`.
- [x] 3.3 Refactor the main return block of `src/components/favourite/epg-search.jsx` to use a two-column layout (e.g., `Box` with `display: flex`).
- [x] 3.4 Implement the left column (approx 250px width, scrollable) to render the `channelList` using MUI `List` and `ListItemButton`.
- [x] 3.5 Move the existing search input, button, and `renderProgramBlock()` into the right column (`flex: 1`).

## 4. Interaction Logic

- [x] 4.1 Add an `onClick` handler to the channel list items that sets `selectedChannel`, updates the `channelQuery` input state, and automatically triggers `handleQueryChannel()`.
- [x] 4.2 Apply a selected/active style to the `ListItemButton` in the left column that matches the `selectedChannel`.

## 5. Testing and Verification

- [x] 5.1 Verify the menu name is correctly displayed as "EPG 频道".
- [x] 5.2 Verify the channel list is fetched and displayed on the left side upon entering the page.
- [x] 5.3 Verify that clicking a channel in the list updates the right side with its EPG data.
- [x] 5.4 Verify that manual search in the right panel still works correctly.
