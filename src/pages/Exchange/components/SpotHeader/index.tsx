import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';
import { observer } from 'mobx-react-lite';
import { Toast } from 'antd-mobile';
import appStore from '@/store';
import { addUserExchangeCoinType, canalUserExchangeCoinType } from '@/services/spot';
import { getPairsRate } from "@/utils/getUseRate";
import WebSocketService from "@/utils/websocket";
import SelectPopup from './SelectPopup/index';
import PrefrenceSettingPop from './PrefrenceSettingPop';

// 开发环境使用代理，生产环境使用完整URL
const WS_URL = `${process.env.REACT_APP_WS_API_BASE}/ws/multi`; 

const SpotHeader = observer(({ coinData }: { coinData: any }) => {
    const { t } = useLanguage('spot');

    const [selectPopupOpen, setSelectPopupOpen] = useState<boolean>(false);
    const [isFavorite, setIsFavorite] = useState(false); // 添加收藏状态
    const [settingPopOpen, setSettingPopOpen] = useState(false); // 侧边抽屉
    const [wsData, setWsData] = useState<Record<string, any>>({});
    const [wsConnected, setWsConnected] = useState(false); // WebSocket连接状态
    const websocketRef = useRef<WebSocketService | null>(null);

    // 解析K线数据
    const klineData = coinData?.data?.[0] || [];
    const [timestamp, open_price, high_price, low_price, close_price, volume] = klineData;

    // 计算涨跌幅
    const priceChange = close_price && open_price ? close_price - open_price : 0;
    const priceChangePercent = open_price && open_price !== 0 ? (priceChange / open_price * 100).toFixed(2) : '0.00';
    const isPriceUp = priceChange >= 0;

    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
    const currencyPairsArray = appStore.currencyPairs || [];

    // WebSocket连接和数据处理
    useEffect(() => {
        // 初始化WebSocket
        if (!websocketRef.current) {
            websocketRef.current = new WebSocketService(WS_URL);
            
            // 设置连接成功回调
            websocketRef.current.setOnConnectedCallback(() => {
                setWsConnected(true);
            });

            // 连接WebSocket并处理消息
            websocketRef.current.connect(
                // onMessage
                (message: string) => {
                    try {
                        const data = JSON.parse(message);
                        if (data && data.type === 'kline') {
                            setWsData(prev => ({
                                ...prev,
                                [data.symbol]: data.data
                            }));
                        }
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                },
                // onError
                (error: Event) => {
                    console.error('WebSocket error:', error);
                    setWsConnected(false);
                }
            );
        }

        // 订阅所有币对的K线数据
        if (wsConnected && currencyPairsArray.length > 0) {
            currencyPairsArray.forEach(pair => {
                const symbol = `${pair.coinSymbol}_${pair.baseSymbol}_${pair.groupStatus}`;
                const subscribeMessage = JSON.stringify({
                    type: 'subscribe',
                    channel: 'kline',
                    symbol: symbol
                });
                websocketRef.current?.send(subscribeMessage);
            });
        }

        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
                websocketRef.current = null;
            }
        };
    }, [wsConnected, currencyPairsArray]);

    // 辅助函数：格式化大额数字
    const formatAmount = (amount: number) => {
        if (amount >= 100000000) {
            return (amount / 100000000).toFixed(2) + t('spot.header.billion');
        } else if (amount >= 10000) {
            return (amount / 10000).toFixed(2) + t('spot.header.tenThousand');
        } else {
            return amount.toFixed(2);
        }
    };

    // 当currentPair变化时同步收藏状态
    useEffect(() => {
        if (currentPair) {
            setIsFavorite(!!currentPair.isFavorite);
        }
    }, [currentPair]);

    // 添加处理收藏的函数
    const handleToggleFavorite = async () => {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState); // 先更新UI状态，提高响应速度

        const data = {
            exchangeCoinId: currentPair.id,
            type: 1
        };

        try {
            let res;
            if (newFavoriteState) {
                // 添加收藏
                res = await addUserExchangeCoinType(data);
            } else {
                // 取消收藏
                res = await canalUserExchangeCoinType(data);
            }

            if (res.code === '0') {
                // 请求成功后更新store中的状态
                appStore.setCurrentPair({
                    ...currentPair,
                    isFavorite: newFavoriteState
                });

                // 更新币对列表中的收藏状态
                const updatedPairs = [...appStore.currencyPairs];
                const pairIndex = updatedPairs.findIndex(item => item.id === currentPair.id);
                if (pairIndex !== -1) {
                    updatedPairs[pairIndex] = {
                        ...updatedPairs[pairIndex],
                        isFavorite: newFavoriteState
                    };
                    appStore.setCurrencyPairs(updatedPairs);
                }
            } else {
                // 如果API失败，恢复UI状态
                setIsFavorite(!newFavoriteState);
                console.error('更新收藏状态失败:', res);
                Toast.show({
                    icon: 'fail',
                    content: res.message
                })
            }
        } catch (error) {
            // 发生错误时恢复UI状态
            setIsFavorite(!newFavoriteState);
            console.error('收藏操作发生错误:', error);
            Toast.show({
                icon: 'fail',
                content: String(error)
            })
        }
    };

    return (
        <div className="border-b-[4px] border-[var(--background14)]">
            <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                    <button 
                        className="flex h-[22px] items-center"
                        onClick={() => setSelectPopupOpen(true)}
                    >
                        <span className="text-[16px] font-medium mr-1">{currentPair?.coinSymbol}/{currentPair?.baseSymbol}</span>
                        <Iconify icon="eva:arrow-down-fill" className="text-[16px] text-[#9e9e9e]" />
                    </button>
                    <div>
                        <button type='button' onClick={handleToggleFavorite}>
                            <Iconify
                                icon={currentPair?.isFavorite ? "ic:round-star" : "ic:round-star-outline"}
                                className="text-[24px]"
                                color={currentPair?.isFavorite ? "#FFD700" : "var(--text-color6)"}
                            />
                        </button>
                        <button type='button' className="ml-4" onClick={() => setSettingPopOpen(true)}>
                            <Iconify icon="mingcute:settings-5-line" className="text-[24px] tip-color" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-x-[17px] mt-[11px]">
                    <div className="shrink-0">
                        <p className={`${isPriceUp ? 'success_icon' : 'error_icon'} text-[18px] font-bold leading-[25px] mb-[9px]`}>
                            {close_price ? close_price.toFixed(2) : '--'}
                        </p>
                        <p className="text-[12px] leading-[17px] text-[#9e9e9e]">
                            <span>≈ ¥ {close_price ? getPairsRate(close_price, 'CNY').rate.toFixed(2) : '--' }</span>
                            <span className={`${isPriceUp ? 'success_icon' : 'error_icon'} ml-[19px]`}>{priceChangePercent && priceChangePercent !== 'NaN' && priceChange !== 0 ? (isPriceUp ? '+' : '') + priceChangePercent + '%' : '--'}</span>
                        </p>
                    </div>
                    <div className="flex-1 min-w-0 text-[12px] text-[#9e9e9e]">
                        <p className="flex justify-between items-center h-[17px]">
                            <span>{t('spot.header.high24h')}</span>
                            <span>{high_price ? high_price.toFixed(2) : '--'}</span>
                        </p>
                        <p className="flex justify-between items-center h-[17px]">
                            <span>{t('spot.header.low24h')}</span>
                            <span>{low_price ? low_price.toFixed(2) : '--'}</span>
                        </p>
                        <p className="flex justify-between items-center h-[17px]">
                            <span>{t('spot.header.volume24h')}({currentPair?.coinSymbol || '--'})</span>
                            <span>{volume ? formatAmount(volume) : '--'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* 币对选择弹窗 */}
            <SelectPopup
                open={selectPopupOpen}
                onOk={() => setSelectPopupOpen(false)}
                onCancel={() => setSelectPopupOpen(false)}
                currencyPairs={currencyPairsArray}
                wsData={wsData}
            />
            <PrefrenceSettingPop open={settingPopOpen} onCancel={() => setSettingPopOpen(false)} />
        </div>
    )
});

export default SpotHeader;