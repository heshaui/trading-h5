import React, {useState, useEffect, useRef} from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';
import { Toast } from 'antd-mobile';
import { getLabel } from '@/utils';
import SelectPop from '@/components/SelectPop';
import DateTimePop from '@/components/DateTimePop';
import { CustomTable } from '@/components/CustomCom'
import type { ColumnType } from '@/components/CustomCom/CustomTable';

import { useOrdinaryCommission, OrdinaryCommission as DataType } from "@/pages/Contract/components/ContractOrder/hooks";
import { getCurrentOrderList, getPlanOrderList } from "@/services/contract";

interface Props {
	contractList: any[]
}
type ParamData = {
  page: number;
  pageSize: number;
  type: string;
  currentId: string;
  uaTime: string;
  [key: string]: any;
};

const OrderNow:React.FC<Props> = ({contractList}) => {
	const { t } = useLanguage('contract');
	const [datePopVisible, setDatePopVisible] = useState(false);
	const [orderList, setOrderList] = useState<DataType[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const paramdataRef = useRef<ParamData>({
		page: 1,
		pageSize: 10,
		type: '',
		currentId: '',
		uaTime: '',
		orderType: ''
	});

	const typeOptions = [
		{label: t('order.select.allType'), value: ''},
		{label: t('order.select.postOnly'), value: 'PostOnly'},
		{label: t('order.select.ioc'), value: 'IOC'}
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

	const pageChange = async (page: number, pageSize: number) => {
		const pageData = {
		page: page,
		pageSize: pageSize
		}
		paramdataRef.current.page = page
		paramdataRef.current.pageSize = pageSize
		getOrderListData()
	}

	const handleSelect = <K extends keyof ParamData>(value: ParamData[K], type: K) => {
		if (value || value?.toString() === '0') {
			paramdataRef.current[type] = value
		} else {
			paramdataRef.current[type] = ''
		}
		getOrderListData()
	}

	const getOrderListData = async () => {
		const params = {
			page: paramdataRef.current.page,
			limit: paramdataRef.current.pageSize,
			orderType: 0,
			type: paramdataRef.current.type,
			contractId: paramdataRef.current.contractId
		}
		setLoading(true)
		try {
			const res = paramdataRef.current.orderType === '1' ? await getCurrentOrderList(params) : await getPlanOrderList(params)
			if (res.code === '0') {
				const newData = res.data.orderList.map((item: any) => ({
					...item
				}));
				setOrderList(newData);
				setTotal(res.data.count);
			} else {
				Toast.show(res.message);
			}
		} catch (error) {
			Toast.show(String(error))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getOrderListData();
	}, [])

	return (
		<div>
			<div>
				<div>
					<SelectPop
						options={contractOptions}
						placeholder={t('placeholder')}
						title={t('placeholder')}
						activeType='icon'
						renderValue={() => getLabel(paramdataRef.current.contractId, contractOptions)}
						onChange={(value) => handleSelect(value, 'contractId')}
						showSearch={false}
					/>
					<SelectPop
						options={orderTypeOptions}
						placeholder={t('placeholder')}
						title={t('placeholder')}
						activeType='icon'
						renderValue={() => getLabel(paramdataRef.current.orderType, orderTypeOptions)}
						onChange={(value) => handleSelect(value, 'orderType')}
						showSearch={false}
					/>
					<SelectPop
						options={typeOptions}
						placeholder={t('placeholder')}
						title={t('placeholder')}
						activeType='icon'
						renderValue={() => getLabel(paramdataRef.current.type, typeOptions)}
						onChange={(value:any) => handleSelect(value, 'type')}
						showSearch={false}
					/>
				</div>
				<button type="button" onClick={() => setDatePopVisible(true)}>
					<Iconify icon="mingcute:filter-line" className="text-[20px] tip-color" />
				</button>
			</div>
		</div>
	)
}

export default OrderNow;