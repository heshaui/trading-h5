import React from 'react';
import UserHeader from '../components/UserHeader';
import SafeCenter from '../components/security/SafeCenter/index.';
import { useLanguage } from '@/hooks/useLanguage';

const Security: React.FC = () => {
	const { t } = useLanguage('userCenter');
	return (
		<div>
			<UserHeader title={t('safeCenter.security')} />
			<div className="py-6 px-4 bg-[var(--btnbgcolor3)]">
				<h3 className="leading-7 text-[20px] font-medium mb-4">{ t('safeCenter.security') }</h3>
				<div className="bg-[var(--background8)] rounded-lg pt-5">
					<SafeCenter />
				</div>
			</div>
		</div>
	);
};

export default Security;