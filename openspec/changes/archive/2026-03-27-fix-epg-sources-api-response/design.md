## Context

The backend API `GET /epg/sources` returns `{ "list": [...], "status": true }`. The frontend currently has a `parseEpgSourcesResponse` and `normalizeEpgUrlList` function in `src/components/settings/epg.jsx`. If the backend wraps the response in a standard `{ code: 200, data: ... }` format, or if the logic fails to extract the `status` boolean correctly from the new structure, the UI won't behave as expected. We need to make the parsing robust enough to handle the new structure directly or unwrapped from `data.data`.

## Goals / Non-Goals

**Goals:**
- Update `parseEpgSourcesResponse` and `normalizeEpgUrlList` in `src/components/settings/epg.jsx` to correctly extract the `list` array and the `status` boolean.
- Ensure the "立即更新 EPG" button logic (which relies on `status === false`) works correctly.

**Non-Goals:**
- Changing the backend API.
- Changing the UI layout of the EPG settings page.

## Decisions

- **Robust Parsing**: We will modify `parseEpgSourcesResponse` to first unwrap the payload (e.g., checking if `data.data` exists and contains `list`). Then we will extract `urls` from the `list` property and `status` from the `status` property.
- **Fallback**: We will maintain fallback logic to handle raw arrays just in case the API changes back or returns a raw array in some edge cases.

## Risks / Trade-offs

- **API Wrapper Changes**: If the backend introduces another layer of wrapping, the parsing might fail again. We will check for `data.data` and `data` to cover the most common Axios/Backend wrapper scenarios.
