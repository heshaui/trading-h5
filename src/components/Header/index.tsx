import { Image } from 'antd-mobile';
import { UserOutline, UnorderedListOutline } from 'antd-mobile-icons';
import { useLogoImage } from '@/hooks/useKv';
import styles from './styles/Header.module.scss';

import { useThemeMode } from '@/hooks/useThemeMode';
import MenuIcon from './MenuIcon';
import UserIcon from './UserIcon';

const Header = () => {
	const { logoUrl } = useLogoImage("");
	const { isDayMode } = useThemeMode();

	const handleUserClick = () => {
		// 处理用户图标点击事件
		console.log('User icon clicked');
	};

	const handleMenuClick = () => {
		// 处理菜单图标点击事件
		console.log('Menu icon clicked');
	};

	return (
		<div className={styles.headerContainer}>
			<div className={styles.headerContent}>
				{/* 左侧Logo */}
				<div className={styles.logo}>
					<Image
						src={logoUrl || ""}
						alt="home logo"
						width={140}
						height={28} // 固定高度
					// style={{ height: "28px", width: '140px' }} // 使用style控制宽度自适应
					// onError={() => setLogoUrl('')} // 图片加载失败时使用默认值
					/>
				</div>

				{/* 右侧图标 */}
				<div className={styles.iconGroup}>
					<div className={` flex-x-cc pr-4`}>
						<UserIcon />
					</div>
					<div className={`${styles.iconButtonBox} flex-x-cc pl-4`}>
						<MenuIcon />
					</div>
				</div>
			</div>
		</div>
	)
}

export default Header;