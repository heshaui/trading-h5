import React, { useState } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';
import { Checkbox } from "antd";
import appStore from '@/store';
import { getRound } from '@/utils/getUseRate';

interface Props {
	orderData: any;
	onOk: () => void;
  	onCancel: () => void;
}

const ConfirmOrder:React.FC<Props> = ({ orderData, onOk, onCancel }) => {
	const { t } = useLanguage('spot');
	// 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
	const [noRemind, setNoRemind] = useState(false);

	// 处理复选框选中状态变化
    const handleCheckboxChange = (e: any) => {
        setNoRemind(e.target.checked);
    };

	// 处理价格和数量的精度
	const formatPrice = (price: string | number) => {
		const priceInfo = getRound(
			`${currentPair?.coinSymbol}/${currentPair?.baseSymbol}`,
			price,
			currentPair?.coinSymbol,
			currentPair?.baseSymbol
		);
		return priceInfo.baseScaleResult;
	};

	const formatAmount = (amount: string | number) => {
		const amountInfo = getRound(
			`${currentPair?.coinSymbol}/${currentPair?.baseSymbol}`,
			amount,
			currentPair?.coinSymbol,
			currentPair?.baseSymbol
		);
		return amountInfo.scaleResult;
	};

	const handOk = async () => {
        console.log('提交订单');
        
        // 如果用户选择不再提醒，保存到本地存储
        if (noRemind) {
            console.log(orderData,'orderData')
            if(orderData.type===1){
                localStorage.setItem('limitOrderConfirm', 'false');
            }else{
                localStorage.setItem('marketOrderConfirm', 'false');
            }
            
        }
        onOk()
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };

	return (
		<div className="p-4 pb-5">
			<h3 className="text-[18px] leading-[25px] font-medium text-center">{currentPair?.coinSymbol}/{currentPair?.baseSymbol}</h3>
			<p className={`success_icon font-14 font-w-400 mt-1 leading-[20px] text-center`}>
				{/* 买入/市价 */}
				{orderData.direction===0?t('spot.modal.buy'):t('spot.modal.sell')} / {orderData.type===0?t('spot.modal.market'):t('spot.select.limit')}
			</p>
			 <ul className={`font-14 font-w-400 mt-[18px] mb-[10px] border border-color rounded-lg p-4`}>
				<li className="flex-x align-center justify-between">
					<p className="tip-color">
						{/* 价格 */}
						{t('spot.modal.price')}
					</p>
					<p>
						{/* 市价{currentPair?.baseSymbol} */}
						{orderData.type===0 ? t('spot.modal.market') : formatPrice(orderData.price)} 
					</p>
				</li>
				{/* 市价买单不显示数量 */}
				{!(orderData.type===0 && orderData.direction===0) && (
					<li className="flex-x align-center justify-between mt-5">
						<p className="tip-color">
							{/* 数量 */}
							{t('spot.modal.amount')}
						</p>
						<p>{formatAmount(orderData.amount)} {currentPair?.coinSymbol}</p>
					</li>
				)}
				{/* 市价卖单不显示成交额 */}
				{!(orderData.type===0 && orderData.direction===1) && (
					<li className="flex-x align-center justify-between mt-5">
						<p className="tip-color">
							{/* 成交额 */}
							{t('spot.trade.amount2')}
						</p>
						<p>{formatPrice(orderData.account)} {currentPair?.baseSymbol}</p>
					</li>
				)}
			</ul>
			{ orderData.type===0 && <div className="bg-[#ff8a26] bg-opacity-[8%] mb-[10px] text-[#ff8a26] text-[12px] rounded-lg px-[10px] py-4 leading-[17px] text-justify flex items-start">
				<Iconify icon="ep:warning-filled" className="warning_color mr-1 text-[16px]" />
				<span>
					{/* 市场行情千变万化，市价单交易伴随着滑点，其最终成交价可能低于/高于最新价，请留意市场深度及价格波动 */}
					{t('spot.modal.warning')}
				</span>
			</div>}
			<Checkbox 
				className="mb-[30px] custom-checkbox" 
				checked={noRemind}
				onChange={handleCheckboxChange}
			>
				<p className="text-[14px] text-[var(--text-color5)]">
					{/* 不再提醒,可在交易设置中，开启或关闭提示。 */}
					{t('spot.modal.noRemind')}
				</p>
			</Checkbox>
			<div className="flex w-full justify-between gap-x-[10px]">
				<button className="w-[50%] rounded-[22px] h-[44px] cancel_btn2 flex justify-center items-center" onClick={onCancel}>
					{t('spot.modal.cancel')}
				</button>
				<button className="w-[50%] rounded-[22px] h-[44px] default_btn flex justify-center items-center" onClick={handOk}>
					{t('spot.modal.confirm')}
				</button>
			</div>
		</div>
	)
}

export default ConfirmOrder;