import React, {useState, useRef, useEffect} from 'react';
import { useLanguage } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '@/components/icon';
import SelectPop from '@/components/SelectPop';
import DateTimePop from '@/components/DateTimePop';
import {Toast, Image} from 'antd-mobile';
import appStore from '@/store';
import dayjs, { Dayjs } from 'dayjs';
import NoData from '@/components/noData/noAddress';
import { getContractFinancialRecords } from '@/services/contract'

interface SelectParamType {
  startTime: number | string;
  endTime: number | string;
  type?: string;
  symbol: string;
}

interface OptionItem {
	label: string,
	value: string,
	url?: string
}

export interface AccountBalance {
  canUseAmount: string; // 可用余额
  isolateMargin: string; // 逐仓保证金
  lockAmount: string; // 锁定金额
  realizedAmount: string; // 已实现盈亏
  symbol: string; // 币种
  totalAmount: string; // 总余额
  totalMargin: string; // 总保证金
  totalMarginRate: string; // 总保证金率
  unRealizedAmount: string; // 未实现盈亏
}


const Account:React.FC = () => {
	const {t} = useLanguage(['assets', 'contract']);
	const navigate = useNavigate();
	const coinList = appStore.getCoinList();
	const selectParam = useRef<SelectParamType>({
		startTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
		endTime: dayjs().endOf('day').valueOf(),
		symbol: 'all',
		type: 'all'
	});
	const [datePopVisible, setDatePopVisible] = useState(false);
	const [accountList, setAccountList] = useState<AccountBalance[]>([]);
	const [loading, setLoading] = useState(false)

	const coinOptions:OptionItem[] = [
		{
			label: t('futureAccount.all'),
			value: 'all'
		},
		...coinList.map(coin => ({
			label: coin.coinName,
			value: coin.coinName,
			url: coin.iconUrl
		}))
	]

	const typeOptions = [
		{
			label: t('futureAccount.allType'),
			value: 'all'
		},
		{
			label: t('futureAccount.in'),
			value: 1
		},
		{
			label: t('futureAccount.out'),
			value: 2
		},
		{
			label: t('futureAccount.cost'),
			value: 3
		},
		{
			label: t('futureAccount.handlingFee'),
			value: 4
		},
	]

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

	const getData = async () => {
		setLoading(true)
		try {
			const res = await getContractFinancialRecords({
				onlyAccount: 1,
				uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
			});
			if (res.code === "0") {
				setAccountList(res.data.accountList);
			} else {
				Toast.show({
					icon: 'fail',
					content: res.msg,
				})
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getData();
	}, [])

	return (
		<div className="h-full flex-col">
			<h3 className="pl-4 text-[16px] h-[44px] flex items-center font-medium" onClick={() => navigate(-1)}>
				<Iconify icon="icon-park-outline:left" className="text-[24px]"/>
				<span className="ml-1">{ t('futureAccount.fundFlow') }</span>
			</h3>
			<div className="h-[50px] px-4 pt-4 pb-[10px] flex justify-between items-center border-b border-color">
				<div className="flex gap-x-[20px]">
					<SelectPop
						options={
							coinOptions.map(coin => ({
								value: coin.value,
								label: (
									<div className="flex items-center gap-x-[10px]">
										{coin.value !== 'all' && <Image src={coin.url} alt={coin.value} className="!w-[20px] !-[20px] rounded-full" />}
										<span className="leading-[20px] text-[14px]">{coin.label}</span>
									</div>
								),
							}))
						}
						title={t('contract:placeholder')} 
						activeType='icon'
						onChange={(value) => {
							selectParam.current.symbol = value as string
							getData();
						}}
						value={selectParam.current.symbol}
					/>
					<SelectPop
						options={typeOptions}
						title={t('contract:placeholder')} 
						activeType='icon'
						onChange={(value) => {
							selectParam.current.type = value as string
							getData();
						}}
						value={selectParam.current.type}
					/>
				</div>
				<button type="button" onClick={() => setDatePopVisible(true)}>
					<Iconify icon="mingcute:filter-line" className="text-[20px] tip-color" />
				</button>
			</div>
			<ul className="flex-1 min-h-0 hideScrollBar">
				{
				loading ? 
				<li className="h-[200px] flex justify-center items-center">
					<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
				</li> :
				accountList.length ? accountList.map((item) => {
					return (<li key={item.symbol} className="mb-[30px] last:mb-0 p-4 border-b border-color">
						<div className="flex items-center justify-between mb-[12px]">
							<div className="flex items-center">
								<Image
									src='/404'
									alt={item.symbol}
									className="!w-[28px] !h-[28px] rounded-full mr-[6px]"
								/>
								<span className="leading-[20px] text-[14px] font-medium">{item.symbol}</span>
							</div>
							<span className="text-[14px] text-[#9e9e9e]">平仓盈亏</span>
						</div>
						<div className="mt-[4px] mb-[16px] leading-[17px] text-[12px] text-[#9e9e9e]">{dayjs().format("YYYY-MM-DD HH:mm:ss")}</div>
						<div>
							<p className="flex justify-between items-center text-[14px] h-[20px] mb-4">
								<span className="text-[#9e9e9e]">{t('contract:symbol')}</span>
								<span>{item.symbol}</span>
							</p>
							<p className="flex justify-between items-center text-[14px] h-[20px] mb-4">
								<span className="text-[#9e9e9e]">{t('contract:total')}</span>
								<span>{item.totalAmount}</span>
							</p>
						</div>
					</li>)
				}) :
					<li className="h-[200px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
			<DateTimePop
				popupVisible={datePopVisible}
				onOpen={() => setDatePopVisible(true)}
				handlePopupClose={() => setDatePopVisible(false)}
				title={t('spot.select.filter')}
				onChange={(value) => {
					selectParam.current.startTime = value[0]?.startOf('day').valueOf() || ''
					selectParam.current.endTime = value[1]?.endOf('day').valueOf() || ''
					getData();
				}}
				defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
				minDate={dayjs().subtract(6, 'month')}
				maxDate={dayjs().endOf('day')}
				placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
				disabledDate={disabled7DaysDate}
			/>
		</div>
	)
}
export const meta = {
  requireAuth: true,
  layout: 'header-only'
}
export default Account;