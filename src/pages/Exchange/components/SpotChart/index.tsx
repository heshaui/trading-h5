import React, { useState } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon'
import { Image } from 'antd-mobile';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';

import SelectPop from '@/components/SelectPop';
import DepthChart from '@/components/DepthChart';

import StockIcon from '@/assets/images/exchange/icon_stock.png';

const SpotChart: React.FC = () => {
    const {t} = useLanguage('spot');
    const { timeInterval, depthData, updateTimeInterval } = useExchange();

    // 时间默认展示
    const dayData = ["15m", "1h", "4h", "1D"];
    // 所有时间选项
    const timeIntervalOptions = [
        "1m","5m","15m","30m","1h","2h","4h","6h","8h","12h","1D","3D","1W","1M","1Y",
    ];
    const handleTimeInterval = (val: string | number | undefined) => {
        const safeVal = (val ?? '').toString();
        updateTimeInterval(safeVal);
    }

    // k线类型
    const [chartDisplayType, setChartDisplayType] = useState<string | number | undefined>(1)
    const chartDisplayTypeOptions = [
        {
            value: 1,
            label: t("spot.exchange.kLine"), //K线图
        },
        {
            value: 8,
            label: t("spot.exchange.usdLine") // 美国线
        },
        {
            value: 13,
            label: t("spot.exchange.areaLine"), // 面积图
        },
        {
            value: 3,
            label: t("spot.exchange.lineType"), // 线型图
        },
    ];

    // 图表类型 K线图,深度图
    const [chartType, setChartType] = useState<string | number | undefined>("basic");
    const chartTypeOptions = [
        {label: t('spot.label.basic'), value: 'basic'},
        {label: t('spot.label.depth'), value: 'depth'}
    ]
    const getChartName = (type: string | number | undefined) => {
        const chartType = chartTypeOptions.find(chart => chart.value === type)
        return chartType?.label
    }

    return (
        <>
            <ul className={`h-[34px] flex items-center pl-[10px] pr-4 border-b border-color ${chartType==='depth' ? 'justify-end' : ''}`}>
                {
                    chartType === 'basic' && dayData.map((item, index) => (
                        <li key={index}>
                            {
                                item !== '1D' ?
                                <button 
                                    type="button" 
                                    className={`text-[12px] leading-[22px] px-[6px] mr-[2px] rounded-[5px] ${item === timeInterval ? 'bg-[var(--background19)]' : ''}`}
                                    onClick={() => handleTimeInterval(item)}
                                >
                                    {item}
                                </button> :
                                <SelectPop 
                                    value={timeInterval}
                                    options={timeIntervalOptions.map(item => ({label: item, value: item}))}
                                    title={t('spot.select.title')} 
                                    onChange={(value) => handleTimeInterval(value)}
                                    renderBtn={(open) => (
                                        <button 
                                            type="button" 
                                            className={`text-[12px] leading-[22px] px-[6px] mr-[2px] rounded-[5px] ${item === timeInterval ? 'bg-[var(--background19)]' : ''}`}
                                            onClick={open}
                                        >
                                            <span>{item}</span>
                                            <Iconify icon="eva:arrow-down-fill" className="text-[12px] ml-1" />
                                        </button>
                                    )}
                                />
                            }
                        </li>
                    ))
                }
                {chartType === 'basic' && <li>
                     <SelectPop 
                        value={chartDisplayType}
                        options={chartDisplayTypeOptions}
                        title={t('spot.select.title')} 
                        showSearch={false}
                        onChange={(value) => setChartDisplayType(Number(value))}
                        renderBtn={(open) => (
                            <Image
                                src={ StockIcon }
                                alt="exchange"
                                className="!w-[20px] !h-[20px] ml-1"
                                onClick={open}
                            />
                        )}
                    />
                </li>}
                <li>
                    <SelectPop 
                        value={chartType}
                        options={chartTypeOptions}
                        title={t('spot.select.title')} 
                        showSearch={false}
                        onChange={(value) => setChartType(value)}
                        renderBtn={(open) => (
                            <button 
                                type="button" 
                                className={`text-[12px] ml-2 leading-[22px]`}
                                onClick={open}
                            >
                                <span>{getChartName(chartType)}</span>
                                <Iconify icon="eva:arrow-down-fill" className="text-[12px] ml-1" />
                            </button>
                        )}
                    />
                </li>
            </ul>
            {
                chartType === 'depth' ? <DepthChart data={ depthData }/>
                : <div className="h-[322px]"></div>
            }
        </>
    )
}

export default SpotChart;