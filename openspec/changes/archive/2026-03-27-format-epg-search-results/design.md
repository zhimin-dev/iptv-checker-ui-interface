## Context

Currently, the EPG channel search results in `src/components/favourite/epg-search.jsx` are displayed as raw JSON. The user wants to format these results into a vertical, chronological list grouped by date, and highlight the currently playing program in bold green text.

## Goals / Non-Goals

**Goals:**
- Parse the EPG JSON response.
- Group programs by date (e.g., "YYYY-MM-DD").
- Sort programs chronologically within each date, starting from 00:00.
- Determine the currently playing program by comparing the current system time with the program's start and end times.
- Render the grouped data using Material-UI components (e.g., `List`, `ListItem`, `Typography`, `Divider`).
- Highlight the current program with bold green text.

**Non-Goals:**
- Changing the EPG backend API or data source.
- Adding pagination or infinite scrolling for the EPG results.
- Modifying other parts of the application outside of the EPG search component.

## Decisions

- **Data Processing**: We will create a helper function or use a `useMemo` hook within the component to group and sort the EPG data. The EPG data usually contains `start` and `end` times (often in Unix timestamp or ISO string format). We will parse these to determine the date and time.
- **Current Program Detection**: We will use `Date.now()` to get the current time and compare it against the `start` and `end` times of each program. To ensure the UI updates if the user leaves the page open, we might need a simple interval to refresh the "current" state, but for a simple implementation, calculating it on render is sufficient.
- **UI Components**: We will use MUI's `List`, `ListItem`, and `ListItemText` for a clean, vertical layout. We will use a `Typography` component for the date headers.

## Risks / Trade-offs

- **Timezone Issues**: The EPG data might be in a different timezone than the user's local timezone. We will assume the EPG times are either in UTC or the local timezone and format them accordingly using standard JavaScript `Date` objects or a lightweight library like `dayjs` if it's already in the project. We will stick to native `Date` to minimize dependencies unless `dayjs` is already used.
- **Performance**: Grouping and sorting a very large EPG list could cause a slight delay. However, typical EPG data for a single channel over a few days is small enough that client-side processing in `useMemo` is perfectly fine.
