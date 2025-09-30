import React, { createContext, useContext, useState, useCallback } from 'react';

// 定义Context的数据类型
interface KLineDataItem {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  [key: string]: any;  // 允许每个数据项有额外属性
}

interface KLineData {
  type?: string;
  data: KLineDataItem[];
  symbol?: string;
  interval?: string;
  [key: string]: any;  // 允许顶层有额外属性
}

interface OrderBookTick {
  asks: [number, number][]; // [价格, 数量]
  buys: [number, number][];
  lastPrice?: number; // 最新成交价
  priceChange?: number; // 24h涨跌幅
}

interface DepthData {
  tick: OrderBookTick;
}

interface RecentTrade {
  id: string;
  time: string;
  price: number;
  amount: number;
  direction: 'buy' | 'sell';
}

// 盘口数据类型
interface OrderDataItem {
  data: {
	buy_price: number;
	quantity: number;
	timestamp: number;
	taker_side: string;
	trade_price: number;
	[key: string]: any;  // 允许其他属性
  };
  [key: string]: any;  // 允许其他属性
}

// 直接使用 OrderDataItem[] 类型代替自定义的 OrderData 接口
type OrderData = OrderDataItem[];

interface ContractContextValue {
  // K线数据
  klineData: KLineData | null;
  timeInterval: string;
  tradePrice: number;
  updateTimeInterval: (interval: string) => void;
  updateKlineData: (updater: ((prevData: KLineData | null) => KLineData) | KLineData | null) => void;
  setKlineData: (data: KLineData | null) => void;
  updateTradePrice: (price: number) => void;
  // 盘口数据
  orderData: OrderData | null;
  updateOrderData: (updater: ((prevData: OrderData | null) => OrderData) | OrderData | null) => void;

  // 深度数据
  depthData: DepthData | null;
  updateDepthData: (updater: ((prevData: DepthData | null) => DepthData) | DepthData | null) => void;
  
  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 币对弹窗搜索数据量 自有/现货数量
  favoritesCount: number;
  setFavoritesCount: (count: number) => void;
  spotCount: number;
  setSpotCount: (count: number) => void;

  // 仓位数量、普通委托数量、条件委托数量、资产数量
  positionCount: number;
  setPositionCount: (count: number) => void;
  defaultOrderCount: number;
  setDefaultOrderCount: (count: number) => void;
  conditionOrderCount: number;
  setConditionOrderCount: (count: number) => void;
  assetsCount: number;
  setAssetsCount: (count: number) => void;
  // 合约价格信息
  marketInfoData: any;
  setMarketInfoData: (data: any) => void;
  // 新增交易,用来通知仓位等刷新列表
  addOrderNotice: number;
  setAddOrderNotice: (count: any) => void;
}

// 创建Context
const ContractContext = createContext<ContractContextValue | undefined>(undefined);

// Context Provider组件
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 状态定义
  const [klineData, setKlineData] = useState<KLineData | null>(null);
  const [timeInterval, setTimeInterval] = useState('1D'); // 默认1天
  const [tradePrice, setTradePrice] = useState<number>(0);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [spotCount, setSpotCount] = useState<number>(0);
  const [positionCount, setPositionCount] = useState<number>(0);
  const [defaultOrderCount, setDefaultOrderCount] = useState<number>(0);
  const [conditionOrderCount, setConditionOrderCount] = useState<number>(0);
  const [assetsCount, setAssetsCount] = useState<number>(0);
  const [marketInfoData, setMarketInfoData] = useState();
  const [addOrderNotice, setAddOrderNotice] = useState(0);

  // 更新方法
  const updateTimeInterval = useCallback((interval: string) => {
	setTimeInterval(interval);
  }, []);

  // 更新价格
  const updateTradePrice = useCallback((price: number) => {
	setTradePrice(price)
  }, [])

  // 更新k线数据
  const updateKlineData = useCallback((updater: ((prevData: KLineData | null) => KLineData) | KLineData | null) => {
	setKlineData(prev => {
	  if (typeof updater === 'function') {
		return updater(prev);
	  }
	  return updater;
	});
  }, []);

  // 更新最新成交数据
  const updateOrderData = useCallback((updater: ((prevData: OrderData | null) => OrderData) | OrderData | null) => {
	setOrderData(prev => {
	  if (typeof updater === 'function') {
		return updater(prev);
	  }
	  return updater;
	});
  }, []);

  // 更新深度图数据
  const updateDepthData = useCallback((updater: ((prevData: DepthData | null) => DepthData) | DepthData | null) => {
	setDepthData(prev => {
	  if (typeof updater === 'function') {
		return updater(prev);
	  }
	  return updater;
	});
  }, []);

  const updateRecentTrades = useCallback((data: RecentTrade[]) => {
	setRecentTrades(data);
  }, []);

  const addRecentTrade = useCallback((trade: RecentTrade) => {
	setRecentTrades(prev => [trade, ...prev].slice(0, 100)); // 保留最新的100条记录
  }, []);

  // Context值
  const value: ContractContextValue = {
	klineData,
	timeInterval,
	tradePrice,
	updateTimeInterval,
	updateKlineData,
	updateTradePrice,
  setKlineData,
	
	orderData,
	updateOrderData,
	
	depthData,
	updateDepthData,
	
	isLoading,
	setIsLoading,

	favoritesCount,
	setFavoritesCount,
	spotCount,
	setSpotCount,

	positionCount,
	setPositionCount,
	defaultOrderCount,
	setDefaultOrderCount,
	conditionOrderCount,
	setConditionOrderCount,
	assetsCount,
	setAssetsCount,
  marketInfoData, 
  setMarketInfoData,
  addOrderNotice,
  setAddOrderNotice
  };

  return (
	<ContractContext.Provider value={value}>
	  {children}
	</ContractContext.Provider>
  );
};

// 自定义Hook，用于在组件中获取Context
export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
	throw new Error('useContract must be used within an ContractProvider');
  }
  return context;
};

// 导出类型
export type { KLineData, KLineDataItem, DepthData, RecentTrade, OrderData, OrderDataItem, ContractContextValue }; 