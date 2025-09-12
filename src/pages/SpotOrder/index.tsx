import React from 'react';
import { SpotLayout, UserCenterLayout } from '@/components/MenuItems';
import styles from './styles/spotOrder.module.scss'
// import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs } from 'antd';
import { CustomTab } from '@/components/CustomCom';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useLanguage } from '@/hooks/useLanguage';
import { useLocation } from 'react-router-dom';
import type { TabsProps } from 'antd';
import SpotOrderNow from './components/SpotOrderTable/NowOrder'
import SpotOrderHistory from './components/SpotOrderTable/HistoryOrder'
import SpotOrderDeal from './components/SpotOrderTable/HistoryDeal'
import appStore from '@/store';
import useQueryParams from '@/hooks/useQueryParams';

interface DataType {
	id: number,
	userId: number,
	platformType: number,
	deviceNo: string,
	ip: string,
	address: string,
	token: number,
	tokenTime: number,
	createTime: number,
	updateTime: number,
	tenantId: string,
}

const SpotOrderPage = () => {
	const { t } = useLanguage(['spot']);
	const location = useLocation();
	const { tab } = useQueryParams();
	const [isClient, setIsClient] = useState(false);
	const [activeTab, setActiveTab] = useState<string>('1');
	const [pageParam, setPageParam] = useState({
		page: 1,
		pageSize: 10,
	})
	const paramdataRef = useRef(pageParam);
	const token = appStore.getToken()

	const items = [
		{
			key: '1',
			label: t('spot.tabs.now'), //"当前委托",
			children: <SpotOrderNow />,
		},
		{
			key: '2',
			label: t('spot.tabs.history'), //'历史委托',
			children: <SpotOrderHistory />,
		},
		{
			key: '3',
			label: t('spot.tabs.historyDeal'), //'历史成交',
			children: <SpotOrderDeal />,
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

	useEffect(() => {
		// 只在客户端执行
		if (typeof window === 'undefined' || !token) return;

		try {
			appStore.loadCurrencyPairs()
		} catch (error) {
			console.error('初始化货币对数据错误:', error);
		}
	}, [isClient, token]);

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

	return (<>
		<div className={`${styles.card_bgc} radius-2` }>
			<CustomTab
				tabsItems={items}
				className={`${styles.customTabs} `}
				direction='ltr'
				stretch={false}
				activeLineMode='fixed'
				activeKey={activeTab}
				onChange={handleTabChange}
			// destroyInactiveTabPane={true}
			// indicator={{ size: (origin) => origin - 35, align: 'center' }} 
			/>
		</div>
	</>
	);
};

export default UserCenterLayout(SpotOrderPage);