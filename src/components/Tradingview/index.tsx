
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo
} from "react";
import "./Tradingview.module.css";
import { useThemeMode } from "@/hooks/useThemeMode";
import jstz from 'jstz';
import getChartConfig from './config';

export interface TradingviewProps {
  symbol?: string;
  chartType?: number;
  klineData?: any;
  timeInterval?: string;
  viewMode?: string
}

export interface TradingviewRefHandle {
  addVolumeDistribution: () => void;
  resetChart: () => void;
  handleAddIndicator: () => void;
  handleChartScreenshot: () => void;
  toggleFullScreen: () => void;
  handleMaximizePane: () => void; // k线最大窗格
  handleTakeSnapshot: () => void; // 保存快照
  handleOpenSettings: () => void; // 设置
}

// 时间间隔转换工具函数
const convertTimeInterval = (interval: string): string => {
  const intervalMap: Record<string, string> = {
    "1m": "1",
    "3m": "3", 
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "2h": "120", 
    "4h": "240",
    "6h": "360",
    "8h": "480",
    "12h": "720",
    "1D": "D",
    "1W": "W", 
    "1M": "M"
  };
  return intervalMap[interval] || interval;
};

const Tradingview: React.ForwardRefRenderFunction<
  TradingviewRefHandle,
  TradingviewProps
> = (
  {
    symbol,
    chartType = 9,
    klineData = [],
    timeInterval = "15m",
    viewMode = 'phone'
  },
  ref
) => {
  const timezone = jstz.determine();
  const { isDayMode } = useThemeMode();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tvWidget, setTvWidget] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIntervalDialog, setShowIntervalDialog] = useState(false);
  const [tradTime, setTradTime] = useState("1D");
  
  const [intervals] = useState([
    "1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "D", "W", "M",
  ]);
  
  const [lineType] = useState([
    { text: "Line", type: 8 },
    { text: "Bar", type: 1 },
    { text: "Candlestick", type: 9 },
    { text: "Area", type: 3 },
    { text: "Heikin Ashi", type: 13 },
  ]);

  const wsDataRef = useRef(klineData);
  const initCompletedRef = useRef(false);
  const scrollContainer = useRef<HTMLUListElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const prevThemeRef = useRef<boolean | null>(null);

  const chartConfig = useMemo(() => {
    return getChartConfig(isDayMode, viewMode);
  }, [viewMode, isDayMode])

  useEffect(() => {
    if (tvWidget) {
      // 重建图表以应用新配置
      recreateChart();
    }
    console.log('视图变了', viewMode)
  }, [viewMode]);

  // 创建图表函数
  const createChart = () => {
    //  || tvWidget || initCompletedRef.current
    if (!chartContainerRef.current) {
      return;
    }

    try {
      const tvTimeInterval = convertTimeInterval(timeInterval);
      const chartSymbol = symbol || "BTC_USDT_1";
      
      const datafeed = createDatafeed(
        wsDataRef.current,
        tvTimeInterval,
        chartSymbol,
        timeInterval
      );

      let lang = localStorage.getItem("lang") || "zh";
      if (lang == "zh_CN") {
        lang = "zh";
      } else if (lang == "en_US") {
        lang = "en";
      } else if (lang == "ko_KR") {
        lang = "ko";
      } else if (lang == "vi_VN") {
        lang = "vi";
      } else {
        lang = "en";
      }

      const widgetOptions = {
        symbol: chartSymbol,
        datafeed: datafeed,
        interval: tvTimeInterval,
        container: chartContainerRef.current,
        library_path: "/charting_library/",
        charts_storage_url: "http://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        autosize: true,
        debug: false,
        locale: lang,
        timezone: timezone.name(),
        theme: isDayMode ? "light" : "dark",
        ...chartConfig
      };

      const newWidget = new window.TradingView.widget(widgetOptions as any);
      setTvWidget(newWidget);

      newWidget.onChartReady(() => {
        newWidget.chart().setChartType(chartType);
        newWidget.chart().createStudy("Volume", false, false, {
          "volume.color.0": "#00FF00",
          "volume.color.1": "#FF0000", 
          "volume.transparency": 30,
          "volume.width": 1,
        });
      });

      initCompletedRef.current = true;
      
      // 设置WebSocket更新处理
      window.__tradingViewHandlersInitialized = true;
      window.__handleTradingViewUpdate = (newData: any) => {
        if (window.__tradingViewUpdateBar) {
          window.__tradingViewUpdateBar(newData);
        }
      };

    } catch (error) {
      console.error('TradingView chart creation error:', error);
    }
  };

  // 重建图表函数
  const recreateChart = () => {
    if (tvWidget) {
      try {
        tvWidget.remove();
        setTvWidget(null);
        initCompletedRef.current = false;
        setTimeout(createChart, 100);
      } catch (e) {

      }
    } else {
      createChart();
    }
  };

  // 主要的初始化和依赖监听
  useEffect(() => {
    // 更新数据引用
    if (klineData && klineData.length > 0) {
      wsDataRef.current = klineData;
    }

    // 如果主题变化，重建图表
    if (prevThemeRef.current !== null && prevThemeRef.current !== isDayMode) {
      recreateChart();
    } else if (!tvWidget) {
      // 首次创建图表
      setTimeout(createChart, 100);
    }

    prevThemeRef.current = isDayMode;

    return () => {
      if (tvWidget) {
        try {
          tvWidget.remove();
          initCompletedRef.current = false;
        } catch (e) {

        }
        setTvWidget(null);
      }
    };
  }, [symbol, timeInterval, chartType, isDayMode]);

  // 监听主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      recreateChart();
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  // 已在上面的初始化函数中处理了主题变化的逻辑

  // 单独处理WebSocket数据更新
  useEffect(() => {
    if (!tvWidget || !klineData) return;

    // 仅在klineData有值时才进行处理
    if (klineData.length === 0 && !klineData.data) return;

    // 更新引用但不重新初始化图表
    wsDataRef.current = klineData;



    // 每次收到新数据时，强制更新图表
    if (window.__handleTradingViewUpdate) {
      // 检查数据格式并确保我们传递的是最新的数据点
      if (
        klineData.type === "kline" &&
        Array.isArray(klineData.data) &&
        klineData.data.length > 0
      ) {
        // 传递整个klineData对象以保持一致的处理
        window.__handleTradingViewUpdate({
          ...klineData,
          timestamp: Date.now(),
        }); // 添加时间戳确保每次更新被识别为新数据
      } else if (Array.isArray(klineData) && klineData.length > 0) {
        // 如果是数组格式，确保我们传递整个数组
        window.__handleTradingViewUpdate([...klineData]); // 创建新数组引用确保触发更新
      } else {
        // 如果是单个数据点对象，直接传递
        window.__handleTradingViewUpdate({
          ...klineData,
          timestamp: Date.now(),
        }); // 添加时间戳确保每次更新被识别为新数据
      }
    }
  }, [klineData, tvWidget]);

  const toggleModal = () => setShowModal(!showModal);

  const setChartInterval = (interval: string) => {
    if (tvWidget) {
      const tvInterval = convertTimeInterval(interval);
      tvWidget.chart().setResolution(tvInterval);
      setTradTime(interval);
      setShowIntervalDialog(false);
    }
  };
  //手动添加指标
  const addIndicator = (studyName: string) => {
    const studyMappings: any = {
      "Moving Average": { name: "Moving Average" },
      EMA: { name: "Moving Average Exponential" },
      MACD: { name: "MACD" },
      KDJ: { name: "Stochastic" }, // 更正为 Stochastic
      BOLL: { name: "Bollinger Bands" },
      "TD Sequential": { name: "TD Sequential" },
      "RSI-S-I": { name: "Relative Strength Index" },
      Stochastic: { name: "Stochastic" },
      "S-RSI": { name: "Stochastic RSI" },
      SMI: { name: "SMI" },
      TRIX: { name: "TRIX" },
      PO: { name: "Price Oscillator" },
      PC: { name: "Price Channel" },
      PVT: { name: "Price Volume Trend" },
      CC: { name: "Commodity Channel Index" },
      KST: { name: "Know Sure Thing" },
      NV: { name: "Negative Volume Index" },
      Momentum: { name: "Momentum" },
      DM: { name: "Directional Movement" },
      AO: { name: "Awesome Oscillator" },
    };

    if (tvWidget && studyMappings[studyName]) {
      const chart = tvWidget.chart();

      chart.createStudy(
        studyMappings[studyName].name,
        false,
        true,
        [], // Params depending on the study
        {}, // Overrides depending on the study
        {} // Inputs depending on the study
      );
    }
  };

  //图表截图
  const handleChartScreenshot = () => {
    if (tvWidget) {
      tvWidget.chart().executeActionById("screenshot");
    }
  };

  const toggleFullScreen = () => {
    // const element = this.$refs.chartContainer;
    const element = chartContainerRef.current;

    // 首先检查element是否存在
    if (!element) {
      return;
    }

    // 检查浏览器支持的全屏API
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  //技术指标搜索
  const handleAddIndicator = () => {
    if (tvWidget) {
      tvWidget.chart().executeActionById("insertIndicator");
    }
  };

  //成交量分布
  const addVolumeDistribution = () => {
    if (tvWidget) {
      tvWidget
        .chart()
        .createStudy("Volume Profile Visible Range", false, false, [
          /* ... 参数 ... */
        ]);
    }
  };

  //重置图表
  const resetChart = () => {
    if (tvWidget) {
      tvWidget.chart().removeAllShapes();
      tvWidget
        .chart()
        .getAllStudies()
        .forEach((study: any) => {
          // 移除指标
          if (study.name != "Volume") {
            tvWidget.chart().removeEntity(study.id);
          }
        });
    }
  };

  // k线窗格最大化
  const handleMaximizePane = () => {
    if (tvWidget) {
      tvWidget.chart().executeActionById("pane_fullscreen_action");
    }
  };

  // 打开快照
  const handleTakeSnapshot = () => {
    tvWidget.takeScreenshot().then((url: string) => {
      console.log("Chart snapshot URL:", url);
    });
  };

  // 打开设置
  const handleOpenSettings = () => {
    if (tvWidget) {
      tvWidget.chart().executeActionById("chartProperties");
    }
  };

  // expose imperative handlers
  useImperativeHandle(ref, () => ({
    addVolumeDistribution,
    resetChart,
    handleAddIndicator,
    handleChartScreenshot,
    toggleFullScreen,
    handleMaximizePane,
    handleTakeSnapshot,
    handleOpenSettings
  }));

  const setChartType = (typeCode: number) => {
    if (tvWidget) {
      tvWidget.chart().setChartType(typeCode);
      setShowModal(false);
    }
  };

  const createDatafeed = (
    initialData: any,
    tvTimeInterval: string,
    symbol: string,
    originalInterval: string
  ) => {
    const subscribers: any = {};
    // 添加请求缓存对象
    const requestCache: { [key: string]: { timestamp: number; data: any } } =
      {};
    // 缓存过期时间(毫秒)
    const CACHE_EXPIRY = 30000; // 30秒

    // 清理全局状态，确保每次创建datafeed时都有干净的状态
    if (window.__tradingViewUpdateBar) {
      delete window.__tradingViewUpdateBar;
    }
    if (window.__handleTradingViewUpdate) {
      delete window.__handleTradingViewUpdate;
    }
    window.__tradingViewHandlersInitialized = false;

    // 先定义时间格式化函数
    const formatTimeValue = (timeValue: any): number => {
      try {
        if (timeValue === undefined || timeValue === null) {
          return Date.now();
        }

        if (typeof timeValue === "number") {
          // 处理秒级时间戳（小于10位数）和毫秒级时间戳
          const timestamp = timeValue < 10000000000 ? timeValue * 1000 : timeValue;
          
          // 验证时间戳是否合理（不能是未来时间太远，也不能是过去时间太远）
          const now = Date.now();
          const oneYearMs = 365 * 24 * 60 * 60 * 1000;
          
          if (timestamp > now + oneYearMs) {

            return now;
          }
          
          if (timestamp < now - 10 * oneYearMs) {
         
            return now;
          }
          
          // 添加调试日志，特别关注时间转换
         
          
          return timestamp;
        }

        if (typeof timeValue === "string") {
          const parsedTime = new Date(timeValue).getTime();
          if (isNaN(parsedTime)) {

            return Date.now();
          }

          return parsedTime;
        }


        return Date.now();
      } catch (error) {

        return Date.now();
      }
    };

    // 预处理初始数据
    const bars: any[] = [];

    // 处理初始K线数据
    if (Array.isArray(initialData) && initialData.length > 0) {
      // 这里可以添加对初始数据的处理
    }

    // 统一的K线数据转换函数
    const convertKlineToBar = (kline: any[]): any => {
      if (!Array.isArray(kline) || kline.length < 7) {
        return null;
      }
      
      const time = formatTimeValue(kline[0]);
      const open = Number(kline[2] || 0);
      const high = Number(kline[1] || 0);
      const low = Number(kline[3] || 0);
      const close = Number(kline[4] || 0);
      const volume = Number(kline[6] || 0);
      
      // 验证价格数据的合理性
      if (high < low || high < open || high < close || low > open || low > close) {
        console.warn("价格数据异常:", { time, open, high, low, close, volume });
      }
      
      return {
        time,
        open,
        high,
        low,
        close,
        volume,
      };
    };

    // 跟踪最后一个K线的时间，防止时间倒序
    const timeTracker = { lastBarTime: 0 };

    // 更新实时数据处理函数
    window.__tradingViewUpdateBar = (data: any) => {
      if (!data) return;

      try {


        // 处理不同的数据格式
        if (
          data.type === "kline" &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {


          // 处理每个数据点
          data.data.forEach((klineItem: any, index: number) => {
            const bar = convertKlineToBar(klineItem);
            if (bar) {


              // 检查时间顺序，防止时间倒序
              if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
   
                return; // 跳过这个数据点
              }
              
              // 检查是否是重复的时间戳
              if (timeTracker.lastBarTime > 0 && bar.time === timeTracker.lastBarTime) {

                return; // 跳过重复数据
              }
              
              timeTracker.lastBarTime = bar.time;

              
              // 将每个数据点传给所有订阅者
              Object.keys(subscribers).forEach((key) => {
                const callback = subscribers[key];
                if (typeof callback === "function") {
                  // 添加一个小延迟确保图表更新
                  setTimeout(() => callback(bar), 0);
                }
              });
            } else {

            }
          });
        } else if (Array.isArray(data)) {
          // 如果是直接的数组格式


          // 分情况处理：如果是数组的数组，则遍历处理
          if (data.length > 0 && Array.isArray(data[0])) {
            // 这是一个数组的数组
            data.forEach((item: any, index: number) => {
              const bar = convertKlineToBar(item);
              if (bar) {
              

                // 检查时间顺序
                if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
                  return;
                }
                
                timeTracker.lastBarTime = bar.time;

                Object.keys(subscribers).forEach((key) => {
                  const callback = subscribers[key];
                  if (typeof callback === "function") {
                    // 使用setTimeout确保每个回调独立执行
                    setTimeout(() => callback(bar), 0);
                  }
                });
              }
            });
          } else if (data.length >= 7) {
            // 这是单个数据点数组
            const bar = convertKlineToBar(data);
            if (bar) {
             

              // 检查时间顺序
              if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {

                return;
              }
              
              timeTracker.lastBarTime = bar.time;

              Object.keys(subscribers).forEach((key) => {
                const callback = subscribers[key];
                if (typeof callback === "function") {
                  setTimeout(() => callback(bar), 0);
                }
              });
            }
          }
        } else {
          // 处理对象格式

          const bar = {
            time: formatTimeValue(data.timestamp || data.time),
            open: Number(data.open || 0),
            high: Number(data.high || 0),
            low: Number(data.low || 0),
            close: Number(data.close || 0),
            volume: Number(data.volume || 0),
          };



          // 检查时间顺序
          if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {

            return;
          }
          
          timeTracker.lastBarTime = bar.time;

          Object.keys(subscribers).forEach((key) => {
            const callback = subscribers[key];
            if (typeof callback === "function") {
              setTimeout(() => callback(bar), 0);
            }
          });
        }
      } catch (error) {
        console.error("💥 更新数据错误:", error);
        console.error("错误数据:", data);
      }
    };

    return {
      onReady: (cb: any) => {
        setTimeout(
          () =>
            cb({
              supported_resolutions: [
                "1",
                "3",
                "5",
                "15",
                "30",
                "60",
                "120",
                "240",
                "360",
                "480",
                "720",
                "D",
                "W",
                "M",
              ],
              supports_marks: false,
              supports_timescale_marks: false,
              supports_time: true,
            }),
          0
        );
      },

      subscribeBars: (
        symbolInfo: any,
        resolution: any,
        onRealtimeCallback: any,
        listenerGUID: any
      ) => {

        subscribers[listenerGUID] = onRealtimeCallback;

        // 处理K线数据
        if (
          initialData &&
          initialData.type === "kline" &&
          initialData.data &&
          initialData.data.length > 0
        ) {

          
          // 遍历所有K线数据，按时间排序
          const sortedData = [...initialData.data].sort((a, b) => {
            const timeA = formatTimeValue(a[0]);
            const timeB = formatTimeValue(b[0]);
            return timeA - timeB;
          });


          
          // 重置时间追踪器
          timeTracker.lastBarTime = 0;

          // 去重处理：移除相同时间戳的重复数据，保留最新的数据
          const deduplicatedData: any[] = [];
          const timeSet = new Set<number>();
          
          sortedData.forEach((kline: any) => {
            const time = formatTimeValue(kline[0]);
            if (!timeSet.has(time)) {
              timeSet.add(time);
              deduplicatedData.push(kline);
            } else {
              console.warn("⚠️ 发现重复时间戳，跳过:", {
                原始时间戳: kline[0],
                格式化时间: new Date(time).toISOString()
              });
            }
          });



          deduplicatedData.forEach((kline: any, index: number) => {
            const bar = convertKlineToBar(kline);
            if (bar) {


              // 更新时间追踪器，确保历史数据的最后时间被记录
              timeTracker.lastBarTime = Math.max(timeTracker.lastBarTime, bar.time);
              
              // 将处理后的数据传递给TradingView
              onRealtimeCallback(bar);
            }
          });
          

        } else {
          console.log("⚠️ 没有初始历史数据");
        }
      },

      unsubscribeBars: (listenerGUID: any) => {
        delete subscribers[listenerGUID];
      },

      searchSymbols: (
        userInput: any,
        exchange: any,
        symbolType: any,
        onResultReadyCallback: any
      ) => {
        onResultReadyCallback([]);
      },

      resolveSymbol: (
        symbolName: any,
        onSymbolResolvedCallback: any,
        onResolveErrorCallback: any
      ) => {
        const symbolParts = symbolName.split("_");
        const baseSymbol = symbolParts[0] || "BTC";

        setTimeout(
          () =>
            onSymbolResolvedCallback({
              name: symbolName,
              description: `${baseSymbol}/USDT`,
              type: "crypto",
              session: "24x7",
              timezone: timezone.name(),
              exchange: "",
              minmov: 1,
              pricescale: 100000,
              has_intraday: true,
              has_no_volume: true,
              has_weekly_and_monthly: true,
              supported_resolutions: [
                "1",
                "3",
                "5",
                "15",
                "30",
                "60",
                "120",
                "240",
                "360",
                "480",
                "720",
                "D",
                "W",
                "M",
              ],
              volume_precision: 8,
              data_status: "streaming",
            }),
          0
        );
      },

      getBars: async (
        symbolInfo: any,
        resolution: any,
        periodParams: any,
        onHistoryCallback: any,
        onErrorCallback: any
      ) => {
        try {
          const startTime = periodParams.from * 1000;
          const endTime = periodParams.to * 1000;

          // 创建缓存键，使用原始格式
          const cacheKey = `${symbol}_${originalInterval}_${startTime}_${endTime}`;

          // 检查缓存中是否有有效数据
          const now = Date.now();
          if (
            requestCache[cacheKey] &&
            now - requestCache[cacheKey].timestamp < CACHE_EXPIRY
          ) {

            const cachedData = requestCache[cacheKey].data;

            if (cachedData.type === "kline" && Array.isArray(cachedData.data)) {

              
              const formattedBars = cachedData.data
                .map((kline: any) => convertKlineToBar(kline))
                .filter((bar: any) => bar !== null)
                .sort((a: any, b: any) => a.time - b.time);

              // 去重处理
              const deduplicatedBars: any[] = [];
              const timeSet = new Set<number>();
              
              formattedBars.forEach((bar: any) => {
                if (!timeSet.has(bar.time)) {
                  timeSet.add(bar.time);
                  deduplicatedBars.push(bar);
                } else {

                }
              });



              onHistoryCallback(deduplicatedBars, {
                noData: deduplicatedBars.length === 0,
              });
              return;
            }
          }
          // 使用原始的时间间隔格式构建URL
          const url = `${process.env.REACT_APP_WEB_API_BASE}/kline/${symbol}/${originalInterval}/range?start_time=${startTime}&end_time=${endTime}&limit=1000`;


          const response = await fetch(url);

          if (response.status === 200) {
            const data = await response.json();

            // 将结果存入缓存
            requestCache[cacheKey] = {
              timestamp: now,
              data: data,
            };

            if (data.type === "kline" && Array.isArray(data.data)) {

              
              const formattedBars = data.data
                .map((kline: any) => convertKlineToBar(kline))
                .filter((bar: any) => bar !== null)
                .sort((a: any, b: any) => a.time - b.time);

              // 去重处理
              const deduplicatedBars: any[] = [];
              const timeSet = new Set<number>();
              
              formattedBars.forEach((bar: any) => {
                if (!timeSet.has(bar.time)) {
                  timeSet.add(bar.time);
                  deduplicatedBars.push(bar);
                } else {

                }
              });



              onHistoryCallback(deduplicatedBars, {
                noData: deduplicatedBars.length === 0,
              });
            } else {
              console.error("获取历史数据格式错误:", data);
              onHistoryCallback([], { noData: true });
            }
          } else {
            console.error("API请求失败:", response.status);
            onHistoryCallback([], { noData: true });
          }
        } catch (error) {
          console.error("获取历史数据错误:", error);
          onHistoryCallback([], { noData: true });
        }
      },
    };
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainer.current) {
      const scrollAmount = 200; // 可以根据需要调整滚动距离
      const newScrollLeft =
        direction === "left"
          ? scrollContainer.current.scrollLeft - scrollAmount
          : scrollContainer.current.scrollLeft + scrollAmount;

      scrollContainer.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px 容差
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ul>
              {lineType.map((item, index) => (
                <li key={index} onClick={() => setChartType(item.type)}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showIntervalDialog && (
        <div
          className="interval-dialog-overlay"
          onClick={() => setShowIntervalDialog(false)}
        >
          <div className="interval-dialog" onClick={(e) => e.stopPropagation()}>
            {intervals.map((interval) => (
              <div
                key={interval}
                className={`interval-option ${
                  interval === tradTime ? "active" : ""
                }`}
                onClick={() => setChartInterval(interval)}
              >
                {interval}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="TVChartContainer"
        ref={chartContainerRef}
        style={{ width: "100%", height: "100%", margin: "auto" }}
      ></div>

    </div>
  );
};

declare global {
  interface Window {
    TradingView: any;
    __tradingViewUpdateBar: any;
    __handleTradingViewUpdate: any;
    __tradingViewHandlersInitialized: boolean;
  }
}

export default forwardRef(Tradingview);
