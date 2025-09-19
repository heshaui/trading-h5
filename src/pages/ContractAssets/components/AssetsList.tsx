import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';
import { Image, Toast, SearchBar,  } from 'antd-mobile';
import appStore from "@/store";
import { NoData } from '@/components/noData';
import BigNumber from "bignumber.js";
import { getContractFinancialRecords } from '@/services/contract'
import dayjs from 'dayjs';

import type {AccountBalance} from '../index';

interface Props {
	loading: boolean;
	contractAssets: AccountBalance[]
}

const Assets: React.FC<Props> = () => {
	const { t } = useLanguage(['assets', 'spot']);
	const coinList = appStore.getCoinList();
	const [searchValue, setSearchValue] = useState('');
	const [assetsList, setAssetsList] = useState<AccountBalance[]>([]);
	const [allAssetsList, setAllAssetsList] = useState<AccountBalance[]>([]);
	const [hideSmall, setHideSmall] = useState(false);
	const [loading, setLoading] = useState(false);

	// 给数据加icon
	const handleData = (data:AccountBalance[]) => {
		const result = data.map((item:AccountBalance) => {
			const targetCoin = coinList.find(coin => coin.coinName === item.symbol);
			return {
				...item,
				iconUrl: targetCoin?.iconUrl ?? '',
				defaultName: targetCoin?.nameDefault ?? '--'
			}
		})
		return result;
	}

	const getData = async () => {
		setLoading(true)
		try {
			const res = await getContractFinancialRecords({
				onlyAccount: 1,
				uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
			});
			if (res.code === "0") {
				const data = handleData(res.data.accountList);
				setAssetsList(data);
				setAllAssetsList(data);
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

	// 查询
	const handleSearch = (value: string) => {
		setSearchValue(value);
		if (value) {
            const newData = allAssetsList.filter((item) =>
                item.symbol.toLowerCase().includes(value.toLowerCase())
            );
            setAssetsList(newData);
        } else {
            setAssetsList(allAssetsList);
        }
	}

	const getTotalBalance = (accountBalance:AccountBalance) => {
		return new BigNumber(accountBalance?.realizedAmount || 0)
					.plus(Number(accountBalance?.totalMargin) || 0)
					.plus(accountBalance?.isolateMargin || 0)
					.toFixed(2)
	}

	const handleNum = (value: string) => {
		return new BigNumber(value || 0).toFormat(2);
	}

	const hideChange = () => {
		setHideSmall(prev => {
			const newHideSmall = !prev;

			if (newHideSmall && allAssetsList.length > 0) {
				const newData = allAssetsList.filter(
					(item) => Number(item.totalAmount) >= 1
				);
				setAssetsList(newData);
			} else {
				setAssetsList(allAssetsList);
			}

			return newHideSmall;
		});
	};

	return (
		<>
			<div className="flex justify-between items-center sticky">
				<SearchBar 
					icon={<Iconify icon="garden:search-26" className="text-[16px]" />}
					placeholder={t('spot:spot.header.search')}
					value={searchValue}
					onChange={handleSearch}
					className="searchBar mr4 w-[188px] !h-[40px]"
				/>
				<button className="flex items-center h-[20px] gap-x-[8px] text-[14px]" onClick={hideChange}>
                    <div className={`h-[16px] w-[16px] border rounded-full p-[2.5px] ${hideSmall ? 'border-[var(--theme-color)]' : 'border-color'}`}>
                        {hideSmall && <div className="h-full w-full rounded-full bg-[var(--theme-color)]"></div>}
                    </div>
                    <span>{t('futureAccount.hideSmall')}</span>
                </button>
			</div>
			<ul className="mt-[29px]">
				{
				loading ? 
				<li className="h-[200px] flex justify-center items-center">
					<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
				</li> :
				assetsList.length ? assetsList.map((item) => {
					const totalBalance = getTotalBalance(item);
					return (<li key={item.symbol} className="mb-[30px] last:mb-0">
						<div className="flex items-center mb-[12px]">
							<Image
								src={item.iconUrl}
								alt={item.symbol}
								className="!w-[28px] !h-[28px] rounded-full mr-[6px]"
							/>
							<div className="flex-col">
								<span className="leading-[20px] text-[14px] font-medium">{item.symbol}</span>
								<span className="leading-[17px] text-[12px] tip-color">{item.defaultName}</span>
							</div>
						</div>
						<div className="pl-[34px]">
							<div className="flex justify-between mb-[12px]">
								<p className="flex-col">
									<span className="leading-[17px] text-[12px] tip-color">{t('futureAccount.total')}</span>
									<span className="leading-[20px] text-[14px] font-medium mt-[2px]">{totalBalance}</span>
								</p>
								<p className="flex-col">
									<span className="leading-[17px] text-[12px] tip-color">{t('futureAccount.balance')}</span>
									<span className="leading-[20px] text-[14px] font-medium mt-[2px] text-right">{handleNum(item.totalAmount)}</span>
								</p>
							</div>
							<div className="flex justify-between">
								<p className="flex-col">
									<span className="leading-[17px] text-[12px] tip-color">{t('futureAccount.useBalance')}</span>
									<span className="leading-[20px] text-[14px] font-medium mt-[2px]">{handleNum(item.canUseAmount)}</span>
								</p>
								<p className="flex-col">
									<span className="leading-[17px] text-[12px] tip-color">{t('futureAccount.unRealizedAmount')}</span>
									<span className="leading-[20px] text-[14px] font-medium mt-[2px] text-right">{handleNum(item.unRealizedAmount)}</span>
								</p>
							</div>
						</div>
					</li>)
				}) :
					<li className="h-[200px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
		</>
	)
}

export default Assets;