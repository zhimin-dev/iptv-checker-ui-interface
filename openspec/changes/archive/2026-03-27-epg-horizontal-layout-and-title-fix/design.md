## Context

The EPG channel search feature was recently updated to display parsed data instead of raw JSON. However, the API response structure has a nested title format (`titles: [{ value: "..." }]`) which the current parsing logic misses, resulting in "未知节目" (Unknown Program) being displayed. Furthermore, all dates are stacked vertically, making the UI excessively long when multiple days of EPG data are returned.

## Goals / Non-Goals

**Goals:**
- Fix the parsing logic in `src/components/favourite/epg-search.jsx` to correctly extract the program title from the `titles` array.
- Implement a horizontal layout for dates using Material-UI `Tabs` and `Tab` components.
- Display only the programs for the currently selected date tab.
- Maintain the existing functionality of highlighting the currently playing program.

**Non-Goals:**
- Changing the backend API.
- Adding complex calendar pickers (simple tabs are sufficient for the typical 3-7 days of EPG data).

## Decisions

- **Title Extraction**: Update the `useMemo` block to check for `prog.titles?.[0]?.value` in addition to `prog.title` and `prog.name`.
- **Horizontal Layout**: Introduce a new state variable `activeTab` (defaulting to 0). Use MUI `<Tabs>` to render the `group.date` strings horizontally. The vertical program list will map over `parsedPrograms[activeTab].programs`.
- **Default Tab Selection**: When new data is loaded, the active tab should reset to 0 (the earliest date) or ideally the current date if it exists in the list. For simplicity and consistency, resetting to the first available date or the current date is acceptable. We will try to default to the current date if available, otherwise index 0.

## Risks / Trade-offs

- **Tab Overflow**: If the API returns a very large number of days (e.g., 14+ days), the tabs might overflow. Material-UI's `Tabs` component handles this gracefully with `variant="scrollable"`, which we will use.
