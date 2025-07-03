import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles/Header.module.scss';
import { useThemeMode } from '@/hooks/useThemeMode';
import userDay from '@/assets/icons/public/icon_user_day.png';
import userDark from '@/assets/icons/public/icon_user_dark.png';
import { Image } from 'antd-mobile';

const MenuItem: React.FC = observer(() => {
    const { isDayMode } = useThemeMode();
    const handleUserClick = () => {
		// 处理用户图标点击事件
		console.log('User icon clicked');
	};
    return (<>
        <button
            className={styles.iconButton}
            onClick={handleUserClick}
            aria-label="user"
        >
            <Image
                src={isDayMode ? userDay : userDark}
                alt="user"
                width={20}
                height={20} // 固定高度
            />
            {/* <UserOutline fontSize={24} color="#FFFFFF" /> */}
        </button>
    </>
    )
})

export default MenuItem;