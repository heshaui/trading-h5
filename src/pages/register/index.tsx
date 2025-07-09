// import { Layout } from "antd";
import type { CSSProperties } from "react";
import { useEffect } from "react";
import RegisterForm from "./components/RegisterForm";
import { LoginStateProvider, RegisterTypeProvider } from "@/context/register-providers/LoginStateProvider";
import { useNavigate } from 'react-router-dom';

// import "./styles/login.css"
import styles from './styles/login.module.scss'
import PhoneEmailAuthcode from "./components/authCode_phoneAndMail";
import { useLanguage } from '@/hooks/useLanguage';
import appStore from '@/store';
function Register() {
	const navigate = useNavigate();
	const { t } = useLanguage('login');

	const allConfig = appStore.getKvConfigAll();
	const token = appStore.getToken();
	const langKey = appStore.getLang() || 'en_US';

	// 如果有授权，则跳转到首页
	// useEffect(() => {
	// 	if (token) {
	// 		navigate('/');
	// 	}
	// }, [token, navigate]);

	// useEffect(() => {
	// 	if (!allConfig) {
	// 		// useWebConfig();
	// 		appStore.getKvConfigAllFromApi()
	// 	}
	// }, [allConfig]);

	return (
		<div className={`relative flex h-max w-full flex-row ${styles.page_box}`} >

			<div className="m-auto flex flex-ai-center w-full flex-col flex-1 position-relative">
				<div style={{ width: "100%" }}>
					<LoginStateProvider>
						{/* 登录注册切换 */}
						<RegisterTypeProvider>
							<RegisterForm />
						</RegisterTypeProvider>
						<PhoneEmailAuthcode />
						{/* <GoogleAuthcode /> */}
					</LoginStateProvider>
				</div>
			</div>
		</div>
	);
}
export default Register;
