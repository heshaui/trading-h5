import React, { useState } from 'react';
import { useLanguage } from '@/hooks';
import { CustomTab } from '@/components/CustomCom';

import ContractChart from '../ContractChart';
import OrderBook from '../OrderBook';
import ContractInfo from '../ContractInfo';

const SpotTabs: React.FC = () => {
    const {t} = useLanguage('contract');
    const [activeTab, setActiveTab] = useState('1');
    const tabItems = [
		{
			key: '1',
			title: t('chart.title') // 图表
		},
		{
			key: '2',
			title: t('orderBookList.title') // 委托列表
		},
        {
			key: '3',
			title: t('realtimeTrade.title') // 实时成交
		},
        {
			key: '4',
			title: t('info') // 合约信息
		}
	]
    return (
        <div className="border-b-[14px] border-[var(--background14)]">
            {/* 标签页 */}
            <CustomTab
                tabsItems={ tabItems }
                activeKey={activeTab}
                onChange={setActiveTab}
                stretch={false}
                activeLineMode='fixed'
                className="spotTabs safeTabs"
            />
            {activeTab === '1' && <ContractChart />}
            {activeTab === '2' && <OrderBook type="orderbook" />}
            {activeTab === '3' && <OrderBook type="trades" />}
            {activeTab === '4' && <ContractInfo />}
        </div>
    )
}

export default SpotTabs;