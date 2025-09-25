// // hooks/useAssetsRate.tsx
// import { useEffect } from 'react'
// import appStore from '@/store'
// import assetsAndRateWS from '@/store/assetsAndRate'

// export const useAssetsAndRateWs = (enabled: boolean = true) => {
//     const userInfo = appStore.getUserInfo();
//     useEffect(() => {
//     if ( !userInfo || typeof window === "undefined") return;

//         if (!enabled) return;
//         assetsAndRateWS.ensure(userInfo.userId);
//         return () => {
//             // 全局单例，不在组件卸载时关闭
//         }
//     }, [userInfo, enabled]);

//     return {
//         ensure: assetsAndRateWS.ensure.bind(assetsAndRateWS),
//         stop: assetsAndRateWS.stop.bind(assetsAndRateWS),
//     }

// }
// hooks/useAssetsRate.tsx
import { useEffect, useState, useRef, useCallback } from 'react'
import appStore from '@/store'
import WebSocketService, { ConnectionState } from "@/utils/websocket";
import { getToken } from "@/request";

const WS_CONNECTED_KEY = "__ASSETS_RATE_WS_CONNECTED__";

export const useAssetsAndRateWs = (enabled: boolean = true) => {
    const balanceDataRef = useRef<WebSocketService | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const userInfo = appStore.getUserInfo();
    // const [banlanceLoading, setBanlanceLoading] = useState(false);
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT = 10;
    // 设置WebSocket连接
    const setupBalanceWebSocket = useCallback(() => {
        if (!enabled) return;
        // 如果已经有连接（OPEN），但未启动心跳，则仅补齐心跳，不重复创建
        // if (balanceDataRef.current && balanceDataRef.current.connectionState === ConnectionState.OPEN) {
        //     if (!pingIntervalRef.current) {
        //         pingIntervalRef.current = setInterval(() => {
        //             const ws = balanceDataRef.current;
        //             if (ws && ws.connectionState === ConnectionState.OPEN) {
        //                 ws.send('ping');
        //             } else {
        //                 if (pingIntervalRef.current) {
        //                     clearInterval(pingIntervalRef.current);
        //                     pingIntervalRef.current = null;
        //                 }
        //             }
        //         }, 25000);
        //     }
        //     return;
        // }
        // 如果全局已标记连接过且当前不处于 OPEN，则交由内部重连，不在此重复创建
        if (typeof window !== "undefined" && (window as any)[WS_CONNECTED_KEY]) return;
        if (balanceDataRef.current && balanceDataRef.current.connectionState !== ConnectionState.CLOSED) return;
        // if (banlanceLoading) return;

        // 创建新的WebSocket连接
        const token = getToken();
        if (!token) {
            console.error("No token found");
            return;
        }
        try {
            if (typeof window !== "undefined") {
                (window as any)[WS_CONNECTED_KEY] = true;
            }
            const websocket = new WebSocketService(
                `${process.env.REACT_APP_ASSETS_API_BASE}/ws/asset?userId=${userInfo.userId}&sa-token=${token}`
            );
            balanceDataRef.current = websocket;

            // 设置连接成功回调，启动ping
            // websocket.setOnConnectedCallback(() => {
            //     // 启动ping心跳（25s 一次，需小于网关空闲超时）
            //     if (pingIntervalRef.current) {
            //         clearInterval(pingIntervalRef.current);
            //         pingIntervalRef.current = null;
            //     }
            //     pingIntervalRef.current = setInterval(() => {
            //         const ws = balanceDataRef.current;
            //         if (ws && ws.connectionState === ConnectionState.OPEN) {
            //             ws.send('ping');
            //         } else {
            //             if (pingIntervalRef.current) {
            //                 clearInterval(pingIntervalRef.current);
            //                 pingIntervalRef.current = null;
            //             }
            //         }
            //     }, 10000);
            // });

            websocket.connect((message: string) => {
                // console.log('收到WebSocket消息:', message);

                try {
                    // 成功收到消息即认为已连通，重置重连计数
                    reconnectAttemptsRef.current = 0;
                    // 处理纯文本心跳
                    if (typeof message === 'string' && (message.startsWith('ping') || message === '__ping__')) {
                        websocket.send(JSON.stringify({ type: '__pong__' }));
                        // console.log('资产页收到ping，回复pong');
                        return;
                    }
                    if (typeof message !== 'string') {
                        return; // 非字符串，忽略或在此按需处理二进制
                    }
                    const trimmed = message.trim();
                    if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) {
                        // 非 JSON 文本（如 Internal Server Error），直接忽略
                        return;
                    }
                    const resData = JSON.parse(trimmed);
                    // console.log('解析后的数据:', data);

                    if (resData.type === "__ping__") {
                        websocket.send(JSON.stringify({ type: "__pong__" }));
                        // console.log('资产页收到JSON ping，回复pong');
                        return;
                    }
                    const data = resData.data;
                    // 更新余额数据
                    if ((resData.data && Array.isArray(resData.data)) && resData.eventType === 'Assets') {
                        appStore.setAssetData(data);
                    }
                    if (resData.data && resData.eventType === 'Rate') {
                        const newData = Object.keys(data.rates)?.map((key: any) => {
                            return {
                                coinSymbol: key,
                                baseSymbol: 'USDT',
                                price: data.rates[key] || 0,
                            }
                        });
                        appStore.setCoinRateData(newData);
                    }
                } catch (error) {
                    console.error("WebSocket数据处理错误:", error);
                    // 保持连接由底层重连处理，不立即置空引用
                }
            }, (err) => {
                console.error('资产WebSocket连接错误:', err);
                // 清理ping定时器
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }
                // 允许后续重建
                balanceDataRef.current = null;
                if (typeof window !== "undefined") {
                    (window as any)[WS_CONNECTED_KEY] = false;
                }
                // 延迟重试，避免热循环（最多重连10次）
                if (reconnectAttemptsRef.current < MAX_RECONNECT) {
                    reconnectAttemptsRef.current += 1;
                    setTimeout(() => {
                        try { setupBalanceWebSocket(); } catch { }
                    }, 3000);
                } else {
                    console.warn(`资产WebSocket已达到最大重连次数(${MAX_RECONNECT})，停止重连`);
                }
            });
        } catch (err) {
            console.error("创建资产WebSocket连接失败:", err);
            // 设置为null以便下次可以重试
            balanceDataRef.current = null;
        }
    }, [userInfo?.userId, enabled]); // 移除initTableData依赖，减少不必要的重连
    useEffect(() => {
        // if (!userInfo || typeof window === "undefined") return;
        if (!userInfo ||!enabled) return;
        setupBalanceWebSocket();
        return () => {
            // 不在组件卸载时强制清理心跳，避免 StrictMode 造成心跳丢失
            // if (pingIntervalRef.current) {
            //     clearInterval(pingIntervalRef.current);
            //     pingIntervalRef.current = null;
            // }
        }
    }, [setupBalanceWebSocket, userInfo, enabled]);

    return {
        setupBalanceWebSocket,
        balanceDataRef,
        pingIntervalRef,
        reconnectAttemptsRef,
        MAX_RECONNECT,
    }

}