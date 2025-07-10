# SelectPop 选择器弹窗组件

一个基于 antd-mobile 的选择器弹窗组件，支持搜索、自定义渲染、默认值等功能。

## 特性

- ✅ 支持搜索功能
- ✅ 自定义选项渲染
- ✅ 自定义值显示
- ✅ 默认值支持
- ✅ 受控/非受控模式
- ✅ 移动端友好的UI设计
- ✅ 完整的TypeScript支持

## 基本用法

```tsx
import SelectPop from '@/components/SelectPop';
import { useState } from 'react';

const MyComponent = () => {
  const [selectedValue, setSelectedValue] = useState();

  return (
    <SelectPop
      value={selectedValue}
      onChange={(value, option) => setSelectedValue(value)}
      options={[
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
      ]}
      placeholder="请选择"
      title="选择选项"
    />
  );
};
```

## 使用默认值

```tsx
<SelectPop
  defaultValue="option1" // 设置默认值，会自动回显对应的label
  onChange={(value, option) => setSelectedValue(value)}
  options={[
    { label: '选项1', value: 'option1' },
    { label: '选项2', value: 'option2' },
  ]}
  placeholder="请选择"
/>
```

## 受控模式

```tsx
<SelectPop
  value={selectedValue} // 受控模式
  defaultValue="option1" // 当value为undefined时使用defaultValue
  onChange={(value, option) => setSelectedValue(value)}
  options={[
    { label: '选项1', value: 'option1' },
    { label: '选项2', value: 'option2' },
  ]}
  placeholder="请选择"
/>
```

## API

### SelectPopProps

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 当前选中的值（受控模式） | `string \| number` | - |
| defaultValue | 默认选中的值（非受控模式） | `string \| number` | - |
| onChange | 值变化时的回调 | `(value: string \| number, option: OptionItem) => void` | - |
| options | 选项列表 | `OptionItem[]` | `[]` |
| placeholder | 占位符文本 | `string` | `"Please select"` |
| title | 弹窗标题 | `string` | `"Select Option"` |
| showSearch | 是否显示搜索框 | `boolean` | `true` |
| searchPlaceholder | 搜索框占位符 | `string` | `"Search"` |
| searchKeys | 搜索的字段名 | `string[]` | `['label', 'value']` |
| disabled | 是否禁用 | `boolean` | `false` |
| showAll | 是否回显全部 | `boolean` | `false` |
| showValue | 是否显示值 | `boolean` | `false` |
| className | 自定义样式类名 | `string` | - |
| renderOption | 自定义选项渲染 | `(option: OptionItem) => React.ReactNode` | - |
| renderValue | 自定义值显示 | `(option: OptionItem \| null) => React.ReactNode` | - |

### OptionItem

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| label | 显示的标签 | `React.ReactNode` | - |
| value | 选项的值 | `string \| number` | - |
| [key: string] | 其他自定义属性 | `any` | - |

## 方法

通过 ref 可以调用以下方法：

```tsx
const selectRef = useRef();

// 打开弹窗
selectRef.current?.open();

// 关闭弹窗
selectRef.current?.close();

// 聚焦（打开弹窗）
selectRef.current?.focus();

// 失焦（关闭弹窗）
selectRef.current?.blur();
```

## 注意事项

1. **优先级**：`value` 优先级高于 `defaultValue`，当 `value` 为 `undefined` 时才使用 `defaultValue`
2. **数字0**：数字0是有效值，不会被当作空值处理
3. **showAll属性**：当选中值为空或'all'时，根据 `showAll` 决定是显示"全部"还是placeholder
4. **受控/非受控**：可以只传 `defaultValue` 实现非受控模式，或者传 `value` 实现受控模式 