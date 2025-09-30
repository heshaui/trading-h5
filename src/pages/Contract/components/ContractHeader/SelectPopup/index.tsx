import React, { useState, useEffect } from 'react';
import { Popup, SearchBar } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import SelectContent from './SelectContent';
import CustomTab from '@/components/CustomCom/CustomTab';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';

type Props = {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
};

export interface SymbolData {
  id: number;
  contractName: string;
  symbol: string;
  contractType: string;
  coType: string;
  contractShowType: string;
  deliveryKind: string;
  contractSide: number;
  multiplier: number;
  multiplierCoin: string;
  marginCoin: string;
  marginRate: number;
  capitalStartTime: number;
  capitalFrequency: number;
  settlementFrequency: number;
  brokerId: number;
  base: string;
  quote: string;
  coinResultVo: any;
  sort: number;
  maxLever: number;
  minLever: number;
  // 可选的UI相关字段
  price?: string;
  changePercent?: string;
  isFavorite?: boolean;
  type?: 'USD' | 'COIN';
}

// 根据合约类型分类的工具函数
export const getContractCategory = (item: SymbolData) => {
        if (item.contractType === 'E') {
            switch (item.contractSide) {
            case 1:
                return 'usdt'; // USDT合约
            case 0:
                return 'coin'; // 币本位合约
            case 2:
                return 'mix'; // 混合合约
            default:
                return 'unknown';
            }
        } else if (item.contractType === 'S') {
            return 'sim'; // 模拟合约
        }
        return 'unknown';
  };

const SelectPopup: React.FC<Props> = observer(({ 
  open, 
  onOk, 
  onCancel
}) => {
  const { t } = useLanguage(['contract', 'spot']);
  const symbolList = appStore.getPublicInfo()?.contractList ?? [];
  const currentSymbol = appStore.getCurrentContractInfo();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('usdt');
  const tabsItems = [
    {
      key: 'usdt',
      title: `${t('symbolSelector.usdtContract')}`
    },
    {
      key: 'coin',
      title: `${t('symbolSelector.coinContract')}`
    },
    {
      key: 'sim',
      title: `${t('symbolSelector.simContract')}`
    },
  ]

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSelect = () => {
    onOk();
  };

  useEffect(() => {
    // tab 固定顺序
    const tabOrder = ['coin', 'usdt', 'mix', 'sim', 'unknown'] as const;

    // 有数据的类型
    const availableTypes = tabOrder.filter(type =>
      symbolList.some((item: SymbolData) => getContractCategory(item) === type)
    );

    // 根据 currentSymbol 选 tab
    let nextTab: string | undefined;
    if (currentSymbol) {
      const category = getContractCategory(currentSymbol);
      if (availableTypes.includes(category)) {
        nextTab = category;
      }
    }

    // 没有 currentSymbol 或对应类型没数据 → 取第一个有数据的
    if (!nextTab) {
      nextTab = availableTypes[0] ?? 'usdt';
    }

    setActiveTab(nextTab);
  }, [open]);

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
          <span>{t('spot:spot.header.market')}</span>
          <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
        </p>
        <div className="flex-col min-h-0 flex-1">
          {/* 头部搜索 */}
          <div className="px-4 pt-4 mb-[10px]">
            <SearchBar 
              icon={<Iconify icon="garden:search-26" className="text-[20px]" />}
              placeholder={t('spot:spot.header.search')}
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
            activeLineMode='fixed'
            className="spotSelectTabs safeTabs"
          />
          {/* 内容区域 */}
          <SelectContent 
            type={activeTab as 'usdt' | 'coin' | 'sim'}
            searchValue={searchValue}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </Popup>
  );
});

export default SelectPopup;
