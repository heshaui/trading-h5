import React from 'react';
import { Iconify } from '@/components/icon'
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import CustomTab from '@/components/CustomTab';
import LoginRecord from "../components/security/SafeLog/LoginRecord";
import SafeSet from "../components/security/SafeLog/SafeSet";
import './index.scss'

export const layout = 'header-only';
const Security: React.FC = () => {
	const { t } = useLanguage('userCenter');
	const navigate = useNavigate();
	const tabsItems = [
		{
			key: '1',
			title: t('security.safeSet.loginRecord'),//'语言',
			children: <LoginRecord />
		},
		{
			key: '2',
			title: t('security.safeSet.safeSetRecord'),//'语言',
			children: <SafeSet />
		},
	]
	return (
		<>
			<h3 className="pl-4 text-[20px] h-[60px] flex items-center font-medium border-b border-b-[var(--border-color6)]" onClick={() => navigate(-1)}>
				<Iconify icon="icon-park-outline:left" className="text-[24px]"/>
				<span className="ml-1">{ t('security.securityDevice') }</span>
			</h3>
			<CustomTab
				tabsItems={ tabsItems }
				stretch={false}
				activeLineMode='fixed'
				className="safeTabs"
            />
		</>
	);
};

export default Security;