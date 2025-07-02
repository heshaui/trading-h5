import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

// 获取主题颜色
export function getThemeColor(key: string) {
  return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/kv/params/${key}`, {
    method: 'POST'
  });
}