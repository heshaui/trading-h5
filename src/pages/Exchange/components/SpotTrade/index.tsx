import React from 'react';
import { useLanguage } from '@/hooks';

const SpotTrade: React.FC = () => {
	const {t} = useLanguage('spot');
	return (
		<div className="h-[76px] w-full bg-[var(--background9)] p-4 flex gap-x-[11px] justify-between fixed bottom-0">
			<button type="button" className="h-full bg-[#00c788] flex-1 rounded-[40px] flex justify-center items-center text-[14px] text-[#fff]">
				{t("spot.trade.buy")}
			</button>
			<button type="button" className="h-full bg-[#ff4d4f] flex-1 rounded-[40px] flex justify-center items-center text-[14px] text-[#fff]">
				{t("spot.trade.sell")}
			</button>
		</div>
	)
}

export default SpotTrade;