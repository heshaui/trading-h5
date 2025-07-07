# EmailAuto 邮箱自动补全组件

一个功能丰富的邮箱输入组件，支持自动补全、历史记录、邮箱后缀建议等功能。

## 功能特性

- ✅ **邮箱后缀自动补全** - 输入用户名时自动提示常用邮箱后缀
- ✅ **历史输入记录** - 记住用户之前输入的邮箱地址
- ✅ **智能搜索建议** - 支持模糊搜索历史记录和后缀匹配
- ✅ **Form.Item 集成** - 完美支持 antd-mobile Form 表单
- ✅ **响应式设计** - 适配移动端和桌面端
- ✅ **暗色主题支持** - 自动适配系统主题
- ✅ **TypeScript 支持** - 完整的类型定义

## 基本使用

### 1. 独立使用

```tsx
import { EmailAutoComplete } from '@/components/EmailAuto';

function MyComponent() {
  const [email, setEmail] = useState('');

  return (
    <EmailAutoComplete
      value={email}
      onChange={setEmail}
      placeholder="请输入邮箱地址"
      showHistory={true}
      maxHistoryCount={5}
    />
  );
}
```

### 2. 表单集成使用

```tsx
import EmailAuto from '@/components/EmailAuto';
import { Form, Button } from 'antd-mobile';

function LoginForm() {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('表单值:', values);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <EmailAuto 
        placeholder="请输入邮箱地址"
        showHistory={true}
        maxHistoryCount={10}
      />
      
      <Button type="submit">提交</Button>
    </Form>
  );
}
```

## API 参数

### EmailAutoComplete 组件

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `''` | 输入框值 |
| `onChange` | `(value: string) => void` | - | 值变化回调 |
| `placeholder` | `string` | `'Please enter email'` | 占位符文本 |
| `showHistory` | `boolean` | `true` | 是否显示历史输入 |
| `maxHistoryCount` | `number` | `5` | 最大历史记录数量 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `className` | `string` | - | 自定义样式类名 |
| `onFocus` | `() => void` | - | 获得焦点回调 |
| `onBlur` | `() => void` | - | 失去焦点回调 |

### EmailAuto 包装组件

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | - | 占位符文本 |
| `showHistory` | `boolean` | `true` | 是否显示历史输入 |
| `maxHistoryCount` | `number` | `5` | 最大历史记录数量 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `className` | `string` | - | 自定义样式类名 |

## 高级用法

### 1. 自定义历史记录数量

```tsx
<EmailAuto 
  showHistory={true}
  maxHistoryCount={10} // 最多保存10条历史记录
/>
```

### 2. 禁用历史记录功能

```tsx
<EmailAuto 
  showHistory={false} // 不显示历史记录
/>
```

### 3. 自定义样式

```tsx
<EmailAuto 
  className="my-custom-email-input"
/>
```

```scss
.my-custom-email-input {
  .emailInput {
    border-color: #ff4d4f;
    
    &:focus {
      border-color: #ff7875;
    }
  }
}
```

## 工作原理

### 建议逻辑

1. **空输入 + 聚焦**: 显示历史记录
2. **输入用户名**: 显示邮箱后缀建议 (`username@gmail.com`, `username@qq.com` 等)
3. **输入包含@**: 根据域名部分进行模糊匹配
4. **历史匹配**: 同时显示匹配的历史记录

### 历史记录管理

- 自动保存完整的邮箱地址到 `localStorage`
- 去重处理，最新的记录排在前面
- 支持自定义最大记录数量
- 支持完全禁用历史记录功能

## 注意事项

1. 历史记录存储在浏览器本地存储中
2. 只有包含 `@` 的完整邮箱才会被保存到历史
3. 组件会自动处理重复记录
4. 建议下拉框会在失去焦点时自动隐藏
5. 支持键盘回车键确认输入

## 样式定制

组件使用 CSS Modules，支持通过 CSS 变量进行主题定制：

```scss
:root {
  --theme-color: #1890ff; // 主题色
}
``` 