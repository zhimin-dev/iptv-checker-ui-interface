## Why

The current EPG channel page has a manual search input on the right side and an unsorted channel list on the left. Users want to easily find channels within the left list by typing a search query, and they expect the channel list to be sorted alphabetically by name for easier browsing. Removing the redundant search bar from the right side and placing a filter input on the left side will make the UI more intuitive and cohesive.

## What Changes

- Sort the fetched channel list alphabetically by channel name before rendering.
- Move the search input from the right column to the left column (above or below the list, as specified by user: "频道列表的下面" - below the list).
- The search input will act as a client-side filter for the channel list.
- Remove the "查询" button and search input from the right column.

## Capabilities

### New Capabilities

### Modified Capabilities
- `favourite-epg-search`: The EPG channel page must sort the channel list alphabetically and provide a local search/filter input within the left column to filter the list, while removing the manual search input from the right column.

## Impact

- `src/components/favourite/epg-search.jsx`: Layout and state logic will be updated to support client-side filtering and sorting of the channel list.
