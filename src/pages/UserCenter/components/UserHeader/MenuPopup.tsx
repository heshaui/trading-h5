import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon'
import { Popup } from 'antd-mobile';
import './index.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as AssetsSvg } from '@/assets/icons/userCenter/wallet.svg';
import { ReactComponent as IdentitySvg } from '@/assets/icons/userCenter/idcard-line.svg';
import { ReactComponent as InviteSvg } from '@/assets/icons/userCenter/invite.svg';
import { ReactComponent as OrderSvg} from '@/assets/icons/userCenter/order.svg';

type IconType = string | React.ReactNode;
interface MenuType {
    title: string;
    icon: IconType;
    path: string;
}

interface MenuPopupProps {
    visible: boolean;
    onClose: () => void;
}

const MenuPopup: React.FC<MenuPopupProps> = ({ visible, onClose }) => {
    const { t } = useLanguage('common');
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const menuList: MenuType[] = [
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
            path: '/orders'
        },
        {
            title: t('router.safetyCenter'),
            icon: 'mingcute:safety-certificate-line',
            path: '/userCenter/safetyCenter'
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
    ]
    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    }
    return (
        <Popup
            visible={visible}
            onClose={onClose}
            closeOnMaskClick
            position='left'
            bodyStyle={{ width: '100vw' }}
            bodyClassName="!bg-[var(--background9)] !text-[var(--text-color5)]"
        >
            <div 
                className="leading-6 flex justify-end pt-[16px] pr-[16px] mb-[6.97px]"
                onClick={onClose}
            >
                <Iconify icon="mingcute:close-line" className="text-[24px] text-[#676867]" />
            </div>
            <ul className="pr-[20px]">
                {
                    menuList.map((menu: MenuType) => {
                        const active = currentPath.includes(menu.path)
                        return (
                            <li 
                                key={menu.path}
                                className={active ? 'user-menu-item active' : 'user-menu-item'}
                                onClick={() => handleNavigate(menu.path)}
                            >
                                <div className="left-border"></div>
                                {typeof menu.icon === 'string' && menu.icon  ? (
                                    <Iconify icon={menu.icon as string} className="text-[24px]" />
                                ) : (
                                    menu.icon
                                )}
                                <span className="ml-[18px]">{ menu.title }</span>
                            </li>
                        )
                    })
                }
            </ul>
        </Popup>
    )
}

export default MenuPopup;