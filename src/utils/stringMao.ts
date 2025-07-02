// 语言编码到目录名称的映射
type LangCode = 'zh_CN' | 'zh_HK' | 'en_US' | 'ja_JP' | 'ko_KR' | string;

const langCodeMapping: Record<LangCode, string> = {
    'zh_CN': 'zh',
    'zh_HK': 'hk',
    'en_US': 'en',
    'ja_JP': 'ja',
    'ko_KR': 'ko'
  };

const langSortCodeMapping: Record<LangCode, string> = {
    'zh': 'zh_CN',
    'hk': 'zh_HK',
    'en': 'en_US',
    'ja': 'ja_JP',
    'ko': 'ko_KR'
  };

/**
 * 通用语言映射函数
 * @param code 需要映射的语言代码
 * @param mapType 映射类型: 'toShort' (长代码转短代码) 或 'toLong' (短代码转长代码)
 * @returns 映射后的语言代码，如果没有找到映射则返回原始代码
 */
export function mapLanguageCode(code: string, mapType: 'toShort' | 'toLong' = 'toShort'): string {
  if (!code) return '';
  
  // 根据映射类型选择映射表
  const mappingTable = mapType === 'toShort' ? langCodeMapping : langSortCodeMapping;
  
  // 返回映射结果，如果没有找到映射则返回原始代码
  return mappingTable[code] || code;
}

/**
 * 获取短语言代码
 * @param longCode 长语言代码 (如 'zh_CN')
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
// 自动检测并映射
/**
 * 自动检测并转换语言代码
 * 自动判断输入是长代码还是短代码，并转换为目标格式
 * @param code 任意格式的语言代码
 * @param targetFormat 目标格式: 'short' 或 'long'
 * @returns 转换后的语言代码
 */
export function autoConvertLangCode(code: string, targetFormat: 'short' | 'long'): string {
  if (!code) return '';
  
  // 判断输入是长代码还是短代码
  const isLongCode = code.includes('_');
  
  if (targetFormat === 'short') {
    return isLongCode ? getShortLangCode(code) : code;
  } else {
    return isLongCode ? code : getLongLangCode(code);
  }
}

export { langCodeMapping, langSortCodeMapping };

