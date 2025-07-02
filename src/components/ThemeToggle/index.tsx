import React from 'react';
import { Switch } from 'antd-mobile';
import { observer } from 'mobx-react-lite';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import './index.scss';

const ThemeToggle: React.FC = observer(() => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="theme-toggle">
      <span className="theme-toggle-label">
        {isDark ? t('theme.dark') : t('theme.light')}
      </span>
      <Switch
        checked={isDark}
        onChange={toggleTheme}
        className="theme-toggle-switch"
      />
    </div>
  );
});

export default ThemeToggle; 