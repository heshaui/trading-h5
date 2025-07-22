import React, { useState } from 'react';
import { Image } from 'antd-mobile';
import { useLanguage, useTheme } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { CustomTab } from '@/components/CustomCom';
import useAuth from '@/hooks/useAuth';

import SpotOrderNow from '@/pages/SpotOrder/components/SpotOrderTable/NowOrder';
import SpotOrderHistory from '@/pages/SpotOrder/components/SpotOrderTable/HistoryOrder';
import SpotOrderDeal from '@/pages/SpotOrder/components/SpotOrderTable/HistoryDeal';
import Assets from './Assets';

import noLoginLightIcon from '@/assets/images/public/icon_nologin_day.png';
import noLoginDarkIcon from '@/assets/images/public/icon_nologin_dark.png';


const SpotTabs: React.FC = () => {
    const {t} = useLanguage('spot');
    const [activeTab, setActiveTab] = useState('1');
    const { isLoggedIn } = useAuth();
    const { isLight } = useTheme();
    const navigate = useNavigate();
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

    // 未登录时的内容
    const NoLogin = () => {
        return (
            <div className="w-full flex-col justify-center items-center pt-[58px] pb-[76px]">
                <img src={isLight ? noLoginLightIcon : noLoginDarkIcon} className="w-[160px] h-[160px]" />
                <p className="h-[20px] flex justify-center items-center text-[14px] font-medium">
                    <button className="text-[#ff5f1f]" onClick={() => navigate('/login')}>登录</button>
                    <span className="mx-2">或</span>
                    <button className="text-[#ff5f1f] mr-2" onClick={() => navigate('/register')}>立即注册</button>
                    <span>开始交易</span>
                </p>
            </div>
        )
    }
    // tab 内容
    const TabContent = () => {
        switch (activeTab) {
            case '1': return <SpotOrderNow />;
            case '2': return <SpotOrderHistory />;
            case '3': return <SpotOrderDeal />;
            case '4': return <Assets />;
        }
    }

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
            {!isLoggedIn ? <NoLogin /> : TabContent()}
        </div>
    )
}

export default SpotTabs;