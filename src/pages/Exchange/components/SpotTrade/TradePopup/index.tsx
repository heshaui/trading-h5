import React, {useState, useEffect} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import { PopTypeProvider, usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';

import TradeContent from './TradeContent';

type Props = {
  open: boolean;
  tradeType: string;
  onOk: () => void;
  onCancel: () => void;
};

const TradePopupContent: React.FC<Props> = ({open, tradeType, onOk, onCancel}) => {
	const {t} = useLanguage('spot');
	const { popType } = usePopTypeContext();
	return (
		<Popup
			visible={open}
			onClose={onCancel}
			closeOnMaskClick
			position="bottom"
			bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
			bodyClassName={`${popType === PopTypeEnum.INDEX ? '!h-[628px]' : '!h-auto'} !bg-[var(--background5)] !text-[var(--text-color5)]`}
		>
			<p className="flex justify-between items-center h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
				<span>{t('spot.preferences.orderConfirm')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
			</p>
			<TradeContent segmentedType={tradeType} onCancel={onCancel} onOk={onOk} />
		</Popup>
	)
}

const TradePopup: React.FC<Props> = ({open, tradeType, onOk, onCancel}) => {
	return (
		<PopTypeProvider>
			<TradePopupContent open={open} onCancel={onCancel} tradeType={tradeType} onOk={onOk} />
		</PopTypeProvider>
	);
}

export default TradePopup;