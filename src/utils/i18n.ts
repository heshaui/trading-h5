import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { loadLanguageResources } from './languageLoader';

// 只预加载默认语言（中文）
import zhCommon from '../locales/zh/common.json';
import zhAssets from '../locales/zh/assets.json';
import zhBuiletinCenter from '../locales/zh/builetinCenter.json';
import zhFlash from '../locales/zh/flash.json';
import zhHelpCenter from '../locales/zh/helpCenter.json';
import zhHome from '../locales/zh/home.json';
import zhInvite from '../locales/zh/invite.json';
import zhLogin from '../locales/zh/login.json';
import zhMarket from '../locales/zh/market.json';
import zhNotice from '../locales/zh/notice.json';
import zhOverview from '../locales/zh/overview.json';
import zhResetPassword from '../locales/zh/resetPassword.json';
import zhSafe from '../locales/zh/safe.json';
import zhSpot from '../locales/zh/spot.json';
import zhUserCenter from '../locales/zh/userCenter.json';
import zhContract from '../locales/zh/contract.json';

// 初始资源，只包含默认语言
const resources = {
  zh: {
    common: zhCommon,
    assets: zhAssets,
    builetinCenter: zhBuiletinCenter,
    flash: zhFlash,
    helpCenter: zhHelpCenter,
    home: zhHome,
    invite: zhInvite,
    login: zhLogin,
    market: zhMarket,
    notice: zhNotice,
    overview: zhOverview,
    resetPassword: zhResetPassword,
    safe: zhSafe,
    spot: zhSpot,
    userCenter: zhUserCenter,
    contract: zhContract
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    defaultNS: 'common',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// 动态加载语言资源的函数
export const loadLanguage = async (language: string) => {
  // 如果语言已经加载过，直接返回
  if (i18n.hasResourceBundle(language, 'common')) {
    return;
  }

  try {
    const languageResources = await loadLanguageResources(language);
    
    // 添加语言资源到 i18next
    Object.keys(languageResources).forEach(namespace => {
      i18n.addResourceBundle(language, namespace, languageResources[namespace as keyof typeof languageResources]);
    });
  } catch (error) {
    console.error(`Failed to load language ${language}:`, error);
  }
};

export default i18n; 