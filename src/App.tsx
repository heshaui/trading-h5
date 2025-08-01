import React from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigProvider } from 'antd-mobile';
import { BrowserRouter } from 'react-router-dom';
import AutoRoutes from '@/routes/AutoRoutes';
import { useThemeEffect } from '@/hooks/dayModeChange';
import { useWebConfig } from '@/hooks/useKv';
import './App.scss';
import './styles/public.scss'
import './styles/init.scss'
import './styles/public_custom.scss'
import { getKvObject } from '@/services/kv';
import appStore from '@/store';
import { useEffect } from 'react';

// 根据环境动态配置基础路径
const getBasename = () => {
  // 生产环境使用 /h5，开发环境使用根路径
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_BASE_PATH || '/h5';
  }
  return process.env.REACT_APP_BASE_PATH || '/';
};

const App: React.FC = observer(() => {
  // 应用动态主题映射文件
  useThemeEffect();
  // kv配置请求
  const { config, loading } = useWebConfig();
  useEffect(() => {
    appStore.loadGetLangList();
    appStore.loadGetRateList();
  }, []);
  return (
    <ConfigProvider>
      <BrowserRouter basename={getBasename()}>
        <div className="app">
          <AutoRoutes />
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
});

export default App;
