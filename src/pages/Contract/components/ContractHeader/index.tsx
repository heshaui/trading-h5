import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/hooks';
import { observer } from 'mobx-react-lite';
import { getPublicMarketInfo } from "@/services/contract";
import { Iconify } from '@/components/icon';
import { formatNumWithPrecision, formatAmount } from '@/utils';
import { getPairsRate } from '@/utils/getUseRate';
import appStore from "@/store";
import { useMarketInfo } from "@/hooks/useMarketInfo";

import SelectPopup from './SelectPopup/index';
import TradeSettingPop from './TradeSettingPop';
import CalculatorPop from './CalculatorPop';
import TipModal from '../ContractOrder/components/Popup/TipModal';

import { ReactComponent as SettingIcon } from '@/assets/images/exchange/icon_settings1.svg';
import { ReactComponent as CalendarIcon } from '@/assets/images/exchange/icon_calendar.svg';

const ContractHeader: React.FC= observer(() => {
	const { t } = useLanguage(['contract', 'spot']);
	const symbolList = appStore.getPublicInfo();
	const currentContractInfo = appStore.getCurrentContractInfo();
	const { marketInfo, loadMarketInfo } = useMarketInfo();
	const priceData = appStore.getActiveNewPrice();

	const [selectPopupOpen, setSelectPopupOpen] = useState<boolean>(false);
	const [settingPopupOpen, setSettingPopupOpen] = useState<boolean>(false);
	const [calculatorPopupOpen, setCalculatorPopupOpen] = useState<boolean>(false);
	const [currentSymbol, setCurrentSymbol] = useState<any>(currentContractInfo);
	const [isPriceUp, setIsPriceUp] = useState<boolean>(false)
	const [tipData, setTipData] = useState({
		title: '',
		content: ''
	});
	const [tipVisible, setTipVisible] = useState(false);
	const [unit, setUnit] = useState('张');

	const symbolPricePrecision=currentContractInfo?.coinResultVo?.symbolPricePrecision
	
	// 格式化价格显示，确保不超过symbolPricePrecision精度
	const formatPriceWithPrecision = (price: number | string | null | undefined): string => {
		return formatNumWithPrecision(price);
	};
	
	// 同步 store 中的 currentContractInfo 到本地状态
	useEffect(() => {
		if (currentContractInfo && Object.keys(currentContractInfo).length > 0) {
			setCurrentSymbol(currentContractInfo);
			console.log('当前合约信息', currentContractInfo)
			const uint = appStore.getUnit(currentContractInfo.base);
			setUnit(uint);
		}
	}, [currentContractInfo, appStore.tradingSetting.contractUnit]);

	useEffect(() => {
		if (currentContractInfo?.id) {
			const interval = setInterval(() => {
				loadMarketInfo(currentContractInfo.id);
			}, 5000);
			return () => clearInterval(interval);
		}
	}, [currentContractInfo, loadMarketInfo]);

	// 显示合约类型
	const getContractShowType = () => {
		const type = currentSymbol.contractShowType;
		return type ? type.replace('合约', '') : '模拟'
	}

	/**
	 * 格式化资金费率
	 * @param rate 资金费率（如 -0.00375）
	 * @returns 格式化后的字符串（如 "-37.50%" 或 "+37.50%"）
	 */
	// const formatFundRate = (rate: number): string => {
	// 	if (isNaN(rate)) return "--";
	// 	const percent = (rate * 100).toFixed(2); // 转换成百分比
	// 	const sign = rate > 0 ? "+" : ""; // 负数自带 '-', 正数补 '+'
	// 	return `${sign}${percent}%`;
	// };

	/**
	 * 把秒数转成 HH:mm:ss 格式
	 * @param seconds 秒数
	 * @returns 格式化字符串
	 */
	const formatSeconds = (seconds: number): string => {
		if (isNaN(seconds) || seconds < 0) return "00:00:00";

		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		const pad = (n: number) => String(n).padStart(2, "0");

		return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
	};

	// 显示changePercent
	const formatFundRate = (rate: string | number) => {
		return rate && rate !== 'NaN' ? rate + '%' : '--'
	}

	return (
		<div className="px-[16px] pb-[16px] border-b-[4px] border-[var(--background14)]">
			<div className="h-[44px] flex justify-end items-center">
				<CalendarIcon className="!h-[24px] !w-[24px] mr-[16px]" onClick={() => setCalculatorPopupOpen(true)}/>
				<SettingIcon className="!h-[24px] !w-[24px]" onClick={() => setSettingPopupOpen(true)}/>
			</div>
			<div className="flex justify-between gap-x-[20px]">
				<div className="shrink-0">
					<div className="h-[22px] flex items-center mb-[6px]" onClick={() => setSelectPopupOpen(true)}>
						<span className="text-[16px] font-medium mr-[4px]">{currentSymbol ? `${currentSymbol.base || 'BTC'}/${currentSymbol.quote || 'USDT'}` : '--'}</span>
						<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center mr-1">{getContractShowType()}</span>
						<Iconify icon="eva:arrow-down-fill" className="text-[16px] text-[#9e9e9e]" />
					</div>
					<div
						className={`text-[var(--text-color5)] font-[600] text-[28px] mb-[5px] ${priceData?.isUp
						? "text-[var(--success-color)]"
						: "text-[var(--error-color)]"
						}`}
					>
						{formatPriceWithPrecision(priceData?.price)}
					</div>
					<div className="h-[17px] flex items-center text-[12px] mb-[3px]">
						{/* getPairsRate(priceData?.price, 'USD').rate.toFixed(2) */}
						<span className="tip-color mr-[19px]">≈ ${priceData?.price ? priceData?.price : '--' }</span>
						<span 
							className={`${priceData?.isUp
							? "text-[var(--success-color)]"
							: "text-[var(--error-color)]"
							}`}
						>{formatFundRate(priceData?.changePercent)}</span>
					</div>
					<div className="h-[14px] text-[10px] flex items-center">
						<span className="tip-color border-b border-dashed border-[#9e9e9e] mr-[4px]"
							onClick={() => {
								setTipData({
									title: t("contractHeader.markPrice"),
									content: t('contractHeader.tooltip.markPrice')
								})
								setTipVisible(true)
							}}
						>{t("contractHeader.markPrice")}</span>
						<span>{formatPriceWithPrecision(marketInfo?.tagPrice)}</span>
					</div>
				</div>
				<div className="flex-1 shrink-0">
					<div className="flex justify-between gap-x-[10px]">
						<div className="flex-col gap-y-[8px] mb-[8px]">
							<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
								<span className="tip-color mb-[2px]">{t('24hHigh')}</span>
								<span>{formatPriceWithPrecision(priceData?.high24h || '--')}</span>
							</p>
							<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
								<span className="tip-color mb-[2px]">{t('24hLow')}</span>
								<span>{formatPriceWithPrecision(priceData?.low24h || '--')}</span>
							</p>
						</div>
						<div className="flex-col gap-y-[8px]">
							<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
								<span className="tip-color mb-[2px]">{t('contractHeader.volume24h')}({unit})</span>
								<span>{priceData?.volume24h ? formatAmount(priceData?.volume24h, t) : '--'}</span>
							</p>
							<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
								<span className="tip-color mb-[2px]">{t('contractHeader.turnover24h')}(USD)</span>
								<span>{priceData?.turnover24h ? formatAmount(priceData?.turnover24h, t) : '--'}</span>
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
						<span className="tip-color w-fit mb-[2px] border-b border-dashed border-[#9e9e9e]"
							onClick={() => {
								setTipData({
									title: t("contractHeader.fundingRate"),
									content: t('contractHeader.tooltip.fundingRate', {rate: marketInfo?.currentFundRate ?? '0.0066%'})
								})
								setTipVisible(true)
							}}
						>{t('contractHeader.fundingRate')}</span>
						<span>{formatFundRate(marketInfo?.currentFundRate)}</span>
					</div>
				</div>
			</div>
			{/* 币对选择弹窗 */}
            <SelectPopup
                open={selectPopupOpen}
                onOk={() => setSelectPopupOpen(false)}
                onCancel={() => setSelectPopupOpen(false)}
            />
			{/* 交易设置 */}
			<TradeSettingPop 
				open={settingPopupOpen}
                onCancel={() => setSettingPopupOpen(false)}
			/>
			{/* 计算器 */}
			<CalculatorPop
				open={calculatorPopupOpen}
                onCancel={() => setCalculatorPopupOpen(false)}
			/>
			{/* 提示 */}
			<TipModal
				open={tipVisible}
				title={tipData.title}
				content={tipData.content}
				onCancel={() => setTipVisible(false)}
			/>
		</div>
	)
});

export default ContractHeader;