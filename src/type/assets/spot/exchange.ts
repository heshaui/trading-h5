// 币对接口数据类型
export interface CurrencyPairType {
    id: string,
    symbol: string,
    baseSymbol: string,
    coinSymbol: string,
    groupStatus: string,
    isFavorite?: boolean,
    baseCoinScale: number,
    buyFee: number,
    classLabel: string,
    coinScale: number,
    depthFour: number,
    depthOne: number,
    depthThree: number,
    depthTwo: number,
    enable: number,
    enableBuy: number,
    enableSell: number,
    maxBaseVolume: number,
    maxCurrentPrice: number,
    maxMarketPrice: number,
    maxVolume: number,
    minBaseVolume: number,
    minVolume: number,
    openingPrice: number,
    priceOffset: number,
    sellFee: number,
    show: number,
    price?: number,             // 当前价格
    yesterdayPrice?: number,    // 昨日价格
    priceChangePercent?: number // 价格变化百分比
    quantity:number //成交数量
}
export interface CoinType {
    balance: number,
    frozenBalance: number,
    releaseBalance: number,
    isLock: number,
    coinId: string,
    coinName: string,
    nameDefault: string,
    iconUrl: string,
    canRecharge: number,
    canTransfer: number,
    canWithdraw: number,
    minWithdrawAmount: number,
    sort: number,
    status: number,
    unit: string,
    unitScale: number,
    maxWithdrawAmount: number,
    minTopUp: number
    
}
