// 语言包加载器
export const loadLanguageResources = async (language: string) => {
  try {
    // 动态导入语言包
    const modules = await Promise.all([
      import(`../locales/${language}/common.json`),
      import(`../locales/${language}/assets.json`),
      import(`../locales/${language}/builetinCenter.json`),
      import(`../locales/${language}/helpCenter.json`),
      import(`../locales/${language}/home.json`),
      import(`../locales/${language}/invite.json`),
      import(`../locales/${language}/login.json`),
      import(`../locales/${language}/market.json`),
      import(`../locales/${language}/notice.json`),
      import(`../locales/${language}/overview.json`),
      import(`../locales/${language}/resetPassword.json`),
      import(`../locales/${language}/safe.json`),
      import(`../locales/${language}/spot.json`),
      import(`../locales/${language}/userCenter.json`),
      // 可选的翻译文件（有些语言可能没有）
      import(`../locales/${language}/flash.json`).catch(() => ({ default: {} })),
      import(`../locales/${language}/contract.json`),
    ]);

    // 返回组织好的语言包
    return {
      common: modules[0].default,
      assets: modules[1].default,
      builetinCenter: modules[2].default,
      helpCenter: modules[3].default,
      home: modules[4].default,
      invite: modules[5].default,
      login: modules[6].default,
      market: modules[7].default,
      notice: modules[8].default,
      overview: modules[9].default,
      resetPassword: modules[10].default,
      safe: modules[11].default,
      spot: modules[12].default,
      userCenter: modules[13].default,
      flash: modules[14].default,
      contract: modules[15].default
    };
  } catch (error) {
    console.error(`Failed to load language resources for ${language}:`, error);
    // 返回空对象作为回退
    return {
      common: {},
      assets: {},
      builetinCenter: {},
      helpCenter: {},
      home: {},
      invite: {},
      login: {},
      market: {},
      notice: {},
      overview: {},
      resetPassword: {},
      safe: {},
      spot: {},
      userCenter: {},
      flash: {},
      contract: {}
    };
  }
};

// 支持的语言列表
export const supportedLanguages = [
  'zh', 'en', 'ja', 'ko', 'hk', 'vi', 'th', 'ru', 'pt', 'pl', 'hi', 'bn'
];

// 语言显示名称映射
export const languageNames = {
  zh: '中文简体',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  hk: '中文繁體',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  ru: 'Русский',
  pt: 'Português',
  pl: 'Polski',
  hi: 'हिन्दी',
  bn: 'বাংলা',
}; 