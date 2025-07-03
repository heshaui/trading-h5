import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import UserHeader from '../components/UserHeader';
import UserInfoCard from '../components/overview/UserInfoCard';
import IdentityStatus from '../components/overview/IdentityStatus';
import SecurityStatus from '../components/overview/SecurityStatus';

const Overview: React.FC = () => {
	const { t } = useLanguage();
	// 这里可以添加用户数据的获取逻辑
	const mockUserData = {
		username: 'John Doe',
		email: 'john.doe@example.com',
		identityStatus: 'unverified' as const,
		securityStatus: {
			loginPassword: true,
			emailVerified: true,
			googleAuth: false
		}
	};

	const handleVerify = () => {
		console.log('Navigate to verify page');
	};

	const handleSecuritySetting = (type: 'password' | 'email' | 'google') => {
		console.log('Navigate to security setting:', type);
	};

	return (
		<div className="overview-page">
			<UserHeader title="safeCenter.overView" />
			<div className="overview-content">
				<UserInfoCard
					username={mockUserData.username}
					email={mockUserData.email}
					identityStatus={mockUserData.identityStatus}
				/>
				<IdentityStatus
					status={mockUserData.identityStatus}
					onVerify={handleVerify}
				/>
				<SecurityStatus
					{...mockUserData.securityStatus}
					onSettingClick={handleSecuritySetting}
				/>
			</div>
		</div>
	);
};

export default Overview;