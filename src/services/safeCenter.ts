import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`
const fixUrl2 = `/${API_MODULE_NAME.AMBIT_AUTH}`

interface UserIdentityInfoType {
  userId: number | string;
}
interface LoginLogListType {
  pageNo?: number,
  pageSize?: number,
  offset?: number,
  id?: number|string,
  userId?: number|string,
  deviceNo?: string
}
//用户登录日志列表
export function getUserLoginLogList(data: LoginLogListType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/userLoginLogList`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
//  用户设备列表
export function getUserDeviceNoList(data: LoginLogListType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/userDeviceNoList`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
// 删除用户设备列表
export function delectUserDeviceNo(data: LoginLogListType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/deleteDeviceNoList`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
// 用户设备列表详情
export function getDeviceNoListDetail(data: LoginLogListType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/userDeviceNoListDetail`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
// 用户安全设置记录列表
export function getUserSafeSettingLoginLogList(data: LoginLogListType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/userSafeSettingLogList`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

//   安全中心
export function getSafeCenter(): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/safeCenter`, {
    method: 'POST',
    //   body:JSON.stringify(data)
  });
}
interface BindPhoneType {
  userId?: number,
  isGoogleAuth?: number,
  isPhoneAuth?: number,
  isEmailAuth?: number,
  email?: string,
  phone?: string,
  phoneStatus?: number,
  password?: string,
  newPassword?: string,
  confirmPassword?: string,
  code?: string,
  googleCode?: number,
  isSafeVerify?: number,
  newEmail?: string,
  newPhone?: string
}
// 绑定/修改手机号
export function bindPhone(data: BindPhoneType | encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/bindPhone`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
// 绑定/修改邮箱
export function bindEmail(data: BindPhoneType | encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/bindEmail`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
interface codeType {
  number: string,
  code?: string,
  deviceType: string,
  userId?: number
}
interface encryptType {
  data: string,
  time: string | number,
  reqNo: string | number
}
// 关闭/修改手机安全验证
export function getPhoneSafe(data: codeType | encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/phoneSecurityVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 修改邮箱安全验证
export function getEmailSafe(data: codeType | encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/emailSecurityVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 短信验证码
export function getSmsCode(data: codeType | encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/sms/send/updateSmsVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
//邮件验证码 
export function getEmailCode(data: codeType | encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/email/send/updateEmailVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 关闭手机
export function getPhoneClose(data: encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/phoneVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 修改/设置密码安全验证
export function setPasswordSafe(data: encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/pwdSecurityVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 修改/设置密码
export function setPassword(data: encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/updatePassword`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 密码-短信验证码
export function getPasswordSmsCode(data:  encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/sms/send/updatePwdVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
//密码-邮件验证码 
export function getPasswordEmailCode(data:  encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/email/send/updatePwdVerify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 解绑谷歌验证
export function unbindGoogle(data: encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/google/relieveGoogleKey`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
// 获取谷歌key
export function getGoogleKey(): Promise<any> {
  return request(`${fixUrl}/user-web/v1/google/sendGoogleKey`, {
    method: 'GET',
    // body: JSON.stringify(data),
  });
}
// 绑定谷歌验证
export function bindGoogle(data: encryptType): Promise<any> {
  return request(`${fixUrl}/user-web/v1/google/bindGoogleKey`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

