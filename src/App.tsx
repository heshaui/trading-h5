import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfigProvider, Button, Space } from 'antd-mobile';
import { useLanguage } from './hooks/useLanguage';
// import { useTheme } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import { Demo } from './pages';
import './App.css';

const App: React.FC = observer(() => {
  const { t } = useLanguage();
  // const { isDark } = useTheme();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <ConfigProvider>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">{t('nav.home')}</h1>
          <div className="app-subtitle">
            {t('common.loading')}
          </div>
        </header>
        
        <main className="app-main">
          <div className="welcome-section">
            <h2>{t('auth.login')}</h2>
            <p>{t('common.confirm')}</p>
            <Space direction="vertical" style={{ marginTop: 20 }}>
              <Button 
                color="primary" 
                size="large"
                onClick={() => setShowDemo(!showDemo)}
              >
                {showDemo ? t('common.back') : t('common.more')}
              </Button>
            </Space>
          </div>
          
          {showDemo ? (
            <Demo />
          ) : (
            <div className="demo-section">
              <h3>{t('trade.buy')} / {t('trade.sell')}</h3>
              <div className="demo-grid">
                <div className="demo-card">
                  <h4>{t('market.price')}</h4>
                  <p>¥ 45,234.56</p>
                </div>
                <div className="demo-card">
                  <h4>{t('market.change')}</h4>
                  <p className="text-success">+2.34%</p>
                </div>
                <div className="demo-card">
                  <h4>{t('assets.totalAssets')}</h4>
                  <p>¥ 12,345.67</p>
                </div>
                <div className="demo-card">
                  <h4>{t('assets.availableBalance')}</h4>
                  <p>¥ 8,765.43</p>
                </div>
              </div>
            </div>
          )}
        </main>
        
        <footer className="app-footer">
          <div className="settings-section">
            <h3>{t('theme.light')}</h3>
            <div className="settings-grid">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
});

export default App;
