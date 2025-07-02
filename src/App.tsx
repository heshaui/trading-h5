import React from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigProvider } from 'antd-mobile';
import { BrowserRouter } from 'react-router-dom';
import AutoRoutes from '@/routes/AutoRoutes';
import { useThemeEffect } from '@/hooks/dayModeChange';
import './App.scss';
import './styles/public.scss'

const App: React.FC = observer(() => {
  // 应用动态主题映射文件
  useThemeEffect();

  return (
    <ConfigProvider>
      <BrowserRouter>
        <div className="app">
          <AutoRoutes />
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
});

export default App;
