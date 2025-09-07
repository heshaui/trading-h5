import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import appStore from "@/store";
import { Switch } from 'antd-mobile';
import { useContract } from '@/context/exchange-providers/ContractProvider';
import { usePosition, Position as PositionType } from "../../hooks";
import { NoData } from '@/components/noData';
import { Iconify } from '@/components/icon';
import { Side, SideMap, PositionTypeMap } from '../../configs/columns';
import BigNumber from "bignumber.js";

import TipModal from '../Popup/TipModal'
import AdjustPopup from '../Popup/AdjustPopup';
import ReservePopup from '../Popup/ReservePopup';
import TakePriofitPopup from '../Popup/TakeProfitPopup'
import ClosePopup from '../Popup/ClosePopup'

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
	// 提示弹窗
	const [tipModalVisible, setTipModalVisible] = useState(false);
	const [tipTitle, setTipTitle] = useState('');
	const [tipContent, setTipContent] = useState('');
	// 保证金弹窗
	const [adjustVisible, setAdjustVisible] = useState(false);
	// 反向开仓
	const [reserveVisible, setReserveVisible] = useState(false);
	const [currentData, setCuurentData] = useState<PositionType | null | undefined>();
	// 止盈止损
	const [tpslVisible, setTpslVisible] = useState(false);
	// 平仓
	const [closeVisible, setCloseVisible] = useState(false);

	useEffect(() => {
		// getPosition();
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
				returnRate: 12334.23,
				orderSide: Side.BUY,
				positionType: 1,
				canUseAmount: 0,
				canSubMarginAmount: 0,
				openRealizedAmount: 0,
				keepRate: 0,
				maxFeeRate: 0,
				unRealizedAmount: 98712.498,
				leverageLevel: 20,
				positionBalance: 0
			},
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
				returnRate: 12334.23,
				orderSide: Side.SELL,
				positionType: 2,
				canUseAmount: 0,
				canSubMarginAmount: 0,
				openRealizedAmount: 0,
				keepRate: 0,
				maxFeeRate: 0,
				unRealizedAmount: 98712.498,
				leverageLevel: 20,
				positionBalance: 0
			},
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
				returnRate: 12334.23,
				orderSide: Side.BUY,
				positionType: 1,
				canUseAmount: 0,
				canSubMarginAmount: 0,
				openRealizedAmount: 0,
				keepRate: 0,
				maxFeeRate: 0,
				unRealizedAmount: 98712.498,
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

	// 显示提示
	const handleTip = (type: string) => {
		setTipModalVisible(true);
		switch (type) {
			case 'position':
				setTipTitle(t("reducePosition.title"));
				setTipContent(t('reducePosition.content'));
				break;
		}
	}
	// 反向开仓、平仓
	const handleOpen = (type: 'close' | 'reserve', data: PositionType) => {
		switch (type) {
			case 'close': setCloseVisible(true); break;
			case 'reserve': setReserveVisible(true); break;
		}
		setCuurentData(data);
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
						return (<li key={item.id} className="border-b border-color p-4">
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
								<PositionIcon className="w-[18px] h-[8px]" onClick={() => handleTip('position')} />
							</div>
							<div className="flex justify-between my-4 pb-4 border-b border-color">
								<p className="flex flex-col gap-y-[4px]">
									<span 
										className="text-[12px] w-fit text-[#9e9e9e] border-b border-dashed border-[#9e9e9e]"
									>
										{t('order.positionColumn.unRealizedAmount')}/{t('order.positionColumn.returnRate')}({currentContractInfo?.marginCoin})
									</span>
									<span
										className={`text-[16px] font-medium
											${item.unRealizedAmount > 0 ? 'success_icon' : item.unRealizedAmount < 0 ? 'error_icon' : ''}
										`}
									>{item.unRealizedAmount > 0 ? '+' : item.unRealizedAmount < 0 ? '-' : ''}{new BigNumber(item.unRealizedAmount).toFormat(symbolPricePrecision)}</span>
								</p>
								<p>
									<p className="flex flex-col gap-y-[4px]">
									<span className="text-[12px] text-[#9e9e9e] text-right">{t('order.positionColumn.returnRate')}</span>
									<span
										className={`text-[16px] font-medium text-right
											${item.returnRate > 0 ? 'success_icon' : item.returnRate < 0 ? 'error_icon' : ''}
										`}
									>{item.returnRate > 0 ? '+' : item.returnRate < 0 ? '-' : ''}{new BigNumber(item.returnRate).toFormat(symbolPricePrecision)}%</span>
								</p>		
								</p>
							</div>
							<div className="flex justify-between">
								<div className="flex gap-x-[30px]">
									<div className="flex flex-col gap-y-[12px]">
										<p className="flex flex-col gap-y-[4px]">
											<span className="text-[12px] w-fit text-[#9e9e9e] border-b border-dashed border-[#9e9e9e]">{t('order.positionColumn.positionVolume')}/{t('order.positionColumn.canCloseVolume')}({currentContractInfo?.marginCoin})</span>
											<span className="text-[14px] font-medium">{new BigNumber(item.positionVolume).toFormat(symbolPricePrecision)}</span>
										</p>
										<p className="flex flex-col gap-y-[4px]">
											<span className="text-[12px] w-fit text-[#9e9e9e] border-b border-dashed border-[#9e9e9e]">{t('order.positionColumn.costPrice')}</span>
											<span className="text-[14px] font-medium">{new BigNumber(item.indexPrice).toFormat(symbolPricePrecision)}</span>
										</p>
									</div>
									<div className="flex flex-col gap-y-[12px]">
										<p className="flex flex-col gap-y-[4px]">
											<span className="text-[12px] w-fit text-[#9e9e9e] border-b border-dashed border-[#9e9e9e]" onClick={() => setAdjustVisible(true)}>{t('margin')}({currentContractInfo?.marginCoin})</span>
											<span className="text-[14px] font-medium">{new BigNumber(item.holdAmount).toFormat(symbolPricePrecision)}</span>
										</p>
										<p className="flex flex-col gap-y-[4px]">
											<span className="text-[12px] w-fit text-[#9e9e9e] border-b border-dashed border-[#9e9e9e]">{t('contractHeader.markPrice')}</span>
											<span className="text-[14px] font-medium">{new BigNumber(item.openAvgPrice).toFormat(symbolPricePrecision)}</span>
										</p>	
									</div>
								</div>
								<div className="flex flex-col gap-y-[12px]">
									<p className="flex flex-col gap-y-[4px]">
										<div className="flex justify-end">
											<span className="text-[12px] w-fit text-[#9e9e9e] border-b border-dashed border-[#9e9e9e]">{t('marginRatio')}</span>
										</div>
										<span className="text-[14px] font-medium text-right">{new BigNumber(item.marginRate).toFormat(symbolPricePrecision)}%</span>
									</p>
									<p className="flex flex-col gap-y-[4px]">
										<div className="flex justify-end">
											<span className="text-[12px] w-fit text-[#9e9e9e] border-b border-dashed border-[#9e9e9e]">{t('order.positionColumn.strongParity')}</span>
										</div>
										<span className="text-[14px] font-medium text-right">{new BigNumber(item.reducePrice).toFormat(symbolPricePrecision)}</span>
									</p>
								</div>
							</div>
							<div className="flex gap-x-[5px] mt-4">
								<button 
									className="flex-1 flex h-[28px] items-center justify-center bg-[var(--background14)] rounded-[4px] text-[14px] tip-color"
									onClick={() => setTpslVisible(true)}
								>
									{t('tpsl')}
								</button>
								<button 
									className="flex-1 flex h-[28px] items-center justify-center bg-[var(--background14)] rounded-[4px] text-[14px] tip-color"
									onClick={() => handleOpen('close', item)}
								>
									{t('close')}
								</button>
								<button 
									className="flex-1 flex h-[28px] items-center justify-center bg-[var(--background14)] rounded-[4px] text-[14px] tip-color"
								>
									{t('order.positionColumn.quickClose')}
								</button>
								<button 
									className="flex-1 flex h-[28px] items-center justify-center bg-[var(--background14)] rounded-[4px] text-[14px] tip-color"
									onClick={() => handleOpen('reserve', item)}
								>
									{t('reverseOpen')}
								</button>
							</div>
						</li>)
					}) :
					<li className="h-[200px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
			{/* 提示弹窗 */}
			<TipModal
				open={tipModalVisible}
				title={tipTitle}
				content={tipContent}
				onCancel={() => setTipModalVisible(false)}
			/>
			{/* 保证金 */}
			<AdjustPopup
				open={adjustVisible}
				onCancel={() => setAdjustVisible(false)}
				onConfirm={() => setAdjustVisible(false)}
			/>
			{/* 反向开仓 */}
			<ReservePopup
				open={reserveVisible}
				currentData={currentData!}
				onCancel={() => setReserveVisible(false)}
				onConfirm={() => setReserveVisible(false)}
			/>
			{/* 止盈止损 */}
			<TakePriofitPopup
				open={tpslVisible}
				onCancel={() => setTpslVisible(false)}
				onConfirm={() => setTpslVisible(false)}
			/>
			{/* 平仓 */}
			{/* 反向开仓 */}
			<ClosePopup
				open={closeVisible}
				currentData={currentData!}
				onCancel={() => setCloseVisible(false)}
				onConfirm={() => setCloseVisible(false)}
			/>
		</>
	)
}

export default Position;