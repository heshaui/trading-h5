import React from 'react';
import { Image } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

import checkImg from '@/assets/images/userCenter/identity/icon_checking.png';

const InReview: React.FC = () => {
	const { t } = useLanguage('userCenter');
	const navigate = useNavigate();
	return (
		<div className="flex flex-col flex-1">
			<h3 className="text-[24px] leading-[34px] font-medium mb-[30px] shrink-0">
				{/* 已提交 */}
				{ t('identity.realName.setUPTitle3') }
			</h3>
			<div className="flex-1 flex flex-col justify-center items-center w-full px-[25px]">
				<Image src={ checkImg } className="w-[160px] h-[160px]" />
				<p className="leading-[28px] text-[20px] font-medium">
					{/* 审核中 */}
					{t('identity.sumbit.title')}
				</p>
				<p className="text-[14px] leading-[20px] mt-4">
					{/* 我们正在审核您的申请。通过审核之后，我们会发送邮件通知您。 等候期间，欢迎浏览我们的网页/App */}
					{t('identity.sumbit.content')}
				</p>
			</div>
			<div className="shrink-0 w-full">
				<button 
					className="w-full h-[50px] flex justify-center items-center bg-[var(--theme-color)] text-[#fff] text-[16px] font-medium"
					onClick={() => navigate('/')}
				>
					{/* 回到首页 */}
					{t('identity.sumbit.goHome')}
				</button>
			</div>
		</div>
	)
}

export default InReview;