import React, {useState} from 'react';
import { useLanguage } from '@/hooks';
import TradePopup from './TradePopup';

const SpotTrade: React.FC = () => {
	const {t} = useLanguage('spot');
	const [visible, setVisible] = useState(false);
	const [tradeType, setTradeType] = useState('buy');
	const handleClick = (type: string) => {
		setVisible(true);
		setTradeType(type);
	}

	return (
		<div className="h-[76px] w-full bg-[var(--background9)] p-4 flex gap-x-[11px] justify-between fixed bottom-0 z-10">
			<button 
				type="button" 
				className="h-full bg-[#00c788] flex-1 rounded-[40px] flex justify-center items-center text-[14px] text-[#fff]"
				onClick={() => handleClick('buy')}
			>
				{t("spot.trade.buy")}
			</button>
			<button 
				type="button" 
				className="h-full bg-[#ff4d4f] flex-1 rounded-[40px] flex justify-center items-center text-[14px] text-[#fff]"
				onClick={() => handleClick('sell')}
			>
				{t("spot.trade.sell")}
			</button>
			<TradePopup 
				open={visible}
				tradeType={tradeType}
				onOk={() => setVisible(false)}
				onCancel={() => setVisible(false)}
			/>
		</div>
	)
}

export default SpotTrade;