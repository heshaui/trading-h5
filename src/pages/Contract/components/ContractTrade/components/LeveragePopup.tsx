import React, {useState, useEffect, useMemo} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import { Modal, Button, Slider, InputNumber, message, ConfigProvider } from 'antd';
import appStore from '@/store';
import { levelEdit } from '@/services/contract';
import { useUserConfig } from "@/hooks/useUserConfig";

type Props = {
  visible: boolean;
  onClose: () => void;
  currentLeverage: number;
  onLeverageChange: (leverage: number) => void;
  symbol?: string;
  positionLimit?: number;
};

const LeveragePopup:React.FC<Props> = ({
  visible,
  onClose,
  currentLeverage,
  onLeverageChange,
  symbol = 'BTCUSDT',
  positionLimit = 0
}) => {
	const {t} = useLanguage('contract');

	const [tempLeverage, setTempLeverage] = useState(currentLeverage);
	const [lastValidLimitValue, setLastValidLimitValue] = useState<number | null>(null);
	const ContractInfo = appStore.currentContractInfo;
	console.log('ContractInfo',ContractInfo)
	const maxLeverage = ContractInfo.maxLever;

	const { loadUserConfig } = useUserConfig();
	const currentUserConfig = appStore.getUserConfig();

	useEffect(() => {
		setTempLeverage(currentLeverage);
	}, [currentLeverage])

	const handleSliderChange = (value: number) => {
		setTempLeverage(value);
	};

	const handleInputChange = (value: number | null) => {
		if (value && value >= 1 && value <= maxLeverage) {
			setTempLeverage(value);
		}
	};

	// 初始化最后有效值
	useEffect(() => {
		const initialValue = currentUserConfig.leverCeiling?.[currentLeverage];
		if (initialValue !== undefined && initialValue !== null && lastValidLimitValue === null) {
			setLastValidLimitValue(initialValue);
		}
	}, [currentUserConfig.leverCeiling, currentLeverage, lastValidLimitValue]);

	// 获取要显示的持仓上限值
	const getDisplayLimitValue = () => {
		const currentValue = currentUserConfig.leverCeiling?.[tempLeverage];
		if (currentValue !== undefined && currentValue !== null) {
			// 如果当前杠杆有对应值，更新最后有效值并返回当前值
			if (lastValidLimitValue !== currentValue) {
				setLastValidLimitValue(currentValue);
			}
			return currentValue;
		} else {
			// 如果当前杠杆没有值，返回最后有效值
			return lastValidLimitValue !== null ? lastValidLimitValue : (currentUserConfig.leverCeiling?.[currentLeverage] ?? '');
		}
	};

	const handleConfirm = async () => {
		try {
			const res = await levelEdit({
				contractId: ContractInfo.id,
				nowLevel: tempLeverage,
			});

			if (res.code === '0') {
				message.success(t('leverageModal.settingSuccess'));

				// 立即更新 store 中的 userConfig.nowLevel，确保 UI 立即响应
			
				appStore.setUserConfig({
					...currentUserConfig,
					nowLevel: tempLeverage
				});

				// 先通知父组件杠杆值变化
				onLeverageChange(tempLeverage);
				// 最后关闭模态框
				onClose();
				// 异步重新获取用户配置，确保数据同步
				await loadUserConfig();

				
			} else {
				message.error(res.message || t('leverageModal.settingFailed'));
			}
		} catch (error) {
			console.error('杠杆设置失败:', error);
			message.error(t('leverageModal.settingFailedRetry'));
		}
	};


	// 创建slider的marks
	const marks = {
		1: '1x',
		25: '25x',
		50: '50x',
		75: '75x',
		100: '100x',
		125: '125x'
	};

	const PopupContent = () => {
		return (
			<ConfigProvider
				theme={{
					components: {
						Slider: {
							controlSize: 18,
							dotActiveBorderColor: "var(--background17)",
							dotBorderColor: "var(--background17)",
							dotSize: 18,
							handleActiveColor: "none",
							handleActiveOutlineColor: "none",
							handleColor: "var(--background17)",
							handleLineWidthHover: 2,
							handleSize: 16,
							handleSizeHover: 16,
							railBg: "var(--background16)", // 滑块轨道背景色
							railHoverBg: "var(--background16)", // 滑块轨道悬浮背景色
							trackBg: "var(--theme-color)",
							trackBgDisabled: "var(--background16)",
							trackHoverBg: "var(--theme-color)"
						},
					},
				}}
			>
				<div className="px-4 pt-[28px] pb-[20px]">
					{/* 当前持仓支持杠杆范围 */}
					<div className="leading-[20px] text-[14px] tip-color mb-[12px]">
						{t('leverageModal.supportRange', { min: 1, max: maxLeverage })}
					</div>

					{/* 杠杆输入区域 */}
					{/* <div className={styles.leverageInputSection}>
						<InputNumber
							value={tempLeverage}
							onChange={handleInputChange}
							min={1}
							max={maxLeverage}
							className="spot-number-inpit"
							controls={false}
						/>
					</div> */}
					<div className="custom-input-number mb-[24px]">
						<InputNumber
							className={`spot_number_input`}
							style={{
								width: "100%",
								boxSizing: "border-box",
							}}
							min={1}
							max={100}
							value={tempLeverage} 
							onChange={handleInputChange}
							suffix='x'
							controls={false}
						/>
						<div className="controls">
							<button type="button" className="border-bottom" onClick={() => setTempLeverage(prev => Number(prev)+1)}>
								<Iconify
									icon="mdi:chevron-up"
									size={20}
									className={`text-[var(--text-color5)] hover:text-[var(--theme-color)]`}
								/>
							</button>
							<button type="button" onClick={() => setTempLeverage(prev => Number(prev)-1)}>
								<Iconify
									icon="mdi:chevron-down"
									size={20}
									className={`text-[var(--text-color5)] hover:text-[var(--theme-color)]`}
								/>
							</button>
						</div>
					</div>

					{/* 杠杆滑块 */}
					<div className="h-[36px]">
						<Slider
							min={1}
							max={maxLeverage}
							marks={marks}
							step={1}
							value={tempLeverage}
							onChange={handleSliderChange}
							className="spotSlider"
							tooltip={{ open: false }}
						/>
					</div>

					{/* 风险提示 */}
					<div className="text-[14px] leading-[20px] text-[#ff8a26] mb-[20px] mt-[16px]">
						{t('leverageModal.riskWarning')}
					</div>

					{/* 持仓上限 */}
					<div className="w-full h-[50px] border input-border flex justify-between rounded-[8px] items-center px-[10px] text-[14px]">
						<span className="text-[#9e9e9e]">{t('leverageModal.positionLimit')}</span>
						<span className="text-[var(--text-color5)]">{getDisplayLimitValue()}USDT</span>
					</div>

					{/* 确认按钮 */}
					<button
						type="button"
						className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mt-[40px] rounded-[25px]
							bg-[var(--theme-color)] text-[var(--text-color5)]
						`}
						onClick={handleConfirm}
					>
						{t('leverageModal.confirm')}
					</button>
				</div>
			</ConfigProvider>
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
				<span>{symbol} {t('leverageModal.contractLeverage')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onClose} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default LeveragePopup;