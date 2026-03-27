## Why

On the EPG configuration page, the "立即更新 EPG" (Refresh EPG) and "清除已爬取的 EPG 信息" (Clear EPG Cache) buttons are currently independent. If a user clicks one while the other is already processing, it can lead to conflicting backend operations or confusing UI states. These two actions should be mutually exclusive: when one is loading, the other should be disabled.

## What Changes

- Update the UI logic in `src/components/settings/epg.jsx` so that the "立即更新 EPG" button is disabled when `clearingCache` is true.
- Update the UI logic so that the "清除已爬取的 EPG 信息" button is disabled when `refreshing` is true.

## Capabilities

### New Capabilities

### Modified Capabilities
- `settings-epg`: The EPG settings page must ensure that the "Refresh EPG" and "Clear EPG Cache" actions are mutually exclusive during their loading states to prevent conflicting operations.

## Impact

- `src/components/settings/epg.jsx`: Button `disabled` props will be updated to depend on each other's loading states.
