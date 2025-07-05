import React, { useState } from 'react';
import { Button, Popover, Popup, Image, Tabs } from 'antd-mobile';
import { useLanguage } from '../../hooks/useLanguage';
import { supportedLanguages, languageNames } from '../../utils/languageLoader';
import iconDown from '../../assets/icons/public/icon_earth_line.png';
import iconDownDark from '../../assets/icons/public/icon_earth_dark.png';
import styles from './index.module.scss';
import { Action } from 'antd-mobile/es/components/popover'
import { DownOutline } from 'antd-mobile-icons';
import appStore from '@/store';
import { useThemeMode } from '@/hooks/useThemeMode';
import { CloseOutline } from 'antd-mobile-icons';
interface Item {
  title: string;
  key: string;
  children: React.ReactNode;
  disabled?:boolean;
  destroyOnClose?:boolean
}
type Props = {
  tabsItems: Item[];
  defaultActiveKey?:string;
  activeKey?:string | null;
  onChange?: (key: string) => void;
  stretch?:boolean;
  direction?:'ltr' | 'rtl';
  activeLineMode?:'auto' | 'full' | 'fixed';
  className?: string| string[];
  style?: React.CSSProperties;
}
const CustomTab: React.FC<Props> = ({ tabsItems,
  defaultActiveKey,
  activeKey,
  onChange,
  stretch=true,
  direction ,
  activeLineMode='auto',
  className,
  style
}) => {
  return (
    <div className={styles.tabs_box}>

      <Tabs defaultActiveKey={defaultActiveKey}
        stretch={stretch}
        direction={direction}
        activeLineMode={activeLineMode}
        className={`${styles.tabs_container} ${className}`}
        activeKey={activeKey}
        onChange={onChange}
        style={style}
      >
        {tabsItems.map((item) => (
          <Tabs.Tab title={item.title} key={item.key}
            destroyOnClose={item.destroyOnClose||false}
            disabled={item.disabled||false}
          >
            {item.children}
          </Tabs.Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default CustomTab; 