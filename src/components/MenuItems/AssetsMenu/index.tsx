import React from 'react';
import { ReactComponent as SpotSvg } from '@/assets/icons/spotOrder/icon_Spot.svg';
import { ReactComponent as CashSvg } from '@/assets/icons/assets/icon_cash.svg';
import { ReactComponent as DepositSvg } from '@/assets/icons/assets/icon_deposit.svg';
import { ReactComponent as BillingSvg } from '@/assets/icons/assets/icon_Billing.svg';

import styles from '../styles/layout.module.scss'
import RouterMenu from "../RouterMenuPublic/Menu"
import { useLanguage } from '@/hooks/useLanguage';
import { MenuType, IconType } from '@/type/public/menu';


// 高阶组件函数
const withAssetsLayout = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    const LayoutWrapper: React.FC<P> = (props) => {
        const { t } = useLanguage('assets');

        // 默认菜单列表
        const defaultMenuList: MenuType[] = [
            {
                path: '/assets/deposit', 
                icon: <CashSvg className="w-[24px] h-[24px] " />,
                title: t('assets.deposit', { ns: 'assets' }), //'充值',
                type: 'p2',
            },
            {
                path: '/assets/withdraw', 
                icon: <DepositSvg className="w-[24px] h-[24px] " />,
                title: t('assets.withdraw', { ns: 'assets' }), //'提现',
                type: 'p2',
            },
            {
                path: '/assets', 
                icon: <SpotSvg className="w-[24px] h-[24px] " />,
                title: t('assets.assetsAccount', { ns: 'assets' }), //'现货账户',
                type: 'p3',
            },
            {
                path: '/assets/bill', 
                icon: <BillingSvg className="w-[24px] h-[24px] " />,
                title: t('assets.billDetails', { ns: 'assets' }), //'账单',
                type: 'p3',
            },
            
        ];

        return (
            <div className={`user-center-page flex flex-col`}>
                {/* 路由菜单头部 */}
                <RouterMenu
                    theme={'var(--background5)'}
                    defaultMenuList={defaultMenuList}
                />

                {/* 页面内容 */}
                <div className={`flex-1 ${styles.contentContainer}`}>
                    <WrappedComponent {...props} />
                </div>
            </div>
        );
    };

    // 设置显示名称，方便调试
    LayoutWrapper.displayName = `withAssetsLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return LayoutWrapper;
};

export default withAssetsLayout;
export type { MenuType, IconType };