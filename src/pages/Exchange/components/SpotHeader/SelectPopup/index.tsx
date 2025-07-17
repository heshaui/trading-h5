import React, { useState } from 'react';
import { Toast, Popup, SearchBar, Tabs } from 'antd-mobile';
import { Iconify } from "@/components/icon/index";
import { useLanguage } from '@/hooks/useLanguage';
import SelectContent from './SelectContent';
import CustomTab from '@/components/CustomCom/CustomTab';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import styles from '../styles/selectPopup.module.scss';

type Props = {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  currencyPairs: any[];
  wsData?: any;
};

const SelectPopup: React.FC<Props> = observer(({ 
  open, 
  onOk, 
  onCancel,
  currencyPairs,
  wsData
}) => {
  const { t } = useLanguage(['spot']);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('spot');

  const tabsItems = [
		{
			key: 'favorites',
			title: t('spot.header.favorites')
		},
		{
			key: 'spot',
			title: t('spot.header.spot')
		},
	]

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handlePairSelect = (pair: any) => {
    appStore.setCurrentPair(pair);
    onOk();
  };

  return (
    <Popup
      visible={open}
      onClose={onCancel}
      closeOnMaskClick
      position='bottom'
      bodyStyle={{ width: '100vw', height: '89.22vh' }}
      bodyClassName="!bg-[var(--background5)] !text-[var(--text-color5)]"
    >
      <div className="flex-col h-full">
        {/* 头部搜索 */}
        <div className="px-4 pt-4 mb-[10px]">
          <SearchBar 
            placeholder={t('spot.header.search')}
            value={searchValue}
            onChange={handleSearch}
            className="searchBar"
          />
        </div>

        {/* 标签页 */}
        <CustomTab
          tabsItems={ tabsItems }
          activeKey={activeTab}
          onChange={setActiveTab}
          stretch={false}
          activeLineMode='auto'
          className="spotTabs safeTabs"
        />
        {/* 内容区域（可滚动） */}
        <div className={styles.contentScroll}>
          <SelectContent 
            type={activeTab as 'favorites' | 'spot'}
            currencyPairs={currencyPairs}
            onPairSelect={handlePairSelect}
            searchValue={searchValue}
            wsData={wsData}
          />
        </div>
      </div>
    </Popup>
  );
});

export default SelectPopup;
