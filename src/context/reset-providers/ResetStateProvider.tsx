
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";
export enum ResetStateEnum {
	INPUT = 0,
	SENTCODE = 1,
	RESET = 2,
}

interface acountType {
	type: string;
	acount: string;
	areaCode?: string;
	isGoogleAuth?: number;
	isPhoneAuth?: number;
	isEmailAuth?: number;
	openAll?: number;
	emailTime?: number;
	phoneTime?: number;
	message?: string;
}

interface ResetStateContextType {
	resetState: ResetStateEnum;
	setResetState: (resetState: ResetStateEnum) => void;
	acount: acountType;
	setAcount: (acount: acountType) => void
}

const ResetStateContext = createContext<ResetStateContextType>({
	resetState: ResetStateEnum.INPUT,
	setResetState: () => { },
	acount: {
		type: "",
		acount: "",
		areaCode: ""
	},
	setAcount: () => { },
});
export function useResetStateContext() {
	const context = useContext(ResetStateContext);
	return context;

}

export function ResetStateProvider({ children }: PropsWithChildren) {
	const [resetState, setResetState] = useState(ResetStateEnum.INPUT);
	const [acount, setAcount] = useState<acountType>({
		type: "",
		acount: "",
		areaCode: ""
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: ResetStateContextType = useMemo(
		() => ({ resetState, setResetState, acount, setAcount }),
		[resetState, acount],
	);

	return (
		<ResetStateContext.Provider value={value}>
			{children}
		</ResetStateContext.Provider>
	);
}





