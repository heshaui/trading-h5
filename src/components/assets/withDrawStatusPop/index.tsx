import React, { useState, useMemo } from 'react';
import { Popup, Toast } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import styles from './accountPop.module.scss';
import { CloseOutline } from 'antd-mobile-icons';
import appStore from '@/store';
import { useThemeMode } from '@/hooks/useThemeMode';
import { ReactComponent as IdCard } from '@/assets/icons/assets/icon_IDcard.svg';
import { ReactComponent as TwoFA } from '@/assets/icons/assets/icon_2FA.svg';
import { Iconify } from '@/components/icon';
import { useNavigate } from 'react-router-dom';

type Props = {
    open?: boolean;
    onClose?: () => void;
    type?: 'withdraw' | 'recharge';
}


const WithdrawStatusPop: React.FC<Props> = ({ open = false, onClose, type = 'withdraw' }) => {
    const { t } = useLanguage('assets');
    const userInfo = appStore.getUserInfo();
    const navigate = useNavigate();
    return (
        <Popup
            visible={open}
            onClose={() => {
                onClose?.();
            }}
            // destroyOnClose
            closeOnMaskClick
            bodyStyle={{ minHeight: '45vh' }}
            bodyClassName={styles.popContainer2}
        >
            <div className={`${styles.title_color} flex-y justify-between h-full `}>
                <div className={`${styles.pop_header} flex-x algin-center justify-between`}>
                    <span className={`${styles.title_color} flex-1`}>{t('withdrawMoney.tipText2')}</span>
                    <button onClick={() => {
                        onClose?.();
                    }}
                        className={styles.title_color}
                    >
                        <CloseOutline fontSize={20} />
                    </button>
                </div>
                {type === 'withdraw' ? <div className={`${styles.pop_content} flex-1 px-4 mt-4`}>
                    <div className={`${styles.pop_content_header} flex-y`}>
                        <span className={`${styles.tip_color} font-12 font-w-400`}>{t('withdrawMoney.tipText3')}</span>
                    </div>
                    <ul className={`${styles.pop_content_body} flex-y `}>
                        {userInfo?.unverifiedWithdrawalStatus == 1 ? null : <>{(userInfo?.verifiedWithdrawalStatus === 1 && userInfo?.realnessStatus !== 1) ? <li className='flex-x-cc mt-5'>
                            <IdCard className="w-[20px] h-[20px] title-color mr-2_5" />
                            <div className={`${styles.titlw_color} font-16 font-w-500 flex-x algin-center flex-1`}>
                                <span className={`${styles.status_title} flex-x algin-center justify-start`}>{t('assetsAccount.button.withdrawtip2')}</span>
                                <Iconify icon="clarity:error-standard-solid" size={22} className={` ${styles.error_color}`} />
                            </div>
                            <button className={`${styles.btn_style2} default_btn`}
                                onClick={() => {
                                    navigate('/userCenter/identity')
                                }}>
                                {t('assetsAccount.button.toAuthentication')}
                            </button>

                        </li> :
                            (userInfo?.verifiedWithdrawalStatus === 1 && userInfo?.realnessStatus === 1) ? <li className='flex-x-cc mt-5'>
                                <IdCard className="w-[20px] h-[20px] title-color mr-2_5" />
                                <div className={`${styles.titlw_color} font-16 font-w-500 flex-x algin-center flex-1`}>
                                    <span className={`${styles.status_title} flex-x algin-center justify-start`}>
                                        {t('assetsAccount.button.withdrawtip3')}</span>
                                    <Iconify icon="mdi:success-circle" size={22} className={` ${styles.success_color}`} />
                                </div>

                            </li> : null}</>}
                        {userInfo?.isGoogleAuth === 1 ? <li className='flex-x-cc mt-5'>
                            <TwoFA className="w-[20px] h-[20px] title-color mr-2_5" />
                            <div className={`${styles.titlw_color} font-16 font-w-500 flex-x algin-center flex-1`}>
                                <span className={`${styles.status_title} flex-x algin-center justify-start`}>{t('assetsAccount.button.withdrawtip5')}</span>

                                <Iconify icon="mdi:success-circle" size={22} className={` ${styles.success_color}`} />
                            </div>
                        </li> :
                            <li className='flex-x-cc mt-5'>
                                <TwoFA className="w-[20px] h-[20px] title-color mr-2_5" />
                                <div className={`${styles.titlw_color} font-16 font-w-500 flex-x algin-center flex-1`}>
                                    <span className={`${styles.status_title} flex-x algin-center justify-start`}>{t('assetsAccount.button.withdrawtip4')}</span>

                                    <Iconify icon="clarity:error-standard-solid" size={22} className={` ${styles.error_color}`} />

                                </div>
                                <button className={`${styles.btn_style2} default_btn`}
                                    onClick={() => {
                                        navigate('/userCenter/security')
                                    }}>
                                    {t('assetsAccount.button.toset')}
                                </button>
                            </li>}

                    </ul>
                </div>
                    :
                    <div className={`${styles.pop_content} flex-1 px-4 mt-4`}>
                        <div className={`${styles.pop_content_header} flex-y`}>
                            <span className={`${styles.tip_color} font-12 font-w-400`}>{t('toUpSteps.tipText3')}</span>
                        </div>
                        <ul className={`${styles.pop_content_body} flex-y `}>
                            {userInfo?.unverifiedRechargeStatus == 1 ? null :
                             <>{(userInfo?.verifiedRechargeStatus === 1 && userInfo?.realnessStatus !== 1) ? <li className='flex-x-cc mt-5'>
                                <IdCard className="w-[20px] h-[20px] title-color mr-2_5" />
                                <div className={`${styles.titlw_color} font-16 font-w-500 flex-x algin-center flex-1`}>
                                    <span className={`${styles.status_title} flex-x algin-center justify-start`}>{t('assetsAccount.button.withdrawtip2')}</span>
                                    <Iconify icon="clarity:error-standard-solid" size={22} className={` ${styles.error_color}`} />
                                </div>
                                <button className={`${styles.btn_style2} default_btn`}
                                    onClick={() => {
                                        navigate('/userCenter/identity')
                                    }}>
                                    {t('assetsAccount.button.toAuthentication')}
                                </button>

                            </li> :
                                (userInfo?.verifiedRechargeStatus === 1 && userInfo?.realnessStatus === 1) ? <li className='flex-x-cc mt-5'>
                                    <IdCard className="w-[20px] h-[20px] title-color mr-2_5" />
                                    <div className={`${styles.titlw_color} font-16 font-w-500 flex-x algin-center flex-1`}>
                                        <span className={`${styles.status_title} flex-x algin-center justify-start`}>
                                            {t('assetsAccount.button.withdrawtip3')}</span>
                                        <Iconify icon="mdi:success-circle" size={22} className={` ${styles.success_color}`} />
                                    </div>

                                </li> : null}</>}

                        </ul>
                    </div>

                }
            </div>
        </Popup>
    );
};

export default WithdrawStatusPop; 