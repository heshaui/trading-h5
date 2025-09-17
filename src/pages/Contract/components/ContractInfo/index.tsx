import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks';
import { observer } from 'mobx-react-lite';
import appStore from "@/store";

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
	return (
		<div className="p-[16px] text-[14px]">
			<div className="flex flex-col gap-[10px]">
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.contractId")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.symbol || '--'}</div>
				</div>
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.deliveryDate")}</div>
					{/* t("contractInfo.perpetual") */}
					<div className="text-[var(--text-color5)]">{currentContractInfo.contractShowType}</div>
				</div>
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.contractTarget")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.symbol} {t("contractInfo.index")}</div>
				</div>
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.marginCoin")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.quote}</div>
				</div>
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.contractValue")}</div>
					<div className="text-[var(--text-color5)]">{currentContractInfo?.multiplier} {currentContractInfo?.multiplierCoin}</div>
				</div>
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.minPriceChange")}</div>
					<div className="text-[var(--text-color5)]">{'--'} {currentContractInfo?.quote}</div>
				</div>
				<div className="flex justify-between items-center">
					<div className="text-[var(--text-color6)]">{t("contractInfo.minMaintainMarginRate")}</div>
					<div className="text-[var(--text-color5)]">{'--'} %</div>
				</div>
			</div>
		</div>
	)
})

export default ContractInfo;