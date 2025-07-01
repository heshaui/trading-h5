import { makeAutoObservable } from 'mobx';

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
    if (this.theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
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