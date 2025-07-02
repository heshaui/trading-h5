# 动态主题系统使用指南

## 系统架构

本项目实现了完整的动态主题系统，支持：
- ✅ 日夜间主题切换
- ✅ 通过接口动态获取主题色
- ✅ 自动应用主题变量到CSS

## 文件结构

```
src/
├── App.tsx                  # 使用useThemeEffect应用动态主题
├── hooks/
│   ├── themes.ts            # 主题色映射文件（核心）
│   ├── dayModeChange.ts     # 主题变量应用工具
│   └── index.ts             # 统一导出
└── stores/
    └── ThemeStore.ts        # 主题状态管理
```

## 工作流程

1. **App.tsx** 使用 `useThemeEffect` Hook 初始化主题系统
2. **ThemeStore.ts** 管理主题状态，并在切换主题时调用 `applyThemeVariables`
3. **themes.ts** 从接口获取主题色，并生成主题变量映射
4. **dayModeChange.ts** 将主题变量应用到CSS

## 使用方法

### 1. 初始化主题系统（已在App.tsx中完成）

```tsx
import { useThemeEffect } from '@/hooks/dayModeChange';

const App = () => {
  // 应用动态主题映射文件
  useThemeEffect();
  
  return <div className="app">...</div>;
};
```

### 2. 切换主题

```tsx
import { themeStore } from '@/stores/ThemeStore';

// 切换主题
themeStore.toggleTheme();

// 设置特定主题
themeStore.setTheme('dark');
```

### 3. 在组件中使用主题状态

```tsx
import { useTheme } from '@/hooks/useTheme';

const MyComponent = () => {
  const { isDark } = useTheme();
  
  return (
    <div>
      当前主题: {isDark ? '暗色' : '亮色'}
    </div>
  );
};
```

### 4. 更新主题色

```tsx
import { updateThemeColor } from '@/hooks/themes';

// 当接口返回新主题色时
updateThemeColor('#FF5F1F');
```

## 核心文件说明

### themes.ts

主题色映射文件，通过接口获取主题色，并生成完整的主题变量映射：

```typescript
export const getThemeVariables = () => {
  const themeColor = getThemeColorFromStorage();
  
  return {
    light: {
      '--theme-color': themeColor,
      // ... 其他变量
    },
    dark: {
      '--theme-color': themeColor,
      // ... 其他变量
    }
  };
};
```

### dayModeChange.ts

主题变量应用工具，将主题变量应用到CSS：

```typescript
export const applyThemeVariables = (isDarkMode: boolean) => {
  const themeVars = getThemeVariables();
  const theme = isDarkMode ? themeVars.dark : themeVars.light;
  
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
};
```

### ThemeStore.ts

主题状态管理，处理主题切换：

```typescript
private applyTheme() {
  const isDarkMode = this.theme === 'dark';
  
  // 应用基础主题类
  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // 应用主题变量到CSS
  applyThemeVariables(isDarkMode);
}
```

## 扩展主题变量

如果需要添加新的主题变量，只需在 `themes.ts` 的 `getThemeVariables` 函数中添加：

```typescript
export const getThemeVariables = () => {
  const themeColor = getThemeColorFromStorage();
  
  return {
    light: {
      // 添加新的变量
      '--my-custom-color': '#FF0000',
      '--my-bg-color': getColorWithOpacity(themeColor, 0.1),
    },
    dark: {
      // 添加新的变量
      '--my-custom-color': '#00FF00',
      '--my-bg-color': getColorWithOpacity(themeColor, 0.3),
    }
  };
};
```

## 在CSS中使用主题变量

```css
.my-component {
  background-color: var(--background-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.my-button {
  background-color: var(--theme-color);
  color: white;
}
``` 