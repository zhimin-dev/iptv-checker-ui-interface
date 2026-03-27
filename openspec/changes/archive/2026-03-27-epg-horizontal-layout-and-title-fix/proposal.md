## Why

The EPG channel search results currently fail to display program titles because the API response structure has changed (titles are now nested under `titles[0].value`). Additionally, displaying multiple days of EPG data vertically makes the page too long and difficult to navigate. Changing to a horizontal layout for dates (e.g., using tabs) will significantly improve usability.

## What Changes

- Update the data parsing logic to correctly extract the program title from `titles[0].value` if it exists.
- Change the UI layout to display dates horizontally (e.g., as selectable Tabs).
- Only display the vertical list of programs for the currently selected date.

## Capabilities

### New Capabilities

### Modified Capabilities
- `favourite-epg-search`: The EPG channel search results must correctly parse the nested title structure and display the available dates horizontally, allowing users to switch between days.

## Impact

- `src/components/favourite/epg-search.jsx`: Will be updated to handle the new JSON structure and implement a horizontal Tab-based layout for dates.
