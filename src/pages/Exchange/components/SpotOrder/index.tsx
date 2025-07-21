import React, { useState } from 'react';
import { useLanguage } from '@/hooks';
import { CustomTab } from '@/components/CustomCom';

import SpotOrderNow from '@/pages/SpotOrder/components/SpotOrderTable/NowOrder'
import SpotOrderHistory from '@/pages/SpotOrder/components/SpotOrderTable/HistoryOrder'
import SpotOrderDeal from '@/pages/SpotOrder/components/SpotOrderTable/HistoryDeal'

const SpotTabs: React.FC = () => {
    const {t} = useLanguage('spot');
    const [activeTab, setActiveTab] = useState('1');
    const tabItems = [
        {
            key: '1',
            title: t('spot.tabs.now') // 当前委托
        },
        {
            key: '2',
            title: t('spot.tabs.history') // 历史委托
        },
        {
            key: '3',
            title: t('spot.tabs.historyDeal') // 历史成交
        },
        {
            key: '4',
            title: t('spot.tabs.asset') // 资产
        }
    ]
    return (
        <div>
            {/* 标签页 */}
            <CustomTab
                tabsItems={ tabItems }
                activeKey={activeTab}
                onChange={setActiveTab}
                stretch={false}
                activeLineMode='fixed'
                className="spotTabs safeTabs"
            />
            {activeTab === '1' && <SpotOrderNow />}
            {activeTab === '2' && <SpotOrderHistory />}
            {activeTab === '3' && <SpotOrderDeal />}
            {activeTab === '4' && <></>}
        </div>
    )
}

export default SpotTabs;