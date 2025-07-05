import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';

const fixUrl=`/${API_MODULE_NAME.AMBIT_USER_WEB}`
const fixUrl2=`/${API_MODULE_NAME.AMBIT_HOME_WEB}`

interface UpdateUserCenterType {
  userId: number|string;
  birthday?: string;
  avatarUrl?:string;
  nickname?:string;
}
interface codeEncrypt {
  data: string,
  time: string|number,
  reqNo: string|number
}
interface identityEncrypt {
  surname: string;
  firstName: string;
  countryId: string;
  cardType: string;
  cardCode: string;
  birthday: string;
  frontUrl?: string;
  backUrl?: string;
  selfieUrl?: string;
}

//用户信息
export function getLoginUserInfo(): Promise<any> {
  return request(`${fixUrl}/user-web/v1/user/getLoginInfo`, {
    method: 'GET',
  });
}

//安全中心
export function getSafeCenter(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/safeCenter`, {
      method: 'POST',
    });
  }
// 个人中心
  export function getUserCenter(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/userCenter`, {
      method: 'POST',
    });
  }
//   修改个人中心
  export function updateUserCenter(data:UpdateUserCenterType|codeEncrypt): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/updateUserCenter`, {
      method: 'POST',
      body:JSON.stringify(data)
    });
  }

  // 身份认证
  // codeEncrypt|
  export function postSaveIdentity(data:identityEncrypt|codeEncrypt): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/saveIdentityVerification`, {
      method: 'POST',
      body:JSON.stringify(data)
    });
  }

  // 个人中心总览
  export function getCarouselImageList(): Promise<any> {
    return request(`${fixUrl2}/home-web/v1/open/carouselImage/carouselImageList`, {
      method: 'POST',
    });
  }

