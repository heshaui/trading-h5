import React, { useState, useRef } from 'react';
import { Switch, Popover } from 'antd-mobile';
import type { PopoverRef } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks';
import { observer } from 'mobx-react-lite';
import { Iconify } from "@/components/icon";
import TradeRule from './trade_rule';
import FeeCoin from './fee_coin';
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';
import useAuth from '@/hooks/useAuth';
import appStore from '@/store';

const PopIndex = observer(() => {
    const { t } = useLanguage(['spot']);
    const navigate = useNavigate();
    const { isLight } = useTheme();
    const { isLoggedIn } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const { popType, setPopType } = usePopTypeContext();
    const [popverVisible, setPopverVisible] = useState(false);
    
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
    const [limitOrderConfirm, setLimitOrderConfirm] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('limitOrderConfirm') === 'true';
        }
        return false;
    });
    const [marketOrderConfirm, setMarketOrderConfirm] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('marketOrderConfirm') === 'true';
        }
        return false;
    });

    const handleLimitOrderChange = (checked: boolean) => {
        setLimitOrderConfirm(checked);
        localStorage.setItem('limitOrderConfirm', String(checked));
    }

    const handleMarketOrderChange = (checked: boolean) => {
        setMarketOrderConfirm(checked);
        localStorage.setItem('marketOrderConfirm', String(checked));
    }

    const goRule = () => {
        setPopType(PopTypeEnum.TRADE_RULE)
    }
    const goFeeCoin = () => {
        setPopType(PopTypeEnum.FEE_COIN)
    }  
    

    if (popType === PopTypeEnum.TRADE_RULE) {
        return <TradeRule />;
    }

    if (popType === PopTypeEnum.FEE_COIN) {
        return <FeeCoin />;
    }

    const PopverContent = () => {
        return (
            <div className="tip-color text-[12px] leading-[20px] w-[100px] text-justify">
                {t('spot.preferences.orderConfirmTip')}
            </div>
        )
    }

    return (
        <div ref={containerRef}>
            {
                isLoggedIn ? (
                    <>
                        <div className="px-4 pt-5 pb-[23px] border-b border-color">
                            <Popover
                                content={<PopverContent />}
                                trigger='click'
                                placement='left'
                                mode={isLight ? 'light' : 'dark'}
                                getContainer={() => containerRef.current!}
                            >
                                <button className="text-[12px] leading-[17px] flex items-center tip-color mb-[19px]">
                                    <span className="mr-1">{t('spot.preferences.orderConfirm')}</span>
                                    <Iconify icon="mingcute:warning-line" className="text-[14px]" />
                                </button>
                            </Popover>
                            <div className="flex justify-between items-center mb-[23px] text-[16px] h-[22px]">
                                <span>{t('spot.preferences.limitOrder')} </span>
                                <Switch
                                    checked={limitOrderConfirm}
                                    onChange={handleLimitOrderChange}
                                    style={{
                                        '--checked-color': 'var(--theme-color)',
                                        '--height': '16px',
                                        '--width': '28px',
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[16px] h-[22px]">
                                <span>{t('spot.preferences.marketOrder')} </span>
                                <Switch
                                    checked={marketOrderConfirm}
                                    onChange={handleMarketOrderChange}
                                    style={{
                                        '--checked-color': 'var(--theme-color)',
                                        '--height': '16px',
                                        '--width': '28px',
                                    }}
                                />
                            </div>
                        </div>
                        <div className="px-4 py-[21px]">
                            {/* <div className="flex justify-between items-center text-[16px] mb-[22px] h-[22px]">
                                {t('spot.preferences.feeCoin')} 
                                <button className="tip-color text-[14px]" onClick={goFeeCoin}>
                                    <span>{t('spot.preferences.receivedCoin')}</span>
                                    <Iconify icon="icon-park-outline:right" className="text-[24px] ml-1" />
                                </button>
                            </div> */}
                            <div className="flex justify-between items-center text-[16px] mb-[22px] h-[22px]">
                                {t('spot.preferences.tradeRule')} 
                                <button className="tip-color text-[14px]" onClick={goRule}>
                                    {currentPair?.coinSymbol}/{currentPair?.baseSymbol}
                                    <Iconify icon="icon-park-outline:right" className="text-[24px] ml-1" />
                                </button>
                            </div>
                        </div>
                    </>
                ) :
                (
                    <div className="px-4 py-[21px]">
                        <div className="flex justify-between items-center text-[16px] mb-[50px] h-[22px]">
                            {t('spot.preferences.tradeRule')} 
                            <button className="tip-color text-[14px]" onClick={goRule}>
                                {currentPair?.coinSymbol}/{currentPair?.baseSymbol}
                                <Iconify icon="icon-park-outline:right" className="text-[24px] ml-1" />
                            </button>
                        </div>
                        <button 
                            className="bg-[var(--theme-color)] h-[50px] rounded-[25px] text-[#fff] w-full flex justify-center items-center text-[16px] font-medium"
                            onClick={() => navigate('/login')}
                        >
                            {t('spot.modal.login')}
                        </button>
                    </div>
                )
            }
        </div>
    );
});

export default PopIndex; 