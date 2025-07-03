import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import UserHeader from '../components/UserHeader';
import UserInfo from '../components/overview/UserInfo';
import styles from './index.module.scss'

const Overview: React.FC = () => {
	const { t } = useLanguage();

	return (
		<div>
			<UserHeader title="safeCenter.overView" />
			<div className={styles.container}>
				<UserInfo />
			</div>
		</div>
	);
};

export default Overview;