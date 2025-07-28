import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';
import { Image, Toast, SearchBar } from 'antd-mobile';
import { getUserBalanceAll } from "@/services/assets";
import { add, roundDown, cut, nul } from "@/utils";
import { getRate } from "@/utils/getUseRate";
import appStore from "@/store";
import { NoData } from '@/components/noData';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';

import { DataType } from "@/type/assets/assetsAccount/assets";

const Assets: React.FC = () => {
	const { t } = useLanguage('spot');
	const rateKey = appStore.getRateKey()?.replace(/\s+/g, ""); // 汇率key
	// 获取币种列表
    const coinList = appStore.getCoinList(); // 获取币种信息
	const [assetsList, setAssetsList] = useState<DataType[]>([]);
	const [allAssetsList, setAllAssetsList] = useState<DataType[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const {setAssetsCount} = useExchange();

	// 获取所有币种余额
    const getAssetsData = async () => {
        setLoading(true);
        try {
            const res = await getUserBalanceAll();
            if (res.code === "0") {
                setAssetsList(res.data || []);
                setAllAssetsList(res.data || []);
            }
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
        } finally {
            setLoading(false);
        }
    };

	// 查询
	const handleSearch = (value: string) => {
		setSearchValue(value);
		if (value) {
            const newData = allAssetsList.filter((item) =>
                item.coinName.toLowerCase().includes(value.toLowerCase())
            );
            setAssetsList(newData);
			setAssetsCount(newData.length);
        } else {
            setAssetsList(allAssetsList);
			setAssetsCount(0);
        }
	}

	//计算币种余额与实际的金额
	const getBalance = (item: DataType) => {
		const coin = coinList.find(
			(coin: any) => coin.coinName === item.coinName
		); // 获取币种信息
		const text = add(item.balance || 0, item.releaseBalance || 0);
		const text2 = add(text, item.frozenBalance || 0);
		// 添加默认值和检查
		const rateKeyName = rateKey.split("-")[0].trim();

		// 确保 rateKeyName 有值
		const { ratetext } = getRate(item.coinName, text2, rateKeyName);
		const balance = text2 ? roundDown(text2, coin?.unitScale) : '0';
		const rateBalance = item.coinName ? ratetext : '';
		return { balance, rateBalance }
	}

	useEffect(() => {
		getAssetsData();
	}, [])

	return (
		<>
			<div className="flex justify-between items-center pt-[10px] px-4 mb-1">
				<SearchBar 
					icon={<Iconify icon="garden:search-26" className="text-[16px]" />}
					placeholder={t('spot.header.search')}
					value={searchValue}
					onChange={handleSearch}
					className="searchBar mr4 w-[130px] !h-[32px]"
				/>
				<button type="button">
					<Iconify icon="mingcute:filter-line" className="text-[20px] tip-color" />
				</button>
			</div>
			<ul className="max-h-[350px] hideScrollBar">
				{
				loading ? 
				<li className="h-[200px] flex justify-center items-center">
					<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
				</li> :
				assetsList.length ? assetsList.map((item) => {
					const { balance, rateBalance } = getBalance(item);
					return (<li key={item.coinId} className="flex justify-between items-center border-b border-color last:border-b-0 h-[65px] px-4">
						<div className="flex items-center">
							<Image
								src={item?.iconUrl}
								alt={item.coinName}
								className="!w-[20px] !h-[20px] rounded-full mr-1"
							/>
							<span className="text-[14px] font-medium">{item.coinName}</span>
						</div>
						<div className="text-right">
							<p className="text-[14px] font-medium mb-1">{ balance }</p>
							<p className="text-[12px] text-[#9e9e9e] ltr-text">{ rateBalance }</p>
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