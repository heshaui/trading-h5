import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

// 获取kv对象
export function getKvObject(keys: string[]): Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/kv/paramsByKeys`, {
        method: 'POST',
        body: JSON.stringify(keys)
    });
}