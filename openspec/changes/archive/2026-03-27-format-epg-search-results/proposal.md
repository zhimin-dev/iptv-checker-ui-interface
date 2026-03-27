## Why

Currently, the EPG channel search results are displayed as raw JSON, which is difficult for users to read and understand. Formatting the data into a vertical, chronological list grouped by date, and highlighting the currently playing program, will significantly improve the user experience and readability of the EPG schedule.

## What Changes

- Parse the raw JSON response from the EPG search API.
- Group the EPG programs by date.
- Display the programs vertically for each day, ordered chronologically starting from 00:00.
- Identify the currently playing program based on the current time and the program's start/end times.
- Highlight the currently playing program using bold green text.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `favourite-epg-search`: The EPG channel search results must be formatted as a chronological list grouped by date, with the currently playing program highlighted in bold green text, rather than displaying raw JSON.

## Impact

- `src/components/favourite/epg-search.jsx`: Will be updated to parse and render the EPG data instead of dumping raw JSON.
- UI/UX: Improved readability of EPG search results.
