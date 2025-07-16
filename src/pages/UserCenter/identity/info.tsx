import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Iconify } from '@/components/icon'
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import useQueryParams from '@/hooks/useQueryParams';
import appStore from '@/store';
import type { EventType } from '../components/identiry/BasicInfo';

import BasicInfo from '../components/identiry/BasicInfo';
import UploadCard from '../components/identiry/UploadCard';
import InReview from '../components/identiry/InReview';

const Security: React.FC = observer(() => {
	const { t } = useLanguage('userCenter');
	const [userInfo, setUserInfo] = useState<EventType>({} as EventType);
	// one: 基础信息 two: 证件上传 three: 提交审核
	const [progress, setProgress] = useState('one');
	const navigate = useNavigate();
	const { authStatus }  = useQueryParams();
	const { realnessStatus } = appStore.userInfo;
	const finalStatus = localStorage.getItem('identity_authStatus') || authStatus || realnessStatus;

	const handleProgress = (pro: string, info?: EventType) => {
		setProgress(pro);
		info && setUserInfo(info);
	}
	useEffect(() => {
		if (finalStatus.toString() === '1' || finalStatus.toString()  === '3') {
			handleProgress('two');
		} else {
			handleProgress('one');
		}
	}, [finalStatus]);
	return (
		<div className="p-4 flex flex-col h-full min-h-0 flex-1">
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
});

export default Security;
export const layout = 'header-only';