import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import appStore from '@/store';
import { UserConfigType, UseUserConfigReturn } from '@/type/contract/userConfig';

/**
 * 用户合约配置状态管理Hook
 * @returns {Object} 包含用户合约配置数据和相关方法的对象
 */
export const useUserConfig = (): UseUserConfigReturn => {
  const [userConfig, setUserConfig] = useState(appStore.getUserConfig());
  const [isLoading, setIsLoading] = useState(appStore.isLoadingUserConfig);

  useEffect(() => {
    // 监听store中的用户配置变化
    const updateUserConfig = () => {
      setUserConfig(appStore.getUserConfig());
      setIsLoading(appStore.isLoadingUserConfig);
    };

    // 立即更新一次
    updateUserConfig();

    // 使用 MobX reaction 监听 store 变化
    const disposer = reaction(
      () => ({
        userConfig: appStore.userConfig,
        isLoadingUserConfig: appStore.isLoadingUserConfig
      }),
      (newData: { userConfig: UserConfigType; isLoadingUserConfig: boolean }) => {
        console.log('useUserConfig reaction triggered:', newData);
        setUserConfig(newData.userConfig);
        setIsLoading(newData.isLoadingUserConfig);
      },
      { fireImmediately: false }
    );
    
    return () => {
      disposer();
    };
  }, []);

  /**
   * 加载用户合约配置
   */
  const loadUserConfig = async (params = {}) => {
    try {
      console.log('useUserConfig loadUserConfig called');
      const result = await appStore.loadUserConfig(params);
      console.log('useUserConfig loadUserConfig result:', result);
      return result;
    } catch (error) {
      console.error('加载用户合约配置失败:', error);
      throw error;
    }
  };

  /**
   * 清除用户合约配置
   */
  const clearUserConfig = () => {
    appStore.clearUserConfig();
  };

  /**
   * 检查用户是否已开通合约交易
   */
  const isContractEnabled = () => {
    return userConfig?.contractStatus === 1 || userConfig?.isContractEnabled === true;
  };

  /**
   * 获取用户合约配置的特定字段
   */
  const getConfigValue = (key: string, defaultValue?: any) => {
    return userConfig?.[key] ?? defaultValue;
  };

  return {
    userConfig,
    isLoading,
    loadUserConfig,
    clearUserConfig,
    isContractEnabled,
    getConfigValue,
  };
};

export default useUserConfig; 