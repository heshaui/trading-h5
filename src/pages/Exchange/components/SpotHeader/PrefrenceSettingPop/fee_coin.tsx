import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import { useFeeDirection } from '@/hooks/useKv';

const FeeCoin = observer(() => {
    const { t } = useLanguage(['spot']);
    const [selectedCoin, setSelectedCoin] = useState('1');
    const { feeDirection } = useFeeDirection();

    useEffect(() => {
        setSelectedCoin(feeDirection.toString());
    }, [feeDirection])

    return (
        <div className="px-4 py-5">
            <div className="flex">
                <button className="flex items-center h-[20px] gap-x-[8px] mr-[100px] text-[14px]" onClick={() => setSelectedCoin('1')}>
                    <div className={`h-[16px] w-[16px] border rounded-full p-[2.5px] ${selectedCoin === '1' ? 'border-[var(--theme-color)]' : 'border-color'}`}>
                        {selectedCoin === '1' && <div className="h-full w-full rounded-full bg-[var(--theme-color)]"></div>}
                    </div>
                    <span>{t('spot.feeCoin.receivedCoin')}</span>
                </button>
                <button className="flex items-center h-[20px] gap-x-[8px] text-[14px]" onClick={() => setSelectedCoin('2')}>
                    <div className={`h-[16px] w-[16px] border rounded-full p-[2.5px] ${selectedCoin === '2' ? 'border-[var(--theme-color)]' : 'border-color'}`}>
                        {selectedCoin === '2' && <div className="h-full w-full rounded-full bg-[var(--theme-color)]"></div>}
                    </div>
                    <span> {t('spot.feeCoin.quotedCoin')}</span>
                </button>
            </div>
            <ul className={`tip-color mt-5 font-14 leading-[20px] text-justify font-w-400`}>
                <li>
                    {t('spot.feeCoin.receivedDesc')}
                </li>
                <li className={`mt-5`}>
                    {t('spot.feeCoin.quotedDesc')}</li>
            </ul>
        </div>
    );
});

export default FeeCoin; 