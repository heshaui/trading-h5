export interface DataType {
    balance: number,
    frozenBalance: number,
    releaseBalance: number,
    isLock: number,
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    isTradeConvert:number
}
export interface BalanceAllType {
    usdBalance?: number | string,
    balance?: number | string
    symbol?: string,
    usdTodayEarnings?: number | string,
    todayEarnings?: number | string,
}
// 今日充值及今日提现
export interface TodayEarningsType {
    usdBalance?: number|string, //  充值-法币换算
    usdWithdraw?: number | string, // 提现-法币换算
    balance?: number | string, //  充值
    withdraw?: number | string, // 提现
    usdGift?: number | string, // 赠币-法币换算
    gift?: number | string // 赠币
}
// 昨日结算余额、充值、提现
export interface YesterdayBalanceType {
    balanceAll?: number | string, //结算
    balance?: number | string, //  充值
    withdraw?: number | string, // 提现
    usdBalanceAll?: number | string, // 结算-法币换算
    usdBalance?: number | string, //  充值-法币换算
    usdWithdraw?: number | string, // 提现-法币换算
}