import React, { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { Popup } from 'antd-mobile';
import './index.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as AssetsSvg } from '@/assets/icons/userCenter/wallet.svg';
import { ReactComponent as IdentitySvg } from '@/assets/icons/userCenter/idcard-line.svg';
import { ReactComponent as InviteSvg } from '@/assets/icons/userCenter/invite.svg';
import { ReactComponent as OrderSvg } from '@/assets/icons/userCenter/order.svg';

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

  const pendingPathRef = useRef<string | null>(null);

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

  const handleMenuClick = (path: string) => {
    if (path === currentPath) {
        onClose()
        return
    }

    if (!pendingPathRef.current) {
        pendingPathRef.current = path
        onClose()

        // 手动延时跳转，优化体验
        setTimeout(() => {
            navigate(pendingPathRef.current!)
            pendingPathRef.current = null
        }, 300) // 300ms 是 Popup 动画时间，保持一致
    }
  }
// afterClose={handleAfterClose}
//   const handleAfterClose = () => {
//     if (pendingPathRef.current) {
//       navigate(pendingPathRef.current);
//       pendingPathRef.current = null;
//     }
//   };

  return (
    <Popup
      visible={visible}
      onClose={onClose}
      closeOnMaskClick
      position="left"
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
        {menuList.map((menu: MenuType) => {
          const active = currentPath === menu.path;
          return (
            <li
              key={menu.path}
              className={active ? 'user-menu-item active' : 'user-menu-item'}
              onClick={() => handleMenuClick(menu.path)}
            >
              <div className="left-border"></div>
              {typeof menu.icon === 'string' ? (
                <Iconify icon={menu.icon} className="text-[24px]" />
              ) : (
                menu.icon
              )}
              <span className="ml-[18px]">{menu.title}</span>
            </li>
          );
        })}
      </ul>
    </Popup>
  );
};

export default MenuPopup;
