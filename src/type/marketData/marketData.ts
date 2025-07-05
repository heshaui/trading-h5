
export interface CryptoItem {
  id: number;
  pair: string;
  price: number;
  change24h: number;
}

export interface CryptoRanking {
  title: string;
  data: CryptoItem[];
}
// 涨跌幅榜数据
export interface TradeRakingResp {
  symbolId?: number;
  symbol?: string;
  open_time?: string;
  high_price?: string;
  open_price?: string;
  low_price?: string;
  close_price?: string;
  volume?: string;
  priceChangePercent?: number;  // 添加涨跌幅字段
  [key: string]: any; // 允许其他可能的属性
}

export interface TradeRakingResponse {
  code?: string;
  message?: string;
  reqNo?: string;
  data?: TradeRakingResp[];
}
// 获取热门榜
export interface HotMarketSymbol {
  id?: number;
  symbol?: string;
  symbolId?: number;
  sort?: string;
  tenantId?: string;
  createTime?: number;
  updateTime?: number;
  basesymbol?: string;
  coinSymbol?: string;
  iconUrl?: string;
  priceChangePercent?: number;  // 添加涨跌幅字段
  [key: string]: any; // 允许其他可能的属性
}

export interface HotMarketResponse {
  code?: string;
  message?: string;
  reqNo?: string;
  data?: HotMarketSymbol[];
}

export interface HotMarketRequest {
  reqNo?: string;
}

// 现货市场
export interface CoinPriceResp {
  baseSymbol?: string;
  coinSymbol?: string;
  price?: string;
  yesterdayPrice?: string;
  quantity?: string;
  yesterdayQuantity?: string;
  turnover?: string;
  yesterdayTurnover?: string;
  height?: string;
  lower?: string;
}

export interface SpotMarketResponse {
  code?: string;
  message?: string;
  reqNo?: string;
  data?: CoinPriceResp[];
}

// 所有币种
export interface CoinMarket {
  coinId?: number;
  coinName?: string;
  iconUrl?: string;
  nameDefault?: string;
  marketValue?: number;
}
export interface pairsNewPriceType {
  baseSymbol: string;
  coinSymbol: string;
  height: string;
  lower: string;
  openPrice: string;
  price: string;
  priceChangePercent: number;
  quantity: string;
  turnover: string;
  yesterdayPrice: number;
  yesterdayQuantity: string;
  yesterdayTurnover: string;
  classLabel?: string;
  coinId?: number;
  coinName?: string;
  iconUrl?: string;
  nameDefault?: string;
  marketValue?: number;
}
export interface CoinClassification {
  classLabel?: string;
  symbol?: string;
}

export interface AllCoinsResponse {
  code?: string;
  message?: string;
  reqNo?: string;
  data?: CoinMarket[];
}

export interface AllCoinsRequest {
  reqNo?: string;
  classLabel?: string;
  symbol?: string;
}

// 币对最新价格
export interface MarketDataResponse {
  code?: string;
  message?: string;
  reqNo?: string;
  data?: MarketDataItem[];
}
export interface MarketDataItem {
  baseSymbol?: string;
  coinSymbol?: string;
  price?: string;
  yesterdayPrice?: string;
  quantity?: string;
  yesterdayQuantity?: string;
  turnover?: string;
  yesterdayTurnover?: string;
  height?: string;
  lower?: string;
  priceChangePercent?: number;  // 添加涨跌幅字段
  [key: string]: any; // 允许其他可能的属性
}