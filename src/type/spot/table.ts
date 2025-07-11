export interface NowDataType {
    id: number,
    orderId: string,
    amount: number,
    baseSymbol: string,
    canceledTime: number,
    coinSymbol: string,
    completedTime: number,
    direction: number,
    userId: number,
    price: number,
    status: number,
    symbol: string,
    createTime: number,
    updateTime: number,
    tradedAmount: number,
    turnover: number,
    type: number,
    useDiscount: number,
    orderResource: number,
    tenantId: string,
    fee: number,
    baseSymbolCount: number
  }
  export interface DataLogsType {
  id: number,
  tenantId: string,
  buyOrderId: number,
  sellOrderId: number,
  buyerUserId: number,
  sellerUserId: number,
  buyPrice: number,
  sellPrice: number,
  tradePrice: number,
  quantity: number,
  takerSide: number,
  buyFee: number,
  sellFee: number,
  ctime: string,
  mtime: string
}
export  interface DataType {
    id: number,
    orderId: string,
    amount: number,
    baseSymbol: string,
    canceledTime: number,
    coinSymbol: string,
    completedTime: number,
    direction: number,
    userId: number,
    price: number,
    status: number,
    symbol: string,
    createTime: number,
    updateTime: number,
    tradedAmount: number,
    turnover: number,
    type: number,
    useDiscount: number,
    orderResource: number,
    tenantId: string,
    fee: number,
    baseSymbolCount: number,
    groupStatus: string,
    userLoginLogs: DataLogsType[]
  }
  export interface symbolSelectType {
    label: string,
    value: string,
    baseSymbol: string,
    coinSymbol: string
  }
  export interface SelectParamType {
    startTime: number | string;
    endTime: number | string;
    direction: string;
    type: number |string;
    symbol: string;
    notStatus: string | number;
  }