import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import appStore from "@/store";
import { Switch } from 'antd-mobile';
import { useContract } from '@/context/exchange-providers/ContractProvider';
import { usePosition, Position as PositionType } from "../../hooks";
import { NoData } from '@/components/noData';
import { Iconify } from '@/components/icon';
import { Side, SideMap, PositionTypeMap } from '../../configs/columns';

import { ReactComponent as FrameIcon } from '@/assets/images/exchange/Frame.svg';
import { ReactComponent as PositionIcon } from '@/assets/images/exchange/PositionIcon.svg';


const Position: React.FC = () => {
	const {t} = useLanguage('contract');
	// 获取当前合约信息
	const currentContractInfo = appStore.getCurrentContractInfo();
	const currentSymbol = currentContractInfo?.symbol || "";
	const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;
	const { setPositionCount } = useContract();
	// 仓位
	const {
		loading,
		getPosition,
		getFilteredPositions,
		quickClose,
	} = usePosition({
		contractId: currentContractInfo?.id,
	});

	const [onlyCurrentSymbol, setOnlyCurrentSymbol] = useState(false);
	const [positionList, setPositionList] = useState<PositionType[]>([]);

	useEffect(() => {
		getPosition();
	}, [getPosition, currentSymbol, currentContractInfo?.id])

	useEffect(() => {
		const data:PositionType[]  = [
			{
				id: 0,
				contractId: 0,
				contractName: '',
				symbol: 'BTC-USDT',
				positionVolume: 0,
				canCloseVolume: 0,
				openAvgPrice: 0,
				indexPrice: 0,
				reducePrice: 0,
				holdAmount: 0,
				marginRate: 0,
				realizedAmount: 0,
				returnRate: 0,
				orderSide: Side.BUY,
				positionType: 1,
				canUseAmount: 0,
				canSubMarginAmount: 0,
				openRealizedAmount: 0,
				keepRate: 0,
				maxFeeRate: 0,
				unRealizedAmount: 0,
				leverageLevel: 20,
				positionBalance: 0
			}
		]
		// const data = getFilteredPositions(currentSymbol, onlyCurrentSymbol);
		setPositionList(data);
		setPositionCount(data?.length ?? 0);
	}, [getPosition, onlyCurrentSymbol])

	// 显示合约类型
	const getContractShowType = () => {
		const type = currentSymbol.contractShowType?.toLowerCase();
		return t(`contractInfo.${type ?? 'demo'}`)
	}

	return (
		<>
			<div className="h-[48px] px-4 flex justify-between items-center text-[14px] border-b border-color">
				<div className="flex items-center">
					<Switch
						checked={onlyCurrentSymbol}
						onChange={(check: boolean) => setOnlyCurrentSymbol(check)}
						style={{
							'--checked-color': 'var(--theme-color)',
							'--height': '16px',
							'--width': '28px',
						}}
					/>
					<span className="ml-1">{t("order.onlyCurrentSymbol")}</span>
				</div>
				<button type="button" className="theme-color">{t('order.flattening')}</button>
			</div>
			<ul className="max-h-[350px] hideScrollBar">
				{
					loading ? 
					<li className="h-[200px] flex justify-center items-center">
						<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
					</li> :
					positionList.length ? positionList.map((item) => {
						return (<li key={item.id} className="border-b border-color last:border-b-0 p-4">
							<div className="flex justify-between items-center mb-[6px]">
								<div className="h-[20px] flex items-center">
									<span className="text-[14px] font-medium mr-[4px]">{item.symbol ?? '--'}</span>
									<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center">{getContractShowType()}</span>
								</div>
								<FrameIcon className="W-[20px] h-[20px]" />
							</div>
							<div className="flex items-center">
								<span
									className={`h-[20px] px-[3px] flex items-center text-[14px] font-medium mr-2 rounded-[4px]
										${item.orderSide === Side.BUY ? 'success_icon success_bg' : 'error_icon error_bg'}
									`}
								>
									{t(SideMap[item.orderSide])}
								</span>
								<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center mr-1">
									{t(PositionTypeMap[item.positionType])} {item.leverageLevel ?? 1}x
								</span>
								<PositionIcon className="w-[18px] h-[8px]" />
							</div>
							<div>
								
							</div>
						</li>)
					}) :
					<li className="h-[200px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
		</>
	)
}

export default Position;