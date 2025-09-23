import React, { useState } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';
import { Checkbox } from "antd";
import appStore from '@/store';
import { BigNumber } from 'bignumber.js';

interface Props {
	orderData: any;
	onOk: () => void;
  	onCancel: () => void;
}

const ConfirmOrder:React.FC<Props> = ({ orderData, onOk, onCancel }) => {
	const { t } = useLanguage(['contract','spot']);
	// 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentContractInfo = appStore.getCurrentContractInfo();
	const {symbolPricePrecision} =currentContractInfo.coinResultVo;
	const [noRemind, setNoRemind] = useState(false);
	const unit = appStore.getUnit(currentContractInfo.base)

	// 处理复选框选中状态变化
    const handleCheckboxChange = (e: any) => {
        setNoRemind(e.target.checked);
    };

	const handOk = async () => {
		// 保存设置
    	localStorage.setItem("dontShowOrderConfirm", noRemind ? "true" : "false");
        onOk()
    };

	// 格式化数字显示 - 如果小数点后都是0则显示整数
	  const formatNumber = (num: number, precision: number = 4) => {
		if (num === 0) return "0";
	
		const fixed = new BigNumber(num).toFormat(precision);
		// 移除末尾的0和小数点
		const formatted = fixed.replace(/\.?0+$/, "");
		return formatted;
	  }

	return (
		<div className="p-4 pb-5">
			<div className="text-[18px] font-medium mb-1">{orderData.btnText}{currentContractInfo.base}{currentContractInfo.quote}</div>
			<div className="text-[14px] tip-color">
				<span className="mr-1">{orderData.marginModel === 1 ? t("tradingPanel.crossMargin") : t("tradingPanel.isolatedMargin")}</span>
				<span>{orderData.leverage}x</span>
			</div>
			 <ul className={`font-14 font-w-400 mt-[18px] mb-[10px] border border-color rounded-lg p-4`}>
				<li className="flex-x align-center justify-between">
					<p className="tip-color">
						{/* 价格 */}
						{t('spot:spot.modal.price')}
					</p>
					<p>
						{/* 市价 */}
						{orderData.orderType==='market' ? t('spot:spot.modal.market') : formatNumber(orderData.price)}(USDT)
					</p>
				</li>
				{/* 市价买单不显示数量 */}
				{!(orderData.type===0 && orderData.direction===0) && (
					<li className="flex-x align-center justify-between mt-5">
						<p className="tip-color">
							{/* 数量 */}
							{t('spot:spot.modal.amount')}
						</p>
						<p>{formatNumber(orderData.amount)} {unit}</p>
					</li>
				)}
			</ul>
			<Checkbox 
				className="mb-[30px] custom-checkbox" 
				checked={noRemind}
				onChange={handleCheckboxChange}
			>
				<p className="text-[14px] text-[var(--text-color5)]">
					{/* 不再提醒,可在交易设置中，开启或关闭提示。 */}
					{t('spot:spot.modal.noRemind')}
				</p>
			</Checkbox>
			<div className="flex w-full justify-between gap-x-[10px]">
				<button className="w-[50%] rounded-[22px] h-[44px] cancel_btn2 flex justify-center items-center" onClick={onCancel}>
					{t('spot:spot.modal.cancel')}
				</button>
				<button className="w-[50%] rounded-[22px] h-[44px] default_btn flex justify-center items-center" onClick={handOk}>
					{t('spot:spot.modal.confirm')}
				</button>
			</div>
		</div>
	)
}

export default ConfirmOrder;