import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon'
import { Image } from 'antd-mobile';
import { useContract } from '@/context/exchange-providers/ContractProvider';
import appStore from "@/store";
import { getDepthMap } from "@/services/contract";

import SelectPop from '@/components/SelectPop';
import DepthChart from '@/components/DepthChart';
import Tradingview, { TradingviewRefHandle } from "../Tradingview";


import { ReactComponent as StockIcon } from '@/assets/images/exchange/icon_stock.svg';
import { ReactComponent as ChartIcon } from '@/assets/images/exchange/icon_chart.svg';
import { ReactComponent as DeleteIcon } from '@/assets/images/exchange/icon_delete.svg';
import { ReactComponent as ValueIcon } from '@/assets/images/exchange/icon_value.svg';
import { ReactComponent as SettingIcon } from '@/assets/images/exchange/icon_settings.svg';
import { ReactComponent as FullscreenIcon } from '@/assets/images/exchange/icon_Fullscreen.svg';

type ViewMode = 'phone' | 'phone-fullscreen' | 'tablet' | 'tablet-fullscreen';

const SpotChart: React.FC = () => {
    const {t} = useLanguage('spot');
    const { timeInterval, klineData, updateTimeInterval } = useContract();
    const currentContractInfo = appStore.getCurrentContractInfo();
    const [depthData, setDepthData] = useState<any>(null);
    // k线图视图模式
    const [viewMode, setViewMode] = useState<ViewMode>(window.innerWidth <= 480 ? 'phone' : 'tablet');
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

    // 获取depthData
    const getDepthMapData = async () => {
        if (!currentContractInfo.symbol) return;
        try {
            const res = await getDepthMap({
                symbol: currentContractInfo.symbol,
                contractId: currentContractInfo.id,
            });
            if (res.code === '0')
            console.log("res:", res);
            const data = {
                ...res.data,
                bids: res.data.buys,
            }
            setDepthData(data);
        } catch (err) {} 
    }

    useEffect(() => {
        // 立即请求一次
        getDepthMapData()

        // const intervalId = setInterval(() => {
        //     getDepthMapData()
        // }, 1000) // 1000ms = 1s

        // return () => {
        //     clearInterval(intervalId) // 组件卸载或依赖变更时清理
        // }
    }, [currentContractInfo.symbol, currentContractInfo.id])

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
        } catch (err) {
            console.error("全屏失败", err);
        }
    }

    // 监听屏幕变化,更新图表视图
    useEffect(() => {
        const updateMode = () => {
            const width = window.innerWidth;

            // 折叠屏等场景在全屏状态下仍触发 resize
            if (document.fullscreenElement) {
                if (width <= 480) {
                    setViewMode('phone-fullscreen');
                } else {
                    setViewMode('tablet-fullscreen');
                }
                return;
            }

            // 非全屏时更新普通视图模式
            if (width <= 480) {
                setViewMode('phone');
            } else {
                setViewMode('tablet');
            }
        };

        updateMode(); // 初始化调用
        window.addEventListener('resize', updateMode);

        // 监听退出全屏事件
        document.addEventListener('fullscreenchange', () => {
            const isNowFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isNowFullscreen);
            updateMode(); // 离开或进入全屏后都重新计算模式
        });

        return () => {
            window.removeEventListener('resize', updateMode);
            document.removeEventListener('fullscreenchange', updateMode);
        };
    }, []);

    return (
        <div ref={chartRef} className="bg-[var(--background-primary)] relative">
            {/* {isFullscreen && <button className="absolute" style={{right: '10px', top: '10px'}} onClick={exitFullscreen}>
                <Iconify icon="mingcute:close-line" className="text-[12px] text-[#676867]" />
            </button>} */}
            {!isFullscreen && <ul className={`h-[34px] flex items-center pl-[10px] pr-4 border-b border-color ${chartType==='depth' ? 'justify-end' : 'hideScrollBar scrollX'}`}>
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
                                    activeType="icon"
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
                            activeType="icon"
                            showSearch={false}
                            onChange={(value) => setChartDisplayType(Number(value))}
                            renderBtn={(open) => (
                                <StockIcon className="!w-[20px] !h-[20px] ml-1" onClick={open} />
                            )}
                        />
                    </li>
                    <li>
                        <ChartIcon className="!w-[20px] !h-[20px] ml-1" onClick={() => tradingviewRef.current?.handleAddIndicator()} />
                    </li>
                    <li className="flex items-center ml-1">
                        <button type="button" onClick={() => tradingviewRef.current?.handleOpenSettings()}>
                            <SettingIcon className="!w-[20px] !h-[20px]"/>
                        </button>
                    </li>
                    <li>
                        <DeleteIcon className="!w-[20px] !h-[20px] ml-1" onClick={() => tradingviewRef.current?.resetChart()} />
                    </li>
                    <li>
                        <ValueIcon className="!w-[20px] !h-[20px] ml-1" onClick={() => tradingviewRef.current?.addVolumeDistribution()} />
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
                        activeType="icon"
                        onChange={(value) => setChartType(value)}
                        renderBtn={(open) => (
                            <button 
                                type="button" 
                                className={`text-[12px] ml-2 leading-[22px] whitespace-nowrap`}
                                onClick={open}
                            >
                                <span>{getChartName(chartType)}</span>
                                <Iconify icon="eva:arrow-down-fill" className="text-[12px] ml-1" />
                            </button>
                        )}
                    />
                </li>
                {/* {chartType === 'basic' && <li className="flex items-center ml-1">
                    <button type="button" onClick={handleFullscreen}>
                        <Iconify icon="icon-park-outline:full-screen-two" className="text-[20px] text-[#a4a5ac]" />
                    </button>
                </li>} */}
                <li className="flex items-center ml-1">
                    <button type="button" onClick={handleFullscreen}>
                        <FullscreenIcon className="!w-[20px] !h-[20px]" />
                    </button>
                </li>
                {/* <li className="flex items-center ml-1">
                    <button type="button" onClick={() => tradingviewRef.current?.handleMaximizePane()}>
                        <Iconify icon="material-symbols:fullscreen-rounded" className="text-[22px] text-[#a4a5ac]" />
                    </button>
                </li> */}
            </ul>}
            <div className={isFullscreen ? 'h-[100vh]' : "h-[322px]"}>
                {
                    chartType === 'depth' ? <DepthChart data={ depthData }/> :
                    <Tradingview
                        ref={tradingviewRef}
                        key={`${currentContractInfo?.symbol || ""}_${timeInterval}`}
                        symbol={currentContractInfo?.symbol}
                        chartType={chartDisplayType}
                        klineData={klineData}
                        timeInterval={timeInterval}
                        viewMode={viewMode}
                    />
                }   
            </div>
        </div>
    )
}

export default SpotChart;