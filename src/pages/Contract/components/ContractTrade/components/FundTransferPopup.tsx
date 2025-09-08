import React, {useState, useEffect, useMemo} from 'react';
import {Popup} from 'antd-mobile';
import { Modal, ConfigProvider, Input, Button, Select, Image } from 'antd';

import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import appStore from "@/store";
import styles from './styles.module.css';
const { Option } = Select;
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


	// 币种选项
	// const coinOptions = [
	//   { value: 'USDT', label: 'USDT', subLabel: 'tetherUSD' },
	//   { value: 'BTC', label: 'BTC', subLabel: 'Bitcoin' },
	//   { value: 'ETH', label: 'ETH', subLabel: 'Ethereum' }
	// ];
	const coinOptions = coinList.map(coin => ({
		id: coin.id,
		value: coin.coinName,
		label: coin.coinName,
		icon: coin.iconUrl,
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
			<div className={styles.modalContent}>
				{/* 账户选择区域 */}
				<div className={styles.accountSection}>
				<div className={styles.accountItem}>
					<label className={styles.accountLabel}>{t('fundTransfer.from')}</label>
					<Select
					value={fromAccount}
					onChange={(value) => {
						setFromAccount(value);
						setToAccount(value === 'spot' ? 'contract' : 'spot');
						// 清空转账数量，因为切换账户后余额可能不同
						setTransferAmount('');
						// 强制刷新余额显示
						setRefreshKey(prev => prev + 1);
					}}
					className={styles.accountSelect}
					size="large"
					suffixIcon={<Iconify icon="mdi:chevron-down" />}
					>
					<Option value="spot">{t('fundTransfer.spotAccount')}</Option>
					<Option value="contract">{t('fundTransfer.contractAccount')}</Option>
					</Select>
				</div>


				<div className={styles.swapButtonWrapper}>
					<Button
					type="text"
					icon={<Iconify icon="mdi:swap-horizontal" />}
					onClick={handleAccountSwitch}
					className={styles.swapButton}
					/>
				</div>

				<div className={styles.accountItem}>
					<label className={styles.accountLabel}>{t('fundTransfer.to')}</label>
					<Select
					value={toAccount}
					onChange={(value) => {
						setToAccount(value);
						setFromAccount(value === 'spot' ? 'contract' : 'spot');
						// 强制刷新余额显示
						setRefreshKey(prev => prev + 1);
					}}
					className={styles.accountSelect}
					size="large"
					suffixIcon={<Iconify icon="mdi:chevron-down" />}
					>
					<Option value="spot">{t('fundTransfer.spotAccount')}</Option>
					<Option value="contract">{t('fundTransfer.contractAccount')}</Option>
					</Select>
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
				<Select
					value={selectedCoin}
					onChange={(value) => {
					setSelectedCoin(value);
					// 清空转账数量，因为切换币种后余额可能不同
					setTransferAmount('');
					// 强制刷新余额显示
					setRefreshKey(prev => prev + 1);
					}}
					className={styles.coinSelect}
					size="large"
					suffixIcon={<Iconify icon="mdi:chevron-down" />}
				>
					{coinOptions.map(coin => (
					<Option key={coin.value} value={coin.value}>
						<div className={styles.coinOption}>
						<div className={styles.coinIcon}>
							<Image src={coin.icon} alt={coin.label} width={20} height={20} preview={false} />
						</div>
						<div className={styles.coinInfo}>
							<span className={styles.coinSymbol}>{coin.label}</span>                    </div>
						</div>
					</Option>
					))}
				</Select>
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