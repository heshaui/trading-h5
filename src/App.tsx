import React from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigProvider } from 'antd-mobile';
import AutoRoutes from '@/routes/AutoRoutes';
import { useThemeEffect } from '@/hooks/dayModeChange';
import { useWebConfig } from '@/hooks/useKv';
import './App.scss';
import './styles/public.scss'
import './styles/init.scss'
import './styles/public_custom.scss'
import { getKvObject } from '@/services/kv';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import appStore from '@/store';
import { useEffect } from 'react';
// 在非组件ts中使用路由跳转
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { history } from '@/utils/history';
import { useAssetsAndRateWs } from '@/hooks/useAssetsRate';

// 根据环境动态配置基础路径
const getBasename = () => {
  // 生产环境使用 /h5，开发环境使用根路径
  if (process.env.NODE_ENV === 'production') {
    return process.env.PUBLIC_URL || '/h5';
  }
  return process.env.PUBLIC_URL || '/';
};

const App: React.FC = observer(() => {
  // 应用动态主题映射文件
  useThemeEffect();
  // kv配置请求
  const { config, loading } = useWebConfig();
  // 设置浏览器标题为交易所名称（来自 kv_config.tenant_cache_name）
  const allConfig = appStore.getKvConfigAll();
  useEffect(() => {
    try {
      let exchangeName: string | undefined = allConfig?.tenant_cache_name;
      if (!exchangeName) {
        const kv = localStorage.getItem(LOCAL_STORAGE_KEY.KV_CONFIG);
        if (kv) {
          exchangeName = JSON.parse(kv)?.tenant_cache_name;
        }
      }
      if (exchangeName && typeof document !== 'undefined') {
        document.title = exchangeName;
      }
    } catch (_) {
      // ignore
    }
  }, [allConfig?.tenant_cache_name]);
  useEffect(() => {
    appStore.loadGetLangList();
    appStore.loadGetRateList();
  }, []);

   // 组件内
   const token = appStore.getToken();
   useAssetsAndRateWs(!!token); // 登录后全局启用
  return (
    <ConfigProvider>
      <HistoryRouter history={history as any} basename={getBasename()}>
        <div className="app">
          <AutoRoutes />
        </div>
      </HistoryRouter>
    </ConfigProvider>
  );
});

export default App;
