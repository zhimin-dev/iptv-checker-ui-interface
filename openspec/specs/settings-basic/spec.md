# settings-basic Specification

## Purpose
TBD - created by archiving change settings-form-layout. Update Purpose after archive.
## Requirements
### Requirement: 基础设置表单布局

系统在「基础设置」页面中展示的配置表单（包括全局 Host、特殊字符替换、语言等），MUST 采用左右布局。
每一项配置 MUST 独立成行，行的左侧展示配置项的名称（Label），右侧展示对应的操作控件（如输入框、开关、下拉选择框）。
左侧的名称区域 MUST 具有固定的宽度以保证各行之间的输入控件能够垂直对齐。

#### Scenario: 查看基础设置表单
- **WHEN** 用户进入「基础设置」页面
- **THEN** 表单项呈现左侧名称、右侧控件的布局，且各行的控件左边缘对齐

