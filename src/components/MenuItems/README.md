# ExpandableMenu 可展开菜单组件

## 功能特点

- ✅ 支持多级菜单展开/收起
- ✅ 平滑的展开/收起动画效果
- ✅ 支持图标显示
- ✅ 响应式设计
- ✅ 支持点击事件回调
- ✅ TypeScript 类型支持

## 使用方法

### 基本使用

```tsx
import { ExpandableMenu, MenuItemType } from '@/components/MenuItems';

const menuItems: MenuItemType[] = [
    {
        key: 'trading',
        title: '交易',
        icon: menuIcon,
        children: [
            {
                key: 'spot',
                title: '现货交易',
                onClick: () => {
                    console.log('现货交易点击');
                }
            }
        ]
    }
];

<ExpandableMenu 
    menuItems={menuItems}
    onItemClick={handleMenuItemClick}
/>
```

### 数据格式

```typescript
interface MenuItemType {
    title: string;        // 菜单标题
    icon?: string;        // 菜单图标（可选）
    children?: MenuItemType[];  // 子菜单（可选）
    key: string;          // 唯一标识符
    onClick?: () => void; // 点击事件（可选）
}
```

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| menuItems | MenuItemType[] | 是 | 菜单数据数组 |
| onItemClick | (item: MenuItemType) => void | 否 | 菜单项点击回调 |

## 样式定制

组件使用 CSS Modules，可以通过以下 CSS 变量进行主题定制：

```scss
// 主要颜色变量
--bg-color1: 背景色
--bg-color2: 悬停背景色
--bg-color3: 激活背景色
--text-color1: 主文本颜色
--text-color2: 次文本颜色
--text-color5: 图标颜色
--border-color8: 边框颜色（浅）
--border-color9: 边框颜色（深）
```

## 动画效果

- **展开动画**: 使用 `max-height` 和 `opacity` 实现平滑展开
- **图标旋转**: 箭头图标在展开/收起时旋转 180 度
- **淡入效果**: 子菜单展开时有淡入动画

## 示例

查看 `MenuExample.tsx` 文件获取完整的使用示例。

## 注意事项

1. 每个菜单项必须有唯一的 `key` 值
2. 如果菜单项有 `children`，点击时会展开/收起子菜单
3. 如果菜单项没有 `children`，点击时会触发 `onClick` 事件
4. 图标路径需要是有效的图片资源路径 