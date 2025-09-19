import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Toast, Image, Checkbox, Modal } from "antd-mobile";
import { UserCenterLayout } from "@/components/MenuItems";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { encryptData } from "@/utils/encrypt";
import BigNumber from "bignumber.js";
import { getUserBalanceAll, transferAll } from "@/services/assets";
import { getCoinRate, getRate } from "@/utils/getUseRate";

import AssetsList from "./components/AssetsList";
import FundTransferPopup from "../Contract/components/ContractTrade/components/FundTransferPopup";

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
  iconUrl?: string; // 图标,
  defaultName?: string; // 币名称
}
const ContractAssets:React.FC = observer(() => {
	const {t} = useLanguage(['assets', 'userCenter', 'contract']);
	const navigate = useNavigate();
	const [contractAssets, setContractAssets] = useState<AccountBalance[]>([]); // 合约账户数据
	const [showFundTransferModal, setShowFundTransferModal] = useState(false);
	const [banlanceShow, setBanlanceShow] = useState(true);
	const [loading, setLoading] = useState(false);
	const [spotBalance, setSpotBalance] = useState<any[]>([]); // 现货账户余额数组

	// 获取合约账户余额
	const getContractBalance = async () => {
		setLoading(true);
		try {
			const accountList = await appStore.loadContractAssets();
			setContractAssets(accountList);
		} catch (error) { }
		setLoading(false);
	}

	// 获取现货账户余额
	const getSpotBalance = async () => {
		try {
		const res = await getUserBalanceAll();
		console.log("getUserBalanceAll response:", res);
		console.log("getUserBalanceAll res.data:", res.data);
		console.log("getUserBalanceAll res.data type:", typeof res.data);

		if (res.code === "0" && Array.isArray(res.data)) {
			setSpotBalance(res.data);
		} else {
			console.error("获取现货余额失败:", res);
			setSpotBalance([]);
		}
		} catch (error) {
			console.error("获取现货余额异常:", error);
			setSpotBalance([]);
		}
	};
	// 账户余额
	const accountBalance = useMemo(() => {
		if (!contractAssets?.length) return null
		const balance = contractAssets.find((item: any) => item.symbol === "USDT");
		return balance ?? contractAssets[1]
	}, [contractAssets])

	const totalBalance = useMemo(() => {
		return new BigNumber(accountBalance?.realizedAmount || 0)
					.plus(Number(accountBalance?.totalMargin) || 0)
					.plus(accountBalance?.isolateMargin || 0)
					.toFixed(2)
	}, [accountBalance])

	const onBalanceUpdate = () => {
		getContractBalance();
		getSpotBalance();
	};

	// 处理资金划转确认
	const handleFundTransferConfirm = async (transferData: any) => {
		const dataEncrypt = await encryptData(transferData);
		const res = await transferAll(dataEncrypt);
		console.log("res:", res);
		if (res.code === "0" && res.data) {
			Toast.show({icon: 'success', content: t('contract:tradingPanel.transferSuccess')});
			// 通知父组件更新余额
		} else {
			Toast.show({icon: 'fail', content: t('contract:tradingPanel.transferFailed')});
		}
		onBalanceUpdate();
	};

	useEffect(() => {
		onBalanceUpdate()
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
					{banlanceShow ? totalBalance : '******'}
				</span>
				{banlanceShow && <span className="leading-[17px]">
					{accountBalance?.symbol}	
				</span>}
			</div>
			<div className="mt-[2px] leading-[17px] text-[12px] tip-color font-medium mb-[10px]">
				{banlanceShow ? `≈ ${totalBalance} USD` : '******'}
			</div>
			{/* 今日盈亏 */}
			{/* <div className='font-14 flex-x align-center line-20 mb-[20px]'>
				<span className="mr-1">{t('userCenter:overview.assets.todayProfitLoss')}</span>
				{banlanceShow ? <span className={`ltr-text font-medium ${Number(todayProfit) > 0 ? 'success_icon' : Number(todayProfit) < 0 ? 'error_icon' : 'error_icon'} font-12`}>
					{Number(todayProfit) < 0 ? "-" : "+"}
					&nbsp;{accountBalance?.symbol||'--'}&nbsp;
					{Number(todayProfit) ? Math.abs(Number(todayProfit)).toFixed(2) : 0}
				</span> :
					<span className={`tip-color font-12 flex-x-cc`}>******</span>
				}
			</div>	 */}
			<div className="flex gap-x-[22px] mb-[30px]">
				<button
					className="min-w-[100px] px-[10px] h-[32px] flex items-center justify-center bg-[var(--background14)] rounded-[30px] text-[12px] font-medium"
					onClick={() => setShowFundTransferModal(true)}
				>
					{/* 划转 */}
					{t("futureAccount.transfer")}
				</button>
				{/* 流水  */}
				{/* <button
					className="min-w-[100px] px-[10px] h-[32px] flex items-center justify-center bg-[var(--background14)] rounded-[30px] text-[12px] font-medium"
					onClick={() => navigate('/contractAssets/account')}
				>
					{t("futureAccount.fundFlow")}
				</button> */}
			</div>
			<AssetsList 
				contractAssets={contractAssets}
				loading={loading}
			/>
			{/* 资金划转弹框 */}
			<FundTransferPopup
				visible={showFundTransferModal}
				spotBalance={spotBalance}
				contractBalance={contractAssets}
				onClose={() => setShowFundTransferModal(false)}
				onConfirm={handleFundTransferConfirm}
			/>			
		</div>
	)
});
export const meta = {
  requireAuth: true,
  layout: 'header-only'
}
export default UserCenterLayout(ContractAssets);