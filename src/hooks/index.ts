export { useTheme } from './useTheme';
export { useLanguage } from './useLanguage';

// 动态主题系统
export { 
  applyThemeVariables, 
  initTheme, 
  useThemeEffect 
} from './dayModeChange';

export { 
  getThemeVariables, 
  getThemeColorFromStorage, 
  updateThemeColor,
  getColorWithOpacity,
  getColorWithLowerBrightness
} from './themes';