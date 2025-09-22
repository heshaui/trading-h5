
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback
} from "react";
import "@/components/Tradingview/Tradingview.module.css";
import { useThemeMode } from "@/hooks/useThemeMode";
import jstz from 'jstz';
import getChartConfig from '@/components/Tradingview/config';
import appStore from "@/store";

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
  const currentContractInfo=appStore.getCurrentContractInfo()
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

  // 强制创建图表函数，跳过状态检查
  const forceCreateChart = useCallback(() => {
	if (!chartContainerRef.current) {
		return;
	}
	try {
		// 确保清理状态
		initCompletedRef.current = false;
		
		const tvTimeInterval = convertTimeInterval(timeInterval);
		// 为每个合约创建唯一的symbol标识，包含时间戳避免缓存冲突
		const uniqueTimestamp = Date.now();
		const chartSymbol = symbol ? `${symbol.replace("-", "_")}_${uniqueTimestamp}` : `BTC_USDT_${uniqueTimestamp}`;
		


		// 优先使用从父组件传递的klineData，其次使用wsDataRef中的缓存数据
		let currentData = klineData || wsDataRef.current;
		
		// 验证数据是否匹配当前时间间隔
		if (currentData && currentData.channel) {
			// 从当前时间间隔转换为WebSocket格式
			const intervalMap: Record<string, string> = {
				"1m": "1min",
				"5m": "5min",
				"15m": "15min",
				"30m": "30min",
				"1h": "60min",
				"1D": "1day",
				"1W": "1week",
				"1M": "1month"
			};
			const expectedInterval = intervalMap[timeInterval] || "1day";
			const expectedChannel = `market_${currentContractInfo.coType.toLowerCase()}_${symbol?.toLowerCase().replace("-", "")}_kline_${expectedInterval}`;
			
			// 如果channel不匹配当前时间间隔，清空数据
			if (currentData.channel !== expectedChannel) {
				console.log("📊 数据channel不匹配，清空旧数据", {
					当前channel: currentData.channel,
					期望channel: expectedChannel,
					当前时间间隔: timeInterval
				});
				currentData = null;
			}
		}

		// 检查数据状态，但即使没有数据也创建图表
		if (!currentData || (Array.isArray(currentData) && currentData.length === 0) || 
			(currentData.event_rep === "rep" && (!currentData.data || currentData.data.length === 0))) {
			// 创建一个空的数据结构，让TradingView能正常初始化
			const intervalMap: Record<string, string> = {
			"1m": "1min",
			"5m": "5min",
			"15m": "15min",
			"30m": "30min",
			"1h": "60min",
			"1D": "1day",
			"1W": "1week",
			"1M": "1month"
			};
			const wsInterval = intervalMap[timeInterval] || "1day";
			currentData = { 
				event_rep: "rep", 
				data: [], 
				channel: `market_${symbol?.toLowerCase().replace("-", "")}_kline_${wsInterval}` 
			};
		}

		const datafeed = createDatafeed(
			currentData,
			tvTimeInterval,
			chartSymbol,
			symbol  // 传递原始symbol用于数据匹配
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
			locale: lang,
			charts_storage_url: "http://saveload.tradingview.com",
			charts_storage_api_version: "1.1",
			client_id: "tradingview.com",
			user_id: "public_user_id",
			fullscreen: false,
			autosize: true,
			timezone: timezone.name(),
			debug: false,
			theme: isDayMode ? "light" : "dark",
			...chartConfig
		};


		
		const newWidget = new window.TradingView.widget(widgetOptions as any);

		setTvWidget(newWidget);


		newWidget.onChartReady(() => {

			try {
				if (newWidget && newWidget.chart && typeof newWidget.chart === 'function') {
					const chart = newWidget.chart();
					if (chart && typeof chart.setChartType === 'function' && typeof chart.createStudy === 'function') {
					chart.setChartType(chartType);
					chart.createStudy("Volume", false, false, {
						"volume.color.0": "#00FF00",
						"volume.color.1": "#FF0000",
						"volume.transparency": 30,
						"volume.width": 1,
					});
					}
				}
			} catch (error) {
				console.error("图表初始化时出错:", error);
			}
		});

		initCompletedRef.current = true;


		// 设置WebSocket更新处理
		window.__tradingViewHandlersInitialized = true;
		window.__handleTradingViewUpdate = (newData: any) => {
			// 验证新数据是否匹配当前时间间隔
			if (newData && newData.channel) {
			const intervalMap: Record<string, string> = {
				"1m": "1min",
				"5m": "5min",
				"15m": "15min",
				"30m": "30min",
				"1h": "60min",
				"1D": "1day",
				"1W": "1week",
				"1M": "1month"
			};
			const expectedInterval = intervalMap[timeInterval] || "1day";
			const expectedChannel = `market_${currentContractInfo.coType.toLowerCase()}_${symbol?.toLowerCase().replace("-", "")}_kline_${expectedInterval}`;
			
			// 只处理匹配当前时间间隔的数据
			if (newData.channel === expectedChannel) {
				if (window.__tradingViewUpdateBar) {
				window.__tradingViewUpdateBar(newData);
				}
			} else {
				console.log("⏭️ 忽略不匹配的数据更新", {
				收到channel: newData.channel,
				期望channel: expectedChannel
				});
			}
			} else if (window.__tradingViewUpdateBar) {
			// 没有channel信息的数据直接处理
			window.__tradingViewUpdateBar(newData);
			}
		};

	} catch (error) {

	}
  }, [symbol, timeInterval, chartType, isDayMode, klineData, timezone]);

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
      } catch (e) {}
    }
    setTimeout(forceCreateChart, 100);
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
    } else if (!tvWidget && !initCompletedRef.current) {
      // 确保容器已经挂载后再创建图表
      if (chartContainerRef.current) {
        setTimeout(() => {
          forceCreateChart();
        }, 100);
      } else {
        // 如果容器还没有挂载，等待下一次渲染
        setTimeout(() => {
          if (chartContainerRef.current) {
            forceCreateChart();
          }
        }, 300);
      }
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

  // 专门监听symbol和timeInterval变化，在合约切换或时间间隔变化时重建图表
    const prevSymbolRef = useRef<string | undefined>(symbol);
    const prevTimeIntervalRef = useRef<string>(timeInterval);
    useEffect(() => {
  
      
      // 检查symbol或timeInterval是否发生了变化
      const symbolChanged = prevSymbolRef.current && prevSymbolRef.current !== symbol && symbol;
      const timeIntervalChanged = prevTimeIntervalRef.current !== timeInterval && prevTimeIntervalRef.current !== undefined;
      
      if (symbolChanged || timeIntervalChanged) {
        console.log("🔄 时间间隔或合约变化，准备重建图表:", {
          symbolChanged,
          timeIntervalChanged,
          旧时间间隔: prevTimeIntervalRef.current,
          新时间间隔: timeInterval
        });

        // 清空旧的WebSocket数据引用，避免使用不匹配的数据
        if (timeIntervalChanged) {
          wsDataRef.current = null;
        }

        // 清理现有图表
        if (tvWidget) {
          try {
            if (tvWidget.remove && typeof tvWidget.remove === 'function') {
              tvWidget.remove();
            }

          } catch (e) {

          }
        }

        // 立即重置状态和引用
        setTvWidget(null);
        initCompletedRef.current = false;
        // 清空数据引用，等待新的时间间隔数据
        wsDataRef.current = null;
        
        // 重置全局时间追踪器，避免时间倒序问题
        if (window.__tradingViewTimeTracker) {
          window.__tradingViewTimeTracker.lastBarTime = 0;
          console.log("🕐 重置时间追踪器，清空旧数据");
        }

        // 延迟创建新图表，确保状态更新和旧图表完全清理
        setTimeout(() => {

          // 确保强制创建新图表
          forceCreateChart();

        }, 300);
      }

      // 更新symbol和timeInterval引用

      prevSymbolRef.current = symbol;
      prevTimeIntervalRef.current = timeInterval;
    }, [symbol, timeInterval, tvWidget, forceCreateChart]);

  // 监听主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      recreateChart();
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, [tvWidget, forceCreateChart]);

  // 已在上面的初始化函数中处理了主题变化的逻辑

  // 单独处理WebSocket数据更新
  useEffect(() => {
      // 只有当klineData存在且不为空时才处理
      if (!klineData) {

        return;
      }

   

      // 更新数据引用 - 始终更新，确保最新数据可用
      wsDataRef.current = klineData;

      // 如果tvWidget不存在，说明图表还没创建，数据已经在wsDataRef中，创建时会使用
      if (!tvWidget) {

        return;
      }

      // 处理WebSocket数据更新 - 只有在图表存在时才处理实时更新
      if (window.__handleTradingViewUpdate) {

        // 直接传递父组件的WebSocket数据，让datafeed处理
        window.__handleTradingViewUpdate(klineData);
      } else {

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
      uniqueSymbol: string,
      originalSymbol?: string  // 原始symbol用于数据匹配
    ) => {
      const subscribers: any = {};
      let getBarsRetryCount = 0; // 添加重试计数器
      const maxRetries = 3; // 最大重试次数


      if (window.__tradingViewUpdateBar) {
        delete window.__tradingViewUpdateBar;
      }
      if (window.__handleTradingViewUpdate) {
        delete window.__handleTradingViewUpdate;
      }
      if (window.__tradingViewTimeTracker) {
        window.__tradingViewTimeTracker.lastBarTime = 0;

      }
      window.__tradingViewHandlersInitialized = false;

      // 安全的时间格式化函数，添加更严格的验证
      const formatTimeValue = (timeValue: any): number => {
        try {
          if (timeValue === undefined || timeValue === null) {
            console.warn("⚠️ 时间值为空，使用当前时间");
            return Date.now();
          }

          if (typeof timeValue === "number") {
            // 检查是否是有效数字
            if (!isFinite(timeValue) || isNaN(timeValue)) {
              console.warn("⚠️ 无效的数字时间戳:", timeValue);
              return Date.now();
            }

            // 处理秒级时间戳（小于10位数）和毫秒级时间戳
            const timestamp = timeValue < 10000000000 ? timeValue * 1000 : timeValue;

            // 验证时间戳是否在合理范围内
            const now = Date.now();
            const oneYearMs = 365 * 24 * 60 * 60 * 1000;
            const minValidTime = new Date('1970-01-01').getTime(); // 最小有效时间
            const maxValidTime = now + oneYearMs; // 最大有效时间

            if (timestamp < minValidTime || timestamp > maxValidTime) {
              console.warn("⚠️ 时间戳超出有效范围:", {
                原始值: timeValue,
                转换后: timestamp,
                最小有效时间: minValidTime,
                最大有效时间: maxValidTime
              });
              return now;
            }

            // 验证转换后的时间戳是否能创建有效的Date对象
            const testDate = new Date(timestamp);
            if (isNaN(testDate.getTime())) {
              console.warn("⚠️ 时间戳无法创建有效Date对象:", timestamp);
              return now;
            }

            return timestamp;
          }

          if (typeof timeValue === "string") {
            const parsedTime = new Date(timeValue).getTime();
            if (isNaN(parsedTime)) {
              console.warn("⚠️ 无法解析时间字符串:", timeValue);
              return Date.now();
            }

            return parsedTime;
          }

          console.warn("⚠️ 未知的时间值类型:", typeof timeValue, timeValue);
          return Date.now();
        } catch (error) {
          console.error("💥 时间格式化错误:", error, "原始值:", timeValue);
          return Date.now();
        }
      };

      // 安全的日期转换函数，避免toISOString错误
      const safeTimeToISO = (timestamp: number): string => {
        try {
          if (!isFinite(timestamp) || isNaN(timestamp)) {
            return "Invalid timestamp";
          }
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) {
            return "Invalid date";
          }
          return date.toISOString();
        } catch (error) {
          return `Error: ${timestamp}`;
        }
      };

      // 预处理初始数据
      const bars: any[] = [];

      // 处理初始K线数据 - 预处理已转换的数据格式
      if (Array.isArray(initialData) && initialData.length > 0) {
        console.log("📊 预处理初始数据:", initialData.length, "条");
        console.log("📊 初始数据示例:", initialData[0]);

        // 检查是否是已转换的格式 {time, open, high, low, close, volume}
        const firstItem = initialData[0];
        if (firstItem && typeof firstItem === 'object' && 'time' in firstItem) {
          console.log("📊 检测到已转换格式的初始数据，直接使用");
        } else {
          console.log("📊 检测到原始格式的初始数据");
        }
      }

      // 统一的K线数据转换函数
      const convertKlineToBar = (kline: any): any => {
        try {
          if (!kline) {
            console.warn("⚠️ K线数据为空");
            return null;
          }

          // 处理对象格式的K线数据
          if (typeof kline === 'object' && !Array.isArray(kline)) {
            let time: number;
            let open: number;
            let high: number;
            let low: number;
            let close: number;
            let volume: number;

            // 检查是否是已转换的格式 {time, open, high, low, close, volume}
            if (kline.time !== undefined && kline.time !== null) {
              time = Number(kline.time);
              open = Number(kline.open || 0);
              high = Number(kline.high || 0);
              low = Number(kline.low || 0);
              close = Number(kline.close || 0);
              volume = Number(kline.volume || 0);
            }
            // 检查是否是从API来的格式 {ds, open, high, low, close, vol}
            else if (kline.ds !== undefined && kline.ds !== null) {
              time = new Date(kline.ds).getTime();
              open = Number(kline.open || 0);
              high = Number(kline.high || 0);
              low = Number(kline.low || 0);
              close = Number(kline.close || 0);
              volume = Number(kline.vol || 0);
            }
            // 检查是否是原始WebSocket格式 {id, open, high, low, close, vol}
            else if (kline.id !== undefined && kline.id !== null) {
              time = formatTimeValue(kline.id * 1000);
              open = Number(kline.open || 0);
              high = Number(kline.high || 0);
              low = Number(kline.low || 0);
              close = Number(kline.close || 0);
              volume = Number(kline.vol || 0);
            }
            else {
              console.warn("⚠️ 对象格式K线数据缺少时间字段:", kline);
              return null;
            }

            // 验证数值是否有效
            if (!isFinite(time) || !isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close) || !isFinite(volume)) {
              console.warn("⚠️ K线数据包含无效数值:", { time, open, high, low, close, volume });
              return null;
            }

            return { time, open, high, low, close, volume };
          }

          // 处理旧的数组格式（向后兼容）
          if (Array.isArray(kline) && kline.length >= 7) {
            const time = formatTimeValue(kline[0]);
            const open = Number(kline[2] || 0);
            const high = Number(kline[1] || 0);
            const low = Number(kline[3] || 0);
            const close = Number(kline[4] || 0);
            const volume = Number(kline[6] || 0);

            if (!isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close) || !isFinite(volume)) {
              console.warn("⚠️ 数组格式K线数据包含无效数值:", { open, high, low, close, volume });
              return null;
            }

            return { time, open, high, low, close, volume };
          }

          console.warn("⚠️ 无法识别的K线数据格式:", kline);
          return null;
        } catch (error) {
          console.error("💥 K线数据转换错误:", error, "原始数据:", kline);
          return null;
        }
      };

      // 跟踪最后一个K线的时间，防止时间倒序 - 使用全局变量以便在合约切换时重置
      const timeTracker = { lastBarTime: 0 };
      
      // 将时间追踪器暴露到全局，以便在合约切换时能够重置
      window.__tradingViewTimeTracker = timeTracker;

      // 更新实时数据处理函数 - 支持新的WebSocket数据格式
      window.__tradingViewUpdateBar = (data: any) => {
        if (!data) return;

        try {

          // 检查数据是否属于当前合约，避免处理错误合约的数据
          // 使用originalSymbol进行匹配，而不是uniqueSymbol
          if (data.channel && originalSymbol) {
            const channelSymbol = data.channel.toLowerCase();
            // 从原始symbol中提取匹配用的标识，支持多种格式转换
            // 例如: "BTC-USDT" → "btcusdt", "BTCUSDT" → "btcusdt"
            const matchSymbol = originalSymbol
              .replace(/-/g, "")  // 移除横杠
              .replace(/_/g, "")  // 移除下划线
              .toLowerCase();     // 转为小写
            
            if (!channelSymbol.includes(matchSymbol)) {
              return;
            }
          }

          // 处理新的WebSocket数据格式
          // 格式1: 历史数据 - { event_rep: "rep", data: [...], tick: null }
          // 格式2: 实时数据 - { event_rep: "", data: null, tick: {...} }

          if (data.event_rep === "rep" && Array.isArray(data.data) && data.data.length > 0) {
            // 处理历史数据格式


            data.data.forEach((klineItem: any, index: number) => {
              const bar = convertKlineToBar(klineItem);
              if (bar) {


                // 检查时间顺序，防止时间倒序
                if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {

                  return;
                }

                // 检查是否是重复的时间戳
                if (timeTracker.lastBarTime > 0 && bar.time === timeTracker.lastBarTime) {

                  return;
                }

                timeTracker.lastBarTime = bar.time;

                // 将每个数据点传给所有订阅者
                Object.keys(subscribers).forEach((key) => {
                  const callback = subscribers[key];
                  if (typeof callback === "function") {
                    setTimeout(() => callback(bar), 0);
                  }
                });
              } else {

              }
            });
          } else if (data.tick && typeof data.tick === 'object') {
            // 处理实时数据格式
            
            const bar = convertKlineToBar(data.tick);
            if (bar) {


              // 检查时间顺序
              if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
     
                return;
              }

              // 对于实时数据，允许相同时间戳的更新（同一K线的更新）
              timeTracker.lastBarTime = bar.time;


              Object.keys(subscribers).forEach((key) => {
                const callback = subscribers[key];

                if (typeof callback === "function") {
                  setTimeout(() => {

                    callback(bar);
                  }, 0);
                }
              });
            } else {

            }
          } else if (
            // 兼容旧格式: data.type === "kline"
            data.type === "kline" &&
            Array.isArray(data.data) &&
            data.data.length > 0
          ) {


            data.data.forEach((klineItem: any, index: number) => {
              const bar = convertKlineToBar(klineItem);
              if (bar) {


                if (timeTracker.lastBarTime > 0 && bar.time < timeTracker.lastBarTime) {
                  return;
                }

                if (timeTracker.lastBarTime > 0 && bar.time === timeTracker.lastBarTime) {
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
            });
          } else if (Array.isArray(data)) {
            // 处理直接数组格式（向后兼容）


            data.forEach((item: any) => {
              const bar = convertKlineToBar(item);
              if (bar) {
                if (timeTracker.lastBarTime > 0 && bar.time <= timeTracker.lastBarTime) {
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
            });
          } else {
            // 处理单个数据对象格式（向后兼容）


            const bar = convertKlineToBar(data);
            if (bar) {
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

          // 处理初始K线数据 - 支持WebSocket数据格式
          if (initialData && initialData.event_rep === "rep" && Array.isArray(initialData.data) && initialData.data.length > 0) {


            const wsKlineData = initialData.data;

            // 处理WebSocket数据格式的初始数据
            const sortedData = [...wsKlineData].sort((a, b) => {
              let timeA: number;
              let timeB: number;

              // 判断数据格式并提取时间
              if (a.time !== undefined) {
                // 已转换格式 {time, open, high, low, close, volume}
                timeA = Number(a.time);
              } else if (a.ds !== undefined) {
                // API格式 {ds, open, high, low, close, vol}
                timeA = new Date(a.ds).getTime();
              } else if (a.id !== undefined) {
                // 原始WebSocket格式 {id, open, high, low, close, vol}
                timeA = a.id * 1000;
              } else if (Array.isArray(a)) {
                // 旧的数组格式 [timestamp, ...]
                timeA = formatTimeValue(a[0]);
              } else {
                timeA = 0;
              }

              if (b.time !== undefined) {
                timeB = Number(b.time);
              } else if (b.ds !== undefined) {
                timeB = new Date(b.ds).getTime();
              } else if (b.id !== undefined) {
                timeB = b.id * 1000;
              } else if (Array.isArray(b)) {
                timeB = formatTimeValue(b[0]);
              } else {
                timeB = 0;
              }

              return timeA - timeB;
            });

            console.log("📊 排序后的初始数据:", sortedData.length, "条");

            // 重置时间追踪器
            timeTracker.lastBarTime = 0;

            // 去重处理：移除相同时间戳的重复数据
            const deduplicatedData: any[] = [];
            const timeSet = new Set<number>();

            sortedData.forEach((kline: any) => {
              let time: number;

              // 根据数据格式提取时间
              if (kline.time !== undefined) {
                // 已转换格式
                time = Number(kline.time);
              } else if (kline.ds !== undefined) {
                // API格式
                time = new Date(kline.ds).getTime();
              } else if (kline.id !== undefined) {
                // 原始WebSocket格式
                time = kline.id * 1000;
              } else if (Array.isArray(kline)) {
                // 旧的数组格式
                time = formatTimeValue(kline[0]);
              } else {
                console.warn("⚠️ 无法提取时间戳的数据格式:", kline);
                return;
              }

              if (!timeSet.has(time)) {
                timeSet.add(time);
                deduplicatedData.push(kline);
              } else {
                console.warn("⚠️ 发现重复时间戳，跳过:", {
                  原始数据: kline,
                  格式化时间: safeTimeToISO(time)
                });
              }
            });

            console.log("📊 去重后的初始数据:", deduplicatedData.length, "条");

            deduplicatedData.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                console.log(`📈 处理初始数据 ${index + 1}:`, bar);

                // 更新时间追踪器，确保历史数据的最后时间被记录
                timeTracker.lastBarTime = Math.max(timeTracker.lastBarTime, bar.time);

                // 将处理后的数据传递给TradingView
                onRealtimeCallback(bar);
              }
            });

            console.log("✅ WebSocket初始数据处理完成，时间追踪器:", safeTimeToISO(timeTracker.lastBarTime));
          } else if (initialData && Array.isArray(initialData) && initialData.length > 0) {
            // 处理传统数组格式的初始数据
            console.log("📊 处理传统数组格式的初始数据:", initialData.length, "条");

            const sortedData = [...initialData].sort((a, b) => {
              let timeA: number;
              let timeB: number;

              // 判断数据格式并提取时间
              if (a.time !== undefined) {
                timeA = Number(a.time);
              } else if (a.ds !== undefined) {
                timeA = new Date(a.ds).getTime();
              } else if (a.id !== undefined) {
                timeA = a.id * 1000;
              } else if (Array.isArray(a)) {
                timeA = formatTimeValue(a[0]);
              } else {
                timeA = 0;
              }

              if (b.time !== undefined) {
                timeB = Number(b.time);
              } else if (b.ds !== undefined) {
                timeB = new Date(b.ds).getTime();
              } else if (b.id !== undefined) {
                timeB = b.id * 1000;
              } else if (Array.isArray(b)) {
                timeB = formatTimeValue(b[0]);
              } else {
                timeB = 0;
              }

              return timeA - timeB;
            });

            console.log("📊 排序后的传统数组数据:", sortedData.length, "条");

            // 重置时间追踪器
            timeTracker.lastBarTime = 0;

            // 去重处理
            const deduplicatedData: any[] = [];
            const timeSet = new Set<number>();

            sortedData.forEach((kline: any) => {
              let time: number;

              if (kline.time !== undefined) {
                time = Number(kline.time);
              } else if (kline.ds !== undefined) {
                time = new Date(kline.ds).getTime();
              } else if (kline.id !== undefined) {
                time = kline.id * 1000;
              } else if (Array.isArray(kline)) {
                time = formatTimeValue(kline[0]);
              } else {
                console.warn("⚠️ 无法提取时间戳的数据格式:", kline);
                return;
              }

              if (!timeSet.has(time)) {
                timeSet.add(time);
                deduplicatedData.push(kline);
              } else {
                console.warn("⚠️ 发现重复时间戳，跳过:", {
                  原始数据: kline,
                  格式化时间: safeTimeToISO(time)
                });
              }
            });

            console.log("📊 去重后的传统数组数据:", deduplicatedData.length, "条");

            deduplicatedData.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                console.log(`📈 处理传统数组数据 ${index + 1}:`, bar);

                timeTracker.lastBarTime = Math.max(timeTracker.lastBarTime, bar.time);
                onRealtimeCallback(bar);
              }
            });

            console.log("✅ 传统数组初始数据处理完成，时间追踪器:", safeTimeToISO(timeTracker.lastBarTime));
          } else if (
            // 兼容旧格式: initialData.type === "kline"
            initialData &&
            initialData.type === "kline" &&
            initialData.data &&
            initialData.data.length > 0
          ) {
            console.log("📊 处理旧格式type=kline初始数据:", initialData.data.length, "条");

            const sortedData = [...initialData.data].sort((a, b) => {
              let timeA: number;
              let timeB: number;

              // 判断数据格式并提取时间
              if (a.time !== undefined) {
                timeA = Number(a.time);
              } else if (a.ds !== undefined) {
                timeA = new Date(a.ds).getTime();
              } else if (a.id !== undefined) {
                timeA = a.id * 1000;
              } else if (Array.isArray(a)) {
                timeA = formatTimeValue(a[0]);
              } else {
                timeA = 0;
              }

              if (b.time !== undefined) {
                timeB = Number(b.time);
              } else if (b.ds !== undefined) {
                timeB = new Date(b.ds).getTime();
              } else if (b.id !== undefined) {
                timeB = b.id * 1000;
              } else if (Array.isArray(b)) {
                timeB = formatTimeValue(b[0]);
              } else {
                timeB = 0;
              }

              return timeA - timeB;
            });

            timeTracker.lastBarTime = 0;

            const deduplicatedData: any[] = [];
            const timeSet = new Set<number>();

            sortedData.forEach((kline: any) => {
              let time: number;

              // 根据数据格式提取时间
              if (kline.time !== undefined) {
                time = Number(kline.time);
              } else if (kline.ds !== undefined) {
                time = new Date(kline.ds).getTime();
              } else if (kline.id !== undefined) {
                time = kline.id * 1000;
              } else if (Array.isArray(kline)) {
                time = formatTimeValue(kline[0]);
              } else {
                console.warn("⚠️ 无法提取时间戳的数据格式:", kline);
                return;
              }

              if (!timeSet.has(time)) {
                timeSet.add(time);
                deduplicatedData.push(kline);
              }
            });

            deduplicatedData.forEach((kline: any) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                timeTracker.lastBarTime = Math.max(timeTracker.lastBarTime, bar.time);
                onRealtimeCallback(bar);
              }
            });
          } else {

            // 没有初始数据时，不需要处理，等待实时数据通过WebSocket更新
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
          // 从唯一symbol中提取原始symbol信息
          const symbolParts = symbolName.split("_");
          const baseSymbol = symbolParts[0] || "BTC";
          const quoteSymbol = symbolParts[1] || "USDT";
          
          // 使用原始symbol名称作为描述
          const originalSymbol = symbol || `${baseSymbol}-${quoteSymbol}`;
          console.log("🏷️ 解析symbol:", { symbolName, originalSymbol, baseSymbol, quoteSymbol });

          setTimeout(
            () =>
              onSymbolResolvedCallback({
                name: symbolName, // 使用唯一的symbol name
                description: `${baseSymbol}/${quoteSymbol}`,
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


          // 处理WebSocket历史数据格式
          if (initialData && initialData.event_rep === "rep" && Array.isArray(initialData.data) && initialData.data.length > 0) {
            getBarsRetryCount = 0; // 有数据时重置重试计数器


            const bars: any[] = [];
            initialData.data.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                // 检查时间范围
                const barTime = bar.time / 1000; // 转换为秒
                if (barTime >= periodParams.from && barTime <= periodParams.to) {
                  bars.push(bar);
                }

                // 调试前几条数据
                if (index < 3) {
             
                }
              } else {

              }
            });

            // 按时间排序
            bars.sort((a, b) => a.time - b.time);



            // 如果有数据则正常返回，如果没有数据则标记为noData避免重复请求
            onHistoryCallback(bars, { noData: bars.length === 0 });
          }

          // 处理传统数组格式
          else if (initialData && Array.isArray(initialData) && initialData.length > 0) {
            getBarsRetryCount = 0; // 有数据时重置重试计数器


            const bars: any[] = [];
            initialData.forEach((kline: any, index: number) => {
              const bar = convertKlineToBar(kline);
              if (bar) {
                // 检查时间范围
                const barTime = bar.time / 1000; // 转换为秒
                if (barTime >= periodParams.from && barTime <= periodParams.to) {
                  bars.push(bar);
                }

                // 调试前几条数据
                if (index < 3) {
                
                }
              } else {

              }
            });

            // 按时间排序
            bars.sort((a, b) => a.time - b.time);



            // 如果有数据则正常返回，如果没有数据则标记为noData避免重复请求
            onHistoryCallback(bars, { noData: bars.length === 0 });
          } else {

            // 直接返回空数据，但不标记为noData，让图表正常显示等待状态
            onHistoryCallback([], { noData: false });
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
	__tradingViewTimeTracker: { lastBarTime: number };
  }
}

export default forwardRef(Tradingview);
