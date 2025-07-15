import React, { useState, useEffect } from 'react';
import { Iconify } from '@/components/icon'
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import type { EventType } from '../components/identiry/BasicInfo';

import BasicInfo from '../components/identiry/BasicInfo';
import UploadCard from '../components/identiry/UploadCard';
import InReview from '../components/identiry/InReview';

const Security: React.FC = () => {
	const { t } = useLanguage('userCenter');
	const [userInfo, setUserInfo] = useState<EventType>({} as EventType);
	// one: 基础信息 two: 证件上传 three: 提交审核
	const [progress, setProgress] = useState('one');
	const navigate = useNavigate();

	const handleProgress = (pro: string, info?: EventType) => {
		setProgress(pro);
		info && setUserInfo(info);
	}
	return (
		<div className="p-4">
			<div className="leading-5 text-[14px] h-5 flex items-center mb-4">
				{/* 身份认证 */}
				<button className="tip-color" onClick={() => navigate('/userCenter/identity')}>{ t('safeCenter.identity') }</button>
				<span className="mx-1 tip-color">/</span>
				{/* 认证信息 */}
				<span>{ t('identity.realName.title') }</span>
			</div>
			{progress === 'one' && <BasicInfo onNext={info => handleProgress('two', info)} />}
			{progress === 'two' && <UploadCard onNext={() => handleProgress('three')} onPrev={() => handleProgress('one') } userInfo={userInfo} />}
			{progress === 'three' && <InReview />}
		</div>
	);
};

export default Security;
export const layout = 'header-only';