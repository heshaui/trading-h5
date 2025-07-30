'use client';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useLanguage, useTheme } from '@/hooks';
import { NoData } from '../noData';

interface DepthChartProps { 
  data: {
    bids: [number, number][];
    asks: [number, number][];
    spot_log_last_seq?: number;
  } | null;  // 修改为对象类型
}

const DepthChart = ({ data }: DepthChartProps) => {
  const { t } = useLanguage(['common']);
  const { isLight } = useTheme();
  
  // 检查数据是否有效
  if (!data || !data.bids || !data.asks) {
    return (
      <div className="w-full h-[312px] flex justify-center items-center">
        <NoData />
      </div>
    );
  }
  
  // 处理深度数据，计算累积数量
  const processDepthData = (data: [number, number][], isBid: boolean) => {
    // 先按价格排序：买单从高到低，卖单从低到高
    const sortedData = [...data].sort((a, b) => isBid ? b[0] - a[0] : a[0] - b[0]);
    
    let cumulativeQuantity = 0;
    return sortedData.map(([price, quantity]) => {
      cumulativeQuantity += Math.abs(quantity);
      return [price, cumulativeQuantity];
    });
  };

  const processedBids = processDepthData(data.bids, true);
  const processedAsks = processDepthData(data.asks, false);
  
  // 计算基准价格和x轴显示范围
  const calculatePriceRange = () => {
    if (data.bids.length === 0 && data.asks.length === 0) {
      return { midPrice: 50000, minPrice: 49000, maxPrice: 51000 };
    }
    
    // 获取最高买价和最低卖价
    const highestBid = data.bids.length > 0 ? Math.max(...data.bids.map(bid => bid[0])) : 0;
    const lowestAsk = data.asks.length > 0 ? Math.min(...data.asks.map(ask => ask[0])) : 0;
    
    let midPrice;
    if (highestBid === 0) {
      midPrice = lowestAsk;
    } else if (lowestAsk === 0) {
      midPrice = highestBid;
    } else {
      midPrice = (highestBid + lowestAsk) / 2;
    }
    
    // 计算所有价格的范围
    const allPrices = [...data.bids.map(bid => bid[0]), ...data.asks.map(ask => ask[0])];
    const minDataPrice = Math.min(...allPrices);
    const maxDataPrice = Math.max(...allPrices);
    
    // 添加一些边距使图表更美观
    const priceSpread = maxDataPrice - minDataPrice;
    const margin = Math.max(priceSpread * 0.1, 1); // 10%的边距或至少1
    
    return {
      midPrice,
      minPrice: minDataPrice - margin,
      maxPrice: maxDataPrice + margin
    };
  };
  
  const { midPrice, minPrice, maxPrice } = calculatePriceRange();

  // ECharts 配置项
  const option = {
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        if (params && params.length > 0) {
          const param = params[0];
          const price = param.data[0];
          const quantity = param.data[1];
          const orderType = param.seriesName;
          return `${orderType}<br/>价格: ${price.toFixed(2)}<br/>累积数量: ${quantity.toFixed(4)}`;
        }
        return '';
      }
    },
    grid: {
      left: -30,
      right: -30,
      bottom: '3%',
      top: '3%',
      containLabel: true,
      show: false
    },
    xAxis: {
      type: 'value',
      min: minPrice,
      max: maxPrice,
      axisLine: { show: false },    // 隐藏x轴轴线
      axisTick: { show: false },    // 隐藏x轴刻度线
      splitLine: { show: false },   // 隐藏x轴分割线（网格线）
      axisLabel: {
        show: true,
        formatter: (value: number) => {
          return value==0 ? '' : value.toFixed(2);
          // // 只显示中间三个点（中点和左右各一个）
          // const mid = (minPrice + maxPrice) / 2;
          // const step = (maxPrice - minPrice) / 4;  // 假设分成4段取3个点

          // if (
          //   Math.abs(value - mid) < 0.01 ||             // 中间点
          //   Math.abs(value - (mid - step)) < 0.01 ||   // 左边一点
          //   Math.abs(value - (mid + step)) < 0.01      // 右边一点
          // ) {
          //   return value.toFixed(2);
          // }
          // return '';  // 不显示其它标签
        },
        color: isLight ? '#0d0d0d' : '#fff',
        fontSize: '12px'
      },
      axisPointer: {
        snap: true
      }
    },
    yAxis: {
      type: 'value',
      position: 'right',
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: true,
        formatter: (val: number) => {
          return val == 0 ? '' :
          val >= 1000000
            ? `${(val / 1000000).toFixed(2)}M`
            : val >= 1000
            ? `${(val / 1000).toFixed(2)}K`
            : val.toFixed(1)
        },
        color: isLight ? '#0d0d0d' : '#fff',
        fontSize: '12px',
        inside: true,
        margin: 46,
      }
    },
    series: [
      {
        name: t('depthChart.buyOrders') || '买单',
        type: 'line',
        data: processedBids,
        step: 'after', // 改为 after 以正确显示深度图的阶梯效果
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 199, 136, 0.3)' },
            { offset: 1, color: 'rgba(0, 199, 136, 0.05)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: 'rgba(0, 199, 136, 0.8)'
        },
        smooth: false,
        symbol: 'none',
        // markLine: {
        //   symbol: 'none',
        //   lineStyle: {
        //     color: 'red',
        //     width: 2,
        //     type: 'solid'
        //   },
        //   data: [{ xAxis: (minPrice + maxPrice) / 2 }]
        // }
      },
      {
        name: t('depthChart.sellOrders') || '卖单',
        type: 'line',
        data: processedAsks,
        step: 'after', // 改为 after 以正确显示深度图的阶梯效果
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
            { offset: 1, color: 'rgba(255, 77, 79, 0.05)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: 'rgba(255, 77, 79, 0.8)'
        },
        smooth: false,
        symbol: 'none'
      },
     
    ]
  };

  return (
    <div className="w-full h-full py-4">
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
      />
    </div>
  );
};

export default DepthChart;