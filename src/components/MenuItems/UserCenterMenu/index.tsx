import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as AssetsSvg } from '@/assets/icons/userCenter/wallet.svg';
import { ReactComponent as IdentitySvg } from '@/assets/icons/userCenter/idcard-line.svg';
import { ReactComponent as InviteSvg } from '@/assets/icons/userCenter/invite.svg';
import { ReactComponent as OrderSvg } from '@/assets/icons/userCenter/order.svg';
import RouterMenu from "../RouterMenuPublic/Menu"
import { useLanguage } from '@/hooks/useLanguage';
import styles from '../styles/layout.module.scss'
import { MenuType, IconType } from '@/type/public/menu';
import appStore from '@/store';
// 定义高阶组件的配置选项
interface WithUserCenterLayoutOptions {
    menuList?: MenuType[]; // 可选的菜单列表，如果不传则使用默认菜单
    currentTitle?: string; // 当前页面标题
    noMinHeight?: boolean; // 是否需要内容最小高度
}

// 高阶组件函数
const withUserCenterLayout = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options: WithUserCenterLayoutOptions = {noMinHeight: false}
) => {
    const LayoutWrapper: React.FC<P> = (props) => {
        const { t } = useLanguage('common');
        const navigate = useNavigate();
        const location = useLocation();
        const currentPath = location.pathname;
        const kvConfig = appStore.getKvConfigAll();
        // 默认菜单列表
        const defaultMenuList: MenuType[] = [
            {
                title: t('common.router.overview'),
                icon: 'pixelarticons:dashboard',
                path: '/userCenter'
            },
            {
                title: t('header.notice.assets'),
                icon: <AssetsSvg className="w-[24px] h-[24px]" />,
                path: '/assets'
            },
            {
                title: t('trade.orders'),
                icon: <OrderSvg className="w-[24px] h-[24px]" />,
                path: '/spotOrder'
            },
            {
                title: t('router.safetyCenter'),
                icon: 'mingcute:safety-certificate-line',
                path: '/userCenter/security'
            },
            {
                title: t('router.identity'),
                icon: <IdentitySvg className="w-[24px] h-[24px]" />,
                path: '/userCenter/identity'
            },
            {
                title: t('router.inviteFriend'),
                icon: <InviteSvg className="w-[24px] h-[24px]" />,
                path: '/invite'
            },
            {
                title: t('router.setting'),
                icon: 'icon-park-outline:setting-two',
                path: '/userCenter/setting'
            }
        ];

        const userCenterList = useMemo(() => {
            return defaultMenuList.filter(item => {
                if ((kvConfig?.account_configuration && kvConfig?.account_configuration === '0')) {
                    return item.path !== '/invite'
                }
                return true
            });
        }, [kvConfig?.account_configuration, currentPath]);

        return (
            <div className={`user-center-page flex flex-col`}>
                {/* 路由菜单头部 */}
                <RouterMenu 
                    // title={getCurrentTitle()}
                    // menuList={menuList}
                    // path={currentPath}
                    defaultMenuList={userCenterList}
                />
                
                {/* 页面内容 */}
                <div className={`flex-1 ${!options.noMinHeight && styles.contentContainer}`}>
                    <WrappedComponent {...props} />
                </div>
            </div>
        );
    };

    // 设置显示名称，方便调试
    LayoutWrapper.displayName = `withUserCenterLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return LayoutWrapper;
};

export default withUserCenterLayout;
export type { MenuType, IconType, WithUserCenterLayoutOptions };