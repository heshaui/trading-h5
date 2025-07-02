import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`
const fixUrl2 = `/${API_MODULE_NAME.AMBIT_ASSETS_WEB}`

// 获取邀请列统计
export function getInviteCount(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/userInviteCount`, {
        method: 'POST',
    });
}
interface paramType{
    pageNo:number,
    pageSize:number,
}
// 获取邀请列表
export function getInviteList(params:paramType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/userInviteList`, {
        method: 'POST',
        body:JSON.stringify(params)
    });
}
// 获取奖励规则
export function getRewardConfiguration(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/user/getRewardConfiguration`, {
        method: 'GET',
    });
}
interface dataType{
    pageNo?:number,
    pageSize?:number,
    userId?: number,
    actualCoinId?: number|string
    actualCoinName?: string|null
}
// 返佣金额-邀请奖励列表
export function getRecordList(data:dataType): Promise<any> {
    return request(`${fixUrl2}/assets-web/v1/tenant-grant-record/grantRecordList`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}

