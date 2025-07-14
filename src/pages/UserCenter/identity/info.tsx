import React from 'react';
import { Iconify } from '@/components/icon'
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

const Security: React.FC = () => {
	const { t } = useLanguage('userCenter');
	const navigate = useNavigate();
	return (
		<div className="p-4">
			<div className="leading-5 text-[14px] h-5 flex items-center mb-4">
				{/* 身份认证 */}
				<button className="tip-color" onClick={() => navigate('userCenter/identity')}>{ t('safeCenter.identity') }</button>
				<span className="mx-1 tip-color">/</span>
				{/* 认证信息 */}
				<span>{ t('identity.realName.title') }</span>
			</div>
			<h3 className="text-6 leading-[34px] font-medium mb-3">
				{/* 基本信息 */}
				{ t('identity.realName.setUPTitle1') }
			</h3>
		</div>
	);
};

export default Security;
export const layout = 'header-only';