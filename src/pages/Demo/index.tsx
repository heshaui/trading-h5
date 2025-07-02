import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from 'antd-mobile';
import { useLanguage } from '../../hooks/useLanguage';
import LanguageToggle from '../../components/LanguageToggle';
import './index.css';

const Demo: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <div className="demo-page">
      <Card title="多语言演示 / Multi-language Demo">
        <div style={{ marginBottom: 16 }}>
          <LanguageToggle />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <p><strong>当前语言 / Current Language:</strong> {currentLanguage}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3>Common 命名空间示例:</h3>
          <p>{t('common:submit', '提交')}</p>
          <p>{t('common:cancel', '取消')}</p>
          <p>{t('common:confirm', '确认')}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3>Login 命名空间示例:</h3>
          <p>{t('login:title', '登录')}</p>
          <p>{t('login:username', '用户名')}</p>
          <p>{t('login:password', '密码')}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3>Market 命名空间示例:</h3>
          <p>{t('market:price', '价格')}</p>
          <p>{t('market:volume', '成交量')}</p>
          <p>{t('market:change', '涨跌')}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3>Assets 命名空间示例:</h3>
          <p>{t('assets:balance', '余额')}</p>
          <p>{t('assets:available', '可用')}</p>
          <p>{t('assets:frozen', '冻结')}</p>
        </div>

        <Button 
          color="primary" 
          onClick={() => {
            alert(t('common:success', '操作成功'));
          }}
        >
          {t('common:test', '测试按钮')}
        </Button>
      </Card>
    </div>
  );
};

export default Demo; 