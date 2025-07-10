import React, { useState } from 'react';
import {  Tabs } from 'antd-mobile';
import styles from './index.module.scss';
interface Item {
  title?: string;
  label?: string;
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
          <Tabs.Tab title={item.title||item.label} key={item.key}
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