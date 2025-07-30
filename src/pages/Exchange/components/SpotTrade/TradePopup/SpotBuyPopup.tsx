import React, {useState, useEffect} from 'react';
import { Popup } from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import { useNavigate } from 'react-router-dom';

type Props = {
  open: boolean;
  onOk?: () => void;
  onCancel: () => void;
};

const SpotBuyPopup: React.FC<Props> = ({open, onOk, onCancel}) => {
	const {t} = useLanguage('spot');
	const navigate = useNavigate();
	return (
		<Popup
			visible={open}
			onClose={onCancel}
			closeOnMaskClick
			destroyOnClose
			position="bottom"
			bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
			bodyClassName={`!h-auto !bg-[var(--background5)] !text-[var(--text-color5)]`}
		>
			<p className="flex justify-between items-center h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
				<span>{t('spot.placeOrderModal.title')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
			</p>
			<div className="p-4">
				<p className={`font-14 font-w-400 tip-color mb-3`}>{t('spot.placeOrderModal.tip')}</p>
				<button className={`border border-color rounded-lg px-[10px] py-4 w-full flex-x align-center`} onClick={()=>{
						navigate('/assets/toUp')
				}}>
					<Iconify icon="mingcute:tether-usdt-fill" className="text-[48px] theme_color"/>
					<div className="flex-y align-start ml-2_5">
						<p className={`font-16 font-w-500`}>{t('spot.placeOrderModal.depositUsdt')}</p>
						<p className={`font-14 font-w-400 tip-color`}>{t('spot.placeOrderModal.depositDesc')}</p>
					</div>
				</button>
			</div>
		</Popup>
	)
}


export default SpotBuyPopup;