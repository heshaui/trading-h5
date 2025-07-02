import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';
const fixUrl=`/${API_MODULE_NAME.AMBIT_AUTH}`

// 登录
export function getLogin(data: encryptType): Promise<any> {
  return request(`${fixUrl}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 注册
export function getRegister(data: encryptType): Promise<any> {
  return request(`${fixUrl}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 登录检查
export function getLoginCheck(data: encryptType): Promise<any> {
  return request(`${fixUrl}/auth/loginCheck`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


interface codeType {
  number: string,
  code?: string,
  deviceType: string
}
interface encryptType {
  data: string,
  time: string|number,
  reqNo: string|number
}
// 登录-邮件验证码-未登录
export function getLoginMailCode(data: codeType|encryptType): Promise<any> {
  return request(`${fixUrl}/email/send/not/loginCheckEmail`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 登录-短信-未登录
export function getLoginSmsCode(data: codeType|encryptType): Promise<any> {
  return request(`${fixUrl}/sms/send/not/loginCheckSms`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 注册-邮件验证码-未登录

export function getRegisterMailCode(data: codeType|encryptType): Promise<any> {
  return request(`${fixUrl}/email/send/not/registerCheckEmail`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 注册-短信-未登录
export function getRegisterSmsCode(data: codeType|encryptType): Promise<any> {
  return request(`${fixUrl}/sms/send/not/registerCheckSms`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}



