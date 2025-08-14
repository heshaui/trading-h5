import React, { useEffect, useState } from 'react';
import { Image, Toast, Skeleton } from 'antd-mobile';
import dayjs from 'dayjs';

import { Iconify } from "@/components/icon"
import { useLanguage } from '@/hooks/useLanguage';
import { getLoginUserInfo, getUserCenter, updateUserCenter } from '@/services/userCenter';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import appStore from '@/store';

import NickNameIcon from '@/assets/images/userCenter/userSettings/icon_nickname.svg';
import AvatarIcon from '@/assets/images/userCenter/userSettings/icon_avatar.svg';
import UserIcon from '@/assets/icons/userCenter/icon_user.svg';
import BrithdayIcon from '@/assets/images/userCenter/userSettings/icon_brithday.svg';

import NickNameModal from './NickNamePopup';
import BirthdayModal from './BrithdayPopup';
import AvatarUrlModal from './AvatarUrlPopup';


// 安全项配置接口
interface SafeListItem {
  title: string;
  type: string;
  desc: string;
  isBind?: boolean;
  bindValue: string;
  onok?: () => void;
  icon: string;  // 可选的图标路径
}

const UserCenter: React.FC = () => {
	const { t, currentLanguage } = useLanguage('userCenter');
	const [loadingSkeleton, setLoadingSkeleton] = useState(false)
	const [necknameOpen, setNecknameOpen] = useState(false);
    const [avatarUrlOpen, setAvatarUrlOpen] = useState(false);
    const [birthdayOpen, setBirthdayOpen] = useState(false);
	const userInfoList: SafeListItem[] =  [
		{
			title: t('account.nickname'),
			type: "nickname",
			desc: t('account.nicknameDesc'),
			isBind: true,
			bindValue: "",
			icon: NickNameIcon,
			onok: () => setNecknameOpen(true),
		},
		{
			title: t('account.avatar'),
			type: "avatarUrl",
			desc: t('account.avatarDesc'),
			isBind: false,
			bindValue: UserIcon,
			icon: AvatarIcon,
			onok: () => setAvatarUrlOpen(true),
		},
		{
			title: t('account.birthday'),
			type: "birthday",
			desc: t('account.birthdayDesc'),
			isBind: true,
			bindValue: "",
			icon: BrithdayIcon,
			onok: () => setBirthdayOpen(true),
		},
	]

	const [userCenterData, setUserCenterData] = useState<SafeListItem[]>(userInfoList);
	const [userInfo, setUserInfo] = useState({
		userId: 0,
		nickname: "",
		avatarUrl: "",
		birthday: "",
	});

	const getUserCenterData = async () => {
		setLoadingSkeleton(true)
		try {
			const res = await getUserCenter();
			const { code, data } = res;
			if (code === '0') {
				setLoadingSkeleton(false)
				setUserInfo(data);
				const localUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
				localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, localUserInfo, data)))
				// 遍历 userInfoList
				const updatedUserInfoList = userInfoList.map(item => {
				if (data.hasOwnProperty(item.type)) {
					if (item.type === 'birthday') {
					const value = data[item.type];
					return {
						...item,
						bindValue: value ? dayjs(value).format('YYYY/MM/DD') : '',
						isBind: Boolean(value),
					};
					}
					const value = data[item.type];
					return {
					...item,
					bindValue: value,
					isBind: Boolean(value),
					};
				}
				return item;
				});
				setUserCenterData(updatedUserInfoList);
			}
		} catch (error) {
			setLoadingSkeleton(false)
			Toast.show({
				icon: 'fail',
				content: String(error),
			})
		}
	};
	const handOk = async (bool: boolean) => {
		await getUserCenterData();
	}

	useEffect(() => {
		getUserCenterData();
	}, [currentLanguage])

	return (
		<ul className="border-b border-[var(--border-color4)] px-4">
			{
				userCenterData.map((item: SafeListItem) => {
					return loadingSkeleton ?
					(
						<li className="px-5" key={item.type}>
							<Skeleton.Title />
							<Skeleton.Paragraph animated />
						</li>
					) :
					(
						<li className="flex justify-between items-center mb-5" key={item.type}>
							<div className="flex items-center flex-1">
								<img
									src={item.icon}
									alt="safe_device"
									className="w-[28px] h-[28px] mr-[10px]"
								/>
								<div>
									<h4 className="leading-[22px] text-[16px] font-medium mb-[2px]"> {item.title} </h4>
									<p className="leading-[17px] text-[12px] font-normal text-[var(--text-color6)]">{item.desc}</p>
								</div>
							</div>
							<div className="flex shrink-0 items-center" onClick={item.type === 'birthday' && item.bindValue ? ()=> '' : item.onok}>
								{item.type === "avatarUrl" ?
									<div className="ml-[55px]">
										{
											item.isBind ?
											<Image src={item.bindValue} fit="cover" className="!w-[20px] !h-[20px] rounded-full" alt="avatar" />
											:
											<Iconify icon="teenyicons:user-circle-outline" className="text-[20px]" />
										}
									</div>
									:
									<p className="text-[14px] flex-1 min-w-0 max-w-[112px] truncate ml-[10px]">{item.bindValue || '-'}</p>
								}
								{ 
									item.type === 'birthday' && item.bindValue ? '' : <Iconify icon="mingcute:right-line" className="text-[16px] font-medium ml-1 text-[#9e9e9e]" />
								}
							</div>
						</li>
					)
				})
			}
			{/* 修改昵称 */}
			<NickNameModal
				open={necknameOpen}
				onCancel={() => setNecknameOpen(false)}
				nicknameInfo={userInfo}
				onOk={handOk} 
			/>

			{/* 修改头像 */}
			<AvatarUrlModal 
				open={avatarUrlOpen}
				onCancel={() => setAvatarUrlOpen(false)}
				userId={userInfo.userId}
				currentAvatar={ userInfo.avatarUrl }
				onOk={handOk} 
			/>

			{/* 修改生日 */}
			<BirthdayModal 
				open={birthdayOpen} 
				userId={userInfo.userId}
				onCancel={() => setBirthdayOpen(false)}
				onOk={handOk}
			/>
		</ul>
	);
};

export default UserCenter;