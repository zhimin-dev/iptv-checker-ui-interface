## Context

The user wants to refine the EPG channel search experience. Instead of a manual search input on the right that triggers an API call, they want to filter the fetched channel list on the left side. The channel list should also be sorted alphabetically, and the search input should be placed below the list.

## Goals / Non-Goals

**Goals:**
- Sort the `channelList` alphabetically by channel name.
- Move the `TextField` for searching from the right column to the bottom of the left column.
- Use the `channelQuery` state to filter the `channelList` displayed in the left column.
- Remove the "查询" (Query) button from the right column.
- Clicking a filtered channel in the list still triggers the EPG data fetch for that channel.

**Non-Goals:**
- Backend search API changes (filtering is done client-side on the fetched list).

## Decisions

- **Sorting**: We will sort the `channelList` in the `useEffect` after fetching it, using `localeCompare` on the channel names.
- **Filtering**: We will use a `useMemo` block to create `filteredChannelList` based on `channelList` and `channelQuery`. The filter will be a simple case-insensitive substring match on the channel name.
- **Layout**: The left column (`Box`) will use `display: 'flex', flexDirection: 'column'`. The `List` container will have `flexGrow: 1, overflowY: 'auto'`, and the `TextField` will be placed below it with `p: 2` or similar spacing.
- **Right Column Cleanup**: The `channelQuery` input and "查询" button will be removed from the right column. The right column will only display the EPG results (`renderProgramBlock()`).

## Risks / Trade-offs

- **Performance**: Client-side filtering on every keystroke for a very large list might cause slight lag. However, for typical channel lists (hundreds to low thousands), React and `useMemo` handle this efficiently. We won't add debouncing unless performance becomes an issue.
