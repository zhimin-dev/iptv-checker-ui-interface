## MODIFIED Requirements

### Requirement: 用户可手动清除已爬取的 EPG 缓存

系统在 EPG 配置页面 SHALL 提供「清除已爬取的 EPG 信息」操作控件，且该控件 MUST 与「添加 EPG 源」控件处于同一操作区域。该控件 **MUST 仅在** 最近一次成功加载的响应中 **`status === true`**（严格布尔真）时渲染；当 `status` 为 `false`、缺失或非布尔时，系统 MUST **不展示**该按钮。用户触发该操作时，系统 MUST 调用后端清除缓存接口（`GET /epg/cache`），并在操作期间展示加载状态。操作完成后，系统 MUST 根据结果显示成功或失败反馈。

#### Scenario: 清除缓存成功

- **WHEN** `status === true` 且用户点击清除缓存按钮且接口返回成功
- **THEN** 系统在操作期间显示加载状态，完成后显示成功反馈

#### Scenario: 清除缓存失败

- **WHEN** 用户点击清除缓存按钮但接口失败或网络错误
- **THEN** 系统在操作期间显示加载状态，完成后显示错误反馈

#### Scenario: 不可清除时不展示按钮

- **WHEN** 加载完成后 `status` 不为 `true`（含 `false`、字段缺失、或非布尔）
- **THEN** 系统不渲染「清除已爬取的 EPG 信息」按钮
