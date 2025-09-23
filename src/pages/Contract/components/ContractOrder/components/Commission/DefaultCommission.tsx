import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import appStore from "@/store";
import { Switch } from 'antd-mobile';
import { message } from 'antd';
import { useContract } from '@/context/exchange-providers/ContractProvider';
import { useOrdinaryCommission, OrdinaryCommission } from "../../hooks";
import { NoData } from '@/components/noData';
import { Iconify } from '@/components/icon';
import { Side, SideMap, Type, PositionType, Open, Status, TypeMap, PositionTypeMap } from '../../configs/columns';
import BigNumber from "bignumber.js";
import dayjs from 'dayjs';

import DelectModal from '@/pages/SpotOrder/components/TipPop/Delect_modal';

const DefaultCommission:React.FC = () => {
    const {t} = useLanguage('contract');
    // 获取当前合约信息
    const currentContractInfo = appStore.getCurrentContractInfo();
    const currentSymbol = currentContractInfo?.symbol || "";
    const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;
    const { setDefaultOrderCount, addOrderNotice } = useContract();

    const [onlyCurrentSymbol, setOnlyCurrentSymbol] = useState(false);
    const [orderList, setOrderList] = useState<OrdinaryCommission[]>([]);
    const [delVisible, setDelVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<OrdinaryCommission>();
    const [delType, setDelType] = useState(0); // 0:全部 1: 单个
    // 普通委托
    const {
        ordinaryCommission,
        loading,
        getOrdinaryCommission,
        handleCancelOrdinaryOrder,
        getFilteredOrdinaryCommission,
    } = useOrdinaryCommission({
        contractId: currentContractInfo?.id,
    });

    useEffect(() => {
        getOrdinaryCommission();
        console.log('新委托', addOrderNotice)
    }, [getOrdinaryCommission, currentSymbol, currentContractInfo?.id, addOrderNotice]);

    useEffect(() => {
		// const data:OrdinaryCommission[]  = [
		// 	{
        //         symbol: 'BSCUSDT',
        //         pricePrecision: 0,
        //         side: Side.BUY,
        //         positionType: PositionType.CROSS_MARGIN,
        //         avgPrice: 0,
        //         tradeFee: 0,
        //         type: Type.LIMIT,
        //         mtime: 0,
        //         volume: 876.98,
        //         dealVolume: 10,
        //         price: 109987.098,
        //         contractId: 0,
        //         ctime: Date.now(),
        //         contractName: '',
        //         id: '',
        //         open: Open.OPEN,
        //         status: Status.PENDING
        //     },
        //     {
        //         symbol: 'ETHUSDT',
        //         pricePrecision: 0,
        //         side: Side.SELL,
        //         positionType: PositionType.ISOLATED_MARGIN,
        //         avgPrice: 0,
        //         tradeFee: 0,
        //         type: Type.MARKET,
        //         mtime: 0,
        //         volume: 876.98,
        //         dealVolume: 10,
        //         price: 109987.098,
        //         contractId: 0,
        //         ctime: Date.now(),
        //         contractName: '',
        //         id: '',
        //         open: Open.OPEN,
        //         status: Status.PENDING
        //     },
		// ]
		const data = getFilteredOrdinaryCommission(currentSymbol, onlyCurrentSymbol);
		setOrderList(data);
		setDefaultOrderCount(data?.length ?? 0);
	}, [getOrdinaryCommission, ordinaryCommission, onlyCurrentSymbol])

	// 显示合约类型
	const getContractShowType = () => {
		const type = currentSymbol.contractShowType;
		return type ? type.replace('合约', '') : '模拟'
	}
    
    // 计算完成度
    const setFinally = (num: number, total: number) => {
        if (!num || !total) return '0%';
        return (Number(num)/Number(total)).toFixed(2)+'%';
    }

    // 全部撤销
    const handleCancelAllOrders = async () => {
        for (const record of orderList) {
            try {
                await handleCancelOrdinaryOrder(record, true)
            } catch (error) {
                console.error("撤销失败:", error)
                message.error(String(error))
            }
        }
        message.success(t("cancelled"))
        getOrdinaryCommission()
    }
	// 撤单确认
	const handleDelOk = () => {
		setDelVisible(false);
		delType ? handleCancelOrdinaryOrder(currentOrder!, false, t("cancelled")) : handleCancelAllOrders();
	}

    return (
        <>
            <div className="h-[48px] px-4 flex justify-between items-center text-[14px] border-b border-color">
                <div className="flex items-center">
                    <Switch
                        checked={onlyCurrentSymbol}
                        onChange={(check: boolean) => setOnlyCurrentSymbol(check)}
                        style={{
                            '--checked-color': 'var(--theme-color)',
                            '--height': '16px',
                            '--width': '28px',
                        }}
                    />
                    <span className="ml-1">{t("order.onlyCurrentSymbol")}</span>
                </div>
                <button 
                    type="button" 
                    className="m-w-[68px] h-[25px] px-[10px] flex justify-center items-center bg-[var(--border-color-light)] rounded-[25px] text-[12px]"
                    onClick={() => {
                        setDelType(0)
						setDelVisible(true)
                    }}
                >
                    {t('cancelAll')}
                </button>
            </div>
            <ul className="max-h-[350px] hideScrollBar">
				{
					loading ? 
					<li className="h-[200px] flex justify-center items-center">
						<Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
					</li> :
					orderList.length ? orderList.map((item) => {
						return (<li key={item.id} className="border-b border-color p-4">
							<div className="flex items-center justify-between mb-[16px]">
                                <div>
                                    <div className="h-[22px] flex items-center mb-[2px]">
                                        <span className="text-[14px] font-medium mr-[4px]">{item.symbol ?? '--'}</span>
                                        <span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center">{getContractShowType()}</span>
                                    </div>
                                    <div className="leading-[17px] text-[12px]">
                                        <span className={`${item.side === Side.BUY ? 'success_icon' : 'error_icon'}`}>
                                            {t(TypeMap[item.type])}/{t(SideMap[item.side])}
                                        </span>
                                        <span className="ml-[10px]">{dayjs(item.mtime).format("YYYY-MM-DD HH:mm:ss")}</span>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    className="h-[25px] px-[10px] flex justify-center items-center bg-[var(--border-color-light)] rounded-[25px] text-[12px]"
                                    onClick={() => {
                                        setDelType(1)
                                        setDelVisible(true)
                                        setCurrentOrder(item)
                                    }}
                                >
                                    {t('cancel')}
                                </button>
                            </div>
                            <div className="flex-col gap-y-[16px]">
                                <p className="flex items-center justify-between h-[20px] text-[14px]">
                                    <span className="text-[#9e9e9e]">{t('order.ordinaryColumn.finally')}</span>
                                    <span>{setFinally(item.dealVolume, item.volume)}</span>
                                </p>
                                <p className="flex items-center justify-between h-[20px] text-[14px]">
                                    <span className="text-[#9e9e9e]">{t('order.ordinaryColumn.volume')}(USDT)</span>
                                    <span>{item.dealVolume.toFixed(2)}/{item.volume.toFixed(2)}</span>
                                </p>
                                <p className="flex items-center justify-between h-[20px] text-[14px]">
                                    <span className="text-[#9e9e9e]">{t('orderPrice')}</span>
                                    <span>{new BigNumber(item.price).toFormat(symbolPricePrecision)}</span>
                                </p>
                                <p className="flex items-center justify-between h-[20px] text-[14px]">
                                    <span className="text-[#9e9e9e]">{t('tpsl')}</span>
                                    <span>--/--</span>
                                </p>
                            </div>
						</li>)
					}) :
					<li className="h-[200px] flex justify-center items-center">
						<NoData />
					</li>
				}
			</ul>
            <DelectModal 
				open={delVisible}
				orderId={[]}
				type={delType}
				onCancel={() => setDelVisible(false)}
				onOk={handleDelOk} 
			/>
        </>
    )
}

export default DefaultCommission;

