import React, { useState, useMemo } from 'react';
import { useLanguage, useTheme } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { CustomTab } from '@/components/CustomCom';
import useAuth from '@/hooks/useAuth';
import { useContract } from '@/context/exchange-providers/ContractProvider';

import Position from './components/Position';
import SpotOrderHistory from '@/pages/SpotOrder/components/SpotOrderTable/HistoryOrder';
import SpotOrderDeal from '@/pages/SpotOrder/components/SpotOrderTable/HistoryDeal';
import Assets from '@/pages/Exchange/components/SpotOrder/Assets';

import noLoginLightIcon from '@/assets/images/public/icon_nologin_day.png';
import noLoginDarkIcon from '@/assets/images/public/icon_nologin_dark.png';


const SpotTabs: React.FC = () => {
    const {t, currentLanguage} = useLanguage(['contract', 'common']);
    const [activeTab, setActiveTab] = useState('1');
    const { isLoggedIn } = useAuth();
    const { isLight } = useTheme();
    const navigate = useNavigate();
    const { positionCount, defaultOrderCount, conditionOrderCount, assetsCount } = useContract();
    const tabItems = useMemo(() => {
        return [
            {
                key: '1',
                title: `${t('order.position')}${positionCount>0 ? `(${positionCount})` : ''}` // 仓位
            },
            {
                key: '2',
                title: `${t('order.defaultCommission')}${defaultOrderCount>0 ? `(${defaultOrderCount})` : ''}` // 普通委托
            },
            {
                key: '3',
                title: `${t('order.conditionCommission')}${conditionOrderCount>0 ? `(${conditionOrderCount})` : ''}` // 条件委托
            },
            {
                key: '4',
                title: `${t('assets')}${assetsCount>0 ? `(${assetsCount})` : ''}` // 资产
            }
        ]
    }, [positionCount, defaultOrderCount, conditionOrderCount, assetsCount, currentLanguage])

    // 未登录时的内容
    const NoLogin = () => {
        return (
            <div className="w-full flex-col justify-center items-center pt-[58px] pb-[76px]">
                <img src={isLight ? noLoginLightIcon : noLoginDarkIcon} className="w-[160px] h-[160px]" />
                <p className="h-[20px] flex justify-center items-center text-[14px] font-medium">
                    <button className="text-[#ff5f1f]" onClick={() => navigate('/login')}>{t('common:noLogin.tip2')}</button>
                    <span className="mx-2">{t('common:noLogin.or')}</span>
                    <button className="text-[#ff5f1f] mr-2" onClick={() => navigate('/register')}>{t('common:noLogin.tip3')}</button>
                    <span>{t('common:noLogin.tip1')}</span>
                </p>
            </div>
        )
    }
    // tab 内容
    const TabContent = () => {
        switch (activeTab) {
            case '1': return <Position />;
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