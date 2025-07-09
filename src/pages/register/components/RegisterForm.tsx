import { Segmented } from 'antd-mobile'
import { useState } from "react";
import Mailbox from "./register_mailbox"
import Phonebox from "./register_phonebox"
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "@/context/register-providers/LoginStateProvider";
import styles from '../styles/login.module.scss'
import { useLanguage } from '@/hooks/useLanguage';

function RegisterForm() {
	const { t } = useLanguage('login');
	const [noteModelOpen, setNoteModelOpen] = useState(false)

	const [tabsProps, setTabsProps] = useState('email');
	const { loginState } = useLoginStateContext();
	const { setRegisterType } = useRegisterTypeContext();

	const handCancel = () => {
		setNoteModelOpen(false);
	};

	const tabsChange = (value: any) => {
		setTabsProps(value)
		if (value === "email") {
			setRegisterType(RegisterTypeEnum.EMAIL)
		} else if (value === "phone") {
			setRegisterType(RegisterTypeEnum.PHONE)
		}

	};

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<div className="flex-col" style={{ minHeight: "70vh", padding: '0 5%' }}>
			<div className="w-full mb-6"><p className={`${styles.title_box}`}>
				{/* 注册 */}
				{t('register')}
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
				]}
				onChange={tabsChange}
				value={tabsProps}
			/>
			<Mailbox />
			<Phonebox />
		</div>
	);
}

export default RegisterForm;
