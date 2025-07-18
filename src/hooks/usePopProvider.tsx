
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";

// 偏好设置枚举
export enum PopTypeEnum {
	INDEX = 0,
	FEE_COIN = 1,
	TRADE_RULE = 2,
}

interface PopTypeContextType {
	popType: PopTypeEnum;
	setPopType: (popType: PopTypeEnum) => void;
}

const PopTypeContext = createContext<PopTypeContextType>({
	popType: PopTypeEnum.INDEX,
	setPopType: () => { },
});
export function usePopTypeContext() {
	const context = useContext(PopTypeContext);
	return context;

}

export function PopTypeProvider({ children }: PropsWithChildren) {
	const [popType, setPopType] = useState(PopTypeEnum.INDEX);


	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: PopTypeContextType = useMemo(
		() => ({ popType, setPopType }),
		[popType],
	);

	return (
		<PopTypeContext.Provider value={value}>
			{children}
		</PopTypeContext.Provider>
	);
}





