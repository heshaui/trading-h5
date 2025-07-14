import React, { useState } from 'react';
import styles from '../styles/index.module.scss';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon'
import MenuPopup from './MenuPopup';

// 定义图标类型
type IconType = string | React.ReactNode;

// 定义菜单项类型
interface MenuType {
  title: string;
  icon: IconType;
  path: string;
}

interface UserHeaderProps {
  title: string;
  menuList: MenuType[];
  path: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ title, menuList,path }) => {
  const { t } = useLanguage(['userCenter', 'common']);
  const [menuVisible, setMenuVisible] = useState(false);

  // 创建图标映射，基于传入的菜单列表
  const iconMap: Record<string, IconType> = {};
  menuList.forEach(menu => {
    iconMap[menu.title] = menu.icon;
  });

  return (
    <div className={`${styles.user_header}`} onClick={() => setMenuVisible(true)}>
      <div className={`${styles.user_header_left}`}>
        {typeof iconMap[title] === 'string' && iconMap[title] ? (
          <Iconify icon={iconMap[title] as string} className={`${styles.left_icon}`} />
        ) : (
          iconMap[title]
        )}
        <span className="ml-[18px]">{title}</span>
      </div>
      <Iconify icon="icon-park-outline:down" className={`${styles.right_icon} ${menuVisible ? styles.activ_icon : ''}`}/>
      <MenuPopup 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)}
        menuList={menuList}
      />
    </div>
  );
};

export default UserHeader;
export type { MenuType, IconType };
