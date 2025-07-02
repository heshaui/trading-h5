import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Card, Space, Toast } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import './Card.scss';

const Demo: React.FC = observer(() => {
  const { t } = useLanguage();
  const { isDark } = useTheme();



  return (
	<div className="demo-page">



	  <Card title={t('common.more')} className="demo-card">
		<div className="info-section">
		  <p>{t('theme.light')}: {isDark ? t('theme.dark') : t('theme.light')}</p>
		  <p>{t('common.loading')}</p>
		  <p>{t('auth.loginSuccess')}</p>
		</div>
	  </Card>
	</div>
  );
});

export default Demo; 