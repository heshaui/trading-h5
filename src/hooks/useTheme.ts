import { useStore } from '../stores';
import { observer } from 'mobx-react-lite';

export const useTheme = () => {
  const { themeStore } = useStore();
  
  return {
    theme: themeStore.theme,
    isDark: themeStore.isDark,
    isLight: themeStore.isLight,
    setTheme: themeStore.setTheme.bind(themeStore),
    toggleTheme: themeStore.toggleTheme.bind(themeStore),
  };
}; 