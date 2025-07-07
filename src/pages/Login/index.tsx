// import { Layout } from "antd";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import { LoginTypeProvider } from "@/context/login-providers/LoginStateProvider";
import { useNavigate } from 'react-router-dom';

// import "./styles/login.css"
import styles from './styles/login.module.scss'
import { getPic2 } from "@/services/open";
import { useLanguage } from '@/hooks/useLanguage';
import appStore from '@/store';

interface LoginPicType {
	[key: string]: {
		image: string,
		title: string,
		url: string
	}
}
function Login() {
	const navigate = useNavigate();
	const { t } = useLanguage('login');

	const [loginPic, setLoginPic] = useState<LoginPicType | null>(null)
	const allConfig = appStore.getKvConfigAll();
	const token = appStore.getToken();
	const langKey = appStore.getLang() || 'en_US';

	const picClick = () => {
		if (loginPic?.login.url) {
			window.open(loginPic?.login.url, '_blank', 'noopener')
		}
	}
	// const getUseBankKv = async () => {
	// 	const keys=['out_money']

	// 	const res=await getKvObject(keys)
	// 	if(res.code==='0'){
	// 		localStorage.setItem(LOCAL_STORAGE_KEY.OUT_MONEY,res.data.out_money)
	// 	}else{
	// 		console.log(res.msg,123);
	// 	}

	// }
	// 如果有授权，则跳转到首页
	// useEffect(() => {
	// 	if (token) {
	// 		router.push('/');
	// 	}
	// 	getBgc()
	// }, [token, router]);
	// useEffect(() => {
	// 	if (!allConfig) {
	// 		// useWebConfig();
	// 		appStore.getKvConfigAllFromApi()
	// 	}
	// }, [allConfig]);


	return (
		<div className={`relative flex h-overmax w-full flex-row ${styles.page_box}`} >

			<div className="m-auto flex flex-ai-center w-full flex-col flex-1 position-relative">
				<div style={{ width: "100%" }}>
					{/* <LoginStateProvider> */}
					{/* 登录注册切换 */}
					<LoginTypeProvider>
						<LoginForm />
					</LoginTypeProvider>
					{/* <PhoneEmailAuthcode /> */}
					{/* <GoogleAuthcode /> */}
					{/* </LoginStateProvider> */}
				</div>
			</div>
		</div>
	);
}

export default Login;

