import { request } from '@/request/index';
import {API_MODULE_NAME} from '@/config/apiConfig';

const fixUrl=`/${API_MODULE_NAME.AMBIT_USER_WEB}`

interface UserIdentityInfoType {
    userId: number|string;
}
//用户信息
// 不传userId
export function getUserIdentityInfo({userId}:UserIdentityInfoType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/userIdentityVerificationDetail`, {
      method: 'POST',
    //   body:JSON.stringify({userId:userId})
    });
  }
//   账户权益
  export function getLevelBenefitDetail({userId}:UserIdentityInfoType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/levelBenefitDetail?userId=${userId}`, {
      method: 'POST',
    //   body:JSON.stringify({userId:userId})
    });
  }