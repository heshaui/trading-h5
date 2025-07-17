import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import { Iconify } from "@/components/icon";
import { addUserExchangeCoinType, canalUserExchangeCoinType } from '@/services/spot';
import appStore from '@/store';
import { Tabs, Rate } from 'antd-mobile';
import CustomTab from '@/components/CustomCom/CustomTab';
import styles from '../styles/selectContent.module.scss';

interface SelectContentProps {
    currencyPairs: any[];
    onPairSelect?: (pair: any) => void;
    searchValue: string;
    wsData?: any;
    type: 'favorites' | 'spot'; // 区分自选和现货
}

const SelectContent: React.FC<SelectContentProps> = observer(({ 
    currencyPairs, 
    onPairSelect, 
    searchValue, 
    wsData,
    type 
}) => {
    const { t } = useLanguage(['spot']);
    const [activeTab, setActiveTab] = useState('all');
    const [showVolume, setShowVolume] = useState<boolean>(false);
    
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

    // 标签页配置
    const tabItems = [
        { key: 'all', title: t('spot.header.all') },
        { key: '1', title: t('spot.header.mainArea') },
        { key: '2', title: t('spot.header.innovationArea') },
        { key: '3', title: t('spot.header.newCoinArea') },
        { key: '4', title: 'AI' },
        { key: '5', title: 'Meme' },
        { key: '6', title: 'NFT' },
        { key: '7', title: 'DeFi' },
        { key: '8', title: 'Web3' },
        { key: '9', title: 'Payments' },
        { key: '10', title: 'Launchpad' },
        { key: '11', title: 'Layer2' },
        { key: '12', title: 'Solana' },
        { key: '13', title: 'RWA' },
        { key: '14', title: 'Launchpool' },
        { key: '15', title: t('spot.header.gameMetaverse') },
        { key: '16', title: t('spot.header.storage') },
    ];

    // 处理排序
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // 获取排序后的数据
    const getSortedPairs = () => {
        if (!sortField) return currencyPairs;

        return [...currencyPairs].sort((a, b) => {
            if (sortField === 'name') {
                const nameA = a.coinSymbol || '';
                const nameB = b.coinSymbol || '';
                return sortDirection === 'asc'
                    ? nameA.localeCompare(nameB, undefined, { numeric: true })
                    : nameB.localeCompare(nameA, undefined, { numeric: true });
            }
            if (sortField === 'price') {
                const priceA = parseFloat(a.yesterdayPrice) || 0;
                const priceB = parseFloat(b.yesterdayPrice) || 0;
                return sortDirection === 'asc'
                    ? priceA - priceB
                    : priceB - priceA;
            }
            if (sortField === 'change') {
                if (showVolume) {
                    const volumeA = parseFloat(a.volume) || 0;
                    const volumeB = parseFloat(b.volume) || 0;
                    return sortDirection === 'asc'
                        ? volumeA - volumeB
                        : volumeB - volumeA;
                } else {
                    const changeA = parseFloat(a.priceChangePercent) || 0;
                    const changeB = parseFloat(b.priceChangePercent) || 0;
                    return sortDirection === 'asc'
                        ? changeA - changeB
                        : changeB - changeA;
                }
            }
            return 0;
        });
    };

    const sortedPairList = getSortedPairs();

    const filteredPairs = sortedPairList.filter(pair => {
        // 搜索过滤
        const matchesSearch = pair.coinSymbol.toLowerCase().includes(searchValue.toLowerCase()) ||
            pair.baseSymbol.toLowerCase().includes(searchValue.toLowerCase());

        // 标签过滤
        const matchesTab = activeTab === 'all' ? true : pair.classLabel === activeTab;

        // 自选/现货过滤
        const matchesType = type === 'favorites' ? pair.isFavorite : true;

        return matchesSearch && matchesTab && matchesType;
    });

    // 合并WebSocket数据到币对数据中
    const enrichedPairs = filteredPairs.map(pair => {
        const symbol = `${pair.coinSymbol}_${pair.baseSymbol}_${pair.groupStatus}`;
        const wsKlineData = wsData?.[symbol];
        
        if (wsKlineData && Array.isArray(wsKlineData) && wsKlineData.length >= 8) {
            const [timestamp, open_price, high_price, low_price, close_price, volume, changePercent, amount] = wsKlineData;
            
            return {
                ...pair,
                realTimePrice: close_price,
                realTimeChange: changePercent ? changePercent.toFixed(2) : null,
                realTimeVolume: volume,
                realTimeAmount: amount
            };
        }
        
        return pair;
    });

    const handlePairClick = async (pair: any) => {
        await appStore.setCurrentPair(pair);
        onPairSelect?.(pair);
    };

    const handleFavoriteClick = (e: React.MouseEvent, value: number, pair: any) => {
        // 阻止冒泡，防止触发行点击事件
        e.stopPropagation();
        handleFavoriteChange(value, pair);
    };

    const handleFavoriteChange = async (value: number, pair: any) => {
        const isFavorite = value === 1;
        const apiCall = isFavorite
            ? addUserExchangeCoinType({ exchangeCoinId: pair.id, type: 1 })
            : canalUserExchangeCoinType({ exchangeCoinId: pair.id, type: 1 });

        const res = await apiCall;
        if (res.code === '0') {
            const updatedPairs = [...appStore.currencyPairs];
            const pairIndex = updatedPairs.findIndex(item => item.id === pair.id);
            if (pairIndex !== -1) {
                updatedPairs[pairIndex] = {
                    ...updatedPairs[pairIndex],
                    isFavorite: isFavorite
                };
                appStore.setCurrencyPairs(updatedPairs);
            }

            if (appStore.currentPair && appStore.currentPair.id === pair.id) {
                const updatedCurrentPair = { ...appStore.currentPair };
                updatedCurrentPair.isFavorite = isFavorite;
                appStore.setCurrentPair(updatedCurrentPair);
            }
        }
    };

    const showChange = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowVolume(!showVolume);
    }

    return (
        <div className="flex-col">
            {/* 滚动标签页 */}
            <CustomTab
                tabsItems={ tabItems }
                activeKey={activeTab}
                onChange={setActiveTab}
                stretch={false}
                activeLineMode='auto'
                className="avatarTabs coinTabs"
            />

            {/* 列表头部 */}
            <div className="flex justify-between gap-x-[10px] h-[17] items-center px-4">
                <div
                    className={`${styles.tip_color} font-12 flex-1 flex-x align-center pointer`}
                    onClick={() => handleSort('name')}
                >
                    <span>{t('spot.header.name')}</span>
                    <div className='ml-1 flex-y-cc'>
                        <Iconify
                            icon="fluent-mdl2:flick-down"
                            className={`pointer ${sortField === 'name' && sortDirection === 'asc' ? styles.active_sort : ''}`}
                            size={10}
                            style={{ marginBottom: 2 }}
                        />
                        <Iconify
                            icon="fluent-mdl2:flick-up"
                            className={`pointer ${sortField === 'name' && sortDirection === 'desc' ? styles.active_sort : ''}`}
                            size={10}
                        />
                    </div>
                </div>
                <div
                    className={`${styles.tip_color} font-12 flex-1 flex-x align-center pointer`}
                    onClick={() => handleSort('price')}
                >
                    <span>{t('spot.header.lastPrice')}</span>
                    <div className='ml-1 flex-y-cc'>
                        <Iconify
                            icon="fluent-mdl2:flick-down"
                            className={`pointer ${sortField === 'price' && sortDirection === 'asc' ? styles.active_sort : ''}`}
                            size={10}
                            style={{ marginBottom: 2 }}
                        />
                        <Iconify
                            icon="fluent-mdl2:flick-up"
                            className={`pointer ${sortField === 'price' && sortDirection === 'desc' ? styles.active_sort : ''}`}
                            size={10}
                        />
                    </div>
                </div>
                <div
                    className={`${styles.tip_color} font-12 flex-1 flex-x align-center pointer`}
                    onClick={() => handleSort('change')}
                >
                    <span>{showVolume ? t('spot.header.volume24h') : t('spot.header.change24h')}</span>
                    <div className='ml-1 flex-y-cc'>
                        <Iconify
                            icon="fluent-mdl2:flick-down"
                            className={`pointer ${sortField === 'change' && sortDirection === 'asc' ? styles.active_sort : ''}`}
                            size={10}
                            style={{ marginBottom: 2 }}
                        />
                        <Iconify
                            icon="fluent-mdl2:flick-up"
                            className={`pointer ${sortField === 'change' && sortDirection === 'desc' ? styles.active_sort : ''}`}
                            size={10}
                        />
                    </div>
                    <div className='ml-1 flex-y-cc' onClick={showChange}>
                        <Iconify icon="mingcute:transfer-line" size={18} />
                    </div>
                </div>
            </div>

            {/* 币对列表 */}
            <div className={`${styles.pair_list}`}>
                {enrichedPairs.map((pair: any) => {
                    const symbol = `${pair.coinSymbol}_${pair.baseSymbol}_${pair.groupStatus}`;
                    const wsKlineData = wsData?.[symbol];
                    const isPriceUp = wsKlineData ? wsKlineData[6] >= 0 : parseFloat(pair.priceChangePercent) >= 0;

                    return (
                        <div 
                            key={pair.id} 
                            className={`${styles.pair_item} px-4 py-2 cursor-pointer hover:bg-[var(--background2)]`}
                            onClick={() => handlePairClick(pair)}
                        >
                            {/* 币种名称 */}
                            <div className={`${styles.pair_name} flex-1`}>
                                <span 
                                    className={styles.favorite}
                                    onClick={(e) => e.stopPropagation()} // 添加额外的阻止冒泡保护
                                >
                                    <Rate
                                        onChange={(value) => handleFavoriteChange(value, pair)}
                                        value={pair.isFavorite ? 1 : 0}
                                        count={1}
                                        style={{ fontSize: 14 }}
                                    />
                                </span>
                                {pair.icon && (
                                    <span className={styles.coin_icon}>
                                        <img src={pair.icon} alt={pair.coinSymbol} className="w-[20px] h-[20px] rounded-full" />
                                    </span>
                                )}
                                <span className={`font-14 ${styles.title_color}`}>{pair.coinSymbol}/{pair.baseSymbol}</span>
                            </div>
                            {/* 最新价 */}
                            <div className={`font-14 ${styles.title_color} flex-1 text-center`}>
                                <span className={isPriceUp ? 'text-[var(--up-color)]' : 'text-[var(--down-color)]'}>
                                    {pair.realTimePrice ? pair.realTimePrice.toFixed(2) : (pair.yesterdayPrice || 0)}
                                </span>
                            </div>
                            {/* 24h涨跌/24h成交量 */}
                            <div className={`flex-1 text-right`}>
                                {showVolume ? (
                                    <span className="font-14">
                                        {formatAmount(pair.realTimeVolume || pair.volume)}
                                    </span>
                                ) : (
                                    <span className={`font-14 ${isPriceUp ? 'text-[var(--up-color)]' : 'text-[var(--down-color)]'}`}>
                                        {(pair.realTimeChange || pair.priceChangePercent)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default SelectContent;
