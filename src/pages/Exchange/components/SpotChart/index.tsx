import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon'
import { Image } from 'antd-mobile';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';
import appStore from "@/store";

import SelectPop from '@/components/SelectPop';
import DepthChart from '@/components/DepthChart';
import Tradingview, { TradingviewRefHandle } from "@/components/Tradingview";

import StockIcon from '@/assets/images/exchange/icon_stock.png';
import ChartIcon from '@/assets/images/exchange/icon_chart.png';
import DeleteIcon from '@/assets/images/exchange/icon_delete.png';
import ValueIcon from '@/assets/images/exchange/icon_value.png';

type ViewMode = 'phone' | 'phone-fullscreen' | 'tablet' | 'tablet-fullscreen';

const SpotChart: React.FC = () => {
    const {t} = useLanguage('spot');
    const { timeInterval, depthData, klineData, updateTimeInterval } = useExchange();
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
    // k线图视图模式
    const [viewMode, setViewMode] = useState<ViewMode>('phone');
    const [isFullscreen, setIsFullscreen] = useState(false);
    // k线图ref
    const tradingviewRef = useRef<TradingviewRefHandle>(null);
    const chartRef = useRef<HTMLDivElement>(null);
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
    const [chartDisplayType, setChartDisplayType] = useState<number | undefined>(1)
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

    // 全屏
    const handleFullscreen = async () => {
        const el = chartRef.current;
        if (!el) return;
        setIsFullscreen(true)
        try {
            // 进入全屏
            if (el.requestFullscreen) {
                await el.requestFullscreen();
            } else if ((el as any).webkitRequestFullscreen) {
                await (el as any).webkitRequestFullscreen();
            }
            switch (viewMode) {
                case 'phone':
                    setViewMode('phone-fullscreen');
                    // 强制横屏（只在支持的浏览器和 https 环境下生效）
                    // @ts-ignore - screen.orientation.lock 在某些浏览器中可用
                    // if (screen.orientation?.lock) {
                    //     // @ts-ignore - screen.orientation.lock 在某些浏览器中可用
                    //     await screen.orientation.lock("landscape");
                    // }
                    break;
                case 'tablet':
                    setViewMode('tablet-fullscreen');
                    break;
            }
        } catch (err) {
            console.error("全屏或锁定横屏失败", err);
        }
    }

    const exitFullscreen = async () => {
        try {
            // 解锁屏幕方向（可选）
            // if (screen.orientation?.unlock) {
            //     screen.orientation.unlock();
            // }

            // 退出全屏
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            }
            setIsFullscreen(false);
            // 恢复之前的视图模式
            const width = window.innerWidth;
            setViewMode(width <= 480 ? 'phone' : 'tablet');
        } catch (err) {
            console.error("退出全屏失败", err);
        }
    };

    // 监听屏幕宽度 + 全屏状态
    useEffect(() => {
        const updateMode = () => {
            const width = window.innerWidth;
            if (width <= 480) {
                setViewMode('phone');
            } else {
                setViewMode('tablet');
            }
        };
        updateMode();
        window.addEventListener('resize', updateMode);
        return () => window.removeEventListener('resize', updateMode);
    }, []);

    return (
        <div ref={chartRef} className="bg-[var(--background9)] relative">
            {isFullscreen && <button className="absolute right-4 top-4" onClick={exitFullscreen}>
                <Iconify icon="mingcute:close-line" className="text-[24px] text-[#676867]" />
            </button>}
            <ul className={`h-[34px] flex items-center pl-[10px] pr-4 border-b border-color ${chartType==='depth' ? 'justify-end' : 'hideScrollBar scrollX'}`}>
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
                                    title={t('spot.select.placeholder')} 
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
                {chartType === 'basic' && (<>
                    <li>
                        <SelectPop 
                            value={chartDisplayType}
                            options={chartDisplayTypeOptions}
                            title={t('spot.select.placeholder')} 
                            showSearch={false}
                            onChange={(value) => setChartDisplayType(Number(value))}
                            renderBtn={(open) => (
                                <Image
                                    src={ StockIcon }
                                    alt="exchange"
                                    className="!w-[20px] !h-[20px] ml-1"
                                    onClick={open}
                                />
                                // <Iconify icon="bx:candles" className="text-[20px] text-[#a4a5ac] ml-1" />
                            )}
                        />
                    </li>
                    <li>
                        <Image
                            src={ChartIcon}
                            alt="exchange"
                            className="!w-[20px] !h-[20px] ml-1"
                            onClick={() =>
                                tradingviewRef.current?.handleAddIndicator()
                            }
                        />
                    </li>
                    <li className="flex items-center ml-1">
                        <button type="button" onClick={() => tradingviewRef.current?.handleOpenSettings()}>
                            <Iconify icon="uil:setting" className="text-[20px] text-[#a4a5ac]" />
                        </button>
                    </li>
                    <li>
                        <Image
                            src={DeleteIcon}
                            alt="exchange"
                            className="!w-[20px] !h-[20px] ml-1"
                            onClick={() => tradingviewRef.current?.resetChart()}
                        />
                    </li>
                    <li>
                        <Image
                            src={ValueIcon}
                            alt="exchange"
                            className="!w-[20px] !h-[20px] ml-1"
                            onClick={() => tradingviewRef.current?.addVolumeDistribution()}
                        />
                    </li>
                    {/* <li className="flex items-center ml-1">
                        <button type="button" onClick={() => tradingviewRef.current?.handleTakeSnapshot()}>
                            <Iconify icon="tabler:camera" className="text-[20px] text-[#a4a5ac]" />
                        </button>
                    </li> */}
                </>)}
                
                <li>
                    <SelectPop 
                        value={chartType}
                        options={chartTypeOptions}
                        title={t('spot.select.placeholder')} 
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
                {chartType === 'basic' && <li className="flex items-center ml-1">
                    <button type="button" onClick={handleFullscreen}>
                        <Iconify icon="icon-park-outline:full-screen-two" className="text-[20px] text-[#a4a5ac]" />
                    </button>
                </li>}
                {/* <li className="flex items-center ml-1">
                    <button type="button" onClick={() => tradingviewRef.current?.handleMaximizePane()}>
                        <Iconify icon="material-symbols:fullscreen-rounded" className="text-[22px] text-[#a4a5ac]" />
                    </button>
                </li> */}
            </ul>
            {
                chartType === 'depth' ? <DepthChart data={ depthData }/>
                : <div className={isFullscreen ? 'h-[100vh]' : "h-[322px]"}>
                    <Tradingview
                        ref={tradingviewRef}
                        key={`${currentPair?.coinSymbol || ""}_${
                        currentPair?.baseSymbol || ""
                        }_${currentPair?.groupStatus || ""}_${timeInterval}`}
                        symbol={
                        (currentPair?.coinSymbol || "") +
                        "_" +
                        (currentPair?.baseSymbol || "") +
                        "_" +
                        (currentPair?.groupStatus || "")
                        }
                        chartType={chartDisplayType}
                        klineData={klineData}
                        timeInterval={timeInterval}
                        viewMode={viewMode}
                    />
                </div>
            }
        </div>
    )
}

export default SpotChart;