import React from 'react';
import { SpotLayout } from '@/components/MenuItems';
import { CustomTab } from '@/components/CustomCom';
import { useState, useEffect, useRef } from "react";
import { useLanguage } from '@/hooks/useLanguage';
import { useLocation } from 'react-router-dom';
import OrderNow from './components/OrderNow'
import OrderHistory from './components/OrderHistory'
import PnlLog from './components/PnlLog'
import appStore from '@/store';
import useQueryParams from '@/hooks/useQueryParams';

const OrderPage = () => {
	const { t } = useLanguage(['contract']);
	const location = useLocation();
	const { tab } = useQueryParams();
	const [activeTab, setActiveTab] = useState<string>('1');
	const [contractList, setContractList] = useState([]);
	const info = appStore.getPublicInfo();

	useEffect(() => {
		if (info && info.contractList) setContractList(info.contractList);
	}, [info])

	const items = [
		{
			key: '1',
			label: t('order.currentCommission'), //"当前委托",
			children: <OrderNow contractList={contractList}/>,
		},
		{
			key: '2',
			label: t('order.historyCommission'), //'历史委托',
			children: <OrderHistory contractList={contractList}/>,
		},
		{
			key: '3',
			label: t('order.profitLoss'), //'历史成交',
			children: <PnlLog contractList={contractList}/>,
		},
	];

	// 处理tab切换
	const handleTabChange = (key: string) => {
		setActiveTab(key);
		// 可选：更新URL参数，方便用户刷新页面时保持当前tab
		const url = new URL(window.location.href);
		url.searchParams.set('tab', key);
		window.history.replaceState({}, '', url.toString());
	};

	// 处理从detail页面返回时的tab切换
	useEffect(() => {
		// 检查是否从detail页面返回
		if (location.state?.fromDetail) {
			setActiveTab('2'); // 切换到历史委托tab
			// 清理state，避免重复触发
			window.history.replaceState({}, '', window.location.pathname);
		} else if (tab && ['1', '2', '3'].includes(tab)) {
			// 如果URL中有有效的tab参数，使用该参数
			setActiveTab(tab);
		} else if (!tab) {
			// 如果没有tab参数，设置默认tab并更新URL
			setActiveTab('1');
			const url = new URL(window.location.href);
			url.searchParams.set('tab', '1');
			window.history.replaceState({}, '', url.toString());
		}
	}, [location.state, tab]);

	return (
		<div>
			<CustomTab
				tabsItems={items}
				className="safeTabs spotSelectTabs orderTabs"
				direction='ltr'
				stretch={false}
				activeLineMode='fixed'
				activeKey={activeTab}
				onChange={handleTabChange}
			/>
		</div>
	);
};

export default SpotLayout(OrderPage);