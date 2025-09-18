import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toast } from 'antd-mobile';
import { observer } from 'mobx-react-lite';
import WebSocketService from "@/utils/websocket";
import appStore from '@/store';
import { reaction } from "mobx";
import { debounce, throttle } from "lodash";
import { useContract } from '@/context/exchange-providers/ContractProvider';
import type { KLineData, OrderData } from '@/context/exchange-providers/ContractProvider';
import useAuth from '@/hooks/useAuth';

import {
  createCoId,
  createOrder,
} from "@/services/contract";
import { getUserBalanceAll } from "@/services/assets";

import RiskDisclosureModal from './RiskDisclosureModal';
import ContractHeader from './ContractHeader';
import { useLanguage } from '@/hooks';
import ContractTabs from './ContractTabs';
import ContractOrder from './ContractOrder';
import ContractTrade from './ContractTrade';


interface ContractAsset {
  symbol: string;
  totalAmount: string;
  canUseAmount: string;
  isolateMargin: string;
  lockAmount: string;
  unRealizedAmount: string;
  realizedAmount: string;
  totalMargin: string;
  totalMarginRate: string;
}

// 原始K线数据项接口
interface KlineDataItem {
  amount: number;
  close: number;
  ds: string; // 时间字符串 "2025-08-21 11:58:00"
  high: number;
  id: number;
  low: number;
  open: number;
  tradeId: number;
  vol: number;
}

// 转换后的K线数据项接口（用于TradingView）
interface ConvertedKlineItem {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// K线WebSocket响应接口
interface KlineResponse {
  event_rep: string;
  channel: string;
  data: KlineDataItem[];
  tick: null;
  ts: number;
  status: string;
}

// 币种数据类型 - 与SymbolSelector组件保持一致
interface SymbolData {
  id: number;
  contractName: string;
  symbol: string;
  contractType: string;
  coType: string;
  contractShowType: string;
  deliveryKind: string;
  contractSide: number;
  multiplier: number;
  multiplierCoin: string;
  marginCoin: string;
  marginRate: number;
  capitalStartTime: number;
  capitalFrequency: number;
  settlementFrequency: number;
  brokerId: number;
  base: string;
  quote: string;
  coinResultVo: any;
  sort: number;
  maxLever: number;
  minLever: number;
  // 可选的UI相关字段
  price?: string;
  changePercent?: string;
  isFavorite?: boolean;
  type?: "USD" | "COIN";
}

const ContractContent: React.FC = observer(() => {
  const {t} = useLanguage(["contract", "spot", "common"])
  const { isLoggedIn } = useAuth();
  // 获取时间间隔
  const { 
      timeInterval: currentTimeInterval, 
      updateDepthData, 
      updateKlineData, 
      updateOrderData,
      setMarketInfoData
  } = useContract();
  // 获取 publicInfo
  const publicInfoFromStore = appStore.getPublicInfo();

  const orderListRef = useRef<any>(null);
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false); // 风险确认书模态框
  const [currentContractInfo, setCurrentContractInfo] = useState<any>({}); // 当前合约信息
  const [publicInfo, setPublicInfo] = useState<any>({}); // 公共数据
  const [priceData, setPriceData] = useState<any>(null); // 价格数据
  const [wsInstance, setWsInstance] = useState<WebSocketService | null>(null); // WebSocket实例
  const [depthPrecision, setDepthPrecision] = useState<number>(0); // 深度精度

  // 处理风险确认书取消
  const handleRiskDisclosureCancel = () => {
    setShowRiskDisclosure(false);
  };

  // 处理风险确认书确认
  const handleRiskDisclosureConfirm = async () => {
    setShowRiskDisclosure(false);
    // 这里可以处理用户确认风险的逻辑，比如开通合约交易
    try {
      const res = await createCoId({
        contractId: publicInfo.contractList[0].id,
        openContract: 1,
      });
      if (res.code === "0") {
        Toast.show({
            icon: 'success',
            content: t("contract:contractOpenSuccess"),
        });
      }
    } catch (error) {
      console.error("开通合约交易失败:", error);
    }
  };

  // 转换时间间隔格式：从组件格式转换为WebSocket格式
  const convertTimeInterval = (interval: string): string => {
    const intervalMap: { [key: string]: string } = {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "30m": "30min",
      "1h": "60min",
      "2h": "120min",
      "4h": "240min",
      "6h": "360min",
      "8h": "480min",
      "12h": "720min",
      "1day": "1day",
      "1D": "1day",
      "3D": "3day",
      "1W": "1week",
      "1M": "1month",
      "1Y": "1year"
    };
    return intervalMap[interval] || "1day";
  };

  // 发送WebSocket取消订阅消息
  const sendUnsubscriptions = useCallback((ws: WebSocketService, contractInfo: any, timeInterval: string, precision: number = depthPrecision) => {
    if (!contractInfo.id || !contractInfo.contractType || !contractInfo.symbol) {
      return;
    }

    const wsTimeInterval = convertTimeInterval(timeInterval);
    console.log("发送取消订阅消息，合约:", contractInfo.symbol, "时间间隔:", wsTimeInterval, "精度:", precision);

    // 取消订单簿数据订阅
    const unsubDepthEvent = {
      event: "unsub",
      params: { channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_depth_step${precision}` },
      cb_id: contractInfo.symbol.toLowerCase(),
    };
    // 取消交易数据订阅


    // 取消价格数据订阅
    const unsubPriceEvent = {
      event: "unsub",
      params: {
        channel: `market_price_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 取消Ticker数据订阅
    const unsubTickerEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 取消实时交易数据订阅
    const unsubRealtimeTradeEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
        top: 100,
      },
    };

    // 取消K线数据订阅
    const unsubKlineSubEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 取消交易数据订阅
    const unsubTradeEvent = {
      event: "unsub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 发送所有取消订阅消息
    ws.send(JSON.stringify(unsubDepthEvent));
    ws.send(JSON.stringify(unsubTradeEvent));
    ws.send(JSON.stringify(unsubPriceEvent));
    ws.send(JSON.stringify(unsubTickerEvent));
    ws.send(JSON.stringify(unsubRealtimeTradeEvent));
    ws.send(JSON.stringify(unsubKlineSubEvent));
  }, [depthPrecision]);

  // 发送新的订阅消息
  const sendNewSubscriptions = useCallback((ws: WebSocketService, contractInfo: any, timeInterval: string, precision: number = 0) => {
    const wsTimeInterval = convertTimeInterval(timeInterval);
    
    console.log("📡 发送新合约订阅消息:", {
      合约: contractInfo.symbol,
      合约ID: contractInfo.id,
      合约类型: contractInfo.contractType,
      时间间隔: timeInterval,
      WebSocket时间间隔: wsTimeInterval
    });

    // 订单簿数据
    const depthEvent = {
      event: "sub",
      params: { channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_depth_step${precision}` },
      cb_id: contractInfo.symbol.toLowerCase(),
    };

    // 交易数据
    const tradeEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol.replace("-", "").toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 价格数据
    const priceEvent = {
      event: "sub",
      params: {
        channel: `market_price_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // Ticker数据
    const tickerEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 实时交易数据
    const realtimeTradeEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
        top: 100,
      },
    };

    const realtimeTradeRepEvent = {
      event: "req",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_trade_ticker`,
        cb_id: contractInfo.symbol.toLowerCase(),
        top: 100,
      },
    };

    // K线数据请求（获取历史数据）
    const klineReqEvent = {
      event: "req",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // K线数据订阅（获取实时更新）
    const klineSubEvent = {
      event: "sub",
      params: {
        channel: `market_${contractInfo.contractType.toLowerCase()}_${contractInfo.symbol
          .replace("-", "")
          .toLowerCase()}_kline_${wsTimeInterval}`,
        cb_id: contractInfo.symbol.toLowerCase(),
      },
    };

    // 发送所有订阅消息
    ws.send(JSON.stringify(depthEvent));
    ws.send(JSON.stringify(tradeEvent));
    ws.send(JSON.stringify(priceEvent));
    ws.send(JSON.stringify(tickerEvent));
    ws.send(JSON.stringify(realtimeTradeEvent));
    ws.send(JSON.stringify(klineReqEvent));
    ws.send(JSON.stringify(klineSubEvent));
    ws.send(JSON.stringify(realtimeTradeRepEvent));
  }, []);

  // 发送WebSocket订阅消息
  const sendSubscriptions = useCallback((ws: WebSocketService, contractInfo: any, timeInterval: string, shouldUnsubscribeFirst: boolean = false, precision: number = depthPrecision) => {
    if (!contractInfo.id || !contractInfo.contractType || !contractInfo.symbol) {
      return;
    }

    // 如果需要先取消订阅，则先发送取消订阅消息
    if (shouldUnsubscribeFirst) {
      sendUnsubscriptions(ws, contractInfo, timeInterval, precision);
      // 等待一小段时间确保取消订阅消息被处理
      setTimeout(() => {
        sendNewSubscriptions(ws, contractInfo, timeInterval, precision);
      }, 100);
    } else {
      sendNewSubscriptions(ws, contractInfo, timeInterval, precision);
    }
  }, [sendUnsubscriptions, sendNewSubscriptions, depthPrecision]);

  // 处理时间间隔变化
  useEffect(() => {
    // 如果WebSocket已连接且合约信息完整，重新发送K线订阅
    if (wsInstance && currentContractInfo.id) {
      sendSubscriptions(wsInstance, currentContractInfo, currentTimeInterval, true); // 时间间隔变化时也先取消旧订阅
    }
  }, [currentTimeInterval])

  // 初始化数据和客户端状态
  useEffect(() => {
    const initializeClientData = async () => {
        const info = publicInfoFromStore;
        setPublicInfo(publicInfoFromStore);

        // 获取当前合约信息
        const contractInfo = appStore.getCurrentContractInfo();
        setCurrentContractInfo(contractInfo);
        console.log(contractInfo)


        // 获取用户合约配置
        if (info.contractList && contractInfo.id && isLoggedIn) {
          try {
            const userConfig = await appStore.loadUserConfig({
              contractId: contractInfo.id,
            });
            if (userConfig && userConfig.openContract !== 1) {
              setShowRiskDisclosure(true);
            }
          } catch (error) {
            console.error("获取用户合约配置失败:", error);
          }
        }
    };
    initializeClientData();
  }, [isLoggedIn, publicInfoFromStore]);

  // 更新价格
  useEffect(() => {
    console.log('更新价格对象', priceData)
    appStore.setActiveNewPrice(priceData);
  }, [priceData])

  // 监听store中currentContractInfo的变化
  useEffect(() => {
    const checkContractInfoChange = () => {
      const storeContractInfo = appStore.getCurrentContractInfo();
      
      // 添加详细的调试信息
      if (Math.random() < 0.01) { // 每100次轮询打印一次状态，避免日志太多
        console.log("🔍 轮询检查合约信息:", {
          当前State合约ID: currentContractInfo.id,
          Store合约ID: storeContractInfo?.id,
          是否需要更新: storeContractInfo && storeContractInfo.id !== currentContractInfo.id
        });
      }
      
      // 只有当store中的合约信息与当前state不同时才更新
      if (
        storeContractInfo &&
        storeContractInfo.id !== currentContractInfo.id
      ) {
        console.log("🔄 ==========合约信息发生变化==========");
        console.log("🔄 旧合约:", currentContractInfo);
        console.log("🔄 新合约:", storeContractInfo);
        
        // 清理旧的数据状态
        console.log("🧹 清理旧数据状态");
        updateDepthData(null);
        setPriceData(null);
        updateKlineData(null);

        // 更新合约信息
        console.log("📝 更新合约信息");
        setCurrentContractInfo(storeContractInfo);

        // 如果WebSocket已连接，重新发送订阅消息（不重新连接）
        if (wsInstance) {
          console.log("🔄 WebSocket已连接，重新订阅新合约数据");
          sendSubscriptions(
            wsInstance,
            storeContractInfo,
            currentTimeInterval,
            true
          ); // 先取消旧订阅
        } else {
        }
      }
    };

    // 使用轮询方式检查store变化（简单方案）
    console.log("📊 设置100ms轮询检查合约信息变化");
    const interval = setInterval(checkContractInfoChange, 100);

    return () => clearInterval(interval);
  }, [
    currentContractInfo.id,
    wsInstance,
    currentTimeInterval,
    sendSubscriptions
  ]);

  // WebSocket连接管理（只负责建立连接）
  useEffect(() => {
    // 只需要检查WebSocket URL是否存在
    if (!publicInfo.wsUrl) {
      console.log("WebSocket URL未准备好");
      return;
    }

    const ws = new WebSocketService(publicInfo.wsUrl.replace(";", ""));
    setWsInstance(ws);

    // 消息处理回调
    const handleMessage = (message: string) => {
      try {
        // 如果消息看起来像是乱码，尝试打印十六进制
        if (message?.includes("�") || message?.length < 10) {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(message);
        }

        const data = JSON.parse(message);
        console.log("解析后的WebSocket消息:", data);

        // 处理K线数据 - 动态检查不同时间间隔的K线数据
        if (data.channel && data.channel.includes("_kline_")) {
          console.log("📈 ==========收到K线WebSocket数据==========");
          console.log("📈 数据通道:", data.channel);
          console.log("📈 当前合约:", currentContractInfo.symbol);
          console.log("📈 完整数据:", data);
          console.log("📈 ========================================");
          
          // 直接传递原始WebSocket数据给TradingView组件处理
          updateKlineData(data);

          // 更新价格数据
          if (
            data.event_rep === "rep" &&
            data.data &&
            Array.isArray(data.data)
          ) {
            const latestKline = data.data[data.data.length - 1];
            if (latestKline) {
              console.log('价格数据')
              setPriceData((prevPriceData: any) => ({
                ...prevPriceData,
                price: latestKline.close.toString(),
                high24h: Math.max(
                  ...data.data.map((k: any) => k.high)
                ).toString(),
                low24h: Math.min(
                  ...data.data.map((k: any) => k.low)
                ).toString(),
                volume24h: data.data
                  .reduce((sum: number, k: any) => sum + k.vol, 0)
                  .toString(),
              }));
            }
          } else if (data.tick && typeof data.tick === "object") {
            setPriceData((prevPriceData: any) => ({
              ...prevPriceData,
              price: data.tick.close.toString(),
            }));
          }
        } else if (data.channel && data.channel.includes("_depth_")) {
          // 处理OrderBook深度数据
          console.log("收到OrderBook数据:", data);
          if (data.tick) {
            console.log("买单数据:", data.tick.buys);
            console.log("卖单数据:", data.tick.asks);
          }
          updateDepthData(data);
        } else if (data.channel && data.channel.includes("_trade_ticker")) {
          // 处理实时成交数据
          console.log("收到实时交易数据:", data);
          if (data.data && Array.isArray(data.data)) {
            // 对数据按时间戳排序，最新的在前
            const sortedData = data.data.sort((a: any, b: any) => b.ts - a.ts);
            updateOrderData(sortedData);

            // 更新最新价格
            if (sortedData.length > 0) {
              const latestTrade = sortedData[0];
              const newPriceData = {
                price: latestTrade.price,
                lastSide: latestTrade.side,
                lastTradeTime: latestTrade.ds,
                symbol: currentContractInfo?.symbol,
                contractId: currentContractInfo?.id,
                timestamp: Date.now(),
              };
              
              setPriceData((prevPriceData: any) => ({
                ...prevPriceData,
                price: latestTrade.price,
                lastSide: latestTrade.side, // 记录最新交易方向
                lastTradeTime: latestTrade.ds,
              }));
            }
          }
        } else if(data.channel && data.channel.includes("review")){
          setMarketInfoData(data.data);
        }
      } catch (error) {
        // console.log("解析WebSocket消息失败:", error);
        // console.log("原始消息:", message);
        // console.log("消息类型:", typeof message);
        // console.log("消息长度:", message.length);
      }
    };

    // 错误处理回调
    const handleError = (error: Event) => {
      console.error("WebSocket连接错误:", error);
    };

    // 连接成功后的回调
    ws.setOnConnectedCallback(() => {
      console.log("WebSocket连接成功");
      // 如果合约信息已经准备好，立即发送订阅
      if (
        currentContractInfo.id &&
        currentContractInfo.contractType &&
        currentContractInfo.symbol
      ) {
        console.log("WebSocket连接成功且合约信息已准备好，立即发送订阅");
        sendSubscriptions(ws, currentContractInfo, currentTimeInterval);
      } else {
        console.log("WebSocket连接成功，但合约信息尚未准备好，等待合约信息");
      }
    });

    // 建立连接
    ws.connect(handleMessage, handleError);

    // 清理函数
    return () => {
      console.log("清理WebSocket连接");
      setWsInstance(null);
      ws.close();
    };
  }, [
    publicInfo.wsUrl,
    currentContractInfo.id,
    currentContractInfo.contractType,
    currentContractInfo.symbol,
  ]);

  // 当合约信息准备好且WebSocket已连接时，发送初始订阅
  useEffect(() => {
    if (
      wsInstance &&
      currentContractInfo.id &&
      currentContractInfo.contractType &&
      currentContractInfo.symbol
    ) {
      console.log("WebSocket已连接且合约信息准备好，发送初始订阅");
      sendSubscriptions(wsInstance, currentContractInfo, currentTimeInterval);
    }
  }, [wsInstance, currentContractInfo, currentTimeInterval, sendSubscriptions]);
    

    return (
        <div className="pb-[76px]">
            <ContractHeader />
            {/* 图表、最新成交 */}
            <ContractTabs />
            {/* 仓位、普通委托、条件委托、资产 */}
            <ContractOrder />
            {/* 买卖 */}
            <ContractTrade />
            {/* 风险确认书模态框 */}
            <RiskDisclosureModal
                open={showRiskDisclosure}
                onCancel={handleRiskDisclosureCancel}
                onConfirm={handleRiskDisclosureConfirm}
            />
        </div>
    );
});

export default ContractContent; 