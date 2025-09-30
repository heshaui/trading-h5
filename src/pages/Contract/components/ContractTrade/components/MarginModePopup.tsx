import React, {useState, useEffect, useMemo} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import { Modal, Button, message, Segmented, ConfigProvider } from 'antd';
import { marginModelEdit } from '@/services/contract';
import appStore from '@/store';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentMode: 1 | 2;
  onModeChange: (mode: 1 | 2) => void;
  symbol?: string;
};

const MarginModePopup:React.FC<Props> = ({
  visible,
  onClose,
  currentMode,
  onModeChange,
  symbol = 'BTCUSDT'
}) => {
	const {t} = useLanguage('contract');
	const [selectedMode, setSelectedMode] = React.useState<1 | 2>(1); // 默认选择逐仓
	const { currentContractInfo } = appStore;
	const handleConfirm = async () => {
		const res = await marginModelEdit({
			marginModel: selectedMode,
			contractId: currentContractInfo.id,
		});
		if (res.code === '0') {
			onModeChange(selectedMode);
			onClose();
			message.success(t('marginMode.settingSuccess'));
		} else {
			message.error(res.msg);
		}
	};

	const PopupContent = () => {
		return (
			<ConfigProvider
				theme={{
					components: {
						Segmented: {
							itemSelectedBg: "var(--theme-color)",
							itemHoverBg: "transparent",
							itemActiveBg: "transparent",
							itemColor: "var(--text-color6)",
							itemSelectedColor: "#fff",
							trackPadding: 3,
							borderRadius: 50,
							borderRadiusSM: 50,
							trackBg: "transparent"
						}
					},
				}}
			>
				<div className="px-4 pt-[28px] pb-[20px]">
					<Segmented
						shape="round"
						className="h-[50px] mb-[20px]  w-[100%] border border-[var(--theme-color)] bg-[transparent]"
						options={[
							{
								label: (
								<div className={`h-[44px] flex items-center justify-center ${selectedMode === 1 ? 'font-medium' : ''}`}>
									{t("crossMargin")}
								</div>
								),
								value: 1,
							},
							{
								label: (
								<div className={`h-[44px] flex items-center justify-center ${selectedMode === 2 ? 'font-medium' : ''}`}>
									{t("isolatedMargin")}
								</div>
								),
								value: 2,
							},
						]}
						value={selectedMode}
						block
						onChange={(value) => {
							setSelectedMode(value as 1 | 2)
						}}
					/>
					<div className="text-[16px] text-justify leading-[23px] tip-color h-[95px] mb-[42px]">
						{selectedMode === 2 ? t('marginMode.isolatedDescription') : t('marginMode.crossDescription')}
					</div>
					<button
						type="button"
						className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium rounded-[25px]
							bg-[var(--theme-color)] text-[var(--text-color5)]
						`}
						onClick={handleConfirm}
					>
						{t('marginMode.setTo', { mode: selectedMode === 1 ? t('crossMargin') : t('isolatedMargin') })}
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
				<span>{symbol}{t('marginMode.title')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onClose} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default MarginModePopup;