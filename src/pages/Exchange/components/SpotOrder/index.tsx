import React, { useState, useMemo } from 'react';
import { Image } from 'antd-mobile';
import { useLanguage, useTheme } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { CustomTab } from '@/components/CustomCom';
import useAuth from '@/hooks/useAuth';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';

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
    const { nowOrderCount, historyOrderCount, historyDealCount, assetsCount } = useExchange();
    const tabItems = useMemo(() => {
        return [
            {
                key: '1',
                title: `${t('spot.tabs.now')}${nowOrderCount>0 ? `(${nowOrderCount})` : ''}` // 当前委托
            },
            {
                key: '2',
                title: `${t('spot.tabs.history')}${historyOrderCount>0 ? `(${historyOrderCount})` : ''}` // 历史委托
            },
            {
                key: '3',
                title: `${t('spot.tabs.historyDeal')}${historyDealCount>0 ? `(${historyDealCount})` : ''}` // 历史成交
            },
            {
                key: '4',
                title: `${t('spot.tabs.asset')}${assetsCount>0 ? `(${assetsCount})` : ''}` // 资产
            }
        ]
    }, [nowOrderCount, historyOrderCount, historyDealCount, assetsCount])

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
            case '1': return <SpotOrderNow pageType="exchange" />;
            case '2': return <SpotOrderHistory pageType="exchange" />;
            case '3': return <SpotOrderDeal pageType="exchange" />;
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
            {/* {!isLoggedIn ? (
                <NoLogin />
            ) : (
                <>
                    <div style={{ display: activeTab === '1' ? 'block' : 'none' }}>
                        <SpotOrderNow pageType="exchange" />
                    </div>
                    <div style={{ display: activeTab === '2' ? 'block' : 'none' }}>
                        <SpotOrderHistory pageType="exchange" />
                    </div>
                    <div style={{ display: activeTab === '3' ? 'block' : 'none' }}>
                        <SpotOrderDeal pageType="exchange" />
                    </div>
                    <div style={{ display: activeTab === '4' ? 'block' : 'none' }}>
                        <Assets />
                    </div>
                </>
            )} */}
        </div>
    )
}

export default SpotTabs;