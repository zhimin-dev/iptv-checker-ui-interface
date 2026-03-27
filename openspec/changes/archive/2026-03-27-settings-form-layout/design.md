## Context

The basic settings form in `src/components/settings/index.jsx` currently uses standard Material-UI `FormControl` components, which stack vertically and use floating labels. The user requested a layout where the label is on the left and the input control is on the right.

## Goals / Non-Goals

**Goals:**
- Change the layout of the `baseHost` TextField, `replaceString` Switch, and `language` Select to a horizontal flex layout.
- Ensure the labels are clearly separated from the inputs (e.g., fixed width for labels).
- Keep the existing state management and save logic intact.

**Non-Goals:**
- Changing the layout of the "Custom Network Source" dialog.
- Adding new settings fields.

## Decisions

- **Layout Structure**: We will use MUI's `Box` with `display: 'flex', alignItems: 'center', mb: 2` for each form row.
- **Label Component**: We will use `Typography` with a fixed width (e.g., `width: '120px'`) for the left-side labels to ensure alignment across different rows.
- **Input Components**: 
  - For `TextField`, we will remove the `label` prop (since we have a separate label now) and keep it `size="small"`.
  - For `Switch`, we will remove `FormControlLabel` and just use the `Switch` component directly next to the `Typography` label.
  - For `Select`, we will remove the `InputLabel` and use the `Select` component directly with `size="small"`.
- **Save Button**: The "Save" button will be placed at the bottom, possibly aligned to the left (matching the input alignment) or center.

## Risks / Trade-offs

- **Responsive Design**: Fixed widths for labels might cause issues on very small screens, but since the container is already constrained (`width: '400px'` or similar), it should be fine for this desktop/web interface.
