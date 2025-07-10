import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as SpotSvg } from '@/assets/icons/spotOrder/icon_Spot.svg';
import styles from '../styles/layout.module.scss'

import RouterMenu from "../RouterMenuPublic/Menu"
import { useLanguage } from '@/hooks/useLanguage';

// 定义图标类型
type IconType = string | React.ReactNode;

// 定义菜单项类型
interface MenuType {
    title: string;
    icon: IconType;
    path: string;
}

// 定义高阶组件的配置选项
interface WithSpotLayoutOptions {
    menuList?: MenuType[]; // 可选的菜单列表，如果不传则使用默认菜单
    currentTitle?: string; // 当前页面标题
}

// 高阶组件函数
const withSpotLayout = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options: WithSpotLayoutOptions = {}
) => {
    const LayoutWrapper: React.FC<P> = (props) => {
        const { t } = useLanguage('spot');
        const navigate = useNavigate();
        const location = useLocation();
        const currentPath = location.pathname;

        // 默认菜单列表
        const defaultMenuList: MenuType[] = [
            {
                path: '/spotOrder', //'/spot/assets',
                icon: <SpotSvg className="w-[24px] h-[24px] title-color" />,
                title: t('spot.spotOrder', { ns: 'spot' }), //'现货订单',
            }
        ];

        // 使用传入的菜单列表或默认菜单列表
        const menuList = options.menuList || defaultMenuList;

        // 根据当前路径获取当前页面标题
        const getCurrentTitle = () => {
            if (options.currentTitle) return options.currentTitle;

            const currentMenu = menuList.find(menu => menu.path === currentPath);
            return currentMenu?.title || t('common.router.overview');
        };

        return (
            <div className={`user-center-page flex flex-col`}>
                {/* 路由菜单头部 */}
                <RouterMenu
                    title={getCurrentTitle()}
                    menuList={menuList}
                    path={currentPath}
                />

                {/* 页面内容 */}
                <div className={`flex-1 ${styles.contentContainer}`}>
                    <WrappedComponent {...props} />
                </div>
            </div>
        );
    };

    // 设置显示名称，方便调试
    LayoutWrapper.displayName = `withSpotLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return LayoutWrapper;
};

export default withSpotLayout;
export type { MenuType, IconType, WithSpotLayoutOptions };