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
		const status = Number(recordData?.status);

		// 状态 0、1、2：处理中状态
		if ([0, 1, 2].includes(status)) {
			return {
				className: styles.warning_icon,
				icon: <IconMore />, // 或者使用相应的图标组件
				tip: t('withdrawTable.walletProcessing')  //'提币钱包处理中，请耐心等待'
			};
		}
		// 状态 3、4：失败状态
		else if ([3, 4].includes(status)) {
			return {
				className: styles.error_icon,
				icon: <IconFail />,
				tip: status === 3 ? (recordData?.remark || '--') : t('withdrawTable.userCancel')  //用户已撤销，请重新提现
			};
		}
		// 状态 5：成功状态
		else if (status === 5) {
			return {
				className: styles.success_icon,
				icon: <IconSuccess />,
				tip: t('withdrawTable.withdrawSuccess') //"提现成功,请查看至币地址"
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
			title: t('withdrawMoney.network2'), //"主网络",
			dataIndex: "protocolName",
			key: "protocolName",
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
				return <div className={`flex-x algin-start`}>{_status || '--'}
					<button onClick={() => copyFn(_status)}>
						<Iconify icon="mingcute:copy-2-line" className="ml-2 tip_color" size={14} />
					</button>

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
				return <div className={`flex-x algin-start`}>{_status || '--'}
					<button onClick={() => copyFn(_status)}>
						<Iconify icon="mingcute:copy-2-line" className="ml-2 tip_color" size={14} />
					</button>

				</div>;
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
				return <span >{_text || '0'}&nbsp;{record.symbol || '--'}</span>;
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
				return <span >{_status ? roundDown(_status, coin?.unitScale) : '0'}&nbsp;{record.symbol || '--'}</span>;

			},
		},

		// {
		// 	title: t('assetsAccount.status'), //"状态",
		// 	key: "status",
		// 	dataIndex: "status",
		// 	width: 128,
		// 	align: "center",
		// 	render: (_status) => {
		// 		return <span >{getStatus(_status) || '--'}</span>;
		// 	},
		// },
		{
			title: t('assetsAccount.time'), //"时间",
			dataIndex: "timestamp",
			key: "timestamp",
			// width: 158,
			align: "left",
			render: (text) => <div>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} </div>,
		},
	];
	// 撤销提现
	const cancelWithdraw = async () => {
		const param = {
			withdrawalId: recordData?.orderId
		}
		const encrypt = await encryptData(param)
		const res = await getCancelWithdraw(encrypt)
		try {
			if (res.code === '0') {
				Toast.show({
					icon: 'success',
					content: res.message || 'success',
					position: 'bottom',
				})
				handleGoBack()
			} else {
				Toast.show({
					icon: 'fail',
					content: res.message || 'error',
					position: 'bottom',
				})
			}
		} catch (error) {
			Toast.show({
				icon: 'fail',
				content: String(error) || 'error',
				position: 'bottom',
			})
		} finally {
			setVisible(false)
		}

	}
	return (<>
		<ContentLayout
			title={t('assets.withdrawDetail')}
			onBack={handleGoBack}
			footer={
				(recordData?.status === '0' || recordData?.status === '1') ? <div className={`${styles.cancel_btn_box} flex-x align-center justify-end`}>
					{/* recordData?.status === 0|1 显示取消按钮 */}
					<button className={`cancel_btn2 ${styles.cancel_btn} flex-x-cc`}
						onClick={() => {
							setVisible(true)
							// setOrderId(recordData?.orderId)

							// Modal.confirm({
							// 	content: <div className="flex-y-cc" style={{ width: "100%", height: 80 }}>
							// 		{t('modal.confirmCancel', { ns: 'common' })}
							// 	</div>,
							// 	onConfirm: async () => {
							// 		try {
							// 			await cancelWithdraw()

							// 		} catch (error) {
							// 			throw new Error()
							// 		}

							// 	},
							// })
						}}>
						{t('assetsAccount.button.cancel')}
					</button>

				</div> : false
			}
			headerClassName={`${styles.border_none}`}
			footerClassName={`${styles.border_none}`}
		>
			<div className={`${styles.card_bgc}  radius-2`}>
				{/* <div className={styles.user_header} >
					<button onClick={handleGoBack}>
						<Iconify icon="teenyicons:left-outline" className="left-icon" />
					</button>
					<div className="flex-1 flex-x-cc pr-3">
						<span className='ml-4'>{t('assets.withdrawDetail')}</span>
					</div>
				</div> */}
				<div className={`${styles.content_header} flex-y-cc`}>
					{/* <div className={`flex-y-cc`}>
					<Image src={getStatusIconAndStyle().icon} className={`${styles.content_img}`} />
				</div> */}
					<div className={`${getStatusIconAndStyle().className} mt-2 font-14 ml-5 flex-y-cc`}>
						<p className={`font-w-500 font-20 title_color`}>-{cut(recordData?.amount || 0, recordData?.fee || 0)}&nbsp;{recordData?.symbol || '--'}</p>
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
			<CenterPopup
				visible={visible}
				onMaskClick={() => {
					setVisible(false)
				}}
			>
				<div className='w-full h-full flex-y-cc'>
					<div className="flex-y-cc" style={{ width: "100%", height: 80 }}>
						{t('modal.confirmCancel', { ns: 'common' })}
					</div>
					<div className="flex-x-cc w-full mb-5" >
						<button
							type="button"
							className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
							onClick={() => {
								setVisible(false)
							}}
						>
							{t('cancel', { ns: 'common' })}
						</button>
						<button
							type="button"
							className={`${styles.modal_footerBtn} default_btn font-14 font-w-500`}
							onClick={() => cancelWithdraw()}
						>
							{t('ok', { ns: 'common' })}
						</button>
					</div>
				</div>
			</CenterPopup>
		</ContentLayout>
	</>
	);
};

export default SpotOrderPage;