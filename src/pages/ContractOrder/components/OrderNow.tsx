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

import DelectModal from '@/pages/SpotOrder/components/TipPop/Delect_modal';

import { useOrdinaryCommission, OrdinaryCommission as DataType } from "@/pages/Contract/components/ContractOrder/hooks";
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

	// 普通委托
	const { handleCancelOrdinaryOrder } = useOrdinaryCommission();

	const [delVisible, setDelVisible] = useState(false);
	const [currentOrder, setCurrentOrder] = useState<DataType>();
	const [delType, setDelType] = useState(0); // 0:全部 1: 单个
	const [orderList, setOrderList] = useState<DataType[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [hasMore, setHasMore] = useState(true)
	const [currentContract, setCurrentContract] = useState(currentContractInfo);
	const paramdataRef = useRef<ParamData>({
		page: 1,
		pageSize: 10,
		type: '',
		contractId: currentContractInfo.id,
		orderType: '1'
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

	const getCurrentContract = () => {
		const target = contractList.find(item => item.id === paramdataRef.current.contractId)
		setCurrentContract(target)
	}

	// 显示合约类型
	const getContractShowType = () => {
		const type = currentContract.contractShowType;
		return type ? type.replace('合约', '') : '模拟'
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
			uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
		}
		paramdataRef.current.page === 1 && setLoading(true)
		console.log('条件变了')
		try {
			const res = paramdataRef.current.orderType === '1' ? await getCurrentOrderList(params) : await getPlanOrderList(params)
			if (res.code === '0') {
				const resData = paramdataRef.current.orderType === '1' ? res.data?.orderList ?? [] : res.data?.trigOrderList ?? [];
				setOrderList(prev => paramdataRef.current.page === 1 ? resData : [...prev, ...resData]);
				setTotal(res.data.count);
				setHasMore(orderList.length + resData.length < res.data.count)
			} else {
				Toast.show({icon: 'fail', content: res.msg});
			}
		} catch (error) {
			Toast.show({icon: 'fail', content: String(error)})
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

	// 撤销订单
	const delOrder = async() => {
		await handleCancelOrdinaryOrder(currentOrder!, true);
		message.success(t("cancelled"))
		initData();
	}
	// 全部撤销
	const handleCancelAllOrders = async () => {
		for (const record of orderList) {
			try {
				await handleCancelOrdinaryOrder(record, true)
			} catch (error) {
				console.error("撤销失败:", error)
			}
		}
		message.success(t("cancelled"))
		initData();
	}
	// 撤单确认
	const handleDelOk = () => {
		setDelVisible(false);
		delType ? delOrder() : handleCancelAllOrders();
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
										setCurrentOrder(item)
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
				orderId={[]}
				type={delType}
				onCancel={() => setDelVisible(false)}
				onOk={handleDelOk} 
			/>
		</div>
	)
}

export default OrderNow;