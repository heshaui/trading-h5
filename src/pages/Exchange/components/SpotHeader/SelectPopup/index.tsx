import React, { useState, useMemo } from 'react';
import { Popup, SearchBar } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import SelectContent from './SelectContent';
import CustomTab from '@/components/CustomCom/CustomTab';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';

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
  const { favoritesCount, spotCount } = useExchange();
  const tabsItems = useMemo(() => [
    {
      key: 'favorites',
      title: `${t('spot.header.favorites')}${searchValue && favoritesCount ? `(${favoritesCount})` : ''}`
    },
    {
      key: 'spot',
      title: `${t('spot.header.spot')}${searchValue && spotCount ? `(${spotCount})` : ''}`
    }
  ], [searchValue, favoritesCount, spotCount]);

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
      bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', width: '100vw', height: '80vh' }}
      bodyClassName="!bg-[var(--background17)] !text-[var(--text-color5)]"
    >
      <div className="flex-col h-full">
        <p className="flex justify-between items-center h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
          <span>{t('spot.header.market')}</span>
          <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
        </p>
        <div className="flex-col min-h-0 flex-1">
          {/* 头部搜索 */}
          <div className="px-4 pt-4 mb-[10px]">
            <SearchBar 
              icon={<Iconify icon="garden:search-26" className="text-[20px]" />}
              placeholder={t('spot.header.search')}
              value={searchValue}
              onChange={handleSearch}
              className="searchBar !h-[40px]"
            />
          </div>

          {/* 标签页 */}
          <CustomTab
            tabsItems={ tabsItems }
            activeKey={activeTab}
            onChange={setActiveTab}
            stretch={false}
            activeLineMode='auto'
            className="spotSelectTabs safeTabs"
          />
          {/* 内容区域 */}
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
