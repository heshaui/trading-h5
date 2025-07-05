import { useEffect } from 'react';
import appStore from '@/store';
import { checkImageUrl } from './useKv';
import { useThemeMode } from '@/hooks/useThemeMode'
// 检查是否在浏览器环境
const isBrowser = () => typeof window !== 'undefined';

/**
 * 自定义钩子，用于设置网站favicon
 * @param defaultFavicon 默认favicon路径
 */
export const useFavicon = (defaultFavicon: string = '/favicon.ico') => {
    const { isDayMode } = useThemeMode()
  const setFavicon = async () => {
    try {
      if (!isBrowser()) return;

      // 从store中获取KV配置
      const config = appStore.getKvConfigAll();
      
      // 检查是否有logo配置
      if (!config.logo) return;
      
      // 获取favicon配置，优先使用专门的favicon配置，如果没有则尝试使用logo配置
      const faviconUrl = isDayMode ? config.logo?.light?.favicon : config.logo?.dark?.favicon 
      
      if (faviconUrl) {
        // 验证图片URL是否可用
        const isValidUrl = await checkImageUrl(faviconUrl);
        
        if (isValidUrl) {
          // 获取现有的favicon元素
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          
          // 如果没有找到favicon元素，创建一个新的
          if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.head.appendChild(link);
          }
          
          // 设置favicon的href属性
          link.href = faviconUrl;
        } else {
          // 如果URL无效，使用默认favicon
          setDefaultFavicon(defaultFavicon);
        }
      } else {
        // 如果没有配置favicon，使用默认favicon
        setDefaultFavicon(defaultFavicon);
      }
    } catch (error) {
      console.error('设置favicon失败:', error);
      // 出错时使用默认favicon
      setDefaultFavicon(defaultFavicon);
    }
  };
  
  // 设置默认favicon的函数
  const setDefaultFavicon = (defaultPath: string) => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    
    link.href = defaultPath;
  };
  useEffect(() => {
 
    
    // 执行设置favicon的函数
    setFavicon();
    
    // 监听store中KV配置的变化（如果有相关事件）
    // 这里可以添加监听器，当KV配置更新时重新设置favicon
    
  }, [defaultFavicon,isDayMode]);
};

export default useFavicon;
