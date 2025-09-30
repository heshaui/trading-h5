import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks';
import { observer } from 'mobx-react-lite';
import appStore from "@/store";
import { getLadderInfo } from '@/services/contract';
import { BigNumber } from 'bignumber.js';

/**
 * base: 基础币种
 * brokerId: 经纪商ID
 * capitalFrequency: 资本频率
 * capitalStartTime: 资本开始时间
 * coType: 合约类型
 * coinResultVo: 币种结果
 * contractName: 合约名称
 * contractShowType: 合约显示类型
 * contractSide: 合约方向
 * contractType: 合约类型
 * deliveryKind: 交割类型
 * id: 合约ID
 * marginCoin: 保证金币种
 * marginRate: 保证金率
 * maxLever: 最大杠杆
 * minLever: 最小杠杆
 * multiplier: 乘数
 * multiplierCoin: 乘数币种
 * quote: 报价币种
 * settlementFrequency: 结算频率
 * sort: 排序
 * symbol: 合约符号
 */
const ContractInfo:React.FC = observer(() => {
	const {t} = useLanguage('contract');
	const currentContractInfo = appStore.getCurrentContractInfo();
	const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;
	// 最低保证金率
	const [minMarginRate, setMinMarginRate] = useState('');

	const getladderList = async () => {
		try {
			const rs = await getLadderInfo({contractId: currentContractInfo.id})
			if (rs.code === '0' && rs.data) {
			if (rs.data.ladderList) {
				const ladderList = rs.data.ladderList.ladderList || [];
				if (ladderList && ladderList.length) {
					const rate = ladderList[0].minMarginRate;
					const result = new BigNumber(rate * 100).toFixed(2);
					setMinMarginRate(result);
				}
			}
			}
		} catch(err) {}
    }

	useEffect(() => {
		getladderList();
	}, [])

	return (
		<div className="p-[16px] text-[14px]">
			<div className="flex flex-col gap-[10px]">
				{/* 合约代号 */}
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.contractId")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.contractName || '--'}</div>
				</div>
				{/* 交割日期 */}
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.deliveryDate")}</div>
					{/* t("contractInfo.perpetual") */}
					<div className="text-[var(--text-color5)]">{currentContractInfo.contractShowType}</div>
				</div>
				{/* 合约标的 */}
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.contractTarget")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.symbol} {t("contractInfo.index")}</div>
				</div>
				{/* 保证金币种 */}
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.marginCoin")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.quote}</div>
				</div>
				{/* 合约面值 */}
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.contractValue")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.multiplier} {currentContractInfo?.multiplierCoin}</div>
				</div>
				{/* 最小价格变动单位 */}
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.minPriceChange")}</div>
					<div className="text-[var(--text-color5)]">{symbolPricePrecision} {currentContractInfo?.quote}</div>
				</div>
				{/* 最低维持保证金率 */}
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.minMaintainMarginRate")}</div>
					<div className="text-[var(--text-color5)]">{minMarginRate ?? '--'} %</div>
				</div>
			</div>
		</div>
	)
})

export default ContractInfo;