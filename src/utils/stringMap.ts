// 语言编码到目录名称的映射
type LangCode = 'zh_CN' | 'zh_HK' | 'en_US' | 'ja_JP' | 'ko_KR' | string;

const langCodeMapping: Record<LangCode, string> = {
    'zh_CN': 'zh',
    'zh_HK': 'hk',
    'en_US': 'en',
    'ja_JP': 'ja',
    'ko_KR': 'ko',
    // 添加更多常见语言支持
    'zh_TW': 'tw',
    'pt_BR': 'pt',
    'es_ES': 'es',
    'fr_FR': 'fr',
    'de_DE': 'de',
    'it_IT': 'it',
    'ru_RU': 'ru',
    'ar_SA': 'ar',
    'th_TH': 'th',
    'vi_VN': 'vi',
    'id_ID': 'id',
    'ms_MY': 'ms',
    'hi_IN': 'hi',
    'bn_BD': 'bn',
    'pl_PL': 'pl'
  };

const langSortCodeMapping: Record<LangCode, string> = {
    'zh': 'zh_CN',
    'hk': 'zh_HK',
    'en': 'en_US',
    'ja': 'ja_JP',
    'ko': 'ko_KR',
    // 添加更多常见语言支持
    'tw': 'zh_TW',
    'pt': 'pt_BR',
    'es': 'es_ES',
    'fr': 'fr_FR',
    'de': 'de_DE',
    'it': 'it_IT',
    'ru': 'ru_RU',
    'ar': 'ar_SA',
    'th': 'th_TH',
    'vi': 'vi_VN',
    'id': 'id_ID',
    'ms': 'ms_MY',
    'hi': 'hi_IN',
    'bn': 'bn_BD',
    'pl': 'pl_PL'
  };

/**
 * 标准化语言代码格式
 * 支持各种输入格式：zh-CN, ZH-CN, zh_cn, ZH_cn, zh-cn 等
 * @param code 原始语言代码
 * @returns 标准化后的语言代码
 */
function normalizeLanguageCode(code: string): string {
  if (!code) return '';
  
  // 移除空格并转换为小写
  const cleanCode = code.trim().toLowerCase();
  
  // 处理常见的分隔符：- 或 _
  const normalizedCode = cleanCode.replace('-', '_');
  
  // 如果包含分隔符，标准化为 xx_XX 格式
  if (normalizedCode.includes('_')) {
    const [lang, region] = normalizedCode.split('_');
    if (lang && region) {
      return `${lang.toLowerCase()}_${region.toUpperCase()}`;
    }
  }
  
  return normalizedCode;
}

/**
 * 检查是否为长格式语言代码
 * @param code 语言代码
 * @returns 是否为长格式
 */
function isLongLanguageCode(code: string): boolean {
  const normalized = normalizeLanguageCode(code);
  return normalized.includes('_') && normalized.split('_').length === 2;
}

/**
 * 通用语言映射函数
 * @param code 需要映射的语言代码（支持各种格式）
 * @param mapType 映射类型: 'toShort' (长代码转短代码) 或 'toLong' (短代码转长代码)
 * @returns 映射后的语言代码，如果没有找到映射则返回标准化后的代码
 */
export function mapLanguageCode(code: string, mapType: 'toShort' | 'toLong' = 'toShort'): string {
  if (!code) return '';
  
  // 先标准化输入
  const normalizedCode = normalizeLanguageCode(code);
  
  // 根据映射类型选择映射表
  const mappingTable = mapType === 'toShort' ? langCodeMapping : langSortCodeMapping;
  
  // 返回映射结果，如果没有找到映射则返回标准化后的代码
  return mappingTable[normalizedCode] || normalizedCode;
}

/**
 * 获取短语言代码
 * @param longCode 长语言代码 (支持各种格式：zh-CN, ZH-CN, zh_cn等)
 * @returns 短语言代码 (如 'zh')
 */
export function getShortLangCode(longCode: string): string {
  return mapLanguageCode(longCode, 'toShort');
}

/**
 * 获取长语言代码
 * @param shortCode 短语言代码 (如 'zh')
 * @returns 长语言代码 (如 'zh_CN')
 */
export function getLongLangCode(shortCode: string): string {
  return mapLanguageCode(shortCode, 'toLong');
}

/**
 * 自动检测并转换语言代码
 * 自动判断输入是长代码还是短代码，并转换为目标格式
 * 支持各种输入格式：zh-CN, ZH-CN, zh_cn, ZH_cn等
 * @param code 任意格式的语言代码
 * @param targetFormat 目标格式: 'short' 或 'long'
 * @returns 转换后的语言代码
 */
export function autoConvertLangCode(code: string, targetFormat: 'short' | 'long'): string {
  if (!code) return '';
  
  // 先标准化输入
  const normalizedCode = normalizeLanguageCode(code);
  
  // 使用新的判断函数来检测是否为长代码
  const isLongCode = isLongLanguageCode(normalizedCode);
  
  if (targetFormat === 'short') {
    return isLongCode ? getShortLangCode(normalizedCode) : normalizedCode;
  } else {
    return isLongCode ? normalizedCode : getLongLangCode(normalizedCode);
  }
}

/**
 * 验证语言代码是否被支持
 * @param code 语言代码
 * @param format 期望的格式：'short' | 'long' | 'auto'
 * @returns 是否被支持
 */
export function isLanguageCodeSupported(code: string, format: 'short' | 'long' | 'auto' = 'auto'): boolean {
  if (!code) return false;
  
  const normalizedCode = normalizeLanguageCode(code);
  
  if (format === 'auto') {
    // 检查是否在任一映射表中
    return Object.hasOwnProperty.call(langCodeMapping, normalizedCode) || 
           Object.hasOwnProperty.call(langSortCodeMapping, normalizedCode);
  } else if (format === 'short') {
    return Object.hasOwnProperty.call(langSortCodeMapping, normalizedCode);
  } else {
    return Object.hasOwnProperty.call(langCodeMapping, normalizedCode);
  }
}

/**
 * 获取所有支持的短语言代码
 * @returns 短语言代码数组
 */
export function getSupportedShortCodes(): string[] {
  return Object.keys(langSortCodeMapping);
}

/**
 * 获取所有支持的长语言代码
 * @returns 长语言代码数组
 */
export function getSupportedLongCodes(): string[] {
  return Object.keys(langCodeMapping);
}

// 导出映射表和标准化函数
export { langCodeMapping, langSortCodeMapping, normalizeLanguageCode, isLongLanguageCode };

