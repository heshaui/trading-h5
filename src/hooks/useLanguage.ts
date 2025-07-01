import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const currentLanguage = i18n.language;
  
  return {
    t,
    currentLanguage,
    changeLanguage,
    isZh: currentLanguage === 'zh',
    isEn: currentLanguage === 'en',
  };
}; 