import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import { Iconify } from "@/components/icon";
import appStore from '@/store';
import { NoData } from '@/components/noData';
import type { SymbolData } from '.';
import { getContractCategory } from '.';

interface SelectContentProps {
    searchValue: string;
    type: 'usdt' | 'coin' | 'sim'; 
    onSelect?: () => void;
}

const SelectContent: React.FC<SelectContentProps> = observer(({ 
    searchValue,
    type,
    onSelect
}) => {
    const { t } = useLanguage(['contract']);
    const symbolList = appStore.getPublicInfo()?.contractList ?? [];
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
        if (!sortField) return symbolList;

        return [...symbolList].sort((a, b) => {
            if (sortField === 'name') {
                const nameA = a.contractName || '';
                const nameB = b.contractName || '';
                return sortDirection === 'asc'
                    ? nameA.localeCompare(nameB, undefined, { numeric: true })
                    : nameB.localeCompare(nameA, undefined, { numeric: true });
            }
            if (sortField === 'price') {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return sortDirection === 'asc'
                    ? priceA - priceB
                    : priceB - priceA;
            }
            if (sortField === 'change') {
                const changeA = parseFloat(a.changePercent) || 0;
                const changeB = parseFloat(b.changePercent) || 0;
                return sortDirection === 'asc'
                    ? changeA - changeB
                    : changeB - changeA;
            }
            return 0;
        });
    };

    const sortedPairList = getSortedPairs();

    // 根据类别过滤合约
    const filteredSymbols = sortedPairList.filter((item: SymbolData) => {
        // 搜索过滤
        const matchesSearch = item.base.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.quote.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.contractName.toLowerCase().includes(searchValue.toLowerCase())
        const itemCategory = getContractCategory(item);
        const matchesType = itemCategory === type;
        return matchesSearch && matchesType;
    });

    const handlePairClick = async (symbol: any) => {
        await appStore.setCurrentContractInfo(symbol.id);
        onSelect?.();
    };

    return (
        <div className="flex-col flex-1 min-h-0 pt-[16px]">
            {/* 列表头部 */}
            <div className="flex justify-between gap-x-[10px] h-[17] items-center px-4 tip-color text-[12px]">
                <div
                    className="flex items-center flex-1"
                    onClick={() => handleSort('name')}
                >
                    <span>{t('symbol')}</span>
                    <div className='ml-1 flex-y-cc'>
                        <Iconify
                            icon="fluent-mdl2:flick-down"
                            className={`${sortField === 'name' && sortDirection === 'asc' ? 'text-[var(--text-color5)]' : 'text-[#9e9e9e]'} text-[10px]`}
                            size={10}
                            style={{ marginBottom: 2 }}
                        />
                        <Iconify
                            icon="fluent-mdl2:flick-up"
                            className={`${sortField === 'name' && sortDirection === 'desc' ? 'text-[var(--text-color5)]' : 'text-[#9e9e9e]'} text-[10px]`}
                            size={10}
                        />
                    </div>
                </div>
                <div
                    className="flex items-center justify-end flex-1"
                    onClick={() => handleSort('price')}
                >
                    <span>{t('symbolSelector.lastPrice')}</span>
                    <div className='ml-1 flex-y-cc'>
                        <Iconify
                            icon="fluent-mdl2:flick-down"
                            className={`${sortField === 'price' && sortDirection === 'asc' ? 'text-[var(--text-color5)]' : 'text-[#9e9e9e]'} text-[10px]`}
                            size={10}
                            style={{ marginBottom: 2 }}
                        />
                        <Iconify
                            icon="fluent-mdl2:flick-up"
                            className={`${sortField === 'price' && sortDirection === 'desc' ? 'text-[var(--text-color5)]' : 'text-[#9e9e9e]'} text-[10px]`}
                            size={10}
                        />
                    </div>
                </div>
                <div
                    className="flex items-center justify-end flex-1"
                    onClick={() => handleSort('change')}
                >
                    <span>{t('symbolSelector.changePercent')}</span>
                    <div className='ml-1 flex-y-cc'>
                        <Iconify
                            icon="fluent-mdl2:flick-down"
                            className={`pointer ${sortField === 'change' && sortDirection === 'asc' ? 'text-[var(--text-color5)]' : 'text-[#9e9e9e]'} text-[10px]`}
                            size={10}
                            style={{ marginBottom: 2 }}
                        />
                        <Iconify
                            icon="fluent-mdl2:flick-up"
                            className={`pointer ${sortField === 'change' && sortDirection === 'desc' ? 'text-[var(--text-color5)]' : 'text-[#9e9e9e]'} text-[10px]`}
                            size={10}
                        />
                    </div>
                </div>
            </div>

            {/* 币对列表 */}
            <ul className={`px-4 py-[13px] flex-1 min-h-0 hideScrollBar`}>
                {filteredSymbols.length ? filteredSymbols.map((pair: any) => (
                        <li 
                            key={pair.id} 
                            className="flex gap-x-[10px] justify-between h-[20px] items-center mb-[15px] last:mb-0 text-[12px]"
                            onClick={() => handlePairClick(pair)}
                        >
                            {/* 币种名称 */}
                            <div className="flex items-center flex-1 font-medium">
                                {pair.contractName}
                            </div>
                            {/* 最新价 */}
                            <div className="text-right flex-1 font-medium">
                                {pair.price ? pair.price.toFixed(2) : '--'}
                            </div>
                            {/* 24h涨跌/24h成交量 */}
                            <div
                                className={`${pair.changePercent ? parseFloat(pair.changePercent) > 0 ? 'success_icon' : parseFloat(pair.realTimeChange) < 0 : pair.priceChangePercent < 0 ? 'error_icon' : ''} text-right flex-1`}
                            >
                                {pair.changePercent ? `${pair.changePercent}%` : '0.00%'}
                            </div>
                        </li>
                ))
                : (
                    <li>
                        <NoData />
                    </li>
                )}
            </ul>
        </div>
    );
});

export default SelectContent;
