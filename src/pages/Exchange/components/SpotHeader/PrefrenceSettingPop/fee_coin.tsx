import React, { useState } from 'react';
import { List, Radio } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import styles from './styles/fee_coin.module.scss';

const FeeCoin = observer(() => {
    const { t } = useLanguage(['spot']);
    const [selectedCoin, setSelectedCoin] = useState('BTC');

    const handleCoinChange = (value: string) => {
        setSelectedCoin(value);
    };

    const coins = [
        { value: 'BTC', label: 'BTC', discount: '20%' },
        { value: 'ETH', label: 'ETH', discount: '15%' },
        { value: 'BNB', label: 'BNB', discount: '25%' },
    ];

    return (
        <div className={`${styles.content} flex-1 overflow-y-auto`}>
            <Radio.Group
                value={selectedCoin}
                onChange={val => handleCoinChange(val as string)}
            >
                <List className={styles.coinList}>
                    {coins.map(coin => (
                        <List.Item
                            key={coin.value}
                            prefix={
                                <Radio
                                    value={coin.value}
                                    icon={checked => (
                                        <div className={checked ? styles.radioChecked : styles.radioUnchecked} />
                                    )}
                                />
                            }
                            extra={
                                <div className={styles.discount}>
                                    {t('spot.header.discount')}: {coin.discount}
                                </div>
                            }
                        >
                            <div className={styles.coinInfo}>
                                <span className={styles.coinName}>{coin.label}</span>
                            </div>
                        </List.Item>
                    ))}
                </List>
            </Radio.Group>
        </div>
    );
});

export default FeeCoin; 