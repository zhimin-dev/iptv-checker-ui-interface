## Why

The current basic settings form uses a vertical layout where labels are either floating inside the input fields or placed above them. The user wants to improve the UI by adopting a horizontal layout where the label (name) is on the left and the input/action control is on the right, making the form cleaner and easier to read.

## What Changes

- Refactor the layout of the basic settings form in the settings page.
- Change the form fields (Global Host, Special Character Replacement, Language) to a horizontal layout.
- The label will be displayed on the left side with a fixed width, and the corresponding input (TextField, Switch, Select) will be aligned on the right.
- The "Save" button will also be aligned appropriately within this new layout.

## Capabilities

### New Capabilities

### Modified Capabilities
- `settings-basic`: The basic settings page UI layout requirement is modified to enforce a horizontal form layout (left label, right input).

## Impact

- `src/components/settings/index.jsx`: The JSX structure and styling of the basic settings form will be updated.
