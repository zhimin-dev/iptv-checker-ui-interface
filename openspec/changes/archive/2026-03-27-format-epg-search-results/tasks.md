## 1. Data Processing Logic

- [x] 1.1 Create a helper function or `useMemo` block in `src/components/favourite/epg-search.jsx` to parse the raw EPG JSON response.
- [x] 1.2 Implement logic to group the EPG programs by date (e.g., "YYYY-MM-DD").
- [x] 1.3 Sort the programs within each date chronologically starting from 00:00.
- [x] 1.4 Implement a function to determine if a program is currently playing based on the current system time and the program's start/end times.

## 2. UI Implementation

- [x] 2.1 Replace the raw JSON display in `src/components/favourite/epg-search.jsx` with Material-UI components (e.g., `List`, `ListItem`).
- [x] 2.2 Render the grouped dates as section headers (e.g., using `Typography` or `ListSubheader`).
- [x] 2.3 Render each program vertically under its corresponding date, showing its start/end times and title.
- [x] 2.4 Apply bold green text styling to the currently playing program.

## 3. Testing and Refinement

- [x] 3.1 Test the EPG search with a valid channel ID to verify the data is parsed, grouped, and sorted correctly.
- [x] 3.2 Verify that the currently playing program is correctly highlighted in bold green text.
- [x] 3.3 Test edge cases, such as empty results or API errors, to ensure the UI handles them gracefully without crashing.
