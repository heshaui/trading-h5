import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';
const fixUrl=`/${API_MODULE_NAME.AMBIT_HOME_WEB}`
const fixUrl2=`/${API_MODULE_NAME.AMBIT_USER_WEB}`



// 获取kv
export const getLangFile = async ({key}: {key: string}) => {
  try {
    // 使用fetch API 或 axios
    const response = await fetch(`${fixUrl}/home-web/v1/open/userLangPackage/userLangPackageDetail`);
    
    return response;
  } catch (error) {
    console.error('获取语言文件失败:', error);
    return { data: null, code: 'error' };
  }
}

// 更新用户语言偏好
export const updateLanguage = async () => {
  return request(`${fixUrl2}/user-web/v1/user-cache/updateLanguage`, {
    method: 'GET',
  });
}
