import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { Popup } from 'antd-mobile';
import styles from '../styles/index.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuType, IconType } from '@/type/public/menu';

interface MenuPopupProps {
  visible: boolean;
  theme?: string;
  onClose: () => void;
  menuList: MenuType[];
}

const MenuPopup: React.FC<MenuPopupProps> = ({ visible, theme, onClose, menuList }) => {
  const { t } = useLanguage('common');
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
      
  // 切换展开状态
  const toggleExpand = (key: string) => {
      setExpandedItems(prev => ({
          ...prev,
          [key]: !prev[key]
      }));
  };

  useEffect(() => {
      menuList.forEach(item => {
          if (item.children?.some(child => child.path === currentPath)) {
            setExpandedItems(prev => ({ ...prev, [item.path]: true }));
          }
      });
  }, [currentPath, visible]);

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

  // 分离不同类型的菜单项
  const p1MenuList = menuList.filter(menu => !menu.type || menu.type === 'p1');
  const p2MenuList = menuList.filter(menu => menu.type === 'p2');
  const p3MenuList = menuList.filter(menu => menu.type === 'p3');

  return (
    <Popup
      visible={visible}
      onClose={onClose}
      closeOnMaskClick
      position="left"
      bodyStyle={{ width: '100vw' }}
      bodyClassName={`!text-[var(--text-color5)] ${theme?`!bg-[${theme}]` : '!bg-[var(--background9)]'}`}
    >
      <div
        className="leading-6 flex justify-end pt-[16px] pr-[16px] mb-[6.97px]"
        onClick={onClose}
      >
        <Iconify icon="mingcute:close-line" className="text-[24px] text-[#676867]" />
      </div>
    {/* p2 类型菜单 - 横向排列 */}
    {p2MenuList.length > 0 && (
        <div className="px-[20px] mt-[20px]">
          <div className="flex flex-wrap gap-[12px]">
            {p2MenuList.map((menu: MenuType) => {
              const active = currentPath === menu.path;
              return (
                <div
                  key={menu.path}
                  className={`flex flex-col items-center justify-center p-[16px] rounded-[8px] cursor-pointer transition-all duration-200 
                    
                  `}
                  // ${ active 
                  //   ? 'bg-[var(--theme-color)] text-white' 
                  //   : 'bg-[var(--background6)] hover:bg-[var(--background3)]' }
                  onClick={() => {
                    // 如果存在自定义点击事件，优先使用
                    if (menu.onClick) {
                      menu.onClick()
                    } else {
                      // 没有自定义点击事件时，执行路由跳转
                      handleMenuClick(menu.path)
                    }
                  }}
                  style={{ minWidth: '80px', flex: '1' }}
                >
                  <div className={`mb-[8px] ${active ? `${styles.active_show} text-[var(--theme-color)]` : 'text-[var(--text-color5)]'} 
                  ${styles.icon_transition}`}>
                    {typeof menu.icon === 'string' ? (
                      <Iconify icon={menu.icon} className="text-[24px]" />
                    ) : (
                      menu.icon
                    )}
                  </div>
                  <span 
                  className={`text-[12px] text-center `}>
                    {menu.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* p1 类型菜单 - 纵向排列 */}
      {p1MenuList.length > 0 && <ul className="pr-[20px]  mt-[20px]">
        {p1MenuList.map((menu: MenuType) => {
          let active = currentPath === menu.path;
          const isShow = expandedItems[menu.path];
          if (menu.children && menu.children.map(item => item.path).includes(currentPath)) {
            active = true
          }
          return (
            <>
            {menu.children ? 
              <>
                <li 
                  key={menu.path}
                  className={`${styles.user_menu_item} pr-4 ${active ? styles.active : ''} justify-between`}
                  onClick={() => toggleExpand(menu.path)}
                >
                  <div className="flex items-center h-full">
                    <div className={`${styles.left_border}`}></div>
                    {typeof menu.icon === 'string' ? (
                      <Iconify icon={menu.icon} className="text-[24px]" />
                    ) : (
                      menu.icon
                    )}
                    <span className="ml-[18px]">{menu.title}</span>
                  </div>
                  <Iconify icon={isShow ? 'icon-park-outline:up' : 'icon-park-outline:down'} className="text-[24px] text-[var(--text-color5)]"/>
                </li>
                {
                  isShow && <ul>
                    {
                        menu.children.map(child => {
                            const isChildActive = currentPath === child.path
                            return (
                                <li className={`${styles.user_menu_item} pl-[58px] tip-color ${isChildActive ? '!text-[var(--theme-color)] !font-medium' : 'font-[400]'}`}
                                onClick={() => handleMenuClick(child.path)}
                                >{child.title}</li>
                            )
                        })
                    }
                  </ul>
                }
              </> :
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
            }
            </>
          );
        })}
      </ul>}

      {p3MenuList.length > 0 &&<ul className="px-[16px] w-full">
        {p3MenuList.map((menu: MenuType) => {
          const active = currentPath === menu.path;
          return (
            <li
              key={menu.path}
              className={`${styles.user_menu_item3} ${active ? `${styles.active3}` : ''}`}
              onClick={() => handleMenuClick(menu.path)}
            >
              {/* <div className={`${styles.left_border}`}></div>
              {typeof menu.icon === 'string' ? (
                <Iconify icon={menu.icon} className="text-[24px]" />
              ) : (
                menu.icon
              )} */}
              <span className="ml-[18px]">{menu.title}</span>
            </li>
          );
        })}
      </ul>}
    </Popup>
  );
};

export default MenuPopup;
export type { MenuType, IconType };
