import React from 'react';
import UserInfo from '../components/overview/UserInfo';
import Assets from '../components/overview/Assets'
import SafeLogPage from '../components/overview/SafeLogin';
import EquipmentPage from '../components/overview/Equipment';
import InvitePage from '../components/overview/Invite';
import styles from './index.module.scss'
import { UserCenterLayout } from '@/components/MenuItems'

const Overview: React.FC = () => {
	return (
		<div className={styles.container}>
			<UserInfo />
			<Assets />
			<SafeLogPage />
			<EquipmentPage />
			<InvitePage />
		</div>
	);
};

export default UserCenterLayout(Overview);