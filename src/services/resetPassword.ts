import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';
const fixUrl=`/${API_MODULE_NAME.AMBIT_AUTH}`

interface codeType {
  number: string,
  code?: string,
  deviceType: string
}
interface codeEncrypt {
  data: string,
  time: string|number,
  reqNo: string|number
}
interface checkType{
  type: string,
  account: string,
  code: string,
  googleCode?: string
}
interface checkEncrypt{
  type: string,
  account: string,
  password: string,
  passwordConfirm: string
}
// 重置密码-邮件验证码-未登录
export function getResetMailCode(data: codeType|codeEncrypt): Promise<any> {
  return request(`${fixUrl}/email/send/not/retrieveCheckEmail`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 重置密码-短信-未登录
export function getResetSmsCode(data: codeType|codeEncrypt): Promise<any> {
  return request(`${fixUrl}/sms/send/not/retrieveCheckSms`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 重置密码校验
export function getResetPasswordCheck(data: checkType|codeEncrypt): Promise<any> {
  return request(`${fixUrl}/auth/retrievePasswordCheck`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 重置密码
// 重置密码-执行修改 - 3
export function getResetPassword(data: checkEncrypt|codeEncrypt): Promise<any> {
  return request(`${fixUrl}/auth/retrievePassword`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 重置密码-获取校验规则 - 1
export function getCheckRule(data: codeEncrypt): Promise<any> {
  return request(`${fixUrl}/auth/retrievePasswordParams`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 重置密码-验证码校验 - 2
export function getCheckCode(data:codeEncrypt): Promise<any> {
  return request(`${fixUrl}/auth/retrievePasswordCheck`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

