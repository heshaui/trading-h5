import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`
const fixUrl2 = `/${API_MODULE_NAME.AMBIT_ASSETS_WEB}`

// export function getFinancialConfig(): Promise<any> {
//     return request(`${fixUrl2}/assets-web/v1/user-project/getFunctionalConfiguration`, {
//       method: 'POST',
//     })
// }

// export function getPurchaseDisplay(): Promise<any> {
//     return request(`${fixUrl2}/assets-web/v1/user-project/purchaseDisplay`, {
//       method: 'POST',
//     })
// }