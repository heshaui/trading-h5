import { ChartingLibraryWidgetOptions, ResolutionString, LanguageCode, Timezone } from '../../../public/charting_library/charting_library';

const configByMode = {
  'phone': {
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
      'study_templates',
      "legend_widget",
    ],
  },
  'tablet-fullscreen': {
    disabled_features: [
      "header_widget",
      "use_localstorage_for_settings", 
      "timeframes_toolbar",
      "symbol_search",
      "symbol_info",
      "header_symbol_search",
      "header_compare",
      "compare_symbol",
      "display_market_status",
      "symbol_change",
    ],
    enabled_features: [
      "study_templates"
    ]
  }
}

const getChartConfig = (isDayMode: boolean, viewMode: string) => {
  const isTabletFullscreen = viewMode === 'table-fullscreen';
  const baseConfig = {
    height: 300,
    overrides: {
      // 背景色
      "paneProperties.background": isDayMode ? "#ffffff" : "#0COD0C",
      "paneProperties.backgroundType": "solid",
      "toolbarBg": isDayMode ? "#ffffff" : "#0COD0C",
      // 线条
      "paneProperties.vertGridProperties.color": isTabletFullscreen ? undefined : "transparent",
      "paneProperties.horzGridProperties.color": isTabletFullscreen ? undefined : "transparent",
      // 坐标轴字体
      "scalesProperties.fontSize": isTabletFullscreen ? 12 : 10,
      "scalesProperties.textColor": isDayMode ? "#676867" : "#A4A5AC",
      // 指标标题样式
      "studies.legendTextColor": isDayMode ? "#676867" : "#A4A5AC",
      "studies.legendFontSize": isTabletFullscreen ? 12 : 10,
    },
  }
  return {
    ...baseConfig,
    ...configByMode[viewMode as keyof typeof configByMode]
  }
}

export default getChartConfig;