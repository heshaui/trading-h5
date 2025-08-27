import { type CSSProperties, useState, useEffect } from "react";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "@/context/register-providers/LoginStateProvider";
import store from "@/store";
import PhoneCodeSelector from "@/components/PhoneCodeSelector/PhoneCodePop"
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import { encryptData } from "@/utils/encrypt";
import { Toast, Form, Input, Checkbox } from 'antd-mobile'
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Iconify } from "@/components/icon";
import { windowOpen } from "@/utils/windowOpen";

const fromStyle: CSSProperties = {
	borderRadius: "5px",
	width: "100%",
	minWidth: "350px",
};

function RegisterPhone() {
	const navigate = useNavigate();
	const { t } = useLanguage('login');
	const [isOpen, setIsOpen] = useState(true); //是否展开
	const [loading, setLoading] = useState(false);

	// 密码校验状态
	const [lengthValid, setLengthValid] = useState(false);
	const [charValid, setCharValid] = useState(false)
	const [numValid, setNumValid] = useState(false);

	const [showLengthCheck, setShowLengthCheck] = useState(false);
	const [showCharCheck, setShowCharCheck] = useState(false);
	const [showNumCheck, setShowNumCheck] = useState(false);

	const [showRules, setShowRules] = useState(false);

	const [phoneCodeInputValue, setPhoneCodeInputValue] = useState('');
	const { setLoginState } = useLoginStateContext();
	const { registerType } = useRegisterTypeContext();
	// const signIn = useSignIn();
	const [form] = Form.useForm();
	const allConfig = store.getKvConfigAll();

	// 获取浏览器指纹
	const getFingerprint = async () => {
		const result = await FingerprintJS.load();
		const visitorId = await result.get();
		return visitorId.visitorId;
	};

	// 当注册类型不为 PHONE 时不渲染组件
	useEffect(() => {
		// 获取 URL 参数中的邀请码
		const urlParams = new URLSearchParams(window.location.search);
		const inviteCode = urlParams.get('inviteCode');
		// 如果 URL 中有 inviteCode，设置到表单的 referee 字段
		if (inviteCode) {
			form.setFieldValue('referee', inviteCode);
		}
	}, [form]);

	const goLogin = () => {
		// setLoginState(LoginStateEnum.LOGIN)
		navigate("/login")
	}

	const onFinish = async () => {
		form
			.validateFields(['phoneNumber', 'areaCode', 'password', 'referee', 'agree'])
			.then(async (values: any) => {
				// form.resetFields(); // 重置表单
				// if (loading) return;
				// console.log(values, 111);
				if (!values.agree) return Toast.show(t('registerForm.agreeErr'))
				const data = {
					type: "p",
					phone: values.phoneNumber,
					password: values.password,
					parentInviteCode: isOpen ? values.referee : "",
					countryCode: values.areaCode
				}

				store.updateRegisterInfo(data)

				goAuthCode()
			})
			.catch((info: any) => {
				console.log("Validate Failed:", info);
			});
		// form.resetFields(); //重置表单
		// setLoading(true);

	};
	// 跳转规则
	const goAuthCode = () => {
		store.setAuthcodeState(LoginStateEnum.REGISTER, RegisterTypeEnum.PHONE); //存储跳转前状态
		setLoginState(LoginStateEnum.Authcode) //设置跳转状态
	}

	// 自定义密码验证规则
	const validatePassword = (_: any, value: string) => {
		if (typeof value === 'string') {
			value = value.trim();
		}
		// if (!value) {
		//     return Promise.reject(new Error(t('registerForm.passwordNull')));
		// }
		// 检查长度是否在 8 - 100 位之间
		if (value.length < 8 || value.length > 100) {
			return Promise.reject(new Error(t('registerForm.passwordPlaceholder')));
		}
		// 检查是否包含数字
		const hasNumber = /.*\d+.*/
		if (!hasNumber.test(value)) {
			return Promise.reject(new Error(t('registerForm.passwordnum')));
		}
		// 检查是否包含大写字母
		const hasUpperCase = /.*[A-Z].*/
		if (!hasUpperCase.test(value)) {
			return Promise.reject(new Error(t('registerForm.passwordletter')));
		}

		return Promise.resolve();
	};

	// 监听密码输入变化
	const handlePasswordChange = (value: string) => {
		if (value.length > 0) {
			setShowRules(true);
		}

		// 检查长度是否在 8 - 100 位之间
		if (value.length < 8 || value.length > 100) {
			setLengthValid(false);
		} else {
			setLengthValid(true);
		}

		// 检查是否包含数字
		const hasNumber = /.*\d+.*/
		if (!hasNumber.test(value)) {
			setNumValid(false);
		} else {
			setNumValid(true);
		}

		// 检查是否包含大写字母
		const hasUpperCase = /.*[A-Z].*/
		if (!hasUpperCase.test(value)) {
			setCharValid(false);
		} else {
			setCharValid(true);
		}
	};

	const showRule = () => {
		setShowLengthCheck(true);
		setShowCharCheck(true);
		setShowNumCheck(true);
	}

	const hideRule = () => {
		setShowRules(false);
		setShowLengthCheck(false);
		setShowCharCheck(false);
		setShowNumCheck(false);
	}

	// 过滤输入，只允许数字和字母
	const handleInputChange = (value: string) => {
		// 只保留数字
		const filteredValue = value.replace(/[^0-9]/g, '');
		setPhoneCodeInputValue(filteredValue);
		form.setFieldsValue({ phoneNumber: filteredValue });
	};
	const goLink = (type: 'user' | 'policy') => {
		if (type === 'user') {
		  windowOpen(allConfig?.user_agreement || '');
		} else {
		  windowOpen(allConfig?.privacy_policy || '');
		}
	  }
	if (registerType !== RegisterTypeEnum.PHONE) return null;

	return (
		<div className="flex-y-cc mt-7" >

			<Form
				name="register"
				form={form}
				// onFinish={onFinish}
				// initialValues={{ areaCode: "+1" }}
				className={`${styles.login_form}`}
			// onValuesChange={usernameChange}
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
				<Form.Item name="password"
					rules={[
						{ required: true, message: t('registerForm.passwordNull') },
						{ validator: validatePassword }
					]}
					className={`${styles.login_form_item}`}
				>
					<Input type="password"
						placeholder={t('registerForm.passwordPlaceholder')}
						maxLength={100}
						clearable={true}
						className={`${styles.mail_input}`}
						onChange={handlePasswordChange}
						onFocus={showRule}
						onBlur={hideRule}
					/>
				</Form.Item>

				{showRules && <div className={`mt-1`}>
					{showLengthCheck && (
						<div className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.tip_title : styles.tip_color}`}>
							<Iconify
								icon="iconoir:check-circle-solid"
								size={16}
								className={`mr-1 ${lengthValid ? styles.tip_title : styles.tip_color}`}
							/>
							{/* 8-100个字符 */}
							{t('registerForm.passwordRule1')}
						</div>
					)}
					{showNumCheck && (
						<div className={`font-12 mt-0_5 font-w-400 ${styles.ruleItem} ${numValid ? styles.tip_title : styles.tip_color}`}>
							<Iconify
								icon="iconoir:check-circle-solid"
								size={16}
								className={`mr-1 ${numValid ? styles.tip_title : styles.tip_color}`}
							/>
							{/* 至少包含一个数字 */}
							{t('registerForm.passwordnum')}
						</div>
					)}
					{showCharCheck && (
						<div className={`font-12 mt-0_5 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color}`}>
							<Iconify
								icon="iconoir:check-circle-solid"
								size={16}
								className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color}`}
							/>
							{/* 至少包含一个大写字母 */}
							{t('registerForm.passwordletter')}
						</div>
					)}
				</div>}

				<div className={`${styles.title_color} mb-1 font-16 font-w-500 flex-x algin-center cursor-pointer`}
				>
					{/* 推荐人的邀请码(选填) */}
					{t('registerForm.refereeTitle')}
					<Iconify icon={isOpen ? "cuida:caret-up-outline" : "cuida:caret-down-outline"}
						className={`${styles.tip_icon} ml-1`} size={20} onClick={() => { setIsOpen(!isOpen) }} />

				</div>
				{isOpen && (
					<Form.Item name="referee" rules={[{ required: false }]} className={`${styles.login_form_item}`}>
						<Input type="text"
							placeholder={t('registerForm.refereePlaceholder')}
							clearable={true}
							className={`${styles.mail_input}`}
							maxLength={8}
						/>
					</Form.Item>
				)}

				<Form.Item noStyle name="agree" valuePropName="checked">
					<Checkbox className="custom-checkbox text-color-default " >
						<p className={`${styles.title_color}`}>
							{/* 我已阅读并同意 */}
							{t('agree')}&nbsp;
							<button type="button" className="text-color" onClick={(event) => {
								event.stopPropagation();
								goLink('user')
							}}>
								{t('protocol')}
							</button>
							&nbsp;{t('and')}&nbsp;
							<button type="button" className="text-color" onClick={(event) => {
								event.stopPropagation();
								goLink('policy')
							}}>
								{t('policy')}
							</button>
						</p>
					</Checkbox>
				</Form.Item>
			</Form>

			<button type="submit" className={`${styles.login_button} flex-x-cc w-full button-color mt-5`}
				onClick={onFinish}>
				{/* 注册 */}
				{t('registerForm.registerButton')}
			</button>

			<div className="flex-cc mt-4">
				<p>
					{/* {"已有账号？"} */}
					{t('registerForm.hasAccount')}
					<button
						type="button"
						className="theme_color"
						onClick={goLogin}
					>
						{/* {"登录"} */}
						{t('login')}
					</button>
				</p>
			</div>
		</div>
	);
}

export default RegisterPhone;
