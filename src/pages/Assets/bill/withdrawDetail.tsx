import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpotLayout } from '@/components/MenuItems';
import styles from '../styles/orderDetail.module.scss'
// import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs } from 'antd';
import { CustomTab } from '@/components/CustomCom';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef, useMemo,useCallback } from "react";
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
import { WithdrawDataType } from "@/type/assets/billDetails/table"
import { getRound } from '@/utils/getUseRate'
import { division, nul, roundDown } from '@/utils';
import appStore from '@/store';
import { getOrderInfo } from '@/services/spot'

export const layout = 'header-only';
const SpotOrderPage = () => {
	const { t } = useLanguage(['assets']);
	const { isDayMode } = useThemeMode();
	const navigate = useNavigate();
	const location = useLocation();
	const userInfo = appStore.getUserInfo() || appStore.userInfo;
	const [tableData, setTableData] = useState<WithdrawDataType[]>([]);
	const [loading, setLoading] = useState(false);
	// 从 location.state 获取传递的数据
	const { recordData } = location.state || {};
	const coninList = appStore.getCoinList()

	// 如果没有传递必要的数据，可以重定向回列表页
	useEffect(() => {
		// if (!orderId || !recordData) {
			if (!recordData ) {
			console.warn('缺少必要的订单数据，重定向到列表页');
			handleGoBack()
		}
	}, [ recordData, navigate]);

	// 根据状态返回样式和图片的方法
	const getStatusIconAndStyle = useCallback(() => {
		const status = recordData?.status
		// 成功状态：0, 1, 4, 5
		if ([0, 1, 4, 5].includes(status)) {
			return {
				className: styles.success_icon,
				icon: status === 1
					? (isDayMode ? success_all_day : success_all_dark)
					: (isDayMode ? success_part_day : success_part_dark)
			};
		}
		// 错误状态：2, 3, 6
		else if ([2, 3, 6].includes(status)) {
			return {
				className: styles.error_icon,
				icon: status === 2
					? (isDayMode ? fail_day : fail_dark)
					: (isDayMode ? error_day : error_dark)
			};
		}
		// 默认情况
		else {
			return {
				className: styles.success_icon,
				icon: isDayMode ? success_part_day : success_part_dark
			};
		}
	}, [isDayMode,recordData])


	const handleGoBack = () => {
		navigate('/assets/bill', { 
			state: { fromDetail: true, activeTab: 'WITHDRAW' },
			replace: true 
		});
	};
	const getStatus = (status: number) => {
		const statusText = Number(status)
		// 状态: 0-创建, 1-待审核, 2-审核通过, 3-审核拒绝, 4-用户撤销  5 提现完成
		switch (statusText) {
		  case 0:
			return t('withdrawTable.create') //'创建';
		  case 1:
			return t('withdrawTable.pending') //'待审核'
		  case 2:
			return t('withdrawTable.passed') //审核通过
		  case 3:
			return t('withdrawTable.rejected') //'审核拒绝'
		  case 4:
			return t('withdrawTable.canceled') //'用户撤销'
		  case 5:
			return t('withdrawTable.completed') //'提现完成'
		  default:
			return statusText || '--'
		}
	  }


	const detailColumns: ColumnType<WithdrawDataType>[] = [
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
		  title: t('assetsAccount.fee'), //"手续费",
		  key: "fee",
		  dataIndex: "fee",
		  width: 128,
		  align: "center",
		  render: (_status, record) => {
			const coin = coninList.find((item: any) => item.coinName === record.symbol || item.coinId === record.symbol)
			return <span >{_status ? roundDown(_status, coin?.unitScale) : '0'}</span>;
	
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
		  title: t('assetsAccount.status'), //"状态",
		  key: "status",
		  dataIndex: "status",
		  width: 128,
		  align: "center",
		  render: (_status) => {
			return <span >{getStatus(_status) || '--'}</span>;
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
	// const getOrderDetail = async () => {
	// 	if (!recordData) return
	// 	setLoading(true);
	// 	try {
	// 		const params = {
	// 			page: 1,
	// 			pageSize: 1000,
	// 			orderId: recordData.orderId,
	// 			symbol: `${recordData.symbol.split('/').join('_')}`
	// 		};
	// 		const res = await getOrderInfo(params);
	// 		if (res.code === '0') {
	// 			setTableData(res.data?.records || [])
	// 		} else {
	// 			Toast.show({
	// 				content: res.message,
	// 				icon: 'fail',
	// 			});
	// 		}
	// 	} catch (error) {
	// 		Toast.show({
	// 			content: String(error),
	// 			icon: 'fail',
	// 		});
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// }
	// useEffect(() => {
	// 	getOrderDetail()
	// }, [])
	return (<>
		<div className={`${styles.card_bgc}  radius-2`}>
			<div className={styles.user_header} >
				<button onClick={handleGoBack}>
					<Iconify icon="teenyicons:left-outline" className="left-icon" />
				</button>
				<div className="flex-1 flex-x-cc pr-3">
					<span className='ml-4'>{t('assets.withdrawDetail')}</span>
				</div>
			</div>
			<div className={`${styles.content_header} flex-y-cc`}>
				{/* <div className={`flex-y-cc`}>
					<Image src={getStatusIconAndStyle().icon} className={`${styles.content_img}`} />
				</div> */}
				<div className={`${getStatusIconAndStyle().className} mt-2 font-14 ml-5`}>
					<span className={`mr-1 `}>
						{getStatus(recordData?.status)}
					</span>
					{/* {getCompletion()} */}
				</div>
			</div>
			
			<div className={`${styles.content_footer} `}>
				<div className={`font-14 font-w-500 pr-4 pl-5 pt-3 pb-4 ${styles.border_bottom}`}>
					{/* {t('spot.columns.tradeDetail')} */}
				</div>
				<div className={`px-2`}>
					<CustomTable
						columns={detailColumns}
						dataSource={recordData?[recordData]:[]}
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