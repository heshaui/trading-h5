export interface coinSelectType {
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    value: string,
    label: string | React.ReactNode,
    memoTag: number,
    balance: number,
    frozenBalance: number,
    isLock: number

}
export interface coinExtAllListType {
    id: number,
    protocol: string,
    protocolName: string,
    browser: string,
    symbol: string,
    chainId: number,
    value: string,
    label: string,
}
export interface coinExtSelectType {
    coinId: number,
    coinName: string,
    protocolId: number,
    decimals: number,
    withdrawFee: number,
    minWithdrawFee: number,
    withdraw: number,
    minWithdraw: number,
    maxWithdraw: number,
    minRecharge: number,
    confirms: number,
    value: string,
    label: string,
    id: number,
    protocol: string,
    protocolName: string,
    browser: string,
    symbol: string,
    chainId: number
}
export interface addressSelectType {
    id: number,
    protocolId: number,
    addressTitle: string,
    protocolName: string,
    symbol: string,
    addressName: string,
    userId: number,
    tenantId: string,
    createTime: number,
    updateTime: number,
    label: string | React.ReactNode,
    value: string,
}

export interface SearchHistoryItem {
    label: string | React.ReactNode,
    value: string,
    desc?: string,
    network?: string,
    iconUrl: string,
    coinName: string
}
export interface userBalanceType {
    balance: number,
    frozenBalance: number,
    isLock: number,
    coinId: string,
    coinName: string
}
export interface coinInfoType {
    balance: number,
    frozenBalance: number,
    isLock: number,
    coinId: string,
    coinName: string,
    iconUrl: string,
    canRecharge: number,
    canTransfer: number,
    canWithdraw: number,
    minWithdrawAmount: number, // 最小提币量-币种
    nameDefault: string,
    sort: number,
    status: number,
    unit: string,
    unitScale: number,
    maxWithdrawAmount: number, // 最大提币量-币种
    minTopUp: number,
    protocolId: number,
    decimals: number,
    withdrawFee: number,
    minWithdrawFee: number,
    withdraw: number,
    minWithdraw: number, // 最小提币量-协议
    maxWithdraw: number, // 最大提币量-协议
    minRecharge: number,
    confirms: number
}
export interface limitType {
    max: string,
    mix: string,
    unit: string
}

