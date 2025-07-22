import React, { useState } from 'react';
import { useLanguage } from '@/hooks';
import { CustomTab } from '@/components/CustomCom';

import SpotChart from '../SpotChart';
import OrderBook from '../OrderBook';

const SpotTabs: React.FC = () => {
    const {t} = useLanguage('spot');
    const [activeTab, setActiveTab] = useState('1');
    const tabItems = [
		{
			key: '1',
			title: t('spot.orderBook.market') // 行情
		},
		{
			key: '2',
			title: t('spot.orderBook.title') // 盘口
		},
        {
			key: '3',
			title: t('spot.orderBook.latestTrades') // 最新成交
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
            {activeTab === '1' && <SpotChart />}
            {activeTab === '2' && <OrderBook type="orderbook" />}
            {activeTab === '3' && <OrderBook type="trades" />}
        </div>
    )
}

export default SpotTabs;