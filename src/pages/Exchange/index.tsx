import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import SpotHeader from './components/SpotHeader';
import WebSocketService from "@/utils/websocket";
import appStore from '@/store';
import { reaction } from "mobx";
import { throttle } from "lodash";

const Exchange = observer(() => {
    const navigate = useNavigate();
    const [coinData, setCoinData] = useState<any>();
    const [currentPair, setCurrentPair] = useState<any>();
    const klineWsRef = useRef<WebSocketService | null>(null);

    // 使用useCallback包装getKlineData函数，确保只有当依赖项变化时才会重新创建函数
    const getKlineData = useCallback(() => {
        if (!currentPair || !currentPair.coinSymbol) return;

        if (klineWsRef.current) {
            klineWsRef.current.close();
            klineWsRef.current = null;
        }
        const ws_url = process.env.NODE_ENV === 'development' 
            ? `/ws/${currentPair.coinSymbol}_${currentPair.baseSymbol}_${currentPair.groupStatus}@kline_1D`
            : `${process.env.REACT_APP_WS_API_BASE}/ws/${currentPair.coinSymbol}_${currentPair.baseSymbol}_${currentPair.groupStatus}@kline_1D`
        try {
            const websocket = new WebSocketService(ws_url);
            klineWsRef.current = websocket;

            const updateKlineData = throttle((newData: any) => {
                setCoinData(newData);
            }, 1000);

            websocket.connect((message: string) => {
                try {
                    if (message.startsWith("subscribe:") ||
                        message.startsWith("ping") ||
                        message.startsWith("pong") ||
                        message.includes("subscribe") ||
                        message.includes("joined") ||
                        message.includes("left")
                    ) {
                        return;
                    }

                    const data = JSON.parse(message);
                    updateKlineData(data);
                } catch (err) {
                    console.error('Failed to parse kline data:', err);
                }
            });
        } catch (err) {
            console.error('Failed to connect to kline websocket:', err);
        }
    }, [currentPair]);

    useEffect(() => {
        // 组件卸载时清理WebSocket连接
        return () => {
            if (klineWsRef.current) klineWsRef.current.close();
        };
    }, []);

    useEffect(() => {
        // 当currentPair有值时执行
        if (!currentPair) return;
        getKlineData();
    }, [currentPair, getKlineData]);

    useEffect(() => {
        try {
            appStore.loadCurrencyPairs()
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
    }, []);

    // 监听 appStore 中的币对变化
    useEffect(() => {
        const disposer = reaction(
            () => appStore.getCurrentPair(),
            (newPair) => {
                if (newPair && (!currentPair || newPair.id !== currentPair.id)) {
                    setCurrentPair(newPair);
                }
            }
        );

        // 组件卸载时清理订阅
        return () => {
            disposer();
        };
    }, [currentPair]);

    return (
        <div>
            <SpotHeader coinData={coinData} />
            {/* 其他交易页面组件将在这里添加 */}
        </div>
    );
});

export default Exchange;

export const meta = {
  requireAuth: false,
  layout: 'header-only'
}

