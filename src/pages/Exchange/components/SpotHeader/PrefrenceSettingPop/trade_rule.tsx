import React from 'react';
import { List } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import styles from './styles/trade_rule.module.scss';

const TradeRule = observer(() => {
    const { t } = useLanguage(['spot']);

    return (
        <div className={`${styles.content} flex-1 overflow-y-auto`}>
            <List className={styles.ruleList}>
                <List.Item>
                    <div className={styles.ruleItem}>
                        <div className={styles.ruleTitle}>{t('spot.header.minAmount')}</div>
                        <div className={styles.ruleValue}>0.0001 BTC</div>
                    </div>
                </List.Item>
                <List.Item>
                    <div className={styles.ruleItem}>
                        <div className={styles.ruleTitle}>{t('spot.header.maxAmount')}</div>
                        <div className={styles.ruleValue}>1000 BTC</div>
                    </div>
                </List.Item>
                <List.Item>
                    <div className={styles.ruleItem}>
                        <div className={styles.ruleTitle}>{t('spot.header.minPrice')}</div>
                        <div className={styles.ruleValue}>0.01 USDT</div>
                    </div>
                </List.Item>
                <List.Item>
                    <div className={styles.ruleItem}>
                        <div className={styles.ruleTitle}>{t('spot.header.maxPrice')}</div>
                        <div className={styles.ruleValue}>100000 USDT</div>
                    </div>
                </List.Item>
                <List.Item>
                    <div className={styles.ruleItem}>
                        <div className={styles.ruleTitle}>{t('spot.header.priceDecimal')}</div>
                        <div className={styles.ruleValue}>2</div>
                    </div>
                </List.Item>
                <List.Item>
                    <div className={styles.ruleItem}>
                        <div className={styles.ruleTitle}>{t('spot.header.amountDecimal')}</div>
                        <div className={styles.ruleValue}>4</div>
                    </div>
                </List.Item>
            </List>
        </div>
    );
});

export default TradeRule; 