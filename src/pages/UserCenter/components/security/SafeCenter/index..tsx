import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Toast } from 'antd-mobile';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Image } from 'antd-mobile'

import { getSafeCenter, getPhoneClose } from "@/services/safeCenter";
import { encryptString, encryptData } from "@/utils/encrypt";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import appStore from "@/store";

import GoogleIcon from '@/assets/images/userCenter/safe/icon_google.svg';
import PhoneIcon from '@/assets/images/userCenter/safe/icon_phone.svg';
import EmailIcon from '@/assets/images/userCenter/safe/icon_email.svg';
import PasswordIcon from '@/assets/images/userCenter/safe/icon_password.svg';
import EquipmentIcon from '@/assets/images/userCenter/safe/equipment.svg';
import SecurityIcon from '@/assets/images/userCenter/safe/icon_security_og.svg';
import CheckIcon from '@/assets/images/userCenter/safe/check.svg';
import CloseIcon from '@/assets/images/userCenter/safe/close.svg';

import BindGoogleModal from '../Modal/BindGoogleModal';
import SetPhoneModal from '../Modal/SetPhoneModal';
import SetMailModal from "../Modal/SetMailModal";
import CheckModal from '../Modal/CheckModal';
import SetLockModal from '../Modal/SetLockModal';
import LockSafeModal from '../Modal/LockSafeModal';


// 按钮配置接口
interface ButtonConfig {
  title: string;
  key: string;
  onok?: () => void;
  onbind?: () => void;
}

// 安全项配置接口
interface SafeListItem {
  title: string;
  type: string;
  desc: string;
  isBind: boolean;
  bindValue: string;
  noBindValue: string;
  bindBtn: ButtonConfig[];
  noBindBtn: ButtonConfig[];
  icon: string; // 可选的图标路径
}
// 安全日志项接口
interface SecurityLogItem {
  title: string;
  desc: string;
  tip: string;
  value: string;
  btntext: string;
  icon: string;
  type: string;
  button: () => void;
}

interface SafeDataType {
  phone?: string;
  email?: string;
  countryCode?: string;
  googleCode?: boolean;
  password?: boolean;
  deviceNos?: string;
  recentIp?: string;
  userId?: string;
  type?: string;
}
// 手机
//  -关闭-1确认弹窗-2安全验证
//  -修改-1确认弹窗-2安全验证-3添加/修改手机号
//  -绑定-1确认弹窗-2添加/修改手机号

// 邮箱
//  -修改-1确认弹窗-2安全验证-3添加/修改邮箱
//  -绑定-1确认弹窗-2添加/修改邮箱

const SafeCenter: React.FC = observer(() => {
	const { t } = useLanguage('userCenter');
	const navigate = useNavigate();
	const [safeData, setSafeData] = useState<SafeDataType>({});
	const [phoneModalOpen, setPhoneModalOpen] = useState(false); // 手机修改/设置弹窗
	const [phoneType, setPhoneType] = useState("");
	const [mailModalOpen, setMailModalOpen] = useState(false); // 邮箱修改/设置弹窗
	const [mailType, setMailType] = useState("");
	const [lockModalOpen, setLockModalOpen] = useState(false); // 密码修改/设置弹窗
	const [lockType, setLockType] = useState("");
	const [checkModalOpen, setCheckModalOpen] = useState(false);
	const [checkType, setCheckType] = useState("");
	const [safeModalOpen, setSafeModalOpen] = useState(false);
	const [safeType, setSafeType] = useState("");
	const [lockSafeModalOpen, setLockSafeModalOpen] = useState(false); // 密码修改-安全验证
	const [lockSafeType, setLockSafeType] = useState("");
	const [mailSafeModalOpen, setMailSafeModalOpen] = useState(false);
	const [phoneSafeModalOpen, setPhoneSafeModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingSkeleton, setLoadingSkeleton] = useState(true);
	const [unbindGoogleModalOpen, setUnbindGoogleModalOpen] = useState(false);
	const [BindGoogleModalOpen, setBindGoogleModalOpen] = useState(false);
	const kvConfigKey = appStore.getKvConfig("out_money");
	const langKey = appStore.getLang();

	// 基础安全
	const initBaseSafeList: SafeListItem[] = [
		{
			title: t("security.googleAuth"),
			type: "googleCode",
			/* 用于登录、提现、修改安全设置等安全验证。若经常收不到短信验证码，建议绑定谷歌验证器。 */
			desc: t("security.googleAuthDesc"),
			isBind: false,
			/* 启用 */
			bindValue: t("security.enabled"),
			/* 未绑定 */
			noBindValue: t("security.notBound"),
			icon: GoogleIcon,
			bindBtn: [
				{
					/* 解绑 */
					title: t("security.unbind"),
					onok: () => {
						setCheckModalOpen(true);
						setCheckType("4");
					},
					key: "close",
				},
				{
					/* 已启用 */
					title: t("security.enabled_status"),
					onok: () => {},
					key: "open",
				},
			],
			noBindBtn: [
				{
					/* 绑定 */
					title: t("security.bind"),
					onbind: () => {
						setBindGoogleModalOpen(true);
					},
					key: "bind",
				},
			],
		},
		{
			/* 手机验证 */
			title: t("security.phoneAuth"),
			type: "phone",
			/* 短信验证码将保护您的账户与交易安全。修改绑定手机号后，支付、提现等功能将禁用24小时。 */
			desc: t("security.phoneAuthDesc2", { time: kvConfigKey || 24 }),
			isBind: false,
			bindValue: "--",
			/* 未绑定 */
			noBindValue: t("security.notBound"),
			icon: PhoneIcon,
			bindBtn: [
				{
					/* 修改 */
					title: t("security.modify"),
					onok: () => {
						setCheckModalOpen(true);
						setCheckType("0");
					},
					key: "change",
				},
				{
					/* 关闭验证 */
					title: t("security.closeVerify"),
					onok: () => {
						setCheckModalOpen(true);
						setCheckType("1");
					},
					key: "close",
				},
			],
			noBindBtn: [
				{
					/* 绑定 */
					title: t("security.bind"),
					onbind: () => {
						setPhoneModalOpen(true);
						setPhoneType("set");
					},
					key: "bind",
				},
			],
		},
		{
			/* 邮箱验证 */
			title: t("security.emailAuth"),
			type: "email",
			/* 邮箱验证码将保护您的账户与交易安全。修改绑定邮箱后，支付、提现等功能将禁用24小时。 */
			desc: t("security.emailAuthDesc2", { time: kvConfigKey || 24 }),
			isBind: false,
			bindValue: "--",
			/* 未绑定 */
			noBindValue: t("security.notBound"),
			icon: EmailIcon,
			bindBtn: [
				{
					/* 修改 */
					title: t("security.modify"),
					onok: () => {
						setCheckModalOpen(true);
						setCheckType("2");
					},
					key: "change",
				},
			],
			noBindBtn: [
				{
					/* 绑定 */
					title: t("security.bind"),
					onbind: () => {
						setMailModalOpen(true);
						setMailType("set");
						// setSafeAccount({
						//     ...safeData,
						//     type: safeData?.email ? 'email' : 'phone',
						// })
					},
					key: "bind",
				},
			],
		},
		{
			/* 登录密码 */
			title: t("security.loginPassword"),
			type: "password",
			/* 重置时自动退出当前账号 */
			desc: t("security.loginPasswordDesc"),
			isBind: false,
			/* 已设置 */
			bindValue: t("security.set"),
			/* 未设置 */
			noBindValue: t("security.notSet"),
			icon: PasswordIcon,
			bindBtn: [
				{
					/* 修改 */
					title: t("security.modify"),
					onok: () => {
						setCheckModalOpen(true);
						setCheckType("3");
					},
					key: "change",
				},
			],
			noBindBtn: [
				{
					/* 设置 */
					title: t("security.setAction"),
					onbind: () => {
						setCheckModalOpen(true);
						setCheckType("5");
					},
					key: "bind",
				},
			],
		},
	];
	const [baseSafeList, setBaseSafeList] = useState<SafeListItem[]>(initBaseSafeList);
	// 安全日志
	const initSecurityLogList: SecurityLogItem[] = [
		{
			/* 安全设备 */
			title: t("security.securityDevice"),
			/* 管理已授权允许登录的设备。 */
			desc: t("security.securityDeviceDesc"),
			/* 授权设备数： */
			tip: t("security.deviceCount"),
			value: "--",
			/* 管理 */
			btntext: t("security.manage"),
			icon: EquipmentIcon,
			type: "deviceNos",
			button: () => {
				navigate(`/userCenter/security/safeEquipment`);
			},
		},
		{
			/* 安全日志 */
			title: t("security.securityLog"),
			/* 用于登录等IP地址安全。 */
			desc: t("security.securityLogDesc"),
			/* 最近登录IP地址： */
			tip: t("security.lastLoginIp"),
			value: "--",
			/* 查看 */
			btntext: t("security.view"),
			icon: SecurityIcon,
			type: "recentIp",
			button: () => {
				if (!safeData) return Toast.show({
					icon: 'loading',
					content: 'loading...',
				});
				navigate(`/userCenter/security/safeLog`);
			},
		},
	];
	const [securityLogList, setSecurityLogList] = useState<SecurityLogItem[]>(initSecurityLogList);

	// 确认弹窗后续操作
	const handCheckModal = async (type: string) => {
		// 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:设置/修改密码 4:关闭谷歌验证 5:设置密码
		if (type.toString() === "0") {
			// 手机修改-2验证安全弹窗
			setPhoneSafeModalOpen(true);
			setSafeType("0");
		} else if (type.toString() === "1") {
			// 关闭手机-2安全验证弹窗
			setPhoneSafeModalOpen(true);
			setSafeType("1");
		} else if (type.toString() === "2") {
			// 修改邮箱-2验证安全弹窗
			setMailSafeModalOpen(true);
			setSafeType("2");
		} else if (type.toString() === "3" || type.toString() === "5") {
		// 修改密码-2验证安全弹窗
			setLockSafeModalOpen(true);
			setSafeType("3");
		} else if (type.toString() === "4") {
			setUnbindGoogleModalOpen(true);
		}
	};

	// 安全校验完毕
	const handsvcOk = async (type: string) => {
		// 0:修改手机号 1:关闭手机验证 2:修改邮箱
		if (type === "0") {
			// 手机修改-3添加/修改手机号弹窗
			setPhoneModalOpen(true);
			setPhoneType("change");
		} else if (type === "1") {
			// 手机关闭-2关闭接口
			await handPhoneClose();
		} else if (type === "2") {
			// 邮箱修改-3修改邮箱弹窗
			setMailModalOpen(true);
			setMailType("change");
		} else if (type === "3") {
			// 密码修改-3添加/修改密码弹窗
			setLockModalOpen(true);
			setLockType("change");
		}
	};

	// 关闭手机
	const handPhoneClose = async () => {
		try {
		const dataInfo = {
			isPhoneAuth: 0,
			type: 3,
			platformType: "Web",
		};
		const dataEncrypt = await encryptData(dataInfo);
		const res = await getPhoneClose(dataEncrypt);
		if (res.code === "0") {
			Toast.show({
                icon: 'success',
                content: t("success") || res.message,
            })
			await getSafeCenterData();
		} else {
			Toast.show({
				icon: 'fail',
				content: res.message,
			})
		}
		} catch (error) {
			Toast.show({
				icon: 'fail',
				content: String(error),
			})
		}
	};

	 // 检查安全验证方式的数量
	const checkMethodsCount = (data: SafeDataType) => {
		let count = 0;
		if (data.phone) count++;
		if (data.email) count++;
		if (data.googleCode) count++;
		return count;
	};
	// 获取安全中心数据
	const getSafeCenterData = async () => {
		setLoading(true);
		try {
			const res = await getSafeCenter();
			const { code, data } = res;
			if (code === "0") {
				setLoadingSkeleton(false);
				setSafeData(data);
				const localUserInfo = JSON.parse(
					localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || "{}"
				);
				localStorage.setItem(
					LOCAL_STORAGE_KEY.USER_INFO,
					JSON.stringify(Object.assign({}, localUserInfo, data))
				);
				const securityMethodsCount = checkMethodsCount(data);
				const baseSafeData = initBaseSafeList.map((item: SafeListItem) => {
				if (data.hasOwnProperty(item.type)) {
					// 判断是否有足够的安全验证方式允许解绑
					// 只有当安全验证方式数量大于2时才允许解绑
					const canUnbind = securityMethodsCount > 2;
					if (item.type === "googleCode") {
					const value = data[item.type];
					// 如果只有一种安全验证方式，且当前是googleCode，则过滤掉close按钮
					const filteredBindBtn = !canUnbind
						? item.bindBtn.filter((btn) => btn.key !== "close")
						: item.bindBtn.filter((btn) => btn.key !== "open");
					return {
						...item,
						bindValue: t("security.enabled"), //'启用',
						isBind: Boolean(value),
						bindBtn: filteredBindBtn,
					};
					}
					if (item.type === "password") {
					const value = data[item.type];
					return {
						...item,
						bindValue: t("security.set"), //'已设置',
						isBind: Boolean(value),
					};
					}
					if (item.type === "phone" || item.type === "email") {
					const value = data[item.type];
					// 如果只有2种安全验证方式，且当前是phone或email，则过滤掉close按钮
					const filteredBindBtn = !canUnbind
						? item.bindBtn.filter((btn) => btn.key !== "close")
						: item.bindBtn;
					return {
						...item,
						bindValue: encryptString(value),
						isBind: Boolean(value),
						bindBtn: filteredBindBtn,
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
				const securityLogData = initSecurityLogList.map(
				(item: SecurityLogItem) => {
					if (data.hasOwnProperty(item.type)) {
					const value = data[item.type];
					return {
						...item,
						value: value,
						bindValue: value,
						isBind: Boolean(value),
					};
					}
					return item;
				}
				);
				// console.log(baseSafeData, 1);
				// console.log(securityLogData, 2);

				setBaseSafeList(baseSafeData);
				setSecurityLogList(securityLogData);
			} else {
				Toast.show({
					icon: 'fail',
					content: res.message,
				})
			}
			setLoading(false);
		} catch (error) {
			setLoading(false);
			Toast.show({
				icon: 'fail',
				content: String(error),
			})
		}
	};
	// 重新获取安全中心数据
	const handOk = async () => {
		await getSafeCenterData();
	};
	// 修改密码成功后
	const changeLock = () => {
		appStore.clearUserInfo();
		appStore.clearUserToken();
		navigate("/login");
	};

	useEffect(() => {
		// getSafeCenterData();
	}, [langKey]);

	return (
		<>
			{/**基础安全 */}
			<h3 className="text-[18px] leading-[25px] font-medium pl-5">{ t("security.basicSecurity") }</h3>
			<ul className="border-b border-[var(--border-color4)] mb-5">
				{
					baseSafeList.map((item: SafeListItem) => {
						return loading ?
						(
							<li className="px-5">
								<Skeleton.Title />
        						<Skeleton.Paragraph />
							</li>
						) :
						(
							<li className="p-5 flex">
								<div className="shrink-0 mr-[14px]">
									<img
										src={item.icon}
										alt="safe_device"
										className="w-[28px] h-[28px]"
									/>
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="leading-[22px] text-[16px] font-medium mb-[2px]"> {item.title} </h4>
									<p className="leading-[17px] text-[12px] font-normal mb-[21px] text-[var(--text-color6)]">{item.desc}</p>
									<div className="flex justify-between items-center">
										<div className="leading-[22px] text-[16px] font-medium flex items-center flex-1 min-w-0">
											{item.isBind ? (
												<>
													<Image
														src={ CheckIcon }
														alt="safe_device"
														className="w-[20px] h-[20px] mr-2 shrink-0"
													/>
													<div className="flex-1 min-w-0 truncate">{item.bindValue}</div>
												</>
												) : (
												<>
													<Image
														src={ CloseIcon }
														alt="safe_device"
														className="w-[20px] h-[20px] mr-2"
													/>
													<div className="flex-1 min-w-0 truncate">{item.noBindValue}</div>
												</>
											)}
										</div>
										<div className="shrink-0 ml-[10px]">
											{item.isBind &&
												Array.isArray(item.bindBtn) &&
												item.bindBtn.length > 0 &&
												item.bindBtn.map((btn: ButtonConfig, index: number) => (
													<button
														className="min-w-[80px] h-[32px] border border-solid border-[var(--theme-color)] text-[var(--theme-color)] text-[14px] font-medium px-[26px] py-[6px] leading-[20px] rounded-[16px]"
														key={index}
														onClick={btn.onok}
													>
														{btn.title}
													</button>
												))
											}
											{!item.isBind &&
												Array.isArray(item.noBindBtn) &&
												item.noBindBtn.length > 0 &&
												!item.isBind &&
												item.noBindBtn.map((btn: ButtonConfig, index: number) => (
													<button
														className="min-w-[80px] h-[32px] border border-solid border-[var(--theme-color)] text-[var(--theme-color)] text-[14px] font-medium px-[26px] py-[6px] leading-[20px] rounded-[16px]"
														key={index}
														onClick={btn.onbind}
													>
														{btn.title}
													</button>
												))
											}
										</div>
									</div>
								</div>
							</li>
						)
					})
				}
			</ul>
			{/**安全日志 */}
			<h3 className="text-[18px] leading-[25px] font-medium pl-5"> { t("security.securityLog") }</h3>
			<ul>
				{
					securityLogList.map((item: SecurityLogItem) => {
						return loading ?
						(
							<li className="px-5">
								<Skeleton.Title />
        						<Skeleton.Paragraph />
							</li>
						) : 
						(
							<li className="p-5 flex">
								<div className="shrink-0 mr-[14px]">
									<img
										src={item.icon}
										alt="safe_device"
										className="w-[28px] h-[28px]"
									/>
								</div>
								<div className="flex-1">
									<h4 className="leading-[22px] text-[16px] font-medium mb-[2px]">{ item.title }</h4>
									<p className="leading-[17px] text-[12px] font-normal mb-[16px] text-[var(--text-color6)]">{ item.desc }</p>
									<div className="flex justify-between items-center">
										<div className="flex-1">
											<h4 className="leading-[22px] text-[16px] font-medium mb-[2px]">{ item.tip }</h4>
											<p className="leading-[17px] text-[12px] font-normal text-[var(--text-color6)]">{ item.value }</p>
										</div>
										<div className="shrink-0">
											<button
												className="min-w-[80px] h-[32px] border border-solid border-[var(--theme-color)] text-[var(--theme-color)] text-[14px] font-medium px-[26px] py-[6px] leading-[20px] rounded-[16px]"
												onClick={item.button}
											>
												{item.btntext}
											</button>
										</div>
									</div>
								</div>
							</li>
						)
					})
				}
			</ul>
			{/* 绑定谷歌 */}
			<BindGoogleModal
				open={BindGoogleModalOpen}
				acountInfo={safeData}
				onOk={() => handOk()}
				onCancel={() => setBindGoogleModalOpen(false)}
			/>
			{/* 设置/修改手机号 */}
			<SetPhoneModal
				open={phoneModalOpen}
				type={phoneType}
				acountInfo={safeData}
				onOk={() => handOk()}
				onCancel={() => setPhoneModalOpen(false)}
			/>
			{/* 设置/修改邮箱 */}
			<SetMailModal
				open={mailModalOpen}
				type={mailType}
				acountInfo={safeData}
				onOk={() => handOk()}
				onCancel={() => setMailModalOpen(false)}
			/>
			{/* 修改确认弹窗 */}
			<CheckModal
				open={checkModalOpen}
				type={checkType}
				onOk={handCheckModal}
				onCancel={() => setCheckModalOpen(false)}
			/>
			{/* 设置/修改密码 */}
			<SetLockModal
				open={lockModalOpen}
				type={lockType}
				onOk={() => changeLock()}
				onCancel={() => setLockModalOpen(false)}
			/>
			{/* 安全验证-设置/修改密码 */}
			<LockSafeModal
				open={lockSafeModalOpen}
				type={safeType}
				onOk={handsvcOk}
				acountInfo={safeData}
				onCancel={() => setLockSafeModalOpen(false)}
			/>
		</>
	);
});

export default SafeCenter;