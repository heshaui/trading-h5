import React from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigProvider } from 'antd-mobile';
import { BrowserRouter } from 'react-router-dom';
import AutoRoutes from '@/routes/AutoRoutes';
import './App.scss';

const App: React.FC = observer(() => {
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
