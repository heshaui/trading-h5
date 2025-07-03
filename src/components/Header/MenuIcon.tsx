import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles/Popup.module.scss';
import { useThemeMode } from '@/hooks/useThemeMode';
import menuDay from '@/assets/icons/public/icon_menu_day.png';
import menuDark from '@/assets/icons/public/icon_menu_dark.png';
import { Image,Popup,Dropdown } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';

const MenuIcon: React.FC = observer(() => {
    const { isDayMode } = useThemeMode();
    const [visible, setVisible] = useState(false);
    const handleMenuClick = () => {
            // 处理菜单图标点击事件
            setVisible(true);
    };
    return (<>
        <button
            className={styles.iconButton}
            onClick={handleMenuClick}
            aria-label="menu"
        >
            <Image
                src={isDayMode ? menuDay : menuDark}
                alt="menu"
                width={20}
                height={20} // 固定高度
            />
        </button>
        <Popup
            visible={visible}
            onClose={() => setVisible(false)}
            // destroyOnClose
            closeOnMaskClick
            position='left'
            bodyStyle={{ width: '100vw' }}
            bodyClassName={styles.popContainer}
        >
            <div>
                <div className={`${styles.pop_header} flex-x algin-center justify-end w-full`}>
                <button onClick={()=>{
                    setVisible(false);
                }}
                className={styles.tip_color}
                >
                    <CloseOutline fontSize={24} />
                </button>
                </div>
                <div>
                
                </div>

            </div>
        </Popup>
    </>
    )
})

export default MenuIcon;