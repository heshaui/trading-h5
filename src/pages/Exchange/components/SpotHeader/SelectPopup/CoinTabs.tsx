import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';

interface Props {
	activeKey: string;
	onChange: (key: string) => void;
}
const CoinTabs: React.FC<Props> = ({activeKey, onChange}) => {
	const { t } = useLanguage(['spot']);
	const scrollRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [showLeft, setShowLeft] = useState(false);
	const [showRight, setShowRight] = useState(false);

	// 标签页配置
    const tabItems = [
        { key: '1', title: t('spot.header.mainArea') },
        { key: '2', title: t('spot.header.innovationArea') },
        { key: '3', title: t('spot.header.newCoinArea') },
        { key: '4', title: 'AI' },
        { key: '5', title: 'Meme' },
        { key: '6', title: 'NFT' },
        { key: '7', title: 'DeFi' },
        { key: '8', title: 'Web3' },
        { key: '9', title: 'Payments' },
        { key: '10', title: 'Launchpad' },
        { key: '11', title: 'Layer2' },
        { key: '12', title: 'Solana' },
        { key: '13', title: 'RWA' },
        { key: '14', title: 'Launchpool' },
        { key: '15', title: t('spot.header.gameMetaverse') },
        { key: '16', title: t('spot.header.storage') },
    ];

	const updateArrow = () => {
		const container = scrollRef.current;
		if (!container) return;

		const { scrollLeft, scrollWidth, clientWidth } = container;
		setShowLeft(scrollLeft > 0);
		setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
	};

	const scrollTabs = (dir: 'left' | 'right') => {
		const container = scrollRef.current;
		if (!container) return;
		container.scrollBy({ left: dir === 'left' ? -100 : 100, behavior: 'smooth' });
		setTimeout(updateArrow, 300);
	};

	const handleTabClick = (key: string, index: number) => {
		onChange(key);
		const container = scrollRef.current;
		const tab = tabRefs.current[index];
		if (container && tab) {
			tab.scrollIntoView({ behavior: 'smooth', inline: 'center' });
		}
	};

	useEffect(() => {
		updateArrow();
		const container = scrollRef.current;
		if (container) {
			container.addEventListener('scroll', updateArrow);
			return () => container.removeEventListener('scroll', updateArrow);
		}
	}, []);

	return (
		<div className="flex px-[16px] py-[16px] items-center">
			{/* { key: 'all', title: t('spot.header.all') }, */}
			<button
				type="button"
				className={`text-[12px] h-[20px] shrink-0 rounded-[4px] py-0 px-[6px] mr-[8px] ${activeKey === 'all' ? 'font-medium bg-[var(--background19)] text-[var(--text-color5)]' : 'text-[var(--text-color6)]'}`} 
				onClick={() => onChange('all')}
			>{t('spot.header.all')}</button>

			{showLeft && <button type="button" className="mr-[12px] shrink-0" onClick={() => scrollTabs('left')}>
				<Iconify icon="icon-park-outline:left" className="text-[16px]" />
			</button>}

			<div
				className="flex-1 hideScrollBar scrollX h-[20px] whitespace-nowrap min-w-0 flex items-center"
				ref={scrollRef}
			>
				<div className="inline-flex">
				{tabItems.map((tab, index) => (
					<div
						key={tab.key}
						ref={(el) => (tabRefs.current[index] = el)}
						onClick={() => handleTabClick(tab.key, index)}
						className={`text-[12px] h-[20px] rounded-[4px] py-0 px-[6px] mr-[35px] last:mr-0 ${
							activeKey === tab.key ? 'font-medium bg-[var(--background19)] text-[var(--text-color5)]' : 'text-[var(--text-color6)]'
						}`}
					>
						{tab.title}
					</div>
				))}
				</div>
			</div>

			{showRight && <button type="button" className="ml-[12px] shrink-0" onClick={() => scrollTabs('right')}>
				<Iconify icon="icon-park-outline:right" className="text-[16px]" />
			</button>}
		</div>
	)
}

export default CoinTabs;