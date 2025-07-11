# DateTimePop 日期时间选择弹窗组件

一个基于 antd-mobile 的日期时间范围选择弹窗组件，支持自定义内容和完全自定义的header。

## 特性

- ✅ 日期范围选择
- ✅ 自定义最小/最大日期
- ✅ 受控/非受控模式
- ✅ 自定义header内容
- ✅ 灵活的自定义内容（支持任意React组件）
- ✅ 移动端友好的UI设计
- ✅ 完整的TypeScript支持

## 基本用法

```tsx
import { DateTimePop } from '@/components/DateTimePop';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

const MyComponent = () => {
  const [visible, setVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  return (
    <DateTimePop
      popupVisible={visible}
      handlePopupClose={() => setVisible(false)}
      title="选择时间范围"
      value={dateRange}
      onChange={setDateRange}
      minDate={dayjs().subtract(6, 'month')}
      maxDate={dayjs()}
      placeholder={['开始时间', '结束时间']}
    />
  );
};
```

## 自定义Header

```tsx
<DateTimePop
  popupVisible={visible}
  handlePopupClose={() => setVisible(false)}
  title="选择时间范围"
  value={dateRange}
  onChange={setDateRange}
  customHeader={
    <div className="flex items-center justify-between">
      <span>自定义标题</span>
      <Button size="small">操作按钮</Button>
    </div>
  }
/>
```

## 自定义内容

```tsx
<DateTimePop
  popupVisible={visible}
  handlePopupClose={() => setVisible(false)}
  title="选择时间范围"
  value={dateRange}
  onChange={setDateRange}
  customContent={[
    // 使用默认的Checkbox
    {
      key: 'hideCancel',
      label: '隐藏所有已撤销',
      checked: hideCancel,
      onChange: setHideCancel
    },
    // 使用自定义组件
    {
      key: 'customSwitch',
      component: (
        <Switch
          checked={switchValue}
          onChange={setSwitchValue}
        >
          自定义开关
        </Switch>
      )
    },
    // 使用任意React组件
    {
      key: 'customButton',
      component: (
        <Button 
          size="small" 
          onClick={() => console.log('点击了自定义按钮')}
        >
          自定义按钮
        </Button>
      )
    }
  ]}
/>
```

## 禁用日期

```tsx
<DateTimePop
  popupVisible={visible}
  handlePopupClose={() => setVisible(false)}
  title="选择时间范围"
  value={dateRange}
  onChange={setDateRange}
  minDate={dayjs().subtract(6, 'month')}
  maxDate={dayjs()}
  disabledDate={(current, info) => {
    const { from } = info || {};
    
    if (from) {
      // 限制日期跨度不超过7天
      return Math.abs(current.diff(from, 'days')) > 7;
    }
    
    // 限制在6个月范围内
    return current.isBefore(dayjs().subtract(6, 'month')) || current.isAfter(dayjs());
  }}
/>
```

## API

### DateTimePopProps

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| popupVisible | 弹窗是否可见 | `boolean` | - |
| handlePopupClose | 关闭弹窗的回调 | `() => void` | - |
| title | 弹窗标题 | `string` | - |
| value | 当前选中的日期范围（受控模式） | `[Dayjs \| null, Dayjs \| null]` | - |
| defaultValue | 默认的日期范围（非受控模式） | `[Dayjs \| null, Dayjs \| null]` | - |
| onChange | 日期范围变化的回调 | `(dates: [Dayjs \| null, Dayjs \| null]) => void` | - |
| customHeader | 自定义header内容 | `React.ReactNode` | - |
| customContent | 自定义内容项 | `CustomContentItem[]` | `[]` |
| minDate | 最小可选日期 | `Dayjs` | - |
| maxDate | 最大可选日期 | `Dayjs` | - |
| placeholder | 占位符文本 | `[string, string]` | `['startDate', 'endDate']` |
| disabled | 是否禁用 | `boolean` | `false` |
| className | 自定义样式类名 | `string` | `''` |
| onOpen | 打开弹窗的回调 | `() => void` | - |
| disabledDate | 禁用日期函数 | `(currentDate: Dayjs, info?: { from?: Dayjs; type?: string }) => boolean` | - |

### CustomContentItem

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| key | 唯一标识符 | `string` | - |
| label | 标签文本（使用默认Checkbox时） | `string` | - |
| checked | 是否选中（使用默认Checkbox时） | `boolean` | - |
| onChange | 状态变化回调（使用默认Checkbox时） | `(checked: boolean) => void` | - |
| component | 自定义React组件 | `React.ReactNode` | - |

## 方法

通过 ref 可以调用以下方法：

```tsx
const dateTimeRef = useRef();

// 重置到默认值
dateTimeRef.current?.reset();

// 获取当前值
const currentValue = dateTimeRef.current?.getValue();

// 获取自定义内容状态
const customStates = dateTimeRef.current?.getCustomStates();
```

## 注意事项

1. 当同时传入 `value` 和 `defaultValue` 时，`value` 优先级更高
2. `customContent` 中的 `component` 和 `label` 二选一，`component` 优先级更高
3. 组件内部会自动处理日期范围的逻辑校验（开始时间不能晚于结束时间）
4. 移动端优化：使用 antd-mobile 的 DatePickerView 组件 