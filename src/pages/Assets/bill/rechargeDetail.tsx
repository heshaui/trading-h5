import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import { SpotLayout } from '@/components/MenuItems';
import styles from '../styles/orderDetail.module.scss'
// import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs } from 'antd';
import { CustomTab } from '@/components/CustomCom';
import { Iconify } from "@/components/icon"
// import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLanguage } from '@/hooks/useLanguage';
// import type { TabsProps } from 'antd';
// import useQueryParams from '@/hooks/useQueryParams';
import { useThemeMode } from '@/hooks/useThemeMode';
import { CustomTable } from '@/components/CustomCom'
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import { WithdrawDataType } from "@/type/assets/billDetails/table"
import { Modal, Toast, CenterPopup } from 'antd-mobile';
import { division, nul, roundDown, cut } from '@/utils';
import appStore from '@/store';
import { getOrderInfo } from '@/services/spot'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { ReactComponent as IconMore } from "@/assets/icons/assets/icon_more.svg"
import { ReactComponent as IconSuccess } from "@/assets/icons/assets/icon_check.svg"
import { ReactComponent as IconFail } from "@/assets/icons/assets/icon_close.svg"
import ContentLayout from '@/components/ContentHeader';
import { encryptData } from '@/utils/encrypt'
import { getCancelWithdraw } from '@/services/assets'


export const layout = 'header-only';


// 状态信息接口
interface StatusInfo {
	className: string;
	icon: React.ReactNode;
	tip: string;
}
const SpotOrderPage = () => {
	const { t } = useLanguage(['assets', 'common']);
	const { isDayMode } = useThemeMode();
	const navigate = useNavigate();
	const location = useLocation();
	const userInfo = appStore.getUserInfo() || appStore.userInfo;
	const [visible, setVisible] = useState(false);
	// 从 location.state 获取传递的数据
	const { recordData } = location.state || {};
	const coninList = appStore.getCoinList()
	const { copyFn } = useCopyToClipboard();
	// 如果没有传递必要的数据，可以重定向回列表页
	useEffect(() => {
		// if (!orderId || !recordData) {
		if (!recordData) {
			console.warn('缺少必要的订单数据，重定向到列表页');
			handleGoBack()
		}
	}, [recordData, navigate]);



	// 根据状态返回样式、图标和提示信息的方法
	const getStatusIconAndStyle = useCallback((): StatusInfo => {
		const status = recordData?.status?Number(recordData?.status):'';

		// 状态 0、1：待审核
		if (status===0) {
			return {
				className: styles.warning_icon,
				icon: <IconMore />, // 或者使用相应的图标组件
				tip: t('withdrawTable.rechargePending')  //'充值审核中，请耐心等待'
			};
		}
		else if (status===1) {
			return {
				className: styles.success_icon,
				icon: <IconSuccess />,
				tip: t('withdrawTable.rechargeSuccess') //"充值成功,请查看至币地址"
			};
		}
		// 默认情况
		else {
			return {
				className: styles.warning_icon,
				icon: <IconMore />,
				tip: '--'
			};
		}
	}, [recordData])


	const handleGoBack = () => {
		navigate('/assets/bill', {
			state: { fromDetail: true },
			replace: true
		});
	};
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


	const detailColumns: ColumnType<WithdrawDataType>[] = [
		{
			title: t('withdrawMoney.network2'), //"主网络",
			dataIndex: "protocolName",
			key: "protocolName",
			align: "center",
			width: 158,
			render: (_status) => {
				return <span className={`${styles.warning_box}`} >{_status || '--'}</span>;

			},
		},

		{
			title: t('assetsAccount.address'), //"地址",
			key: "address",
			dataIndex: "address",
			width: 128,
			align: "center",
			render: (_status) => {
				return <div className={`flex-x algin-start pl-[8px]`}>{_status || '--'}
					{_status&&<button onClick={() => copyFn(_status)}>
						<Iconify icon="mingcute:copy-2-line" className="ml-2 tip_color" size={14} />
					</button>}

				</div>;
			},
		},
		{
			title: t('withdrawMoney.txHash'), //"交易哈希",
			key: "txHash",
			dataIndex: "txHash",
			width: 128,
			align: "center",
			render: (_status) => {
				return <div className={`flex-x algin-start pl-[8px]`}>
					{_status || '--'}
					{_status && <button onClick={() => copyFn(_status)}>
						<Iconify icon="mingcute:copy-2-line" className="ml-2 tip_color" size={14} />
					</button>}

				</div>;
			},
		},
		// {
		// 	title: t('assetsAccount.number'), //"数量",
		// 	key: "amount",
		// 	dataIndex: "amount",
		// 	width: 128,
		// 	align: "center",
		// 	render: (_text, record) => {
		// 		// const coin = coninList.find((item: any) => item.coinName === record.symbol || item.coinId === record.symbol)
		// 		// const text = roundDown(_text, coin?.unitScale || 0)
		// 		return <span >{_text || '0'}&nbsp;{record.symbol || '--'}</span>;
		// 	},
		// },
		// {
		// 	title: t('assetsAccount.fee'), //"手续费",
		// 	key: "fee",
		// 	dataIndex: "fee",
		// 	width: 128,
		// 	align: "center",
		// 	render: (_status, record) => {
		// 		const coin = coninList.find((item: any) => item.coinName === record.symbol || item.coinId === record.symbol)
		// 		return <span >{_status ? roundDown(_status, coin?.unitScale) : '0'}&nbsp;{record.symbol || '--'}</span>;

		// 	},
		// },

		{
			title: t('assetsAccount.wallet'), //"钱包",
			dataIndex: "timestamp",
			key: "timestamp",
			// width: 158,
			align: "left",
			render: (text) => <div>{t('withdrawMoneyCheck.spotAccount')} </div>,
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
		<ContentLayout
			title={t('assets.rechargeDetail')}
			onBack={handleGoBack}
			headerClassName={`${styles.border_none}`}
			footerClassName={`${styles.border_none}`}
		>
			<div className={`${styles.card_bgc}  radius-2`}>
				<div className={`${styles.content_header} flex-y-cc`}>
					<div className={`${getStatusIconAndStyle().className} mt-2 font-14 ml-5 flex-y-cc`}>
						<p className={`font-w-500 font-20 title_color`}>+{cut(recordData?.amount || 0, recordData?.fee || 0)}&nbsp;{recordData?.symbol || '--'}</p>
						<div className={`mr-1 flex-x-cc mt-1`}>
							{getStatusIconAndStyle().icon} &nbsp;
							{getStatus(recordData?.status)}
						</div>
						<p className={`font-w-400 font-14 tip_color mt-4`}>
							{getStatusIconAndStyle().tip}
						</p>

					</div>
				</div>

				<div className={`${styles.content_footer} pt-7`}>
					<div className={`px-2`}>
						<CustomTable
							columns={detailColumns}
							dataSource={recordData ? [recordData] : []}
							bodyClassName={`${styles.tables_content} ${styles.history_content}`}
							headerClassName={styles.tables_header}
							pagination={false}
							p1cardBorder={'none'}
						// locale={{ emptyText: <NoData textColor='#A4A5AC' height='45vh' position='top'/> }}
						/>
					</div>
				</div>

			</div >
		</ContentLayout>
	</>
	);
};

export default SpotOrderPage;