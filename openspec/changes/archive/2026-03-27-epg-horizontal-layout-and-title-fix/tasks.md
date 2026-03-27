## 1. Data Parsing Fix

- [x] 1.1 Update `src/components/favourite/epg-search.jsx` to extract the program title from `prog.titles?.[0]?.value` in addition to `prog.title` and `prog.name`.

## 2. UI Layout Change

- [x] 2.1 Import `Tabs` and `Tab` from `@mui/material` in `src/components/favourite/epg-search.jsx`.
- [x] 2.2 Add an `activeTab` state to track the currently selected date index.
- [x] 2.3 Render the `parsedPrograms` dates horizontally using the `<Tabs>` component with `variant="scrollable"`.
- [x] 2.4 Update the program list rendering to only show the programs for the currently selected `activeTab` (i.e., `parsedPrograms[activeTab].programs`), instead of mapping over all dates.
- [x] 2.5 Ensure the `activeTab` resets to `0` when a new search is performed or new data is loaded.

## 3. Testing and Verification

- [x] 3.1 Verify that the program title is correctly displayed for the new JSON structure.
- [x] 3.2 Verify that dates are displayed horizontally as tabs and clicking them switches the displayed programs.
- [x] 3.3 Verify that the "currently playing" green highlight still works correctly within the selected tab.
