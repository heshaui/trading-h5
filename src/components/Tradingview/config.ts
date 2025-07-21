import { ChartingLibraryWidgetOptions, ResolutionString, LanguageCode, Timezone } from '../../../public/charting_library/charting_library';

// 基础配置
const baseConfig = (isDayMode: boolean, lang: LanguageCode, timezone: Timezone): Partial<ChartingLibraryWidgetOptions> => ({
  library_path: "/charting_library/",
  charts_storage_url: "http://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  autosize: true,
  debug: false,
  locale: lang,
  timezone,
  theme: isDayMode ? "light" : "dark",
  custom_css_url: "/tradingview-custom.css",
  studies_overrides: {
    // 成交量指标样式
    "volume.volume.color.0": isDayMode ? "rgba(255, 59, 48, 0.5)" : "rgba(255, 59, 48, 0.5)",  // 下跌成交量颜色
    "volume.volume.color.1": isDayMode ? "rgba(0, 192, 135, 0.5)" : "rgba(0, 192, 135, 0.5)",  // 上涨成交量颜色
    "volume.volume.transparency": 50,  // 透明度
    "volume.volume ma.color": isDayMode ? "#9B7DFF" : "#9B7DFF",  // MA线颜色
    "volume.volume ma.transparency": 30,  // MA线透明度
    "volume.volume ma.linewidth": 1,  // MA线宽度
    "volume.title.color": isDayMode ? "#787B86" : "#787B86",  // 标题颜色
    "volume.title.font": "10px 'Trebuchet MS', Roboto, Ubuntu, sans-serif",  // 标题字体
    // MACD指标样式
    "MACD.histogram.color.0": isDayMode ? "rgba(255, 59, 48, 0.5)" : "rgba(255, 59, 48, 0.5)",
    "MACD.histogram.color.1": isDayMode ? "rgba(0, 192, 135, 0.5)" : "rgba(0, 192, 135, 0.5)",
    "MACD.histogram.transparency": 50,
    "MACD.signal.color": isDayMode ? "#FF9500" : "#FF9500",
    "MACD.signal.transparency": 30,
    "MACD.signal.linewidth": 1,
    "MACD.macd.color": isDayMode ? "#9B7DFF" : "#9B7DFF",
    "MACD.macd.transparency": 30,
    "MACD.macd.linewidth": 1,
    "MACD.title.color": isDayMode ? "#787B86" : "#787B86",
    "MACD.title.font": "10px 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
  }
});

// 移动端配置
export const getMobileConfig = (
  isDayMode: boolean,
  lang: LanguageCode,
  timezone: Timezone
): Partial<ChartingLibraryWidgetOptions> => ({
  ...baseConfig(isDayMode, lang, timezone),
  disabled_features: [
    "header_widget",
    "left_toolbar",
    "timeframes_toolbar",
    "symbol_info",
    "header_symbol_search",
    "header_compare",
    "display_market_status",
    "volume_force_overlay",
    "legend_widget",
    "scales_date_format",
    "go_to_date",
    "context_menus",
    "header_chart_type",
    "header_indicators",
    "header_settings",
    "header_fullscreen_button",
    "header_screenshot",
    "use_localstorage_for_settings",
  ],
  enabled_features: [
    "hide_left_toolbar_by_default",
    "adaptive_logo",
    "disable_resolution_rebuild",
  ],
  height: 300,
  overrides: {
    "paneProperties.background": isDayMode ? "#ffffff" : "#000000",
    "paneProperties.backgroundType": "solid",
    "paneProperties.vertGridProperties.color": "transparent",
    "paneProperties.horzGridProperties.color": "transparent",
    "scalesProperties.fontSize": 10,
    "scalesProperties.textColor": isDayMode ? "#999999" : "#666666",
    "mainSeriesProperties.candleStyle.upColor": "#00C087",
    "mainSeriesProperties.candleStyle.downColor": "#FF3B30",
    "mainSeriesProperties.candleStyle.borderUpColor": "#00C087",
    "mainSeriesProperties.candleStyle.borderDownColor": "#FF3B30",
    "mainSeriesProperties.candleStyle.wickUpColor": "#00C087",
    "mainSeriesProperties.candleStyle.wickDownColor": "#FF3B30",
    // 图例样式
    "legendProperties.showStudyArguments": true,  // 显示指标参数
    "legendProperties.showStudyTitles": true,     // 显示指标标题
    "legendProperties.showStudyValues": true,     // 显示指标值
    "legendProperties.showSeriesTitle": true,     // 显示系列标题
    "legendProperties.showSeriesOHLC": true,      // 显示OHLC值
    "legendProperties.showLegend": true,          // 显示图例
    "legendProperties.showBarChange": true,       // 显示价格变化
    // 指标标题样式
    "studies.legendTextColor": isDayMode ? "#787B86" : "#787B86",
    "studies.legendFontSize": 10,
  }
});

// 桌面端配置
export const getDesktopConfig = (
  isDayMode: boolean,
  lang: LanguageCode,
  timezone: Timezone
): Partial<ChartingLibraryWidgetOptions> => ({
  ...baseConfig(isDayMode, lang, timezone),
  disabled_features: [
    "use_localstorage_for_settings",
    "symbol_info",
    "header_symbol_search",
    "header_compare",
    "display_market_status",
  ],
  enabled_features: [
    "left_toolbar",
    "header_widget",
    "timeframes_toolbar",
    "legend_widget",
    "adaptive_logo",
  ],
  height: 300,
  overrides: {
    "paneProperties.background": isDayMode ? "#ffffff" : "#000000",
    "paneProperties.backgroundType": "solid",
    "scalesProperties.fontSize": 12,
    "scalesProperties.textColor": isDayMode ? "#999999" : "#666666",
    "mainSeriesProperties.candleStyle.upColor": "#00C087",
    "mainSeriesProperties.candleStyle.downColor": "#FF3B30",
    "mainSeriesProperties.candleStyle.borderUpColor": "#00C087",
    "mainSeriesProperties.candleStyle.borderDownColor": "#FF3B30",
    "mainSeriesProperties.candleStyle.wickUpColor": "#00C087",
    "mainSeriesProperties.candleStyle.wickDownColor": "#FF3B30",
    // 图例样式
    "legendProperties.showStudyArguments": true,  // 显示指标参数
    "legendProperties.showStudyTitles": true,     // 显示指标标题
    "legendProperties.showStudyValues": true,     // 显示指标值
    "legendProperties.showSeriesTitle": true,     // 显示系列标题
    "legendProperties.showSeriesOHLC": true,      // 显示OHLC值
    "legendProperties.showLegend": true,          // 显示图例
    "legendProperties.showBarChange": true,       // 显示价格变化
    // 指标标题样式
    "studies.legendTextColor": isDayMode ? "#787B86" : "#787B86",
    "studies.legendFontSize": 12,
  }
}); 