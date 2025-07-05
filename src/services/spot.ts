import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';
const fixUrl = `/${API_MODULE_NAME.AMBIT_USER_WEB}`

interface createOrderType {
    amount:number,
    baseSymbol:string,
    coinSymbol:string,
    direction:number,
    price?:number,
    symbol:string,
    type:number,
}
interface encryptType {
    data: string,
    time: string|number,
    reqNo: string|number
  }
// 获取邀请列统计
export function createOrder(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/createOrder`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}


// 获取交易所组
export function getExchangeGroup(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/group/getExchangeGroup`, {
        method: 'GET',
    });
}



export function getExchangeCoinList(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/exchange-coin/exchangeCoinList`, {
        method: 'GET',
    });
}



export function getExchangeOrderList(data: any): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/exchangeOrderList`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}
interface getOrderListType {
    endTime?: number|string|null;
    pageNo?: number|null;
    pageSize?: number|null
    startTime?: number|string|null;
    baseSymbol?:number|string|null;
    coinSymbol?:number|string|null;
    notStatus?:number|string|null;
    direction?:number|string|null;
    symbol?:number|string|null;
}

// 订单查询
export function getOrderList(data: getOrderListType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/exchangeOrderList`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}


//自选币对
export function getUserExchangeCoinTypeList(): Promise<any> {
    //2 自选币对
    return request(`${fixUrl}/user-web/v1/exchange-coin/userExchangeCoinTypeList/1`, {
        method: 'GET',
    });
}

// 取消订单
export function revocationOrder(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/revocationOrder`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}
// 修改订单
export function updateOrder(data: encryptType): Promise<any> {
    return request(`${fixUrl}/user-web/v1/order/updateOrder`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}

// 获取所有币对价格
export function getExchangeCoinAllPrice(): Promise<any> {
    return request(`${fixUrl}/user-web/v1/exchange-coin/exchangeCoinAllPrice`, {
        method: 'GET',
    });
}

// 添加自选币对
export function addUserExchangeCoinType(data: any): Promise<any> {
    return request(`${fixUrl}/user-web/v1/exchange-coin/addUserExchangeCoinType`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}



// 取消自选币对
export function canalUserExchangeCoinType(data: any): Promise<any> {
    return request(`${fixUrl}/user-web/v1/exchange-coin/canalUserExchangeCoinType`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}

// 历史委托详情
export function getOrderInfo(data:any): Promise<any> {
    return request(`${fixUrl}/user-trade/v1/trades`, {
        method: 'POST',
        body:JSON.stringify(data)
    });
}

