import { request } from '@/request/index';


// 获取kv
export const getLangFile = async ({key}: {key: string}) => {
  try {
    // 使用fetch API 或 axios
    const response = await fetch(`/home-web/v1/open/userLangPackage/userLangPackageDetail`);
    
    return response;
  } catch (error) {
    console.error('获取语言文件失败:', error);
    return { data: null, code: 'error' };
  }
}
