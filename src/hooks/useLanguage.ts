import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { loadLanguage } from '../utils/i18n';

export const useLanguage = (namespace?: string | string[]) => {
  const { i18n, t } = useTranslation(namespace);
  const [isLoading, setIsLoading] = useState(false);
  
  const changeLanguage = async (lng: string) => {
    setIsLoading(true);
    try {
      // 动态加载语言包
      await loadLanguage(lng);
      // 切换语言
      await i18n.changeLanguage(lng);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentLanguage = i18n.language;
  
  return {
    t,
    currentLanguage,
    changeLanguage,
    isLoading,
    isZh: currentLanguage === 'zh',
    isEn: currentLanguage === 'en',
  };
}; 