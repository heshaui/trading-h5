import React, { useState } from 'react';
import { List, Switch, Stepper, Radio } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import { Iconify } from "@/components/icon";
import TradeRule from './trade_rule';
import FeeCoin from './fee_coin';
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';
import styles from './styles/pop_index.module.scss';

const PopIndex = observer(() => {
    const { t } = useLanguage(['spot']);
    const { popType, setPopType } = usePopTypeContext();
    const [autoCancel, setAutoCancel] = useState(false);
    const [autoCancelTime, setAutoCancelTime] = useState(1);
    const [priceType, setPriceType] = useState('limit');

    const handleAutoCancelChange = (checked: boolean) => {
        setAutoCancel(checked);
    };

    const handleAutoCancelTimeChange = (value: number) => {
        setAutoCancelTime(value);
    };

    const handlePriceTypeChange = (value: string) => {
        setPriceType(value);
    };

    if (popType === PopTypeEnum.TRADE_RULE) {
        return <TradeRule />;
    }

    if (popType === PopTypeEnum.FEE_COIN) {
        return <FeeCoin />;
    }

    return (
        <List className={styles.settingList}>
            {/* 交易规则 */}
            <List.Item
                onClick={() => setPopType(PopTypeEnum.TRADE_RULE)}
                arrow
                extra={<Iconify icon="eva:arrow-ios-forward-outline" size={20} />}
            >
                {t('spot.header.tradeRule')}
            </List.Item>

            {/* 手续费币种 */}
            <List.Item
                onClick={() => setPopType(PopTypeEnum.FEE_COIN)}
                arrow
                extra={<Iconify icon="eva:arrow-ios-forward-outline" size={20} />}
            >
                {t('spot.header.feeCoin')}
            </List.Item>

            {/* 自动撤单 */}
            <List.Item
                extra={
                    <Switch
                        checked={autoCancel}
                        onChange={handleAutoCancelChange}
                    />
                }
            >
                {t('spot.header.autoCancel')}
            </List.Item>

            {/* 自动撤单时间 */}
            {autoCancel && (
                <List.Item
                    extra={
                        <Stepper
                            value={autoCancelTime}
                            onChange={handleAutoCancelTimeChange}
                            min={1}
                            max={60}
                        />
                    }
                >
                    {t('spot.header.autoCancelTime')}
                </List.Item>
            )}

            {/* 价格类型 */}
            <List.Item>
                <div className={styles.priceTypeContainer}>
                    <div className={styles.priceTypeTitle}>{t('spot.header.priceType')}</div>
                    <Radio.Group
                        value={priceType}
                        onChange={val => handlePriceTypeChange(val as string)}
                    >
                        <div className={styles.radioGroup}>
                            <Radio value="limit">{t('spot.header.limitPrice')}</Radio>
                            <Radio value="market">{t('spot.header.marketPrice')}</Radio>
                        </div>
                    </Radio.Group>
                </div>
            </List.Item>
        </List>
    );
});

export default PopIndex; 