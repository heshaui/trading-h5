import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Toast, Image, Checkbox, Modal } from "antd-mobile";
import { AssetsLayout } from "@/components/MenuItems";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '@/hooks/useLanguage';
import { NoData } from "@/components/noData";
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import BigNumber from "bignumber.js";

import AssetsList from "./components/AssetsList";

import { ReactComponent as CloseeyeSvg } from '@/assets/icons/userCenter/close-eye.svg';
import { ReactComponent as OpeneyeSvg } from '@/assets/icons/userCenter/open-eye.svg';

export interface AccountBalance {
  canUseAmount: string; // 可用余额
  isolateMargin: string; // 逐仓保证金
  lockAmount: string; // 锁定金额
  realizedAmount: string; // 已实现盈亏
  symbol: string; // 币种
  totalAmount: string; // 总余额
  totalMargin: string; // 总保证金
  totalMarginRate: string; // 总保证金率
  unRealizedAmount: string; // 未实现盈亏
}
const ContractAssets:React.FC = observer(() => {
	const {t} = useLanguage(['assets', 'userCenter']);
	const navigate = useNavigate();
	const [contractAssets, setContractAssets] = useState<AccountBalance[]>([]); // 合约账户数据
	const [showFundTransferModal, setShowFundTransferModal] = useState(false);
	const [banlanceShow, setBanlanceShow] = useState(true);
	const [loading, setLoading] = useState(false);

	// 获取合约账户余额
	const getContractBalance = async () => {
		setLoading(true);
		try {
			const accountList = await appStore.loadContractAssets();
			setContractAssets(accountList);
		} catch (error) { }
		setLoading(false);
	}
	// 账户余额
	const accountBalance = useMemo(() => {
		if (!contractAssets?.length) return null
		const balance = contractAssets.find((item: any) => item.symbol === "USDT");
		return balance ?? contractAssets[1]
	}, [contractAssets])

	useEffect(() => {
		getContractBalance()
	}, [])

	const todayProfit = 1

	return (
		<div className="p-4">
			<h3 className="text-[20px] leading-[28px] font-medium mb-4">{t('assets.futureAccount')}</h3>
			{/* 资产 */}
			<div className={`line-17 flex-row align-center text-[12px] font-medium`} >
				{/* 总资产折合 */}
				{t('userCenter:overview.assets.totalAssets')}
				<button type='button' className='ml-1'
					onClick={() => setBanlanceShow(!banlanceShow)}
				>
					{banlanceShow ? <OpeneyeSvg className="!w-[20px] !h-[20px] text-[var(--text-color5)]" /> : <CloseeyeSvg className="!w-[20px] !h-[20px] text-[var(--text-color5)]" />}
				</button>
			</div>
			<div>
				<span className="leading-[29px] text-[24px] mr-1">
					{/* 合约账户总权益。账户总权益=全仓总权益+逐仓总权益+冻结保证金 */}
					{banlanceShow ? new BigNumber(accountBalance?.realizedAmount || 0)
						.plus(Number(accountBalance?.totalMargin) || 0)
						.plus(accountBalance?.isolateMargin || 0)
						.toFixed(2) : '******'}
				</span>
				<span className="leading-[17px]">
					{accountBalance?.symbol}	
				</span>
			</div>
			<div className="mt-[2px] leading-[17px] text-[12px] tip-color font-medium mb-[10px]">
				{banlanceShow ? `≈ 9807.08 USD` : '******'}
			</div>
			<div className='font-14 flex-x align-center line-20 mb-[20px]'>
				{/* 今日盈亏 */}
				<span className="mr-1">{t('userCenter:overview.assets.todayProfitLoss')}</span>
				{banlanceShow ? <span className={`ltr-text font-medium ${Number(todayProfit) > 0 ? 'success_icon' : Number(todayProfit) < 0 ? 'error_icon' : 'error_icon'} font-12`}>
					{Number(todayProfit) < 0 ? "-" : "+"}
					&nbsp;{accountBalance?.symbol||'--'}&nbsp;
					{Number(todayProfit) ? Math.abs(Number(todayProfit)).toFixed(2) : 0}
				</span> :
					<span className={`tip-color font-12 flex-x-cc`}>******</span>
				}
			</div>	
			<div className="flex gap-x-[22px] mb-[30px]">
				<button
					className="min-w-[100px] px-[10px] h-[32px] flex items-center justify-center bg-[var(--background14)] rounded-[30px] text-[12px] font-medium"
				>
					{/* 划转 */}
					{t("futureAccount.transfer")}
				</button>
				<button
					className="min-w-[100px] px-[10px] h-[32px] flex items-center justify-center bg-[var(--background14)] rounded-[30px] text-[12px] font-medium"
					onClick={() => navigate('/contractAsets/account')}
				>
					{/* 流水  */}
					{t("futureAccount.fundFlow")}
				</button>
			</div>
			<AssetsList 
				contractAssets={contractAssets}
				loading={loading}
			/>			
		</div>
	)
});
export const meta = {
  requireAuth: true,
  layout: 'header-only'
}
export default AssetsLayout(ContractAssets);