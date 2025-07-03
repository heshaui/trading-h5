import { useState, useEffect } from 'react';

export const useThemeMode = () => {
    const [isDayMode, setIsDayMode] = useState(() => {
        // 初始化时从 localStorage 获取状态
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('theme');
            return savedMode === 'true';
        }
        return true;
    });

    useEffect(() => {
        // 监听主题变化事件
        const handleThemeChange = () => {
            const currentMode = localStorage.getItem('theme');
            setIsDayMode(currentMode === 'true');
        };

        window.addEventListener('themeChange', handleThemeChange);
        
        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
        };
    }, []);

    return { isDayMode };
};