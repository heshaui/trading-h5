import React, { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { Popup } from 'antd-mobile';
import styles from '../styles/index.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';

// 定义图标类型
type IconType = string | React.ReactNode;

// 定义菜单项类型
interface MenuType {
  title: string;
  icon: IconType;
  path: string;
}

interface MenuPopupProps {
  visible: boolean;
  onClose: () => void;
  menuList: MenuType[];
}

const MenuPopup: React.FC<MenuPopupProps> = ({ visible, onClose, menuList }) => {
  const { t } = useLanguage('common');
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const pendingPathRef = useRef<string | null>(null);

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
              className={active ? `${styles.user_menu_item} ${styles.active}` : styles.user_menu_item}
              onClick={() => handleMenuClick(menu.path)}
            >
              <div className={`${styles.left_border}`}></div>
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
export type { MenuType, IconType };
