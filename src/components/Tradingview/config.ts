import { ChartingLibraryWidgetOptions, ResolutionString, LanguageCode, Timezone } from '../../../public/charting_library/charting_library';

const configByMode = {
  'phone': {
    disabled_features: [
      "header_widget",
      "left_toolbar",
      "timeframes_toolbar",
      "symbol_info",
      "legend_widget",
      "header_symbol_search",
      "header_compare",
      "display_market_status",
      "volume_force_overlay",
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
      "disable_resolution_rebuild",
      'study_templates'
    ],
  },
  'tablet': {
    disabled_features: [
      "header_widget",
      "left_toolbar",
      "timeframes_toolbar",
      "symbol_info",
      "header_symbol_search",
      "header_compare",
      "display_market_status",
      "volume_force_overlay",
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
      "legend_widget",
      'study_templates'
    ],
  },
  'phone-fullscreen': {
    disabled_features: [
      "left_toolbar",
      "timeframes_toolbar",
      "symbol_info",
      "header_symbol_search",
      "header_compare",
      "display_market_status",
      "volume_force_overlay",
      "scales_date_format",
      "go_to_date",
      "context_menus",
      "header_indicators",
      "header_fullscreen_button",
      "use_localstorage_for_settings",
      "header_saveload",
    ],
    enabled_features: [
      "hide_left_toolbar_by_default",
      "adaptive_logo",
      "disable_resolution_rebuild",
      'study_templates',
      "legend_widget",
    ],
  },
  'tablet-fullscreen': {
    disabled_features: [
      "use_localstorage_for_settings", 
      "timeframes_toolbar",
      "symbol_search",
      "symbol_info",
      "header_symbol_search",
      "header_compare",
      "compare_symbol",
      "display_market_status",
      "symbol_change",
      "header_fullscreen_button",
      "header_saveload",
      "symbol_search_hot_key"
    ],
    enabled_features: [
      "study_templates"
    ]
  }
}

const getChartConfig = (isDayMode: boolean, viewMode: string) => {
  const isTabletFullscreen = viewMode === 'tablet-fullscreen';
  const baseConfig = {
    height: 300,
    overrides: {
      // 背景色
      "paneProperties.background": isDayMode ? "#ffffff" : "#0C0D0C",  // 修复颜色代码
      "paneProperties.backgroundType": "solid",
      "toolbarBg": isDayMode ? "#ffffff" : "#0C0D0C",  // 修复颜色代码
      // 线条
      "paneProperties.vertGridProperties.color": isTabletFullscreen ? undefined : "transparent",
      "paneProperties.horzGridProperties.color": isTabletFullscreen ? undefined : "transparent",
      // 坐标轴字体
      "scalesProperties.fontSize": isTabletFullscreen ? 14 : 12,
      "scalesProperties.textColor": isDayMode ? "#676867" : "#A4A5AC",
      // 指标标题样式
      "studies.legendTextColor": isDayMode ? "#676867" : "#A4A5AC",
      "studies.legendFontSize": isTabletFullscreen ? 14 : 12,
      // 添加K线样式
      "mainSeriesProperties.candleStyle.upColor": "#00C087",
      "mainSeriesProperties.candleStyle.downColor": "#FF3B30",
      "mainSeriesProperties.candleStyle.borderUpColor": "#00C087",
      "mainSeriesProperties.candleStyle.borderDownColor": "#FF3B30",
      "mainSeriesProperties.candleStyle.wickUpColor": "#00C087",
      "mainSeriesProperties.candleStyle.wickDownColor": "#FF3B30",
    },
  }
  return {
    ...baseConfig,
    ...configByMode[viewMode as keyof typeof configByMode]
  }
}

export default getChartConfig;