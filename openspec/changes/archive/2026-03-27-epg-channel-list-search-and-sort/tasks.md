## 1. Data Processing Updates

- [x] 1.1 Update `useEffect` in `src/components/favourite/epg-search.jsx` to sort the fetched `channelList` alphabetically by channel name before setting state.
- [x] 1.2 Add a `useMemo` hook to compute `filteredChannelList` based on `channelList` and `channelQuery`.

## 2. UI Layout Updates

- [x] 2.1 Modify the left column in `src/components/favourite/epg-search.jsx` to render `filteredChannelList` instead of `channelList`.
- [x] 2.2 Move the `TextField` for `channelQuery` from the right column to the bottom of the left column.
- [x] 2.3 Remove the "查询" button and the `TextField` from the right column.

## 3. Verification

- [x] 3.1 Verify that the channel list is sorted alphabetically on load.
- [x] 3.2 Verify that typing in the search box correctly filters the channel list in real-time.
- [x] 3.3 Verify that clicking a filtered channel still fetches and displays the correct EPG data on the right.
