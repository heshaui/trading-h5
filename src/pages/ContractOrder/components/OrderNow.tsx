import React, {useState, useEffect, useRef} from 'react';
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

import DelectModal from '@/pages/SpotOrder/components/TipPop/Delect_modal';

import { OrdinaryCommission as DataType } from "@/pages/Contract/components/ContractOrder/hooks";
import { Side, SideMap, Type, PositionType, Open, Status, TypeMap, PositionTypeMap } from '@/pages/Contract/components/ContractOrder/configs/columns';
import { getCurrentOrderList, getPlanOrderList, cancelOrder } from "@/services/contract";

interface Props {
	contractList: any[]
}
type ParamData = {
  page: number;
  pageSize: number;
  type: string;
  contractId: string;
  [key: string]: any;
};

const OrderNow:React.FC<Props> = ({contractList}) => {
	const { t, currentLanguage } = useLanguage(['contract', 'spot']);
	// 获取当前合约信息
    const currentContractInfo = appStore.getCurrentContractInfo();
    const currentSymbol = currentContractInfo?.symbol || "";
    const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;

	const [delVisible, setDelVisible] = useState(false);
	const [orderIds, setOrderIds] = useState<string[]>([]);
	const [delType, setDelType] = useState(0); // 0:全部 1: 单个
	const [orderList, setOrderList] = useState<DataType[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [hasMore, setHasMore] = useState(true)
	const paramdataRef = useRef<ParamData>({
		page: 1,
		pageSize: 10,
		type: '',
		contractId: '',
		orderType: '1'
	});

	const typeOptions = [
		{label: t('order.select.allType'), value: ''},
		{label: t('order.select.limitOrder'), value: 1},
		{label: t('order.select.postOnly'), value: 5}
	]

	const orderTypeOptions = [
		{label: t('order.defaultCommission'), value: '1'},
		{label: t('order.planCommission'), value: '2'}
	]

	const contractOptions = [
		{label: t('order.select.allContract'), value: ''},
		...contractList.map(item => ({
			label: item.contractName,
			value: item.id
		}))
	]

	// 显示合约类型
	const getContractShowType = () => {
		return t(`contractInfo.${'demo'}`)
	}
    
    // 计算完成度
    const setFinally = (num: number, total: number) => {
        if (!num || !total) return '0%';
        return (Number(num)/Number(total)).toFixed(2)+'%';
    }

	const handleSelect = <K extends keyof ParamData>(value: ParamData[K], type: K) => {
		if (value || value?.toString() === '0') {
			paramdataRef.current[type] = value
		} else {
			paramdataRef.current[type] = ''
		}
		initData();
		getOrderListData();
	}

	const getOrderListData = async () => {
		const params = {
			page: paramdataRef.current.page,
			limit: paramdataRef.current.pageSize,
			type: paramdataRef.current.type,
			contractId: paramdataRef.current.contractId,
			uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
		}
		paramdataRef.current.page === 1 && setLoading(true)
		console.log('条件变了')
		try {
			const res = paramdataRef.current.orderType === '1' ? await getCurrentOrderList(params) : await getPlanOrderList(params)
			const resData = paramdataRef.current.orderType === '1' ? res.data.orderList : res.data.trigOrderList;
			if (res.code === '0') {
				setOrderList(prev => paramdataRef.current.page === 1 ? resData : [...prev, ...resData]);
				setTotal(res.data.count);
				setHasMore(orderList.length + resData.length < res.data.count)
			} else {
				Toast.show(res.message);
			}
		} catch (error) {
			Toast.show(String(error))
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
		setOrderList([
			{
				symbol: 'BTCUSDT',
				pricePrecision: 0,
				side: Side.BUY,
				positionType: PositionType.CROSS_MARGIN,
				avgPrice: 0,
				tradeFee: 0,
				type: Type.LIMIT,
				mtime: 0,
				volume: 0,
				dealVolume: 0,
				price: 0,
				contractId: 0,
				ctime: 0,
				contractName: '',
				id: '',
				open: Open.OPEN,
				status: Status.PENDING
			}
		])
	}

	// 条件变化时需要初始化页数
	useEffect(() => {
		initData();
		//getOrderListData();
	}, [currentLanguage])

	// 撤销订单
	const delOrder = async() => {
		try {
			const params = {
				orderId: orderIds,
				isConditionOrder: false,
			}
			const res = await cancelOrder(params)
			if (res.code === '0') {
				message.success('spot:spot.toastModal.canceled')
			} else {
				Toast.show({
					content: res.message,
					icon: 'fail',
				})
			}
			getOrderListData()
		} catch (error) {
			Toast.show({
				content: String(error),
				icon: 'fail',
			})
		}
	}
	// 撤单确认
	const handleDelOk = () => {
		setDelVisible(false);
		delOrder();
	}

	return (
		<div>
			<div className="flex h-[44px] px-[16px] items-center justify-between gap-x-[10px] border border-color">
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
				<button 
                    type="button" 
                    className="m-w-[68px] shrink-0 h-[25px] px-[10px] flex justify-center items-center bg-[var(--border-color-light)] rounded-[25px] text-[12px]"
					onClick={() => {
						setDelType(0)
						setDelVisible(true)
						setOrderIds(orderIds.map((item:any) => item.id))
					}}
                >
                    {t('cancelAll')}
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
							<div className="flex items-center justify-between mb-[16px]">
								<div>
									<div className="h-[22px] flex items-center mb-[2px]">
										<span className="text-[14px] font-medium mr-[4px]">{item.symbol ?? '--'}</span>
										<span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center">{getContractShowType()}</span>
									</div>
									<div className="leading-[17px] text-[12px]">
										<span className={`${item.side === Side.BUY ? 'success_icon' : 'error_icon'}`}>
											{t(TypeMap[item.type])}/{t(SideMap[item.side])}
										</span>
										<span className="ml-[10px] tip-color">{dayjs(item.mtime).format("YYYY-MM-DD HH:mm:ss")}</span>
									</div>
								</div>
								<button 
									type="button" 
									className="h-[25px] px-[10px] flex justify-center items-center bg-[var(--border-color-light)] rounded-[25px] text-[12px]"
									onClick={() => {
										setDelType(1)
										setDelVisible(true)
										setOrderIds([item.id])
									}}
								>
									{t('cancel')}
								</button>
							</div>
							<div className="flex-col gap-y-[16px]">
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('order.ordinaryColumn.finally')}</span>
									<span>{setFinally(item.dealVolume, item.volume)}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('orderAmount')}(USDT)</span>
									<span>{item.dealVolume.toFixed(2)}/{item.volume.toFixed(2)}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('orderPrice')}</span>
									<span>{new BigNumber(item.price).toFormat(symbolPricePrecision)}</span>
								</p>
								<p className="flex items-center justify-between h-[20px] text-[14px]">
									<span className="text-[#9e9e9e]">{t('tpsl')}</span>
									<span>--/--</span>
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
			<DelectModal 
				open={delVisible}
				orderId={orderIds}
				type={delType}
				onCancel={() => setDelVisible(false)}
				onOk={handleDelOk} 
			/>
		</div>
	)
}

export default OrderNow;