import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpotLayout } from '@/components/MenuItems';
import styles from '../styles/orderDetail.module.scss'
// import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs } from 'antd';
import { CustomTab } from '@/components/CustomCom';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLanguage } from '@/hooks/useLanguage';
import type { TabsProps } from 'antd';
import useQueryParams from '@/hooks/useQueryParams';
import { Image, Toast } from 'antd-mobile';
import success_part_day from '@/assets/images/spot/spotOrder/success_part_day.svg'
import success_part_dark from '@/assets/images/spot/spotOrder/success_part_dark.svg'
import success_all_dark from '@/assets/images/spot/spotOrder/success_all_dark.svg'
import success_all_day from '@/assets/images/spot/spotOrder/success_all_day.svg'
import fail_day from '@/assets/images/spot/spotOrder/fail_day.svg'
import fail_dark from '@/assets/images/spot/spotOrder/fail_dark.svg'
import error_day from '@/assets/images/spot/spotOrder/error_day.svg'
import error_dark from '@/assets/images/spot/spotOrder/error_dark.svg'
import { useThemeMode } from '@/hooks/useThemeMode';
import { CustomTable } from '@/components/CustomCom'
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import type { DataType, DataLogsType } from '@/type/spot/table';
import { getRound } from '@/utils/getUseRate'
import { division, nul, roundDown } from '@/utils';
import appStore from '@/store';
import { getOrderInfo } from '@/services/spot'

export const layout = 'header-only';
const SpotOrderPage = () => {
	const { t } = useLanguage(['spot']);
	const { isDayMode } = useThemeMode();
	const navigate = useNavigate();
	const location = useLocation();
	const userInfo = appStore.getUserInfo() || appStore.userInfo;
	const [tableData, setTableData] = useState<DataLogsType[]>([]);
	const [loading, setLoading] = useState(false);
	// 从 location.state 获取传递的数据
	const { recordData, orderId, symbol } = location.state || {};

	// 如果没有传递必要的数据，可以重定向回列表页
	useEffect(() => {
		if (!orderId || !recordData) {
			handleGoBack()
		}
	}, [orderId, recordData, navigate]);



	const handleGoBack = () => {
		navigate('/assets/bill', {
			state: { fromDetail: true, activeTab: 'RECHARGE' },
			replace: true
		});
	};
	// 判断状态
	const getStatus = (status: number) => {
		const statusText = Number(status)
		switch (statusText) {
			case 0:
				return t('recharge.rechargeStatus0') //'充值中';
			case 1:
				return t('recharge.rechargeStatus1') //'充值完成'
			default:
				return statusText || '--'
		}
	}

	const getCompletion = () => {
		const amount = nul(division(recordData?.tradedAmount, recordData?.amount), 100)
		const { baseScaleResult } = getRound(recordData.symbol, amount)
		return < >
			{recordData?.amount ?
				<span >
					{recordData.tradedAmount && recordData.tradedAmount.toString() !== '0' ? `${roundDown(baseScaleResult, 2)}%` : '0%'}
				</span> : '0'
			}
		</ >
	}

	const detailColumns: ColumnType<DataLogsType>[] = [

		{
			title: t('assetsAccount.type'), //"类型",
			dataIndex: "billType",
			key: "billType",
			align: "center",
			width: 128,
			render: (_text) => <span>{t('assetsAccount.cashout')}</span>,
		},
		{
			title: t('assetsAccount.currency'), //"币种",
			dataIndex: "symbol",
			key: "symbol",
			align: "center",
			width: 158,
			render: (_status) => {
				return <span >{_status || '--'}</span>;

			},
		},
		{
			title: t('assetsAccount.address'), //"地址",
			key: "address",
			dataIndex: "address",
			width: 128,
			align: "center",
			render: (_status) => {
				return <span >{_status || '--'}</span>;
			},
		},

		{
			title: "TxID",
			key: "txHash",
			dataIndex: "txHash",
			width: 128,
			align: "center",
			render: (_status) => {
				return <span >{_status || '--'}</span>;
			},
		},
		{
			title: t('assetsAccount.number'), //"数量",
			key: "amount",
			dataIndex: "amount",
			width: 128,
			align: "center",
			render: (_text, record) => {
				// const coin = coninList.find((item: any) => item.coinName === record.symbol || item.coinId === record.symbol)
				// const text = roundDown(_text, coin?.unitScale || 0)
				return <span >{_text || '0'}</span>;
			},
		},

		{
			title: t('assetsAccount.time'), //"时间",
			dataIndex: "timestamp",
			key: "timestamp",
			// width: 158,
			align: "left",
			render: (text) => <div>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} </div>,
		},
	];

	return (<>
		<div className={`${styles.card_bgc}  radius-2`}>
			<div className={styles.user_header} >
				<button onClick={handleGoBack}>
					<Iconify icon="teenyicons:left-outline" className="left-icon" />
				</button>
				<div className="flex-1 flex-x-cc pr-3">
					<span className='ml-4'>{t('assets.rechargeDetail')}</span>
				</div>
			</div>
			<div className={`${styles.content_header} flex-y-cc`}>
				<div className={`flex-y-cc`}>
					{/* <Image src={getStatusIconAndStyle().icon} className={`${styles.content_img}`} /> */}
				</div>
				<div className={` mt-2 font-14 ml-5`}>
					<span className={`mr-1 `}>
						{getStatus(recordData?.status)}
					</span>
					{getCompletion()}
				</div>
			</div>
			<div className={`${styles.content_footer}`}>
				<div className={`font-14 font-w-500 pr-4 pl-5 pt-3 pb-4 ${styles.border_bottom}`}>
					{t('spot.columns.tradeDetail')}
				</div>
				<div className={`px-2`}>
					<CustomTable
						columns={detailColumns}
						dataSource={tableData}
						bodyClassName={`${styles.tables_content} ${styles.history_content}`}
						headerClassName={styles.tables_header}
						pagination={false}
						loading={loading}
						p1cardBorder={'buttom'}
					// locale={{ emptyText: <NoData textColor='#A4A5AC' height='45vh' position='top'/> }}
					/>
				</div>
			</div>
		</div >
	</>
	);
};

export default SpotOrderPage;