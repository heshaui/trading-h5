import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';
import { ExchangeRateParams, LanguageParams } from '@/type/types';

// 获取首页菜单
export function homeMenu(data: { lang: string }) {
  // 加密请求数据
  // const encryptedData = encryptWithPublicKey(JSON.stringify(data));
  // if (!encryptedData) {
  //   throw new Error('加密失败');
  // }

  // 替换路径参数并发送请求
  let lang
  if(data.lang==='en'){
    lang='en_US'
  }else if(data.lang==='zh'){
    lang='zh_CN'
  }else {
    lang=data.lang
  }
  return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/menu/selectHomeMenuJson/${lang}`, {
    method: 'POST',
    body: JSON.stringify(data), // 将加密后的数据作为请求体
  });
}
// 获取语言
export function getLanguage(data: LanguageParams) {
  return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/open/language/langQuery`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 获取汇率
export function exchangeRate(data: ExchangeRateParams) {
  return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/open/exchangeRate/exchangeRateQuery`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
