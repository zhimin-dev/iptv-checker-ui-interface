## Context

The EPG settings page has two global actions: "立即更新 EPG" (Refresh EPG) and "清除已爬取的 EPG 信息" (Clear EPG Cache). Both are asynchronous operations that affect the backend EPG state. Currently, a user could theoretically click one while the other is loading, causing potential race conditions or confusing UI feedback.

## Goals / Non-Goals

**Goals:**
- Disable the "清除已爬取的 EPG 信息" button when `refreshing` is true.
- Disable the "立即更新 EPG" button when `clearingCache` is true.

**Non-Goals:**
- Changing the backend logic.
- Adding complex global state management (local component state is sufficient).

## Decisions

- **UI State Binding**: We will use the existing `refreshing` and `clearingCache` state variables in `src/components/settings/epg.jsx`. We will add the `disabled` prop to the `LoadingButton` components, setting it to the opposite loading state. (e.g., `<LoadingButton loading={clearingCache} disabled={refreshing} ...>`).

## Risks / Trade-offs

- **None**: This is a straightforward UI enhancement to improve robustness.
