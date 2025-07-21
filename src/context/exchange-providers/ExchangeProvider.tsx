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

interface DepthData {
  bids: [number, number][];
    asks: [number, number][];
    spot_log_last_seq?: number;
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

interface ExchangeContextValue {
  // K线数据
  klineData: KLineData | null;
  timeInterval: string;
  tradePrice: number;
  updateTimeInterval: (interval: string) => void;
  updateKlineData: (updater: ((prevData: KLineData | null) => KLineData) | KLineData | null) => void;
  updateTradePrice: (price: number) => void;
  // 盘口数据
  orderData: OrderData | null;
  updateOrderData: (updater: ((prevData: OrderData | null) => OrderData) | OrderData | null) => void;

  // 深度数据
  depthData: DepthData | null;
  updateDepthData: (updater: ((prevData: DepthData | null) => DepthData) | DepthData | null) => void;
  
  // 最新成交
  recentTrades: RecentTrade[];
  updateRecentTrades: (data: RecentTrade[]) => void;
  addRecentTrade: (trade: RecentTrade) => void;  // 添加单条成交记录
  
  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// 创建Context
const ExchangeContext = createContext<ExchangeContextValue | undefined>(undefined);

// Context Provider组件
export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 状态定义
  const [klineData, setKlineData] = useState<KLineData | null>(null);
  const [timeInterval, setTimeInterval] = useState('1D'); // 默认1天
  const [tradePrice, setTradePrice] = useState<number>(0);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 更新方法
  const updateTimeInterval = useCallback((interval: string) => {
    setTimeInterval(interval);
  }, []);

  // 更新价格
  const updateTradePrice = useCallback((price: number) => {
    setTradePrice(price)
  }, [])

  const updateKlineData = useCallback((updater: ((prevData: KLineData | null) => KLineData) | KLineData | null) => {
    setKlineData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return updater;
    });
  }, []);

  const updateOrderData = useCallback((updater: ((prevData: OrderData | null) => OrderData) | OrderData | null) => {
    setOrderData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return updater;
    });
  }, []);

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
  const value: ExchangeContextValue = {
    klineData,
    timeInterval,
    tradePrice,
    updateTimeInterval,
    updateKlineData,
    updateTradePrice,
    
    orderData,
    updateOrderData,
    
    depthData,
    updateDepthData,
    
    recentTrades,
    updateRecentTrades,
    addRecentTrade,
    
    isLoading,
    setIsLoading
  };

  return (
    <ExchangeContext.Provider value={value}>
      {children}
    </ExchangeContext.Provider>
  );
};

// 自定义Hook，用于在组件中获取Context
export const useExchange = () => {
  const context = useContext(ExchangeContext);
  if (context === undefined) {
    throw new Error('useExchange must be used within an ExchangeProvider');
  }
  return context;
};

// 导出类型
export type { KLineData, KLineDataItem, DepthData, RecentTrade, OrderData, OrderDataItem, ExchangeContextValue }; 