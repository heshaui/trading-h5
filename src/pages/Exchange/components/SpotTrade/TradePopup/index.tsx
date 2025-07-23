import React, {useState, useEffect} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';

type Props = {
  open: boolean;
  onOk: (bool: boolean) => void;
  onCancel: () => void;
};

const TradePopup: React.FC<Props> = ({open, onOk, onCancel}) => {
	const {t} = useLanguage('spot');
	return (
		<Popup
			visible={open}
			onClose={onCancel}
			closeOnMaskClick
			position="bottom"
			bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
			bodyClassName="!h-[433px] !bg-[var(--background5)] !text-[var(--text-color5)]"
		>
			<p className="flex justify-between items-center h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
				<span>{t('spot.preferences.orderConfirm')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
			</p>
			<div>
				
			</div>
		</Popup>
	)
}

export default TradePopup;