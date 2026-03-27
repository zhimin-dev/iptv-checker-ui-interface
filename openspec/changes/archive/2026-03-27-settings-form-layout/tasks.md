## 1. UI Layout Refactoring

- [x] 1.1 In `src/components/settings/index.jsx`, modify the `baseHost` input row to use a flex container with a left-aligned `Typography` label and a right-aligned `TextField` (removing the floating label).
- [x] 1.2 Modify the `replaceString` switch row to use the same flex container layout, removing `FormControlLabel` and placing the `Switch` next to a `Typography` label.
- [x] 1.3 Modify the `language` select row to use the flex container layout, removing `InputLabel` and placing the `Select` next to a `Typography` label.
- [x] 1.4 Adjust the container width (e.g., from `400px` to `500px` or `100%` max-width) to accommodate the horizontal layout comfortably.
- [x] 1.5 Align the "保存" (Save) button to match the new layout flow (e.g., centered or aligned with the inputs).

## 2. Verification

- [x] 2.1 Verify that the basic settings form renders with labels on the left and controls on the right.
- [x] 2.2 Verify that the controls are vertically aligned with each other.
- [x] 2.3 Verify that changing values and saving still works correctly.
