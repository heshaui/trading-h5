import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { Iconify } from "@/components/icon"
import { useLanguage } from '@/hooks/useLanguage';
import { Image, Toast } from 'antd-mobile';
import { useThemeMode } from '@/hooks/useThemeMode';
import appStore from '@/store';
import { NoData } from '@/components/noData';
import { BigNumber } from 'bignumber.js';
import { HistoryCommission } from "@/pages/Contract/components/ContractOrder/hooks";
import { getHistoryTradeList } from '@/services/contract';
import { Side, SideMap, Type, PositionType, Open, Status, StatusMap, TypeMap, PositionTypeMap } from '@/pages/Contract/components/ContractOrder/configs/columns';

import success_part_day from '@/assets/images/spot/spotOrder/success_part_day.svg'
import success_part_dark from '@/assets/images/spot/spotOrder/success_part_dark.svg'
import success_all_dark from '@/assets/images/spot/spotOrder/success_all_dark.svg'
import success_all_day from '@/assets/images/spot/spotOrder/success_all_day.svg'
import fail_day from '@/assets/images/spot/spotOrder/fail_day.svg'
import fail_dark from '@/assets/images/spot/spotOrder/fail_dark.svg'
import error_day from '@/assets/images/spot/spotOrder/error_day.svg'
import error_dark from '@/assets/images/spot/spotOrder/error_dark.svg'


interface DataType {
  contractId: number; // 合约ID
  contractName: string; // 合约名称
  ctime: number; // 创建时间
  fee: number; // 手续费
  feeCoin: string; // 手续费币种
  feeCoinPrecision: number; // 手续费币种精度
  id: string; // 订单ID
  open: string; // 开仓方向
  price: number; // 成交价格
  pricePrecision: number; // 价格精度
  role: string; // 角色
  side: Side; // 方向
  symbol: string; // 合约
  volume: number; // 成交数量
}

const OrderDetail = () => {
	const {t, currentLanguage} = useLanguage(['contract', 'spot']);
	const { isDayMode } = useThemeMode();
	const navigate = useNavigate();
	const location = useLocation();
	const userInfo = appStore.getUserInfo() || appStore.userInfo;
	const [loading, setLoading] = useState(false);
	const [tradeList, setTradeList] = useState<DataType[]>([]);
	// 从 location.state 获取传递的数据
	const { recordData, orderId, symbol }: {
		recordData: HistoryCommission,
		orderId: string,
		symbol: string
	} = location.state || {};
	// 获取当前合约信息
	const currentContractInfo = appStore.getCurrentContractInfo();
	const currentSymbol = currentContractInfo?.symbol || "";
	const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;

	// 如果没有传递必要的数据，可以重定向回列表页
	useEffect(() => {
		if (!orderId || !recordData) {
			console.warn('缺少必要的订单数据，重定向到列表页');
			navigate('/contractOrder', { replace: true });
		}
	}, [orderId, recordData, navigate]);

	// 根据状态返回样式和图片的方法
	const getStatusIconAndStyle = useCallback(() => {
		const status = recordData?.status
		// 成功状态：0, 1, 4, 5
		if ([0, 1, 2, 3].includes(status)) {
			return {
				className: 'success_icon',
				icon: status === 1
					? (isDayMode ? success_all_day : success_all_dark)
					: (isDayMode ? success_part_day : success_part_dark)
			};
		}
		// 错误状态：2, 3, 6
		else if ([4, 5, 6, 7].includes(status)) {
			return {
				className: 'error_icon',
				icon: status === 2
					? (isDayMode ? fail_day : fail_dark)
					: (isDayMode ? error_day : error_dark)
			};
		}
		// 默认情况
		else {
			return {
				className: 'success_icon',
				icon: isDayMode ? success_part_day : success_part_dark
			};
		}
	}, [isDayMode, recordData])

	const getCompletion = () => {
		const result = (Number(recordData.dealVolume) / Number(recordData?.volume)) * 100
		return <>
			{recordData?.status === 1 ? `100%` : recordData?.volume ?
				<span >
					{recordData.dealVolume && recordData.dealVolume.toString() !== '0' ? `${result.toFixed(2)}%` : '0%'}
				</span> : '0'
			}
		</>
	}

	const handleGoBack = () => {
		navigate('/contractOrder', {
			state: { fromDetail: true },
			replace: true
		});
	};

	const getData = async() => {
		setLoading(true)
		try {
			const paramsTime = [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")]
			const params = {
				limit: 1000,
				page: 1,
				uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
				contractId: currentContractInfo.id,
				beginTime: paramsTime[0].valueOf(),
				endTime: paramsTime[1].valueOf(),
			}
			const res = await getHistoryTradeList(params)
			if (res.code === "0") {
				setTradeList(res.data?.tradeHisList ?? [])
			} else {
				Toast.show({icon: 'fail', content: res.msg})
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getData()
	}, [currentLanguage])

	return (
		<>
			<h3 className="pl-4 text-[16px] h-[44px] flex recordDatas-center font-medium mb-4" onClick={handleGoBack}>
				<Iconify icon="icon-park-outline:left" className="text-[24px]"/>
				<div className="flex-1 flex-x-cc">
					<span className="text-[16px] font-medium mr-[4px]">{symbol ?? '--'}</span>
					<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center">模拟</span>
				</div>
			</h3>
			<div className={`flex-y-cc`}>
				<div className={`flex-y-cc`}>
					<Image src={getStatusIconAndStyle().icon} className={`w-[160px] h-[102px]`} />
				</div>
				<div className={`${getStatusIconAndStyle().className} mt-2 font-14 leading-[20px]`}>
					<span className={`mr-1`}>
						{t(StatusMap[recordData.status])}
					</span>
					{recordData?.status !== 4 && recordData?.status !== 6 && getCompletion()}
				</div>
			</div>
			<div className="flex-col gap-y-[16px] px-4 mt-4">
				<p className="flex recordDatas-center justify-between h-[20px] text-[14px]">
					<span className="text-[#9e9e9e]">{t('order.historyColumn.price')}</span>
					<span>{new BigNumber(recordData.price).toFormat(symbolPricePrecision)}/{t(TypeMap[recordData.type]).replace('单', '')}</span>
				</p>
				<p className="flex recordDatas-center justify-between h-[20px] text-[14px]">
					<span className="text-[#9e9e9e]">{t('orderAmount')}(USDT)</span>
					<span>{recordData.dealVolume.toFixed(2)}/{recordData.volume.toFixed(2)}</span>
				</p>
				{/* <p className="flex recordDatas-center justify-between h-[20px] text-[14px]">
					<span className="text-[#9e9e9e]">{t('order.tradeRecordColumn.profitRealizedAmount')}(USDT)</span>
					<span>{0}</span>
				</p> */}
				<p className="flex recordDatas-center justify-between h-[20px] text-[14px]">
					<span className="text-[#9e9e9e]">{t('orderType')}</span>
					<span>{t(TypeMap[recordData.type])}</span>
				</p>
				<p className="flex recordDatas-center justify-between h-[20px] text-[14px]">
					<span className="text-[#9e9e9e]">{t('status')}</span>
					<span>{t(StatusMap[recordData.status])}</span>
				</p>
			</div>
			<div className="border-b border-color px-4 text-[14px] font-medium leading-[44px] my-4">
				{t('order.tradeHistory')}
			</div>
			<div className="flex h-[17px] items-center text-[12px] text-[#9e9e9e] mb-[9px] px-4">
				<span className="text-left flex-1">
					{t("filledPrice")}(USDT)
				</span>
				<span className="text-right flex-1">
					{t("filledAmount")}({t('tradingPanel.unit')})
				</span>
				<span className="text-right flex-1">{t("fee")}(USDT)</span>
			</div>
			<ul className="hideScrollBar px-4">
				{
					loading ? 
					<li className="h-[200px] flex justify-center items-center">
						<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
					</li> :
					tradeList.length ? tradeList.map((trade) => {
						return (<li key={trade.id} className="flex justify-between h-[17px] mb-[15px] last:mb-0 items-center text-[14px]">
							<span
								className={`flex-1 text-left}`}
							>
								{trade.price.toFixed(symbolPricePrecision ?? 1)}
							</span>
							<span className="flex-1 text-right">
								{trade.volume.toFixed(8)}
							</span>
							<span className="flex-1 text-right">{trade.fee.toFixed(8)}</span>
						</li>)
					}) :
					<li className="h-[200px] pt-[84px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
		</>
	)
}


export const meta = {
  requireAuth: true,
  layout: 'header-only'
}
export default OrderDetail;