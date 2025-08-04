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
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { history } from '@/utils/history';

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
      <HistoryRouter history={history as any}>
        <div className="app">
          <AutoRoutes />
        </div>
      </HistoryRouter>
    </ConfigProvider>
  );
});

export default App;
