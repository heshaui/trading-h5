import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

// 获取kv
export function getLogo(data: { key: string }): Promise<any> {
    // 替换路径参数并发送请求
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/kv/params/${data.key}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
// 获取自定义footer -kv为0
export function getCustomFooter(data: { lang: string }): Promise<any> {
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/menu/selectHomeBottomJson/${data.lang}`, {
        method: 'POST',
        // body: JSON.stringify(data),
    });
}
// 获取社交媒体列表
export function getSocialMediaList(): Promise<any> {
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/open/homeSocialMedia/homeSocialMediaList`, {
        method: 'POST',
    });
}
// 底部导航栏自定义-kv为1
export function getSelectFooter(data: { lang: string }): Promise<any> {
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/menu/selectHomeBottomFooter/${data.lang}`, {
        method: 'POST',
        // body: JSON.stringify(data),
    });
}