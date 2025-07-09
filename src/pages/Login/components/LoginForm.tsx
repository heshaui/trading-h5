// import { Button, Form, Input,Tabs } from "antd";
// import { Segmented } from "antd";
import { Segmented } from 'antd-mobile'
import {  useState } from "react";
import Mailbox from "./login_mailbox"
import Phonebox from "./login_phonebox"
import { LoginStateEnum, useLoginStateContext } from "@/context/login-providers/LoginStateProvider";
import { LoginTypeEnum, useLoginTypeContext } from "@/context/login-providers/LoginStateProvider";
// import NoteModal from "@/components/myModal/noteModal"
// import { useTranslation } from 'next-i18next';
import styles from '../styles/login.module.scss'
import { useLanguage } from '@/hooks/useLanguage';

function LoginForm() {
	const { t } = useLanguage('login');
	const [noteModelOpen, setNoteModelOpen]=useState(false)

	const [tabsProps, setTabsProps] = useState('email');
	const { loginState } = useLoginStateContext();
	// const signIn = useSignIn();
	const {  setLoginType } = useLoginTypeContext();
	// 当登录状态不为 LOGIN 时不渲染组件

	const handCancel = () => {
		setNoteModelOpen(false);
	};

	// const handOk = () => {
	// 	setNoteModelOpen(true);
	// 	// 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
	// };

	// const handleFinish = async (values: any) => {
	// 	setLoading(true);
	// };

	// const usernameChange = (changedValues: any) => {
	// 	Object.keys(changedValues).forEach((key) => {
	// 		if (key === "username" && preCheck) {
	// 			setpreCheck(false);
	// 		}
	// 	});

	// }
	const tabsChange = (value: any) => {
		setTabsProps(value)
		if (value === "email") {
			setLoginType(LoginTypeEnum.EMAIL)
		} else if (value === "phone") {
			setLoginType(LoginTypeEnum.PHONE)
		} else if (value === "QRcode") {
			setLoginType(LoginTypeEnum.QRcode)
		}

	};
	if (loginState !== LoginStateEnum.LOGIN) return null;

	return (
		<div className="flex-col" style={{ minHeight: "70vh",padding:'0 5%'}}>
			{/* {t('login')} */}
			<div className="w-full mb-6"><p className={`${styles.title_box}`}>
				{/* 登录 */}
				{t('login')}
				</p> 
			</div>

			<Segmented
				className={`${styles.custom_segmented} custom-segmented`}
				options={[
					{
						label: (
							//  button-color
							<div className={`${styles.tabs_label}`} >
								<div>
									{t('email')}
								</div>
							</div>

						),
						value: 'email',
					},
					{
						label: (
							<div className={`${styles.tabs_label}`}>
								<div>
									{t('phone')}
								</div>
							</div>

						),
						value: 'phone',
					},
					// {
					// 	label: (
					// 		<div className="tabs-label" >
					// 			<div>QRcode</div>
					// 		</div>
					// 	),
					// 	value: 'QRcode',
					// },
				]}
				onChange={tabsChange}
				value={tabsProps}
			/>
			<Mailbox />
			<Phonebox />
			{/* <QRCodebox/> */}
			{/* <NoteModal open={noteModelOpen}  onCancel={handCancel}/> */}
		</div>
	);
}

export default LoginForm;
