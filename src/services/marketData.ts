import {request} from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';
const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`
const fixUrl2 = `/${API_MODULE_NAME.AMBIT_HOME_WEB}`
//获取涨幅榜
 export function getMarketUp():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/trade_raking/${3}`,{
        method:'GET'
    });
 }
 //获取跌幅榜
 export function getMarketDown():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/trade_raking/${4}`,{
        method:'GET'
    });
 }
//  获取热门榜单

export function getHotData():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/open/hotMarketSymbol/hotMarketSymbolList`,{
        method:'POST',
    });
}
// 获取现货市场-不登录
export function getSpotData(params = {}):Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/exchange-coin/exchangeCoinAllPrice`,{
        method:'POST',
        body: JSON.stringify(params)
    });
 }

// // 获取所有币种-不登录
export function getAllCoinsData():Promise<any>{
    return request(`/${API_MODULE_NAME.AMBIT_HOME_WEB}/home-web/v1/exchange-coin/tenantCurrencyCoinAll`,{
        method:'POST',
        body:JSON.stringify({})
    });
 }

// 获取所有币对最新价格-无需登录
export function getExchangeCoinAllPrice(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/exchange-coin/exchangeCoinAllPrice`, {
        method: 'GET',
    });
}
// 获取当前商户包含币对标签-无需登录
export function getClassLabel(): Promise<any> {
    return request(`${fixUrl2}/home-web/v1/exchange-coin/getClassLabel`, {
        method: 'GET',
    });
}
// USDT相对于USD价格
export function getUsdtPriceWithStables():Promise<any>{
    return request(`${fixUrl2}/home-web/v1/open/hotMarketSymbol/getUsdtPriceWithStables`,{
        method:'POST',
    });
 }