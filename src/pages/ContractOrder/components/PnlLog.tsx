import React, {useState, useEffect, useRef, useMemo} from 'react';
import { useLanguage } from '@/hooks';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '@/components/icon';
import { Toast, InfiniteScroll } from 'antd-mobile';
import { getLabel } from '@/utils';
import SelectPop from '@/components/SelectPop';
import dayjs from 'dayjs';
import { NoData } from '@/components/noData';
import appStore from '@/store';
import { BigNumber } from 'bignumber.js';

import SharePopup from '@/pages/Contract/components/ContractOrder/components/Popup/SharePopup';
import { ReactComponent as FrameIcon } from '@/assets/images/exchange/Frame.svg';

import { Position as DataType } from "@/pages/Contract/components/ContractOrder/hooks";
import { Side, SideMap, Type, PositionType, Open, Status, TypeMap, PositionTypeMap } from '@/pages/Contract/components/ContractOrder/configs/columns';
import { getHistoryPositionList } from "@/services/contract";

interface Props {
	contractList: any[]
}
type ParamData = {
  page: number;
  pageSize: number;
  [key: string]: any;
};

const PnlLog:React.FC<Props> = ({contractList}) => {
	const { t, currentLanguage } = useLanguage(['contract', 'spot']);
	// 获取当前合约信息
	const currentContractInfo = appStore.getCurrentContractInfo();
	const currentSymbol = currentContractInfo?.symbol || "";

	const [shareVisible, setShareVisible] = useState(false);
	const [currentData, setCurrentData] = useState<DataType>();
	const [orderList, setOrderList] = useState<DataType[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [hasMore, setHasMore] = useState(true)
	const [currentContract, setCurrentContract] = useState(currentContractInfo);
	const [contractId, setContractId] = useState(currentContractInfo.id);
	const paramdataRef = useRef<ParamData>({
		page: 1,
		pageSize: 10
	});

	const symbolPricePrecision = useMemo(() => {
		return currentContract?.coinResultVo?.symbolPricePrecision;
	}, [currentContract])

	const contractOptions = [
		// {label: t('order.select.allContract'), value: ''},
		...contractList.map(item => ({
			label: item.contractName,
			value: item.id
		}))
	]

	// 显示合约类型
	const getCurrentContract = () => {
		const target = contractList.find(item => item.id === contractId)
		setCurrentContract(target)
	}

	// 显示合约类型
	const getContractShowType = () => {
		const type = currentContract.contractShowType;
		return type ? type.replace('合约', '') : '模拟'
	}

	const handleSelect = (value: string) => {
		if (value || value?.toString() === '0') {
			setContractId(value)
		} else {
			setContractId(currentContractInfo.id)
		}
		getCurrentContract();
		initData();
	}

	const getOrderListData = async () => {
		const params = {
			page: paramdataRef.current.page,
			limit: paramdataRef.current.pageSize,
			contractId: contractId,
			uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
		}
		paramdataRef.current.page === 1 && setLoading(true)
		try {
			const res = await getHistoryPositionList(params)
			if (res.code === '0') {
				setOrderList(prev => paramdataRef.current.page === 1 ? res.data?.positionList : [...prev, ...res.data?.positionList]);
				setTotal(res.data.count);
				setHasMore(orderList.length + res.data.positionList.length < res.data.count)
			} else {
				Toast.show({icon: 'fail', content: res.msg});
			}
		} catch (error) {
			Toast.show({icon: 'fail', content: String(error)});
		} finally {
			setLoading(false)
		}
	}

	const loadMore = async () => {
		if (orderList.length < total) {
			paramdataRef.current.page++
			getOrderListData()
		} else {
			setHasMore(false)
		}
	}

	const initData = () => {
		paramdataRef.current.page = 1
		setTotal(0)
		setOrderList([])
		getOrderListData();
	}

	// 条件变化时需要初始化页数
	useEffect(() => {
		initData();
	}, [currentLanguage])

	return (
		<div>
			<div className="flex h-[44px] px-[16px] items-center justify-between border border-color">
				<div className="flex gap-x-[14px]">
					<SelectPop
						value={contractId}
						options={contractOptions}
						placeholder={t('placeholder')}
						title={t('placeholder')}
						activeType='icon'
						onChange={(value:any) => handleSelect(value)}
						renderBtn={(open) => (
							<button 
								type="button" 
								className={`text-[14px] leading-[20px] flex items-center`}
								onClick={open}
							>
								<span>{getLabel(contractId, contractOptions)}</span>
								<Iconify icon="eva:arrow-down-fill" className="text-[12px] ml-1" />
							</button>
						)}
					/>
				</div>
			</div>
			<ul className="hideScrollBar">
				{
					loading ? 
					<li className="h-[200px] flex justify-center items-center">
						<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
					</li> :
					orderList.length ? orderList.map((item) => {
						return (<li key={item.id} className="border-b border-color p-4">
							<div className="flex items-center justify-between mb-[16px]">
								<div>
									<div className="h-[22px] flex items-center mb-[2px]">
										<span className="text-[14px] font-medium mr-[4px]">{item.symbol ?? currentSymbol}</span>
										<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center">{getContractShowType()}</span>
									</div>
									<div className="leading-[17px] text-[12px] flex items-center">
										<span
											className={`leading-[17px] mr-[22px]
												${item.orderSide === Side.BUY ? 'success_icon' : 'error_icon'}
											`}
										>
											{t(PositionTypeMap[item.positionType])}/{t(SideMap[item.orderSide])}
										</span>
										<span className="tip-color">{dayjs().format("YYYY-MM-DD HH:mm:ss")}</span>
									</div>
								</div>
								<FrameIcon className="W-[20px] h-[20px]" onClick={() => {
									setShareVisible(true)
									setCurrentData(item)
								}} />
							</div>
							<div className="flex-col gap-y-[16px]">
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('realizedPnl')}</span>
									<span>{new BigNumber(item.realizedAmount).toFormat(symbolPricePrecision)}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('order.positionColumn.openAvgPrice')}</span>
									<span>{new BigNumber(item.openAvgPrice).toFormat(symbolPricePrecision)}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('calculator.positionSize')}(USDT)</span>
									<span>{new BigNumber(item.positionVolume).toFormat(symbolPricePrecision)}</span>
								</p>
							</div>
						</li>)
					}) :
					<li className="h-[200px] pt-[84px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
			{orderList.length > 0 && <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />}
			{currentData && <SharePopup 
				open={shareVisible}
				data={currentData}
				onCancel={() => setShareVisible(false)}
				onConfirm={() => setShareVisible(false)}
			/>}
		</div>
	)
}

export default PnlLog;