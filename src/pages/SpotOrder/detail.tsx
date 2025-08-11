import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpotLayout } from '@/components/MenuItems';
import styles from './styles/orderDetail.module.scss'
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
			console.warn('缺少必要的订单数据，重定向到列表页');
			navigate('/spotOrder', { replace: true });
		}
	}, [orderId, recordData, navigate]);

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
	}, [isDayMode, recordData])


	const handleGoBack = () => {
		navigate('/spotOrder', {
			state: { fromDetail: true },
			replace: true
		});
	};
	// 判断状态
	const getStatus = (_status: number) => {
		if (_status === 0) {
			// 交易中
			return <span >{t('spot.select.trading') || '--'}</span>;
		} else if (_status === 1) {
			// 完全成交
			return <span >{t('spot.select.completed') || '--'}</span>;
		} else if (_status === 2) {
			// 拒绝
			return <span >{t('spot.select.failed') || '--'}</span>;
		} else if (_status === 3 || _status === 6) {
			// 已撤销
			return <span >{t('spot.select.canceled') || '--'}</span>;
		} else if (_status === 4) {
			// 创建订单
			return <span >{t('spot.select.created') || '--'}</span>;
		} else if (_status === 5) {
			// 部分成交
			return <span >{t('spot.select.partial') || '--'}</span>;
		}
		// else if (_status === 6) {
		//   return <span >{t('spot.select.canceled2') || '--'}</span>;
		// }
		else {
			return <span >{_status}</span>;
		}
	}
	// 判断方向是买还是卖
	const orderDirection = (takerSide: number, buyerUserId: number, sellerUserId: number) => {
		const userId = userInfo.userId
		if (sellerUserId === userId && buyerUserId === userId) {
			return takerSide
		} else if (sellerUserId === userId) {
			return 1
		} else if (buyerUserId === userId) {
			return 0
		} else {
			return '--'
		}
	}
	const getCompletion = () => {
		const amount = nul(division(recordData?.tradedAmount, recordData?.amount), 100)
		const { baseScaleResult } = getRound(recordData.symbol, amount)
		return < >
			{recordData?.status === 1 ? `100%` : recordData?.amount ?
				<span >
					{recordData.tradedAmount && recordData.tradedAmount.toString() !== '0' ? `${roundDown(baseScaleResult, 2)}%` : '0%'}
				</span> : '0'
			}
		</ >
	}
	// 判断角色是taker还是maker
	const maskName = (takerSide: number, buyerUserId: number, sellerUserId: number) => {
		const userId = userInfo.userId
		if (takerSide === 0) {
			if (userId === buyerUserId) {
				return 'Taker'
			} else {
				return 'Maker'
			}
		} else if (takerSide === 1) {
			if (userId === sellerUserId) {
				return 'Taker'
			} else {
				return 'Maker'
			}
		} else {
			return '--'
		}
	}
	const mainColumns1: ColumnType<DataType>[] = [
		{
			title: t('spot.columns.type'), //"类型",
			key: "type",
			dataIndex: "type",
			align: "center",
			render: (_text, record) => {
				let directionText
				if (record.direction === 0) {
					directionText = t('spot.trade.buy')
				} else if (record.direction === 1) {
					directionText = t('spot.trade.sell')
				} else {
					directionText = '--'
				}
				let typeText
				if (record.type === 0) {
					typeText = t('spot.select.market1')
				} else if (record.type === 1) {
					typeText = t('spot.select.limit1')
				} else {
					typeText = '--'
				}
				return <div className={`${record.direction === 0 ? styles.success_icon :
					record.direction === 1 ? styles.error_icon : styles.title_color} font-14`}>
					<span className={``}>{typeText}</span>/
					<span className={``}>
						{directionText}
					</span>
				</div>
			},
		},
		// {
		// 	title: t('spot.columns.quantity'), //"数量",
		// 	key: "amount",
		// 	dataIndex: "amount",
		// 	width: 128,
		// 	align: "center",
		// 	render: (_status: any, record: DataType) => {
		// 	  const { scaleResult } = getRound(record.symbol, _status);
		// 	  const res = getRound(record.symbol, record.tradedAmount);
		// 	  if (record.type === 0&& record.direction === 0) {
		// 		if (record.status === 1 || record.status === 5) {
		// 		  return <span>{res.scaleResult}</span>;
		// 		} else {
		// 		  return <span>--</span>;
		// 		}
		// 	  } else {
		// 		return <span>{scaleResult}</span>;
		// 	  }
		// 	//   if(!Number(record.turnover) && record.type === 0){
		// 	//     return <span>--</span>;
		// 	//   }else{
		// 	//   return <span>{_status ? scaleResult : '0'}</span>;
		// 	// }
		// 	},
		//   },
		//   {
		// 	title: t('spot.columns.count'), //"成交数量",
		// 	key: "tradedAmount",
		// 	dataIndex: "tradedAmount",
		// 	width: 128,
		// 	align: "center",
		// 	render: (_status: any, record: DataType) => {
		// 	  const { scaleResult } = getRound(record.symbol, _status);
		// 	  return <span>{_status ? scaleResult : '0'}</span>;
		// 	},
		//   },
		{
			title: `${t('spot.columns.count')}/${t('spot.columns.quantity')}`, //"成交数量/数量",
			key: "amount",
			dataIndex: "amount",
			width: 128,
			align: "center",
			render: (_status: any, record: DataType) => {
				const { scaleResult: amountScaleResult } = getRound(record.symbol, _status);
				// const res = getRound(record.symbol, record.tradedAmount);
				const { scaleResult: tradedAmountScaleResult } = getRound(record.symbol, record.tradedAmount);


				let amountText
				if (record.type === 0 && record.direction === 0) {
					if (record.status === 1 || record.status === 5) {
						amountText = tradedAmountScaleResult
					} else {
						amountText = '--'
					}
				} else {
					amountText = amountScaleResult
				}

				const tradedAmountText = tradedAmountScaleResult ? tradedAmountScaleResult : '0'

				return <span>{tradedAmountText}/{amountText}</span>;
			},
		},
		{
			title: `${t('spot.columns.averagePrice2')}/${t('spot.columns.price')}`, //"均价/价格",
			key: "price",
			dataIndex: "price",
			width: 128,
			border: 'buttom',
			render: (_status: any, record: DataType) => {
				const averagePrice = record.tradedAmount ? division(record.turnover || 0, record.tradedAmount) : 0
				let averagePriceText
				if (record.status === 0 || record.status === 1 || record.status === 5) {
					const { baseScaleResult } = getRound(record.symbol, averagePrice);
					averagePriceText = averagePrice ? baseScaleResult : '--'
				} else if (record.type === 0) {
					averagePriceText = t('spot.select.market')
				} else {
					averagePriceText = '--'
				}
				let priceText
				if (record.type === 0) {
					priceText = t('spot.select.market')
				} else if (record.type === 1) {
					const { baseScaleResult } = getRound(record.symbol, _status);
					priceText = _status ? baseScaleResult : '0'
				} else {
					priceText = '--'
				}
				return <span>{averagePriceText}/{priceText}</span>;
			},
		},
	];
	const mainColumns2: ColumnType<DataType>[] = [
		{
			title: t('spot.columns.fee'), //"手续费",
			key: "buyFee",
			dataIndex: "buyFee",
			// width: 158,
			align: "center",
			render: (_status, record) => {
				const symbol = record.symbol.split('/')
				let fee
				if (record.direction === 0) {
					// directionText = t('spot.trade.buy')
					fee = nul(record.takerFee, record.turnover)
				} else if (record.direction === 1) {
					fee = nul(record.makerFee, record.turnover)
				} else {
					fee = '--'
				}

				return <span>{fee}{symbol?.[0] || '--'}</span>;
			},
		},
		{
			title: t('spot.columns.amount2'), //"成交金额",
			key: "turnover",
			dataIndex: "turnover",
			width: 128,
			align: "center",
			render: (_status: any, record: DataType) => {
				const symbol = record.symbol.split('/')
				const { baseScaleResult } = getRound(record.symbol, _status);
				return <span>{_status ? baseScaleResult : '0'} {symbol?.[1] || '--'}</span>;
			},
		},
		{
			title: t('spot.columns.createTime'), //"下单时间",
			dataIndex: "createTime",
			key: "createTime",
			width: 158,
			align: "left",
			render: (text, record) => {
				return <span>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`}</span>
			},
		},
		{
			title: t('spot.columns.updateTime'), //"更新时间",
			dataIndex: "updateTime",
			key: "updateTime",
			width: 158,
			align: "left",
			render: (text, record) => {
				return <span>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`}</span>
			},
		},


	];
	const detailColumns: ColumnType<DataLogsType>[] = [
		{
			title: t('spot.columns.tradeTime'),//成交时间
			dataIndex: "mtime",
			key: "mtime",
			width: 128,
			align: "left",
			render: (text) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`} </div>,
		},
		{
			title: t('spot.columns.tradePrice'),//成交价
			dataIndex: "tradePrice",
			key: "tradePrice",
			align: "center",
			width: 128,
			// 判断方向是买还是卖 buyPrice/sellPrice
			render: (_tradePrice, record) => {
				const symbolName = recordData?.symbol;
				const { baseScaleResult } = getRound(symbolName, _tradePrice);
				return <span>{_tradePrice ? baseScaleResult : '--'}</span>;
			},
		},
		{
			title: t('spot.columns.tradeCount'),//成交数量
			dataIndex: "quantity",
			key: "quantity",
			align: "center",
			width: 158,
			render: (_status) => {
				const symbolName = recordData?.symbol;
				const { scaleResult } = getRound(symbolName, _status);
				return <span>{_status ? scaleResult : '--'}</span>;
			},
		},
		{
			title: t('spot.columns.tradeFee'),//手续费
			dataIndex: "buyFee",
			key: "buyFee",
			align: "center",
			width: 158,
			render: (_buyFee, record) => {
				const symbolName = recordData?.symbol
				const flag = orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
				// const price=nul(record.tradePrice,record.quantity)
				if (flag === 0) {
					const { baseScaleResult, baseSymbol, coinSymbol } = getRound(symbolName, _buyFee || 0)
					return <span>{`${baseScaleResult} ${coinSymbol || '--'}`}</span>
				} else if (flag === 1) {
					const { baseScaleResult, baseSymbol } = getRound(symbolName, record.sellFee || 0)
					return <span>{`${baseScaleResult} ${baseSymbol || '--'}`}</span>
				} else {
					return '--'
				}
			},
		},
		{
			title: t('spot.columns.tradeRole'),//角色
			key: "takerSide",
			dataIndex: "takerSide",
			width: 128,
			align: "center",
			render: (_text, record) => {

				return maskName(_text, record.buyerUserId, record.sellerUserId)
			},
		}
	]
	const getOrderDetail = async () => {
		if (!orderId || !symbol) return
		setLoading(true);
		try {
			const params = {
				page: 1,
				pageSize: 1000,
				orderId: orderId,
				symbol: `${symbol.split('/').join('_')}`
			};
			const res = await getOrderInfo(params);
			if (res.code === '0') {
				setTableData(res.data?.records || [])
			} else {
				Toast.show({
					content: res.message,
					icon: 'fail',
				});
			}
		} catch (error) {
			Toast.show({
				content: String(error),
				icon: 'fail',
			});
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		getOrderDetail()
	}, [orderId, symbol])
	return (<>
		<div className={`${styles.card_bgc}  radius-2`}>
			<div className={styles.user_header} >
				<button onClick={handleGoBack}>
					<Iconify icon="teenyicons:left-outline" className="left-icon" />
				</button>
				<div className="flex-1 flex-x-cc pr-3">
					<span className='ml-4'>{symbol || '--'}</span>
				</div>
			</div>
			<div className={`${styles.content_header} flex-y-cc`}>
				<div className={`flex-y-cc`}>
					<Image src={getStatusIconAndStyle().icon} className={`${styles.content_img}`} />
				</div>
				<div className={`${getStatusIconAndStyle().className} mt-2 font-14 ml-5`}>
					<span className={`mr-1 `}>
						{getStatus(recordData?.status)}
					</span>
					{getCompletion()}
				</div>
			</div>
			<div className={`${styles.content_body}`}>
				<div className={`${styles.border_bottom} px-2`}>
					<CustomTable
						columns={mainColumns1}
						dataSource={[recordData]}

						bodyClassName={`${styles.tables_content} ${styles.history_content}`}
						headerClassName={styles.tables_header}
						pagination={false}
						p1cardBorder={'none'}
					/>
				</div>
				<div className={`px-2`}>
					<CustomTable
						columns={mainColumns2}
						dataSource={[recordData]}
						bodyClassName={`${styles.tables_content} ${styles.history_content}`}
						headerClassName={styles.tables_header}
						pagination={false}
						p1cardBorder={'none'}
					/>
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