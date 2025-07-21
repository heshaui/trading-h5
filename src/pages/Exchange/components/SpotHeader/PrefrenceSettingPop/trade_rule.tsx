import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';

// 根据精度值生成对应的最小小数值
const getMinimumDecimal = (scale: number | undefined): string => {
  if (!scale || scale <= 0) return '1';
  
  // 生成对应精度的小数，例如：scale为4时返回0.0001
  return `0.${'0'.repeat(scale-1)}1`;
};

const TradeRule = observer(() => {
    const { t } = useLanguage(['spot']);
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];

    return (
        <ul className="px-4 py-5 text-[16px] font-medium">
            <li className='flex-x align-center justify-between'>
                {t('spot.tradeRule.maxOrderAmount')}
                <span className={`tip-color font-w-400 font-14`}>
                    {currentPair?.maxBaseVolume}{currentPair?.baseSymbol}
                </span>
            </li>
            <li className='flex-x align-center justify-between mt-5'>
                {t('spot.tradeRule.minOrderAmount')}
                <span className={`tip-color font-w-400  mx-1 font-14`}>
                    {currentPair?.minBaseVolume}{currentPair?.baseSymbol}
                </span>
            </li>
            <li className='flex-x align-center justify-between mt-5'>
                {t('spot.tradeRule.maxOrderQuantity')}
                <span className={`tip-color  font-w-400  mx-1 font-14`}>
                    {currentPair?.maxVolume}{currentPair?.coinSymbol}
                </span>
            </li>
            <li className='flex-x align-center justify-between mt-5'>
                {t('spot.tradeRule.minOrderQuantity')}
                <span className={`tip-color  font-w-400  mx-1 font-14`}>
                    {currentPair?.minVolume}{currentPair?.coinSymbol}
                </span>
            </li>

            <li className='flex-x align-center justify-between mt-5'>
                {t('spot.tradeRule.minPriceFluctuation')}
                <span className={`tip-color font-w-400  mx-1 font-14`}>
                    {getMinimumDecimal(currentPair?.coinScale)}{currentPair?.coinSymbol}
                </span>
            </li>
            <li className='flex-x align-center justify-between mt-5'>
                {t('spot.tradeRule.minQuantityFluctuation')}
                <span className={`tip-color font-w-400  mx-1 font-14`}>
                    {currentPair?.baseCoinScale}{currentPair?.baseSymbol}
                </span>
            </li> 
        </ul>
    );
});

export default TradeRule; 