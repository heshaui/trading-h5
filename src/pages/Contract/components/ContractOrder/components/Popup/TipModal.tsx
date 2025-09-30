import React from 'react';
import { Iconify } from "@/components/icon/index";
import { Modal } from "antd-mobile";
import { useLanguage } from '@/hooks';

type Props = {
	title: string;
	content: string;
    open: boolean;
    onCancel: () => void;
};

const TipModal: React.FC<Props> = ({open, onCancel, title, content}) => {
	const { t } = useLanguage('contract');
	const handleCancel = () => {
		onCancel();
	};

	const handleConfirm = () => {
		onCancel();
	};
	const ModalTitle: React.FC = () => {
			return (
				<p className="bg-[var(--background17)] border-b border-b-[var(--border-color4)] font-medium text-[16px] h-[60px] flex items-center px-[16px] justify-between">
					{/* title */}
					<span>{title}</span>
					<Iconify icon="mingcute:close-line" className="text-[24px] text-[#9e9e9e]" onClick={handleCancel} />
				</p>
			)
		}
		const ModalContent: React.FC = () => {
			return (
				<div className="h-[100%] bg-[var(--background17)] px-[4px] pt-[20px] pb-[16px]">
					{/* 内容 */}
					<p className="mb-[40px] tip-color text-[16px] leading-[22px] text-justify">
						{content}
					</p>
					<button
						type="button"
						className="w-full h-[50px] text-[16px] font-medium flex items-center justify-center rounded-[40px] default_btn"
						onClick={handleConfirm}
					>
						{/* 确认 */}
						{t('reducePosition.confirm')}
					</button>
				</div>
			)
		}
		return (
			<Modal
				visible={open}
				title={ <ModalTitle /> }
				content={ <ModalContent /> }
				bodyClassName="!pt-0 !bg-[var(--background17)] !w-[91.47vw] !h-auto"
				closeOnMaskClick={true}
				onClose={onCancel}
			/>
		)
}

export default TipModal;