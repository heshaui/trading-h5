import React, {useState, useEffect, useRef, useMemo} from 'react';
import { useLanguage } from '@/hooks';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '@/components/icon';
import { Toast, InfiniteScroll } from 'antd-mobile';
import { getLabel } from '@/utils';
import { Checkbox } from 'antd'
import SelectPop from '@/components/SelectPop';
import dayjs, { Dayjs } from 'dayjs';
import { NoData } from '@/components/noData';
import appStore from '@/store';
import { BigNumber } from 'bignumber.js';

import DateTimePop from '@/components/DateTimePop';

import { HistoryCommission as DataType } from "@/pages/Contract/components/ContractOrder/hooks";
import { Side, SideMap, Type, PositionType, Open, Status, StatusMap, TypeMap, PositionTypeMap } from '@/pages/Contract/components/ContractOrder/configs/columns';
import { getHistoryOrderList, getHistoryPlanOrderList } from "@/services/contract";

interface Props {
	contractList: any[]
}
type ParamData = {
  page: number;
  pageSize: number;
  type: string;
  contractId: string;
  beginTime: number | undefined;
  endTime: number | undefined;
  [key: string]: any;
};

const OrderHistory:React.FC<Props> = ({contractList}) => {
	const { t, currentLanguage } = useLanguage(['contract', 'spot']);
	const navigate = useNavigate();
	// 获取当前合约信息
	const currentContractInfo = appStore.getCurrentContractInfo();

	const [datePopVisible, setDatePopVisible] = useState(false);
	const [orderId, setOrderId] = useState();
	const [orderList, setOrderList] = useState<DataType[]>([]);
	const [allList, setAllList] = useState<DataType[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [hasMore, setHasMore] = useState(true)
	const [currentContract, setCurrentContract] = useState(currentContractInfo);
	const paramdataRef = useRef<ParamData>({
		page: 1,
		pageSize: 10,
		type: '',
		contractId: currentContractInfo.id,
		orderType: '1',
		beginTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
		endTime: dayjs().endOf('day').valueOf()
	});
	const symbolPricePrecision = useMemo(() => {
		return currentContract?.coinResultVo?.symbolPricePrecision;
	}, [currentContract])

	const typeOptions = [
		{label: t('order.select.allType'), value: ''},
		{label: t('order.select.limitOrder'), value: 1},
		{label: t('order.select.marketOrder'), value: 2}
	]

	const orderTypeOptions = [
		{label: t('order.defaultCommission'), value: '1'},
		{label: t('order.planCommission'), value: '2'}
	]

	const contractOptions = [
		// {label: t('order.select.allContract'), value: ''},
		...contractList.map(item => ({
			label: item.contractName,
			value: item.id
		}))
	]

	// 显示合约类型
	const getCurrentContract = () => {
		const target = contractList.find(item => item.id === paramdataRef.current.contractId)
		setCurrentContract(target)
	}

	// 显示合约类型
	const getContractShowType = () => {
		const type = currentContract.contractShowType;
		return type ? type.replace('合约', '') : '模拟'
	}

	const handleSelect = <K extends keyof ParamData>(value: ParamData[K], type: K) => {
		if (value || value?.toString() === '0') {
			paramdataRef.current[type] = value
		} else {
			paramdataRef.current[type] = '';
			switch (type) {
				case 'orderType': paramdataRef.current[type] = '1'; break;
				case 'contractId': paramdataRef.current[type] = currentContractInfo.id; break;
			}
		}
		type === 'contractId' && getCurrentContract();
		initData();
	}

	const getOrderListData = async () => {
		const params = {
			page: paramdataRef.current.page,
			limit: paramdataRef.current.pageSize,
			type: paramdataRef.current.type,
			contractId: paramdataRef.current.contractId,
			beginTime: paramdataRef.current.beginTime,
			endTime: paramdataRef.current.endTime,
			uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
		}
		paramdataRef.current.page === 1 && setLoading(true)
		console.log('条件变了')
		try {
			const res = paramdataRef.current.orderType === '1' ? await getHistoryOrderList(params) : await getHistoryPlanOrderList(params)
			if (res.code === '0') {
				const resData = paramdataRef.current.orderType === '1' ? res.data?.orderList ?? [] : res.data?.trigOrderList ?? [];
				setOrderList(prev => paramdataRef.current.page === 1 ? resData : [...prev, ...resData]);
				setTotal(res.data.count);
				setHasMore(orderList.length + resData.length < res.data.count)
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

	const disabled7DaysDate = (current: Dayjs, info?: { from?: Dayjs; type?: string }) => {
		const { from, type } = info || {};
		
		if (from) {
			// 如果已经选择了一个日期，限制另一个日期的选择范围为7天内
			const minDate = from.subtract(7, 'days');
			const maxDate = from.add(7, 'days');
			
			switch (type) {
			case 'year':
				return current.year() < minDate.year() || current.year() > maxDate.year();
			case 'month':
				const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();
				return (
				getYearMonth(current) < getYearMonth(minDate) ||
				getYearMonth(current) > getYearMonth(maxDate)
				);
			default:
				return Math.abs(current.diff(from, 'days')) > 7;
			}
		}
		
		// 如果没有选择起始日期，则限制在6个月范围内
		const sixMonthsAgo = dayjs().subtract(6, 'month');
		const today = dayjs();
		
		return current.isBefore(sixMonthsAgo) || current.isAfter(today);
	};

	// 过滤已撤销的数据
	const filterCancel = (check: boolean) => {
		if (check) {
			setAllList(orderList)
			setOrderList(prev => {
				return prev.filter(item => item.status !== 3)
			})
		} else {
			setOrderList(allList)
		}
	}

	const initData = () => {
		paramdataRef.current.page = 1
		setTotal(0)
		setOrderList([])
		getOrderListData();
	}

	const toDetail = (record: DataType) => {
		navigate(`/contractOrder/detail`, {
              state: {
                recordData: record,
                orderId: record.id,
                symbol: record.symbol,
                fromTab: '2' // 标识来源是历史委托tab
              }
        });
	}

	// 条件变化时需要初始化页数
	useEffect(() => {
		initData();
	}, [currentLanguage])

	return (
		<div>
			<div className="flex h-[44px] px-[16px] items-center justify-between border border-color">
				<div className="flex flex-1 gap-x-[14px]">
					<SelectPop
						value={paramdataRef.current.contractId}
						options={contractOptions}
						placeholder={t('placeholder')}
						title={t('placeholder')}
						activeType='icon'
						onChange={(value:any) => handleSelect(value, 'contractId')}
						renderBtn={(open) => (
							<button 
								type="button" 
								className={`max-w-[78.34px] text-[14px] leading-[20px] flex items-center`}
								onClick={open}
							>
								<span className="min-w-0 truncate">{getLabel(paramdataRef.current.contractId, contractOptions)}</span>
								<Iconify icon="eva:arrow-down-fill" className="text-[12px] ml-1 shrink-0" />
							</button>
						)}
					/>
					<SelectPop
						value={paramdataRef.current.orderType}
						options={orderTypeOptions}
						placeholder={t('placeholder')}
						title={t('placeholder')}
						activeType='icon'
						onChange={(value) => handleSelect(value, 'orderType')}
						showSearch={false}
						renderBtn={(open) => (
							<button 
								type="button" 
								className={`max-w-[78.34px] text-[14px] leading-[20px] flex items-center`}
								onClick={open}
							>
								<span className="min-w-0 truncate">{getLabel(paramdataRef.current.orderType, orderTypeOptions)}</span>
								<Iconify icon="eva:arrow-down-fill" className="text-[12px] shrink-0 ml-1" />
							</button>
						)}
					/>
					<SelectPop
						value={paramdataRef.current.type}
						options={typeOptions}
						placeholder={t('placeholder')}
						title={t('placeholder')}
						activeType='icon'
						onChange={(value:any) => handleSelect(value, 'type')}
						showSearch={false}
						renderBtn={(open) => (
							<button 
								type="button" 
								className={`max-w-[78.34px] text-[14px] leading-[20px] flex items-center`}
								onClick={open}
							>
								<span className="min-w-0 truncate">{getLabel(paramdataRef.current.type, typeOptions)}</span>
								<Iconify icon="eva:arrow-down-fill" className="text-[12px] shrink-0 ml-1" />
							</button>
						)}
					/>
				</div>
				<button type="button" onClick={() => setDatePopVisible(true)}>
					<Iconify icon="mingcute:filter-line" className="text-[20px] tip-color" />
				</button>
			</div>
			<ul className="hideScrollBar">
				{
					loading ? 
					<li className="h-[200px] flex justify-center items-center">
						<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
					</li> :
					orderList.length ? orderList.map((item) => {
						return (<li key={item.id} className="border-b border-color p-4">
							<div className="mb-4">
								<div className="flex h-[22px] items-center justify-between mb-[2px]">
									<div className="h-[22px] flex items-center">
										<span className="text-[14px] font-medium mr-[4px]">{item.symbol ?? '--'}</span>
										<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center">{getContractShowType()}</span>
									</div>
									<div className="flex items-center h-[17px]" onClick={() => toDetail(item)}>
										<span className="text-[12px] tip-color">{dayjs(item.ctime).format("YYYY-MM-DD HH:mm:ss")}</span>
										<Iconify icon="mingcute:right-line" className={`tip-color text-[16px]`} />
									</div> 
								</div>
								<div className="leading-[17px] text-[12px]">
									<span className={`${item.side === Side.BUY ? 'success_icon' : 'error_icon'}`}>
										{t(SideMap[item.side])}
									</span>
								</div>
							</div>
							<div className="flex-col gap-y-[16px]">
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('order.historyColumn.price')}</span>
									<span>{new BigNumber(item.price).toFormat(symbolPricePrecision)}/{t(TypeMap[item.type]).replace('单', '')}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('orderAmount')}(USDT)</span>
									<span>{item.dealVolume.toFixed(2)}/{item.volume.toFixed(2)}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('order.tradeRecordColumn.profitRealizedAmount')}(USDT)</span>
									<span>{0}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('orderType')}</span>
									<span>{t(TypeMap[item.type])}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('status')}</span>
									<span>{t(StatusMap[item.status])}</span>
								</p>
							</div>
						</li>)
					}) :
					<li className="h-[200px] pt-[84px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
			{orderList.length > 9 && <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />}
			<DateTimePop
				popupVisible={datePopVisible}
				onOpen={() => setDatePopVisible(true)}
				handlePopupClose={() => setDatePopVisible(false)}
				title={t('spot:spot.select.filter')}
				onChange={(value) => {
					paramdataRef.current.beginTime = value[0]?.startOf('day').valueOf()
					paramdataRef.current.endTime = value[1]?.endOf('day').valueOf()
					initData()
					getOrderListData()
				}}
				defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
				minDate={dayjs().subtract(6, 'month')}
				maxDate={dayjs().endOf('day')}
				placeholder={[t('spot:spot.select.startTime'), t('spot:spot.select.endTime')]}
				disabledDate={disabled7DaysDate}
				customHeader={
					<div>
						<Checkbox
							defaultChecked={false}
							onChange={(e) => {
								filterCancel(e.target.checked)
							}}
							className={`custom-checkbox`}
						>
							<span className={`tip-color font-14`}>
								{t('spot:spot.select.hideAllCancel')}
							</span>
						</Checkbox>
					</div>
				}
			/>
		</div>
	)
}

export default OrderHistory;