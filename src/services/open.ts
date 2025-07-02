import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';
import { log } from 'console';
const fixUrl=`/${API_MODULE_NAME.AMBIT_HOME_WEB}`
const fixUrl2=`/${API_MODULE_NAME.AMBIT_OSS}`

// 获取全部国家区号
export function getCountryCode(): Promise<any> {
  return request(`${fixUrl}/home-web/v1/open/country/selectHomeCountryList`, {
    method: 'GET',
  });
}
export function getPic(data:Array<string>): Promise<any> {
  return request(`${fixUrl}/home-web/v1/kv/paramsByKeys`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getPic2(key:string): Promise<any> {
  return request(`${fixUrl}/home-web/v1/kv/params/${key}`, {
    method: 'POST',
  });
}

// 上传图片
export function fileImg(file:File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file); // 将文件添加到 FormData 中，字段名为 'file'
  return request(`${fixUrl2}/oss/img/file`, {
    method: 'POST',
    body: formData,
    // headers: {
    //   'Content-Type': 'multipart/form-data',
    // },
  });
}
interface HomeImageType{
  key: string,
  languageCode: string,
  dayType: string,
  loginType: string
}
// 首页图片
export function getHomeImage(data:HomeImageType): Promise<any> {
  return request<HomeImageType>(`${fixUrl}/home-web/v1/open/home-image/homeImage`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
