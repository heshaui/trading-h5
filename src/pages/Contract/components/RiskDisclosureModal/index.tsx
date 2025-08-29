import React, { useState, useEffect, useRef } from 'react';
import { Iconify } from "@/components/icon/index";
import { Modal } from "antd-mobile";
import { useLanguage } from '@/hooks';

type Props = {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

const RiskDisclosureModal: React.FC<Props> = ({open, onConfirm, onCancel}) => {
	const { t } = useLanguage('contract');
	const handleCancel = () => {
		onCancel();
	};

	const handleConfirm = () => {
		onConfirm();
	};
	const ModalTitle: React.FC = () => {
			return (
				<p className="bg-[var(--background12)] border-b border-b-[var(--border-color4)] font-medium text-[16px] h-[60px] flex items-center px-[16px] justify-between">
					{/* 合约交易风险确认书 */}
					<span>{t("riskDisclosure.title")}</span>
					<Iconify icon="mingcute:close-line" className="text-[24px] text-[#9e9e9e]" onClick={handleCancel} />
				</p>
			)
		}
		const ModalContent: React.FC = () => {
			return (
				<div className="h-[100%] bg-[var(--background12)] px-[4px] pt-[8px] pb-[4px]">
					{/* 风险披露内容 */}
					<div className="h-[calc(100%-64px)] overflow-y-auto mb-[20px] border input-border rounded-[8px] p-[12px] tip-color text-[12px]">
						<p className="mb-[20px] text-justify leading-[17px]">{t("riskDisclosure.content.paragraph1")}</p>
						<p className="mb-[20px] text-justify leading-[17px]">{t("riskDisclosure.content.paragraph2")}</p>
						<p className="mb-[20px] text-justify leading-[17px]">{t("riskDisclosure.content.paragraph3")}</p>
						<p className="mb-[20px] text-justify leading-[17px]">{t("riskDisclosure.content.paragraph4")}</p>
						<p className="mb-[20px] text-justify leading-[17px]">{t("riskDisclosure.content.paragraph5")}</p>
						<p className="mb-[20px] text-justify leading-[17px]">{t("riskDisclosure.content.paragraph6")}</p>
						<p className="text-justify leading-[17px]">{t("riskDisclosure.content.paragraph7")}</p>
					</div>
					<div className="text-[14px] font-medium flex justify-between">
						<button
							type="button"
							className="shrink-0 min-w-[80px] h-[44px] flex items-center justify-center rounded-[40px] cancel_btn2 mr-[10px]"
							onClick={handleCancel}
						>
							{/* 取消 */}
							{t('riskDisclosure.cancel')}
						</button>
						<button
							type="submit"
							className="flex-1 h-[44px] flex items-center justify-center rounded-[40px] default_btn"
							onClick={handleConfirm}
						>
							{/* 确认 */}
							{t('riskDisclosure.confirm')}
						</button>
					</div>
				</div>
			)
		}
		return (
			<Modal
				visible={open}
				title={ <ModalTitle /> }
				content={ <ModalContent /> }
				bodyClassName="!pt-0 !bg-[var(--background12)] !w-[91.47vw] !h-[50vh]"
				closeOnMaskClick={true}
				onClose={onCancel}
			/>
		)
}

export default RiskDisclosureModal;