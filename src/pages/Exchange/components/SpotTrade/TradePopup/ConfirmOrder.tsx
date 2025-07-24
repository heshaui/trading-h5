import React, { useState } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';
import { Checkbox } from "antd";
import appStore from '@/store';

interface Props {
	orderData: any;
}

const ConfirmOrder:React.FC<Props> = ({ orderData }) => {
	const { t } = useLanguage('spot');
	// 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
	const [noRemind, setNoRemind] = useState(false);

	// 处理复选框选中状态变化
    const handleCheckboxChange = (e: any) => {
        setNoRemind(e.target.checked);
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
        
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };
	const handCancel = () => {}

	return (
		<div>
			<h3>{currentPair?.coinSymbol}/{currentPair?.baseSymbol}</h3>
			 <p className={`success_icon font-14 font-w-400 mt-1`}>
				{/* 买入/市价 */}
				{orderData.direction===0?t('spot.modal.buy'):t('spot.modal.sell')} / {orderData.type===0?t('spot.modal.market'):t('spot.select.limit')}
			</p>
			 <ul className={`tip-color font-14 font-w-400 mt-4 mb-2_5`}>
				<li className="flex-x align-center justify-between">
					<p>
						{/* 价格 */}
						{t('spot.modal.price')}
					</p>
					<p >
						{/* 市价 */}
						{orderData.type===0?t('spot.modal.market'):orderData.price}{currentPair?.baseSymbol}
					</p>
				</li>
				{/* 市价买单不显示数量 */}
				{!(orderData.type===0 && orderData.direction===0) && (
					<li className="flex-x align-center justify-between mt-3">
						<p>
							{/* 数量 */}
							{t('spot.modal.amount')}
						</p>
						<p >{orderData.amount}{currentPair?.coinSymbol}</p>
					</li>
				)}
				{/* 市价卖单不显示成交额 */}
				{!(orderData.type===0 && orderData.direction===1) && (
					<li className="flex-x align-center justify-between mt-3">
						<p>
							{/* 成交额 */}
							{t('spot.trade.amount2')}
						</p>
						<p >{orderData.account}{currentPair?.baseSymbol}</p>
					</li>
				)}
			</ul>
			{ orderData.type===0 && <div className={`font-12 font-w-400 flex align-start mb-2_5 `} >
				<Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
				<span>
					{/* 市场行情千变万化，市价单交易伴随着滑点，其最终成交价可能低于/高于最新价，请留意市场深度及价格波动 */}
					{t('spot.modal.warning')}
				</span>
			</div>}
			<Checkbox 
				className="custom-checkbox text-color-default mb-5" 
				checked={noRemind}
				onChange={handleCheckboxChange}
			>
				<p >
					{/* 不再提醒,可在交易设置中，开启或关闭提示。 */}
					{t('spot.modal.noRemind')}
				</p>
			</Checkbox>
			<div className="flex justify-between gap-x-[10px] px-4">
				<button className="w-[50%] rounded-[22px] h-[44px] cancel_btn2 flex justify-center items-center" onClick={handCancel}>
					{t('cancel')}
				</button>
				<button className="w-[50%] rounded-[22px] h-[44px] default_btn flex justify-center items-center" onClick={handOk}>
					{t('save')}
				</button>
			</div>
		</div>
	)
}

export default ConfirmOrder;