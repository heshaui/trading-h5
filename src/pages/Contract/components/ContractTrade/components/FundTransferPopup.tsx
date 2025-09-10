import React, {useState, useEffect, useMemo} from 'react';
import {Popup} from 'antd-mobile';
import { Modal, ConfigProvider, Input, Button, Image } from 'antd';
import SelectPop from '@/components/SelectPop';
import { Iconify } from '@/components/icon';
import { getLabel } from '@/utils';
import { useLanguage } from '@/hooks';
import appStore from "@/store";
import styles from './FundTransferPopup.module.scss';

import { ReactComponent as TransferIcon } from '@/assets/images/exchange/icon-convert.svg';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (transferData: any) => void;
  spotBalance?: any[]; // 现货账户余额是数组
  contractBalance?: any[]; // 合约账户余额是数组
};

const FundTransferPopup:React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  spotBalance = [],
  contractBalance = []
}) => {
	const {t} = useLanguage('contract');
	// 状态管理
	const [fromAccount, setFromAccount] = useState<'spot' | 'contract'>('spot');
	const [toAccount, setToAccount] = useState<'spot' | 'contract'>('contract');
	const [selectedCoin, setSelectedCoin] = useState('USDT');
	const [transferAmount, setTransferAmount] = useState('');
	const [refreshKey, setRefreshKey] = useState(0); // 强制刷新key
	const [availableBalance] = useState(11111555503.012312338123); // 可用余额
	const coinList = appStore.getCoinList();


	// 监听币种和账户变化，更新可用余额
	useEffect(() => {
		// 当币种或账户变化时，重新计算可用余额
		const currentBalance = fromAccount === 'spot' ? getSpotBalance() : getContractBalance();

	}, [selectedCoin, fromAccount, spotBalance, contractBalance]);

	// 账户选项
	const accountOptions = [
		{label: t('fundTransfer.spotAccount'), value: 'spot'},
		{label: t('fundTransfer.contractAccount'), value: 'contract'},
	]
	// 币种选项
	// const coinOptions = [
	//   { value: 'USDT', label: 'USDT', subLabel: 'tetherUSD' },
	//   { value: 'BTC', label: 'BTC', subLabel: 'Bitcoin' },
	//   { value: 'ETH', label: 'ETH', subLabel: 'Ethereum' }
	// ];
	const coinOptions = coinList.map(coin => ({
		value: coin.coinName,
		label: (
			<div className="flex items-center">
				<Image src={coin.iconUrl} alt={coin.coinName} className="!w-[20px] !-[20px] rounded-full" preview={false} />
				<span className="leading-[20px] text-[14px] ml-[10px]">{coin.coinName}</span>
			</div>
		),
	}));	
	

	// 获取指定币种的余额
	const getBalance = (balanceList: any[], coinName: string) => {


		if (!Array.isArray(balanceList) || balanceList.length === 0) {

		return 0;
		}

		const balanceItem = balanceList.find((item: any) => {
		const matches = item.coinName === coinName || item.symbol === coinName;

		return matches;
		});



		if (balanceItem) {
		const balance = balanceItem.balance || balanceItem.canUseAmount || 0;

		// 确保balance是数字类型
		const numericBalance = typeof balance === 'number' ? balance : parseFloat(balance) || 0;

		return Number(numericBalance.toFixed(4));
		}


		return 0;
	};

	// 获取当前选择的币种在现货账户的余额
	const getSpotBalance = () => {
		return getBalance(spotBalance || [], selectedCoin);
	};

	// 获取当前选择的币种在合约账户的余额
	const getContractBalance = () => {
		return getBalance(contractBalance || [], selectedCoin);
	};

	// 检查是否有足够的余额进行转账
	const hasEnoughBalance = () => {
		const currentBalance = fromAccount === 'spot' ? getSpotBalance() : getContractBalance();
		const amount = Number(transferAmount) || 0;
		return amount > 0 && amount <= currentBalance;
	};



	// 处理关闭
	const handleCancel = () => {
		setTransferAmount('');
		setSelectedCoin('USDT'); // 重置为默认币种
		setFromAccount('spot'); // 重置为默认账户
		setToAccount('contract'); // 重置为默认目标账户
		onClose();
	};

	// 处理确认转账
	const handleConfirm = async () => {

		const transferData = {
		transferType: fromAccount === 'spot' ? 'wallet_to_contract' : 'contract_to_wallet',
		coinSymbol: selectedCoin,
		amount: transferAmount
		};

		onConfirm?.(transferData);
		handleCancel();
	};

	// 处理最大按钮
	const handleMaxAmount = () => {
		let maxAmount = 0;
		if (fromAccount === 'spot') {
		maxAmount = getSpotBalance();
		} else {
		maxAmount = getContractBalance();
		}
		setTransferAmount(maxAmount.toString());
	};

	// 处理账户切换
	const handleAccountSwitch = () => {
		setFromAccount(fromAccount === 'spot' ? 'contract' : 'spot');
		setToAccount(toAccount === 'spot' ? 'contract' : 'spot');
		// 清空转账数量，因为交换账户后余额可能不同
		setTransferAmount('');
		// 强制刷新余额显示
		setRefreshKey(prev => prev + 1);
	};

	// 获取账户显示名称
	const getAccountName = (accountType: 'spot' | 'contract') => {
		return accountType === 'spot' ? t('fundTransfer.spotAccount') : t('fundTransfer.contractAccount');
	};

	const PopupContent = () => {
		return (
			<div className="p-[16px]">
				{/* 账户选择区域 */}
				<div className="px-[10px] py-[15px] rounded-[8px] border border-color flex">
					<div className="flex-1 mr-[20px]">
						<div className="flex items-center justify-between h-[24px] text-[14px] mb-[30px]">
							<label className="tip-color mr-[20px] shrink-0">{t('fundTransfer.from')}</label>
							<SelectPop 
								value={fromAccount}
								options={accountOptions}
								title={t('placeholder')} 
								activeType="icon"
								onChange={(value:any) => {
									setFromAccount(value);
									setToAccount(value === 'spot' ? 'contract' : 'spot');
									// 清空转账数量，因为切换账户后余额可能不同
									setTransferAmount('');
									// 强制刷新余额显示
									setRefreshKey(prev => prev + 1);
								}}
								renderBtn={(open) => (
									<button 
										className="flex-1 h-[24px] flex justify-between items-center"
										onClick={open}
									>
										<span>{getLabel(fromAccount, accountOptions)}</span>
										<Iconify icon="icon-park-outline:down" className="text-[24px]"/>
									</button>
								)}
							/>
						</div>
						<div className="flex items-center justify-between h-[24px] text-[14px]">
							<label className="tip-color mr-[20px] shrink-0">{t('fundTransfer.to')}</label>
							<SelectPop 
								value={toAccount}
								options={accountOptions}
								title={t('placeholder')} 
								activeType="icon"
								onChange={(value: any) => {
									setToAccount(value);
									setFromAccount(value === 'spot' ? 'contract' : 'spot');
									// 强制刷新余额显示
									setRefreshKey(prev => prev + 1);
								}}
								renderBtn={(open) => (
									<button 
										className="flex-1 h-[24px] flex justify-between items-center"
										onClick={open}
									>
										<span>{getLabel(toAccount, accountOptions)}</span>
										<Iconify icon="icon-park-outline:down" className="text-[24px]"/>
									</button>
								)}
							/>
						</div>
					</div>
					<div className="shrink-0" onClick={handleAccountSwitch}>
						<TransferIcon className="!w-[20px] !h-[20px]" />
					</div>
				</div>
				<div className={styles.availableBalance} key={`balance-${refreshKey}`}>
					<div>
						<span>{t('fundTransfer.available')}: </span>
						<span className={styles.balanceAmount}>
						{fromAccount === 'spot' ? getSpotBalance() : getContractBalance()} {selectedCoin}
						</span>
					</div>
					<div>
						<span>{t('fundTransfer.available')}: </span>
						<span className={styles.balanceAmount}>
						{toAccount === 'spot' ? getSpotBalance() : getContractBalance()} {selectedCoin}
						</span>
					</div>
				</div>

				{/* 币种选择 */}
				<div className={styles.formItem}>
				<label className={styles.formLabel}>{t('fundTransfer.coin')}</label>
				<SelectPop 
					value={selectedCoin}
					options={coinOptions}
					title={t('placeholder')} 
					activeType="icon"
					onChange={(value: any) => {
						setSelectedCoin(value);
						// 清空转账数量，因为切换币种后余额可能不同
						setTransferAmount('');
						// 强制刷新余额显示
						setRefreshKey(prev => prev + 1);
					}}
					renderBtn={(open) => (
						<button 
							className="border border-solid input-border rounded-lg w-full h-[50px] px-[13px] text-[14px] flex justify-between items-center"
							onClick={open}
						>
							<span>{getLabel(selectedCoin, coinOptions)}</span>
							<Iconify icon="icon-park-outline:down" className="text-[24px]"/>
						</button>
					)}
				/>
				
				</div>

				{/* 数量输入 */}
				<div className={styles.formItem}>
				<label className={styles.formLabel}>{t('fundTransfer.amount')}</label>
				<div className={styles.amountInputWrapper}>
					<Input
						value={transferAmount}
						onChange={(e) => setTransferAmount(e.target.value)}
						placeholder={t('fundTransfer.minAmount')}
						className={styles.amountInput}
						size="large"
						suffix={
							<div className={styles.inputSuffix}>
							<span className={styles.coinUnit}>{selectedCoin}</span>
							<Button
								type="text"
								size="small"
								onClick={handleMaxAmount}
								className={styles.maxButton}
							>
								{t('fundTransfer.max')}
							</Button>
							</div>
						}
					/>

				</div>
				</div>


				{/* 确认按钮 */}
				<Button
				type="primary"
				size="large"
				onClick={handleConfirm}
				disabled={!transferAmount || Number(transferAmount) <= 0 || !hasEnoughBalance()}
				className={styles.confirmButton}
				block
				title={!transferAmount || Number(transferAmount) <= 0 ? t('fundTransfer.enterValidAmount') : !hasEnoughBalance() ? t('fundTransfer.insufficientBalance') : ""}
				>
				{t('fundTransfer.confirm')}
				</Button>
			</div>
		)
	}

	return (
		<Popup
			visible={visible}
			onClose={onClose}
			closeOnMaskClick
			destroyOnClose
			position="bottom"
			bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
			bodyClassName={`!h-auto !bg-[var(--background17)] !text-[var(--text-color5)]`}
		>
			<p className="flex justify-between items-center h-[50px] text-[16px] font-medium px-4 border-b border-[var(--border-color6)]">
				<span>{t('fundTransfer.title')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onClose} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default FundTransferPopup;