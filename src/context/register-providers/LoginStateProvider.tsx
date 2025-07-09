
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";

export enum LoginStateEnum {
	LOGIN = 0,
	REGISTER = 1,
	RESET_PASSWORD = 2,
	MOBILE = 3,
	QR_CODE = 4,
	Authcode= 5,
	Googlecode=6,
}
export enum LoginTypeEnum {
	EMAIL = 0,
	PHONE = 1,
	QRcode = 2,
	Authcode= 3,
	Googlecode=4,
}
export enum RegisterTypeEnum {
	EMAIL = 0,
	PHONE = 1,
	QRcode = 2,
	Authcode= 3,
	Googlecode=4,
}


interface LoginStateContextType {
	loginState: LoginStateEnum;
	setLoginState: (loginState: LoginStateEnum) => void;
	// backToLogin: () => void;
}
interface LoginTypeContextType {
	loginType: LoginTypeEnum;
	setLoginType: (loginType: LoginTypeEnum) => void;
	backToLoginType: () => void;
}
interface RegisterTypeContextType {
	registerType: RegisterTypeEnum;
	setRegisterType: (RegisterType: RegisterTypeEnum) => void;
	backToRegisterType: () => void;
}


const LoginStateContext = createContext<LoginStateContextType>({
	loginState: LoginStateEnum.REGISTER,
	setLoginState: () => {},
	// backToLogin: () => {},
});
const LoginTypeContext = createContext<LoginTypeContextType>({
	loginType: LoginTypeEnum.EMAIL,
	setLoginType: () => {},
	backToLoginType: () => {},
});
const RegisterTypeContext = createContext<RegisterTypeContextType>({
	registerType: RegisterTypeEnum.EMAIL,
	setRegisterType: () => {},
	backToRegisterType: () => {},
});

export function useLoginStateContext() {
	const context = useContext(LoginStateContext);
	return context;
}
export function useLoginTypeContext() {
	const context = useContext(LoginTypeContext);
	return context;
}
export function useRegisterTypeContext() {
	const context = useContext(RegisterTypeContext);
	return context;
}

export function LoginStateProvider({ children }: PropsWithChildren) {
	const [loginState, setLoginState] = useState(LoginStateEnum.REGISTER);

	// function backToLogin() {
	// 	setLoginState(LoginStateEnum.LOGIN);

	// }

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: LoginStateContextType = useMemo(
		() => ({ loginState, setLoginState }),
		[loginState],
	);

	return (
		<LoginStateContext.Provider value={value}>
			{children}
		</LoginStateContext.Provider>
	);
}
export function LoginTypeProvider({ children }: PropsWithChildren) {
	const [loginType, setLoginType] = useState(LoginTypeEnum.EMAIL);	
	function backToLoginType() {
		setLoginType(LoginTypeEnum.PHONE);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: LoginTypeContextType = useMemo(
		() => ({ loginType, setLoginType, backToLoginType }),
		[loginType],
	);

	return (
		<LoginTypeContext.Provider value={value}>
			{children}
		</LoginTypeContext.Provider>
	);
}
export function RegisterTypeProvider({ children }: PropsWithChildren) {
	const [registerType, setRegisterType] = useState(RegisterTypeEnum.EMAIL);

	function backToRegisterType() {
		setRegisterType(RegisterTypeEnum.EMAIL);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: RegisterTypeContextType = useMemo(
		() => ({ registerType, setRegisterType, backToRegisterType }),
		[registerType],
	);

	return (
		<RegisterTypeContext.Provider value={value}>
			{children}
		</RegisterTypeContext.Provider>
	);
}
