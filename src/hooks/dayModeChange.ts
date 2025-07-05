import { useEffect } from 'react';
import { getThemeVariables } from '@/hooks/themes';
import { themeStore } from '@/stores/ThemeStore';

const isClient = typeof window !== 'undefined';
// const { isDark } = useTheme();

// 应用主题变量到CSS的工具函数
export const applyThemeVariables = (isDarkMode: boolean) => {
    if (!isClient) return;
    
    try {
        const themeVars = getThemeVariables();
        const theme = isDarkMode ? themeVars.dark : themeVars.light;

        // 确保获取到主题变量
        if (!theme || Object.keys(theme).length === 0) {
            return;
        }

        // 将主题变量应用到 CSS 变量
        Object.entries(theme).forEach(([key, value]) => {
            if (key && value) {
                document.documentElement.style.setProperty(key, value as string);
            }
        });

        // 添加主题标识到body，便于样式调试
        document.body.setAttribute('data-theme-applied', isDarkMode ? 'dark' : 'light');

        // 触发主题变更事件，通知其他组件
        window.dispatchEvent(new Event('themeChange'));
        
    } catch (e) {
        console.error('应用主题变量失败:', e);
    }
};

// 初始化主题函数
export const initTheme = () => {
    if (isClient) {
        // 获取当前主题模式（白天/黑夜）
        const isDarkMode = localStorage.getItem('theme') === 'dark';
        
        // 应用主题变量
        applyThemeVariables(isDarkMode);
        
        // 监听主题色更新事件
        const handleThemeColorUpdate = () => {
            // 主题色更新时重新应用当前主题
            const currentTheme = localStorage.getItem('theme');
            const currentIsDark = currentTheme === 'dark';
            applyThemeVariables(currentIsDark);
        };
        
        // 添加主题色更新事件监听
        window.addEventListener('themeColorUpdate', handleThemeColorUpdate);
        
        console.log('初始化主题系统完成');
    }
};

// 在React组件中使用的Hook
export const useThemeEffect = () => {
    useEffect(() => {
        // 初始化主题
        initTheme();
        
        // 监听主题变化
        const handleThemeChange = () => {
            const isDarkMode = themeStore.isDark;
            applyThemeVariables(isDarkMode);
        };
        
        // 添加事件监听
        window.addEventListener('themeChange', handleThemeChange);
        
        // 清理函数
        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
            window.removeEventListener('themeColorUpdate', () => {
                const currentTheme = localStorage.getItem('theme');
                const currentIsDark = currentTheme === 'dark';
                applyThemeVariables(currentIsDark);
            });
        };
    }, []);
};