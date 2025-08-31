import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks';
import { observer } from 'mobx-react-lite';
import { getPublicMarketInfo } from "@/services/contract";
import { Iconify } from '@/components/icon';
import { formatNumWithPrecision, formatAmount } from '@/utils';
import { getPairsRate } from '@/utils/getUseRate';
import appStore from "@/store";

import { ReactComponent as SettingIcon } from '@/assets/images/exchange/icon_settings1.svg';
import { ReactComponent as CalendarIcon } from '@/assets/images/exchange/icon_calendar.svg';

interface Props {
	priceData: any
}

const ContractHeader: React.FC<Props>= observer(({priceData}) => {
	const { t } = useLanguage(['contract', 'spot']);
	const symbolList = appStore.getPublicInfo();
	const currentContractInfo = appStore.getCurrentContractInfo();
	const [currentSymbol, setCurrentSymbol] = useState<any>(currentContractInfo);
	const [marketInfo, setMarketInfo] = useState<any>(null);
	const [isPriceUp, setIsPriceUp] = useState<boolean>(false);
	const handleSymbolSelect = (symbol: any) => {
		
		appStore.setCurrentContractInfo(symbol.id);
		setCurrentSymbol(symbol);

	};

	const handleToggleFavorite = (symbol: any) => {
		console.log("handleToggleFavorite", symbol);
	};

	const getMarketInfo = async (id: number) => {
		const res = await getPublicMarketInfo({ contractId: id });
		if (res.code === '0') {
			setMarketInfo(res.data);
			if (res.data?.currentFundRate > 0) setIsPriceUp(true);
		}
	};
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
		}
	}, [currentContractInfo]);

	useEffect(() => {
		if (currentContractInfo?.id) {
		const interval = setInterval(() => {
			getMarketInfo(currentContractInfo.id);
		}, 5000);
		return () => clearInterval(interval);
		}
	}, [currentContractInfo]);

	// 显示合约类型
	const getContractShowType = () => {
		const type = currentSymbol.contractShowType?.toLowerCase();
		return t(`contractInfo.${type}`)
	}

	/**
	 * 格式化资金费率
	 * @param rate 资金费率（如 -0.00375）
	 * @returns 格式化后的字符串（如 "-37.50%" 或 "+37.50%"）
	 */
	const formatFundRate = (rate: number): string => {
		if (isNaN(rate)) return "--";
		const percent = (rate * 100).toFixed(2); // 转换成百分比
		const sign = rate > 0 ? "+" : ""; // 负数自带 '-', 正数补 '+'
		return `${sign}${percent}%`;
	};

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
	const getChangePercent = () => {
		const priceChangePercent = priceData?.changePercent
		return priceChangePercent && priceChangePercent !== 'NaN' ? priceChangePercent + '%' : '--'
	}

	return (
		<div className="px-[16px] pb-[16px] border-b-[4px] border-[var(--background14)]">
			<div className="h-[44px] flex justify-end items-center">
				<CalendarIcon className="!h-[24px] !w-[24px] mr-[16px]" />
				<SettingIcon className="!h-[24px] !w-[24px]" />
			</div>
			<div className="flex">
				<div className="shrink-0 mr-[30px]">
					<div className="h-[22px] flex items-center mb-[6px]">
						<span className="text-[16px] font-medium mr-[4px]">{currentSymbol.base}/{currentSymbol.quote}</span>
						<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center mr-1">{getContractShowType()}</span>
						<Iconify icon="eva:arrow-down-fill" className="text-[16px] text-[#9e9e9e]" />
					</div>
					<div
						className={`text-[var(--text-color5)] font-[600] text-[28px] mb-[5px] ${isPriceUp
						? "text-[var(--success-color)]"
						: "text-[var(--error-color)]"
						}`}
					>
						{formatPriceWithPrecision(marketInfo?.indexPrice)}
					</div>
					<div className="h-[17px] flex items-center text-[12px] mb-[3px]">
						<span className="tip-color mr-[19px]">≈ ${marketInfo?.indexPrice ? getPairsRate(marketInfo?.indexPrice, 'USD').rate.toFixed(2) : '--' }</span>
						<span 
							className={`${isPriceUp
							? "text-[var(--success-color)]"
							: "text-[var(--error-color)]"
							}`}
						>{formatFundRate(marketInfo?.currentFundRate)}</span>
					</div>
					<div className="h-[14px] text-[10px] flex items-center">
						<span className="tip-color border-b border-dashed border-[#9e9e9e] mr-[4px]">{t("contractHeader.markPrice")}</span>
						<span>{formatPriceWithPrecision(marketInfo?.tagPrice)}</span>
					</div>
				</div>
				<div className="flex-1 shrink-0">
					<div className="flex mb-[8px]">
						<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px] mr-[20px]">
							<span className="tip-color mb-[2px]">{t('24hHigh')}</span>
							<span>{formatPriceWithPrecision(priceData?.high24h || 4079.098)}</span>
						</p>
						<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
							<span className="tip-color mb-[2px]">{t('contractHeader.volume24h')}</span>
							<span>{priceData?.volume24h ? formatAmount(priceData?.volume24h, t) : formatAmount(89876539.9809, t)}</span>
						</p>
					</div>
					<div className="flex mb-[8px]">
						<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px] mr-[20px]">
							<span className="tip-color mb-[2px]">{t('24hLow')}</span>
							<span>{formatPriceWithPrecision(priceData?.low24h || 4079.098)}</span>
						</p>
						<p className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
							<span className="tip-color mb-[2px]">{t('contractHeader.turnover24h')}</span>
							<span>{priceData?.turnover24h ? formatAmount(priceData?.turnover24h, t) : formatAmount(8987653999.9809, t)}</span>
						</p>
					</div>
					<div className="flex flex-col gap-y-[2px] text-[10px] leading-[14px]">
						<span className="tip-color w-fit mb-[2px] border-b border-dashed border-[#9e9e9e]">{t('contractHeader.fundingRate')}</span>
						<span>{'0.0066%'}/{formatSeconds(689)}</span>
					</div>
				</div>
			</div>
		</div>
	)
});

export default ContractHeader;