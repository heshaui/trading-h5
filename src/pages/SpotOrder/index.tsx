import React from 'react';
import { SpotLayout } from '@/components/MenuItems';
import styles from './styles/billDetails.module.css'
// import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs } from 'antd';
import { CustomTab } from '@/components/CustomCom';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useLanguage } from '@/hooks/useLanguage';
import type { TabsProps } from 'antd';
import SpotOrderNow from './components/SpotOrderTable/NowOrder'
import SpotOrderHistory from './components/SpotOrderTable/HistoryOrder'
import SpotOrderDeal from './components/SpotOrderTable/HistoryDeal'
import appStore from '@/store';
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
	const [isClient, setIsClient] = useState(false);
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
	useEffect(() => {
		// 只在客户端执行
		if (typeof window === 'undefined' || !token) return;

		try {
			appStore.loadCurrencyPairs()
		} catch (error) {
			console.error('初始化货币对数据错误:', error);
		}
	}, [isClient, token]);
	return (<>
		<div className={`${styles.card_bgc} radius-2` }>
			<CustomTab
				tabsItems={items}
				className={`${styles.customTabs} `}
				direction='ltr'
				stretch={false}
				activeLineMode='fixed'
			// destroyInactiveTabPane={true}
			// indicator={{ size: (origin) => origin - 35, align: 'center' }} 
			/>
		</div>
	</>
	);
};

export default SpotLayout(SpotOrderPage);