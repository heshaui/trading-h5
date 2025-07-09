import React from 'react';
import UserHeader from '../components/UserHeader';
import Auth from '../components/identiry/Auth';
import NoAuth from '../components/identiry/NoAuth';
import './index.scss'
import { useLanguage } from '@/hooks/useLanguage';
import IdentifyStatus from '../components/overview/UserInfo/IdentifyStatus';

const Identity: React.FC = () => {
	const { t } = useLanguage('userCenter');
   const isAuth = false;
	return (
		<div>
			<UserHeader title={t('safeCenter.security')} />
			{
            isAuth ? <Auth /> : <NoAuth />
         }
		</div>
	);
};

export default Identity;