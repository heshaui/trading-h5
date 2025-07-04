import React from 'react';
import UserHeader from '../components/UserHeader';
import UserInfo from '../components/overview/UserInfo';
import Assets from '../components/overview/Assets'
import SafeLogPage from '../components/overview/SafeLogin';
import EquipmentPage from '../components/overview/Equipment';
import InvitePage from '../components/overview/Invite';
import styles from './index.module.scss'

const Overview: React.FC = () => {
	return (
		<div>
			<UserHeader title="safeCenter.overView" />
			<div className={styles.container}>
				<UserInfo />
				<Assets />
				<SafeLogPage />
				<EquipmentPage />
				<InvitePage />
			</div>
		</div>
	);
};

export default Overview;