import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Iconify } from '../icon';
import styles from './index.module.scss';

const ThemeToggle: React.FC = observer(() => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`${styles.theme_toggle} flex-x algin-center justify-between`}>
      <button 
        onClick={toggleTheme}
        className={`${styles.theme_toggle_button} flex-x algin-center`}
      >
        <div className={`${styles.theme_icons} flex-x algin-center`}>
          {/* 太阳图标 - 日间模式 */}
          <div className={`${styles.icon_wrapper} ${!isDark ? styles.active : ''}`}>
            <Iconify 
              icon="si:sun-fill" 
              size={24}
              className={`${styles.sun_icon} ${!isDark ? styles.active_icon : ''}`}
            />
          </div>
          
          {/* 月亮图标 - 夜间模式 */}
          <div className={`${styles.icon_wrapper} ${isDark ? styles.active : ''}`}>
            <Iconify 
              icon="ph:moon-bold" 
              size={24}
              className={`${styles.moon_icon} ${isDark ? styles.active_icon : ''}`}
            />
          </div>
        </div>
      </button>
    </div>
  );
});

export default ThemeToggle; 