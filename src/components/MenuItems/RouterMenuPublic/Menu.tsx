import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/index.module.scss';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon'
import MenuPopup from './MenuPopup';
import { MenuType, IconType } from '@/type/public/menu';


interface UserHeaderProps {
  theme?: string;
  defaultMenuList: MenuType[];
}

const UserHeader: React.FC<UserHeaderProps> = ({ theme,defaultMenuList }) => {
  const { t } = useLanguage(['userCenter', 'common','assets']);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 根据当前路径获取当前页面标题
  const getCurrentTitle = () => {
    const currentMenu = defaultMenuList.find(menu => menu.path === currentPath);
    return currentMenu?.title || currentPath
  };

  const title = getCurrentTitle();

  // 创建图标映射，基于传入的菜单列表
  const iconMap: Record<string, IconType> = {};
  defaultMenuList.forEach(menu => {
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
        theme={theme}
        onClose={() => setMenuVisible(false)}
        menuList={defaultMenuList}
      />
    </div>
  );
};

export default UserHeader;
export type { MenuType, IconType };
