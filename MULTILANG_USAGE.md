# 多语言系统使用说明

## 概述

本项目采用了基于 i18next 的动态加载多语言系统，支持12种语言，按需加载语言包，优化了应用的初始加载速度。

## 支持的语言

- `zh` - 中文简体
- `en` - English
- `ja` - 日本語  
- `ko` - 한국어
- `hk` - 中文繁體
- `vi` - Tiếng Việt
- `th` - ไทย
- `ru` - Русский
- `pt` - Português
- `pl` - Polski
- `hi` - हिन्दी
- `bn` - বাংলা

## 核心文件

### 1. `src/utils/languageLoader.ts`
- 动态加载语言包的核心逻辑
- 导出支持的语言列表和语言名称映射
- 处理可选翻译文件（如 flash.json）

### 2. `src/utils/i18n.ts`
- i18next 配置文件
- 只预加载默认语言（中文）
- 提供 `loadLanguage` 函数用于动态加载其他语言

### 3. `src/hooks/useLanguage.ts`
- React Hook，提供语言切换功能
- 支持异步语言加载
- 提供加载状态

### 4. `src/components/LanguageToggle/index.tsx`
- 语言切换组件
- 显示加载状态
- 使用集中管理的语言配置

## 使用方法

### 1. 基本使用

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* 使用默认命名空间 (common) */}
      <p>{t('submit')}</p>
      
      {/* 指定命名空间 */}
      <p>{t('login:username')}</p>
      <p>{t('market:price')}</p>
      <p>{t('assets:balance')}</p>
    </div>
  );
};
```

### 2. 语言切换

```tsx
import { useLanguage } from '../hooks/useLanguage';

const MyComponent = () => {
  const { changeLanguage, isLoading, currentLanguage } = useLanguage();
  
  const handleLanguageChange = async () => {
    await changeLanguage('en'); // 切换到英文
  };
  
  return (
    <div>
      <p>当前语言: {currentLanguage}</p>
      <button onClick={handleLanguageChange} disabled={isLoading}>
        {isLoading ? '加载中...' : '切换到英文'}
      </button>
    </div>
  );
};
```

### 3. 使用语言切换组件

```tsx
import LanguageToggle from '../components/LanguageToggle';

const MyComponent = () => {
  return (
    <div>
      <LanguageToggle />
    </div>
  );
};
```

## 命名空间说明

项目中的翻译文件按功能模块组织成不同的命名空间：

- `common` - 通用翻译（默认命名空间）
- `assets` - 资产相关
- `builetinCenter` - 公告中心
- `flash` - 快讯（可选，部分语言可能没有）
- `helpCenter` - 帮助中心
- `home` - 首页
- `invite` - 邀请
- `login` - 登录
- `market` - 市场
- `notice` - 通知
- `overview` - 概览
- `resetPassword` - 重置密码
- `safe` - 安全
- `spot` - 现货交易
- `userCenter` - 用户中心

## 添加新语言

1. 在 `src/locales/` 下创建新的语言文件夹
2. 复制现有语言的所有 JSON 文件到新文件夹
3. 翻译 JSON 文件中的内容
4. 在 `src/utils/languageLoader.ts` 中添加新语言：
   ```ts
   export const supportedLanguages = [
     // ... 现有语言
     'newLang'
   ];
   
   export const languageNames = {
     // ... 现有语言
     newLang: '新语言名称'
   };
   ```

## 注意事项

1. **命名空间使用**: 使用 `namespace:key` 格式访问特定命名空间的翻译
2. **回退值**: 建议为 `t()` 函数提供回退值：`t('key', 'fallback text')`
3. **异步加载**: 语言切换是异步操作，需要使用 `await` 或处理 Promise
4. **可选文件**: 系统会自动处理缺失的翻译文件（如 flash.json）
5. **缓存**: 已加载的语言包会被缓存，不会重复加载

## 性能优势

- **按需加载**: 只在需要时加载对应语言包
- **减少初始包大小**: 默认只加载中文，其他语言动态加载
- **缓存机制**: 避免重复加载相同语言包
- **错误处理**: 优雅处理缺失的翻译文件

## 示例页面

访问 `/demo` 页面可以看到多语言功能的完整演示。 