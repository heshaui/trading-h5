// import { Form, Input, AutoComplete, ConfigProvider } from "antd";
import { type CSSProperties, useState, useEffect } from "react";
import { LoginTypeEnum, useLoginTypeContext } from "@/context/login-providers/LoginStateProvider"; //LoginStateEnum,useLoginStateContext,
// import type { TabsProps, AutoCompleteProps } from 'antd';
// import { Iconify } from "@/components/icon/index";
// import store from "@/store";
import { emailSuffixes } from "@/utils/enum";
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login.module.scss'
// import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import { useLanguage } from '@/hooks/useLanguage';
// import SafeModal from "@/components/myModal/login_safeModal"
// import SafeModal from "@/components/myModal/login_safeModal2"
import { encryptData } from "@/utils/encrypt";
import { getLoginCheck } from "@/services/login";
// import { toast } from "sonner";
import { Toast, Form, Input } from 'antd-mobile'
import { Iconify } from "@/components/icon";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { isShowArr } from "@/utils/filterLang";
import PhoneCodeSelector from "@/components/PhoneCodeSelector/PhoneCodePop";
import SafeModal from "@/components/LoginAboutPop/loginModal";


interface useInfoType {
	type: string;
	phone: string;
	password: string;
	deviceType: string;
	authCodePhone: string;
}

function Phonebox() {
	const navigate = useNavigate();
	const { t } = useLanguage('login');
	// const [loading, setLoading] = useState(false);
	const [codeModelOpen, setCodeModelOpen] = useState(false); //验证码弹窗
	// const { loginState,setLoginState } = useLoginStateContext(); // 
	const { loginType } = useLoginTypeContext(); //, setLoginType
	const [phoneCodeInputValue, setPhoneCodeInputValue] = useState('');
	const [loginInfo, setLoginInfo] = useState<useInfoType>({} as useInfoType);
	const [loading, setLoading] = useState(false);
	// const signIn = useSignIn();
	const [form] = Form.useForm();
	const phoneNumber = Form.useWatch('phoneNumber', form);
	const areaCode = Form.useWatch('areaCode', form);

	// 当登录类型不为 PHONE 时不渲染组件
	// if (loginState !== LoginStateEnum.LOGIN) return null;
	const handCodeCancel = () => {
		setCodeModelOpen(false)
	}
	// 获取浏览器指纹
	const getFingerprint = async () => {
		const result = await FingerprintJS.load();
		const visitorId = await result.get();
		return visitorId.visitorId;
	};

	const onFinish = async () => {
		form
			.validateFields()
			.then(async (values) => {
				// form.resetFields(); // 重置表单
				// console.log(values, 111);
				// goAuthCode()
				// const data = {
				// 	type: "p",
				// 	phone: values.phoneNumber,
				// 	deviceType: "H5",
				// 	password: values.password,
				// 	authCodePhone: "",
				// 	countryCode: values.areaCode
				// }
				// setLoginInfo(data)
				// setCodeModelOpen(true)
				if (loading) return;
				const fingerprint = await getFingerprint();
				const param = {
					type: "p",
					account: values.phoneNumber,
					deviceType: fingerprint,
				}
				const dataEncrypt = await encryptData(param)
				setLoading(true)
				try {
					const res = await getLoginCheck(dataEncrypt)
					if (res.code === "0") {
						const data = {
							...res.data,
							type: "p",
							phone: values.phoneNumber,
							deviceType: "H5",
							password: values.password,
							authCodePhone: "",
							countryCode: values.areaCode,
							
						}
						setLoginInfo(data)
						setCodeModelOpen(true)
						// if(!((res.data.openAll === 1 && res.data.isGoogleAuth === 1&&(res.data.isEmailAuth === 0 && res.data.isPhoneAuth === 0)) || 
						// (res.data.openAll === 0 && res.data.isGoogleAuth === 1))){
						//     toast.success(t('success'))
						// }
						const showArr = isShowArr(res.data.isGoogleAuth, res.data.isEmailAuth, res.data.isPhoneAuth, 'login', res.data.openAll);
						if (showArr && showArr.length > 0 && (showArr.includes('email') || showArr.includes('phone'))) {
							Toast.show(t('success'))
						}
					} else if (res.code === "10044") {
						// const data = {
						//     ...res.data,
						//     type: "m",
						//     email: values.email,
						//     deviceType: "H5",
						//     password: values.password,
						//     authCodeMail: "",

						// }
						// setLoginInfo(data)
						setCodeModelOpen(true)
						Toast.show(t('safeModal.codeValid'))
					} else {
						Toast.show(res.message)
					}
				} catch (error) {
					Toast.show(String(error))
				} finally {
					setLoading(false)
				}

			})
			.catch((info) => {
				console.log("Validate Failed:", info);
			});
		// form.resetFields(); //重置表单
		// setLoading(true);

	};

	// const usernameChange = (changedValues: any) => {
	// 	Object.keys(changedValues).forEach((key) => {
	// 		if (key === "username" && preCheck) {
	// 			setpreCheck(false);
	// 		}
	// 	});

	// }
	// const goAuthCode = () => {
	// 	store.setAuthcodeState(LoginStateEnum.LOGIN, LoginTypeEnum.PHONE);
	// 	setLoginState(LoginStateEnum.Googlecode)
	// }
	// const goAuthCode = () => {
	//     store.setAuthcodeState(LoginStateEnum.LOGIN, LoginTypeEnum.PHONE);
	//     setLoginState(LoginStateEnum.Authcode)
	// }
	const goResetPassword = () => {

		navigate('/resetPassword?acount=' + phoneNumber + '&type=p' + '&areaCode=' + areaCode);
	}
	const goRegister = () => {

		// setLoginState(LoginStateEnum.REGISTER)
		navigate("/register")
	}
	// 过滤输入，只允许数字和字母
	const handleInputChange = (value: string) => {
		// const { value } = e
		// 只保留数字和字母
		const filteredValue = value.replace(/[^0-9]/g, '');
		setPhoneCodeInputValue(filteredValue);
		form.setFieldsValue({ phoneNumber: filteredValue });
	};
	if (loginType !== LoginTypeEnum.PHONE) return null;

	return (
		<div className="flex-y-cc mt-7" >

			<Form
				name="login"
				form={form}
				// onFinish={onFinish}
				initialValues={{ areaCode: "+1" }}
				className={`${styles.login_form}`}
			>
				<div className={`${styles.title_color} mb-1 font-16 font-w-500`}>
					{/* 手机号 */}
					{t('phoneTitle')}
				</div>
				<Form.Item className={`${styles.login_form_item}`}>
					<div className="flex">
						{/* <Form.Item name="areaCode" noStyle> */}
						{/* <Select
								defaultValue="1"
								style={{ width: 115 }}
								options={areaCodeSelectList}
								prefix={
									<Iconify icon="zondicons:network" className="icon-color" />
								}
								// optionRender={(option) => (
								// 	<Space style={{ width: "360px" }}>
								// 		<span aria-label={option.data.value}>
								// 			{option.data.cnName}
								// 		</span>
								// 		{option.data.showName}
								// 	</Space>
								// )}
								// showSearch
								// filterOption={(inputValue, option) => {
                                //     return (
                                //         (option?.showName ?? '').toLowerCase().includes(inputValue.toLowerCase())
                                //     );
                                // }}
							/> */}

						<PhoneCodeSelector />
						{/* </Form.Item> */}
						<Form.Item
							name="phoneNumber"
							noStyle
							className={`${styles.login_form_item}`}
							rules={[{ required: true, message: t('phoneNull') }]}

						>
							<Input
								clearable={true}
								placeholder={t('phoneInputPlaceholder')}
								className={`${styles.mail_input} ml-2 `}
								maxLength={20}
								onChange={handleInputChange}
								value={phoneCodeInputValue}
							/>
						</Form.Item>
					</div>
				</Form.Item>
				<div className={`${styles.title_color} mb-1 font-16 font-w-500`}>
					{/* 密码 */}
					{t('passwordTitle')}
				</div>
				<Form.Item
					name="password"
					rules={[{ required: true, message: t('passwordNull') }]}
					className={`${styles.login_form_item}`}
				>
					<Input
						clearable={true}
						type="password"
						placeholder={t('passwordPlaceholder')}
						maxLength={30}
						className={`${styles.mail_input}`}
					/>
				</Form.Item>
				<div className="w-full flex-x align-center justify-end">
					<button
						type="button"
						className={`${styles.forget_password_button} font-14`}
						onClick={() => goResetPassword()}
					>
						{/* 忘记密码 */}
						{t('forgetPassword')}
					</button>
				</div>
			</Form>
			{!loading ? <button
				type="submit"
				className={`${styles.login_button} font-16 flex-x-cc w-full button-color mt-5`}
				onClick={onFinish}
			>
				{/* 登录 */}
				{t('loginButton')}
			</button> :
				<button type="button" className={`${styles.login_loading} font-16 flex-x-cc w-full button-color mt-5`}>
					<Iconify icon="eos-icons:bubble-loading" className="text-[#fff] text-[16px] mr-1" />
					{/* 登录 */}
					<span>{t('loginButton')}</span>
				</button>}
			<div className="flex-cc mt-4 font-14">
				<p>
					{/* 没有账号？ */}
					{t('noAcount')}
					<button
						type="button"
						className="theme_color"
						onClick={() => goRegister()}
					>
						{/* 注册 */}
						{t('register')}
					</button>
				</p>
			</div>
			<SafeModal
				open={codeModelOpen}
				acountInfo={loginInfo}
				onCancel={handCodeCancel}
			/>
		</div>
	);
}

export default Phonebox;
