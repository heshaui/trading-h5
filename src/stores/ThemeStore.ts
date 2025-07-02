import { makeAutoObservable } from 'mobx';
import { applyThemeVariables } from '@/hooks/dayModeChange';

export type ThemeMode = 'light' | 'dark';

class ThemeStore {
  theme: ThemeMode = 'light';

  constructor() {
    makeAutoObservable(this);
    this.initTheme();
  }

  private initTheme() {
    // 从localStorage读取主题设置
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      this.theme = savedTheme;
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme();
  }

  setTheme(theme: ThemeMode) {
    this.theme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  private applyTheme() {
    const root = document.documentElement;
    const isDarkMode = this.theme === 'dark';
    
    // 应用基础主题类
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // 应用主题变量到CSS
    applyThemeVariables(isDarkMode);
  }

  get isDark() {
    return this.theme === 'dark';
  }

  get isLight() {
    return this.theme === 'light';
  }
}

export const themeStore = new ThemeStore();
export default themeStore; 