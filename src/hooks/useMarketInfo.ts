import { useState, useEffect } from 'react';
import appStore from '@/store';

/**
 * 使用市场信息的Hook
 * @returns 市场信息数据和相关方法
 */
export const useMarketInfo = () => {
  const [marketInfo, setMarketInfo] = useState(appStore.getMarketInfo());
  const [isLoading, setIsLoading] = useState(appStore.isLoadingMarketInfo);

  // 获取市场信息
  const loadMarketInfo = async (contractId: number) => {
    setIsLoading(true);
    try {
      const data = await appStore.loadMarketInfo(contractId);
      setMarketInfo(data || appStore.getMarketInfo());
      return data;
    } finally {
      setIsLoading(appStore.isLoadingMarketInfo);
    }
  };

  // 监听store中市场信息的变化
  useEffect(() => {
    const interval = setInterval(() => {
      const storeMarketInfo = appStore.getMarketInfo();
      const storeIsLoading = appStore.isLoadingMarketInfo;
      
      // 只有当数据真正发生变化时才更新
      if (JSON.stringify(storeMarketInfo) !== JSON.stringify(marketInfo)) {
        setMarketInfo(storeMarketInfo);
      }
      if (storeIsLoading !== isLoading) {
        setIsLoading(storeIsLoading);
      }
    }, 100); // 每100ms检查一次

    return () => clearInterval(interval);
  }, [marketInfo, isLoading]);

  return {
    marketInfo,
    isLoading,
    loadMarketInfo,
    // 便于其他组件直接获取特定数据
    markPrice: marketInfo?.markPrice,
    indexPrice: marketInfo?.indexPrice,
    fundingRate: marketInfo?.fundingRate,
    volume24h: marketInfo?.volume24h,
  };
};