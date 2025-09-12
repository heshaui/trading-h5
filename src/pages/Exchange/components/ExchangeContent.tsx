import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import WebSocketService from "@/utils/websocket";
import appStore from '@/store';
import { reaction } from "mobx";
import { debounce, throttle } from "lodash";
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';
import type { KLineData, OrderData } from '@/context/exchange-providers/ExchangeProvider';
import useAuth from '@/hooks/useAuth';

import SpotHeader from './SpotHeader';
import SpotTabs from './SpotTabs';
import SportOrder from './SpotOrder';
import SportTrade from './SpotTrade';

const ExchangeContent: React.FC = observer(() => {
    const [coinData, setCoinData] = useState<any>();
    const { isLoggedIn } = useAuth();
    // 获取时间间隔
    const { 
        timeInterval, 
        updateDepthData, 
        updateKlineData, 
        updateOrderData,
    } = useExchange();
    const [klineData, setKlineData] = useState<any>();
    const [currentPair, setCurrentPair] = useState<any>();
    const [depthData, setDepthData] = useState<any>();
    const [orderData, setOrderData] = useState<any[]>([]);

    // 修改WebSocket相关逻辑，使用useRef保存WebSocket实例
    const websocketRef = useRef<WebSocketService | null>(null);
    const depthWsRef = useRef<WebSocketService | null>(null);
    const klineWsRef = useRef<WebSocketService | null>(null);

    // 获取盘口数据
    const getOrderWsData = useCallback(() => {
        // 如果已经有连接，不要重复创建
        if (websocketRef.current) return;
        const wsUrl = `${
            process.env.REACT_APP_WS_API_BASE
        }/ws/${currentPair.coinSymbol.toUpperCase()}_${currentPair.baseSymbol.toUpperCase()}_${
            currentPair.groupStatus
        }@trade`;
        const websocket = new WebSocketService(wsUrl);
        websocketRef.current = websocket;

        websocket.connect((message: string) => {
        try {
            const data = JSON.parse(message);
            if (data.type === "__ping__") {
            return;
            }
            // 使用函数式更新来累积数据
            updateOrderData((prevData: OrderData| null) => {
                if (!prevData) return [data];

                // 假设我们希望保留最新的100条数据
                const maxEntries = 100;
                const newData = Array.isArray(data) ? data : [data];

                // 将新数据添加到数组开头（假设最新的数据应该显示在前面）
                const combinedData = [...newData, ...prevData];

                // 限制数组长度
                return combinedData.slice(0, maxEntries);
            });
        } catch (error) {

        }
        });
    }, [currentPair]);

    // 获取深度图数据
    const getWsDepthData = useCallback(() => {
        // 如果已经有连接，不要重复创建
        if (depthWsRef.current) return;
        const wsUrl = `${
            process.env.REACT_APP_WS_API_BASE
        }/ws/${currentPair.coinSymbol.toUpperCase()}_${currentPair.baseSymbol.toUpperCase()}_${
            currentPair.groupStatus
        }@depth_30_levels`;

        const websocket = new WebSocketService(wsUrl);
        depthWsRef.current = websocket;

        websocket.connect((message: string) => {
            try {
                // 检查消息是否为系统消息
                if (
                    message.startsWith("subscribe:") ||
                    message.startsWith("ping") ||
                    message.startsWith("pong") ||
                    message.includes("subscribe") ||
                    message.includes("left the channel") ||
                    message.includes("client")
                ) {
                    // 处理系统消息
                    return;
                }

                if (message.includes("error")) {
                    return;
                }
                const data = JSON.parse(message);
                // 检查消息类型是否为depth
                if (data.type !== "depth") {
                    return;
                }

                updateDepthData(() => {
                    // 处理买单(bids) - 按价格降序排列
                    const processedBids = (data.bids || [])
                    // 处理卖单(asks) - 按价格升序排列  
                    const processedAsks = (data.asks || [])
                    const newDepthData = {
                        asks: processedAsks,
                        bids: processedBids,
                    };               
                    return newDepthData;
                });
            } catch (error) {
            }
        });
    }, [currentPair]);

    // 历史深度图数据
    const getHistoryDepthData = useCallback(async () => {
        try {
        const response = await fetch(
            `${process.env.REACT_APP_WEB_API_BASE}/depth/${currentPair.coinSymbol}_${currentPair.baseSymbol}_${currentPair.groupStatus}`
        );
        const data = await response.json();

        // 确保bids和asks是数组并限制为30条
        const formattedData = {
            bids: Array.isArray(data.bids) ? data.bids.slice(0, 30) : [],
            asks: Array.isArray(data.asks) ? data.asks.slice(0, 30) : [],
        };

        // 设置初始深度数据
        updateDepthData(formattedData);

        // 初始数据加载完成后建立WebSocket连接获取实时更新
        getWsDepthData();
        } catch (error) {}
    }, [currentPair, getWsDepthData]);

    // 获取k线数据
    const getKlineData = useCallback(() => {
        if (!currentPair || !currentPair.coinSymbol) return;

        if (klineWsRef.current) {
            klineWsRef.current.close();
            klineWsRef.current = null;
        }

        try {
            const wsUrl = `${process.env.REACT_APP_WS_API_BASE}/ws/${currentPair.coinSymbol}_${
                currentPair.baseSymbol
                }_${currentPair.groupStatus}@kline_${timeInterval.toLowerCase()}`;
            const websocket = new WebSocketService(wsUrl);
            klineWsRef.current = websocket;

            const updateKlineDataDebounce = throttle((newData: any) => {
                updateKlineData((prevData: KLineData | null) => {
                    const newDataCopy = JSON.parse(JSON.stringify(newData));
                    const combinedKlines = [
                        ...(prevData?.data || []),
                        ...(newDataCopy.data || []),
                    ]
                        .reduce((acc, curr) => {
                        acc.push(curr);
                        return acc;
                        }, [])
                        .sort((a: any, b: any) => a.timestamp - b.timestamp);
                    return { ...newDataCopy, data: combinedKlines };
                });
            }, 0);

            websocket.connect((message: string) => {
                try {
                    if (
                        message.startsWith("subscribe:") ||
                        message.startsWith("ping") ||
                        message.startsWith("pong") ||
                        message.includes("subscribe") ||
                        message.includes("joined") ||
                        message.includes("left")
                    ) {
                        return;
                    }

                    const data = JSON.parse(message);

                    setCoinData(data);
                    updateKlineDataDebounce(data);
                } catch (err) {}
            });
        } catch (err) {}
    }, [currentPair, timeInterval]);

    useEffect(() => {
        // 组件卸载时清理WebSocket连接
        return () => {
            if (websocketRef.current) websocketRef.current.close();
            if (depthWsRef.current) depthWsRef.current.close();
            if (klineWsRef.current) klineWsRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (!currentPair) return;
        // 现在可以安全地使用currentPair
        getOrderWsData();
        getHistoryDepthData();
        getKlineData();
    }, [
        currentPair,
        timeInterval,
        getKlineData,
        getHistoryDepthData,
        getOrderWsData,
    ]);
    

    useEffect(() => {
        try {
            appStore.loadCurrencyPairs(isLoggedIn ? 'all' : 'show')
                .then((result) => {
                    const currentPairList = appStore.getCurrentPair() ||
                        (appStore.currencyPairs && appStore.currencyPairs.length > 0
                            ? appStore.currencyPairs[0]
                            : null);
                    if (currentPairList) {
                        setCurrentPair(currentPairList);
                    }
                })
                .catch((error) => {
                    console.error('Failed to load currency pairs:', error);
                });
        } catch (error) {
            console.error('Error in loadCurrencyPairs:', error);
        }
    }, [isLoggedIn]);

    // 添加一个新的 useEffect 来监听 appStore 中的币对变化
    useEffect(() => {
        // 创建一个订阅函数来监听 appStore 中当前币对的变化
        const disposer = reaction(
            () => appStore.getCurrentPair(),
            (newPair) => {
                if (
                    newPair &&
                    (!currentPair ||
                        newPair.coinSymbol !== currentPair.coinSymbol ||
                        newPair.baseSymbol !== currentPair.baseSymbol ||
                        newPair.groupStatus !== currentPair.groupStatus)
                    ) {
                    // 清理现有的 WebSocket 连接
                    if (websocketRef.current) {
                        websocketRef.current.close();
                        websocketRef.current = null;
                    }

                    if (depthWsRef.current) {
                        depthWsRef.current.close();
                        depthWsRef.current = null;
                    }

                    if (klineWsRef.current) {
                        klineWsRef.current.close();
                        klineWsRef.current = null;
                    }

                    // 更新当前币对
                    setCurrentPair(newPair);

                    // 重置数据
                    updateOrderData(null);
                    updateDepthData(null);
                    updateKlineData(null);
                }
            },
            { fireImmediately: true }
        );

        // 清理函数
        return () => {
            disposer();
        };
    }, [currentPair]);

    return (
        <div className="pb-[76px]">
            <SpotHeader coinData={coinData} />
            {/* 行情、盘口、最新成交 */}
            <SpotTabs />
            {/* 当前委托、历史委托、历史成交、资产 */}
            <SportOrder />
            {/* 买卖 */}
            <SportTrade />
        </div>
    );
});

export default ExchangeContent; 