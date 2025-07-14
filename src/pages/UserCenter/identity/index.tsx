import React, { useState, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { UserCenterLayout } from '@/components/MenuItems/'
import Certified from '../components/identiry/Certified';
import NoCertified from '../components/identiry/NoCertified';
import Faq from '../components/identiry/faq';
import { useLanguage } from '@/hooks/useLanguage';
import { getUserIdentityInfo, getLevelBenefitDetail } from '@/services/identity';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig"

const Identity: React.FC = () => {
	const { t } = useLanguage('userCenter');
	const [userIdentityInfo, setUserIdentityInfo] = useState<any>({
		authStatus: 2,
	});
	const [levelBenefitData, setLevelBenefitData] = useState([]);
	const getUserIdentityInfoData = async () => {
		const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}');
		try {
			const res = await getUserIdentityInfo({
				userId: userInfo.userId || ''
			});
			if (res.code === '0') {
				setUserIdentityInfo(res.data);
				localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, userInfo, res.data)))

				if (res.data.authStatus === 1) {
					getLevelBenefitData(userInfo.userId);

				} else {
					getLevelBenefitData(null);
				}
			}
		} catch (error) {
			Toast.show({
				icon: 'fail',
				content: String(error),
			})
		}
	}
	const getLevelBenefitData = async (userId: string | number | null) => {
		try {
			const res = await getLevelBenefitDetail({
				userId: userId || ''
			});
			if (res.code === '0') {
				const benefitData = transformData(res.data)
				setLevelBenefitData(benefitData);
			}
		} catch (error) {
			Toast.show({
				icon: 'fail',
				content: String(error),
			})
		}
	}

	const transformData = (data: any) => {
		return data.map((item: any) => {
		// 创建基础对象，包含 benefitId 和 benefitName
		const result = {
			benefitId: item.benefitId,
			benefitName: item.benefitName,
			benefitValue: item.benefitValue,
			// 初始化默认值
			status0: null,
			value0: null,
			params0: null,
			status1: null,
			value1: null,
			params1: null
		};

		// 遍历 levelBenefits 数组，根据 levelId 设置对应的属性
		item.levelBenefits.forEach((benefit: any) => {
			if (benefit.levelValue === "L0") {
			// 未认证
			result.status0 = benefit.status;
			result.value0 = benefit.value;
			result.params0 = benefit.params;
			} else if (benefit.levelValue ==="L1") {
			// 已认证
			result.status1 = benefit.status;
			result.value1 = benefit.value;
			result.params1 = benefit.params;
			}
		});

		return result;
		});
	}

	useEffect(() => {
		getUserIdentityInfoData();
	}, []);
    return (
		<div className="pb-[30px] pt-[10px] px-4">
			<h3 className="leading-7 text-[20px] font-medium mb-4">{ t('safeCenter.identity') }</h3>
			{/* 0驳回 1已认证 2未认证 3审核中 */}
			{/* 未认证 - 驳回 - 审核中*/}
			{/* {(userIdentityInfo?.authStatus === 2||userIdentityInfo?.authStatus === 0||userIdentityInfo?.authStatus === 3) && <NoAuthentication identityInfo={userIdentityInfo}/>} */}
			{/* 已认证 */}
			{
				userIdentityInfo?.authStatus === 1 ? 
				<Certified identityInfo={userIdentityInfo} levelBenefit={levelBenefitData} /> : 
				<NoCertified identityInfo={userIdentityInfo} levelBenefit={levelBenefitData}/>
			}
			<Faq />
		</div>
	);
};

export default UserCenterLayout(Identity);