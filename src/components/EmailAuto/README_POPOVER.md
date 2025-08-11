# EmailAuto 邮箱自动完成组件 (Popover 版本)

这是一个使用 Popover 组件重构的邮箱自动完成组件，提供更好的用户体验。

## ✨ 功能特性

- 📧 **邮箱后缀自动建议** - 支持常见邮箱后缀智能补全
- 🕒 **历史输入记录** - 自动保存和显示历史输入的邮箱
- 🔍 **智能匹配** - 根据输入内容智能过滤建议
- 🎨 **Popover UI** - 使用 antd-mobile Popover 组件提供更好的用户体验
- 📱 **移动端友好** - 针对移动端优化的交互体验

## 🎯 主要更新

### 替换为 Popover 组件
- ✅ 使用 `antd-mobile` 的 `Popover` 组件替代原生下拉框
- ✅ 更标准的 UI 组件和更好的视觉效果
- ✅ 更流畅的显示隐藏动画和事件处理
- ✅ 增强可访问性：更好的键盘导航和屏幕阅读器支持

### UI 改进
- ✅ 建议列表最大高度限制（240px）
- ✅ 自动滚动条当建议项过多时
- ✅ 更好的间距和圆角设计
- ✅ 历史标签样式优化

## 📋 使用方法

### 基础用法

```jsx
import EmailAutoComplete from '@/components/EmailAuto';

function MyForm() {
  const [email, setEmail] = useState('');

  return (
    <EmailAutoComplete
      value={email}
      onChange={setEmail}
      placeholder="请输入邮箱地址"
    />
  );
}
```

### 在表单中使用

```jsx
import { Form } from 'antd-mobile';
import EmailAutoComplete from '@/components/EmailAuto';

function RegisterForm() {
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <Form.Item name="email" label="邮箱">
        <EmailAutoComplete placeholder="请输入邮箱地址" />
      </Form.Item>
    </Form>
  );
}
```

### 自定义配置

```jsx
<EmailAutoComplete
  value={email}
  onChange={setEmail}
  placeholder="请输入邮箱地址"
  showHistory={true}        // 显示历史记录
  maxHistoryCount={10}      // 最大历史记录数
  disabled={false}          // 是否禁用
  onFocus={() => {}}        // 聚焦回调
  onBlur={() => {}}         // 失焦回调
/>
```

## ⚙️ Props 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `''` | 输入值 |
| `onChange` | `(value: string) => void` | - | 值改变回调 |
| `placeholder` | `string` | `'Please enter email'` | 占位符文本 |
| `showHistory` | `boolean` | `true` | 是否显示历史记录 |
| `maxHistoryCount` | `number` | `5` | 最大历史记录数量 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `className` | `string` | - | 自定义样式类名 |
| `onFocus` | `() => void` | - | 聚焦回调 |
| `onBlur` | `() => void` | - | 失焦回调 |

## 🎨 样式定制

组件使用了以下 CSS 类名，可以通过覆盖这些类名来自定义样式：

```scss
.emailAutoContainer {
  // 容器样式
}

.inputWrapper {
  // 输入框包装器
}

.emailInput {
  // 输入框样式
}

.suggestionsContainer {
  // 建议列表容器
}

.suggestionItem {
  // 建议项样式
  
  &:hover {
    background-color: var(--adm-color-fill-secondary);
  }
}

.suggestionHeader {
  // 建议列表头部
}

.suggestionTag {
  // 历史标签
}
```

## 📱 移动端优化

- 使用 `Popover` 组件确保在移动端正确显示
- 自适应容器宽度，最小280px，最大400px
- 触摸友好的间距设计
- 支持滚动查看更多建议

## 🔧 技术实现

### Popover 配置
```jsx
<Popover
  content={renderSuggestionsContent()}
  placement="bottom"
  visible={showSuggestions && suggestions.length > 0}
  onVisibleChange={handlePopoverVisibleChange}
  trigger={["manual"] as any}
  destroyOnHide
  getContainer={() => document.body}
  style={{
    '--z-index': '1050',
  }}
>
```

### 关键特性
- `trigger="manual"`: 手动控制显示隐藏
- `destroyOnHide`: 隐藏时销毁内容，提升性能
- `getContainer={() => document.body}`: 挂载到 body，避免层级问题
- 自定义 z-index 确保正确的层叠顺序

## 🔄 迁移指南

如果你正在从旧版本升级，主要变化：

1. **UI 改进**: Popover 替代原生下拉框
2. **样式更新**: 部分 CSS 类名可能需要调整
3. **事件处理**: 优化了焦点和点击事件的处理逻辑
4. **性能提升**: 使用 `destroyOnHide` 提升性能

大部分 API 保持不变，升级应该是无痛的。