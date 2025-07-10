import React from 'react';
import SafeCenter from '../components/security/SafeCenter/index.';
import { useLanguage } from '@/hooks/useLanguage';
import { UserCenterLayout } from '@/components/MenuItems/'

const Setting: React.FC = () => {
	const { t } = useLanguage('userCenter');
	return (
		<div className="py-6 px-4 bg-[var(--btnbgcolor3)]">
			<h3 className="leading-7 text-[20px] font-medium mb-4">{ t('account.userCenter') }</h3>
			<div className="bg-[var(--background8)] rounded-lg pt-5">
				<SafeCenter />
			</div>
		</div>
	);
};

export default UserCenterLayout(Setting);