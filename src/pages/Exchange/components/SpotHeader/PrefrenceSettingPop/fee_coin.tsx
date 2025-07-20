import React, { useState } from 'react';
import { Radio } from "antd";
import { useLanguage } from '@/hooks/useLanguage';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import { observer } from 'mobx-react-lite';
import { useFeeDirection } from '@/hooks/useKv';

const FeeCoin = observer(() => {
    const { t } = useLanguage(['spot']);
    const [selectedCoin, setSelectedCoin] = useState('');
    const { feeDirection } = useFeeDirection();
    const handleCoinChange = (value: string) => {
        setSelectedCoin(value);
    };

    const options: CheckboxGroupProps<string>['options'] = [
        {
            label:
                <div className={`font-[14px] ml-2`}>
                    {t('spot.feeCoin.receivedCoin')}
                </div>,
            value: '1'
        },
        {
            label:
                <div className={`font-[14px] ml-2`}>
                    {t('spot.feeCoin.quotedCoin')}
                </div>,
            value: '2'
        },
    ];

    return (
        <div className="px-4 py-5">
            <Radio.Group block options={options} defaultValue={feeDirection.toString()} />
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