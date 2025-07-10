import React from 'react';
import { Popup, Toast,Image } from 'antd-mobile';
import styles from './styles/repeatModal.module.scss';
import { useLanguage } from '@/hooks/useLanguage';
import errIcon from '@/assets/images/public/icon_repeat.png';

type Props = {
    open: boolean;
    type: string;
    message: string;
    acount: string;
    onOk: () => void;
    onCancel: () => void;
};

const RepeatModal: React.FC<Props> = ({ open, type, message, acount, onOk, onCancel }) => {
    const { t } = useLanguage("login");

    return (
        <Popup
            visible={open}
            onClose={onCancel}
            closeOnMaskClick
            position='bottom'
            bodyStyle={{ minHeight: '30vh', paddingBottom: '5%' }}
            bodyClassName={styles.userCenterPopContainer}
            className={`${styles.login_form}`}
        >
            {/* <div className="flex-col p-4">
                <div className={`${styles.title_color} mb-4 font-16 font-w-500 text-center`}>
                    {type === 'error' ? t('registerForm.error') : t('registerForm.success')}
                </div>
                
                <div className={`${styles.tip_color} mb-4 text-center`}>
                    {message}
                </div>
                
                <div className={`${styles.tip_color} mb-6 text-center`}>
                    {acount}
                </div>
                
                <div className="flex gap-3">
                    <button
                        type="button"
                        className={`${styles.goback_btn} flex-1`}
                        onClick={onCancel}
                    >
                        {t('authCodeForm.cancel')}
                    </button>
                    <button
                        type="button"
                        className={`${styles.submit_btn} btn-color flex-1`}
                        onClick={onOk}
                    >
                        {t('authCodeForm.confirm')}
                    </button>
                </div>
            </div> */}
             <div className="flex-col flex-ai-center">
                {type === 'error' && <Image src={errIcon}
                    alt=""
                    className={`${styles.icon_box}`} width={160} height={160} />
                }
                {type === 'error' && <p className={`${styles.title} `}>
                    {acount} {t('registerForm.repeat')}
                    {t('registerForm.repeat2')}
                </p>}
                {type === 'success' && <p className={`${styles.title} `}>
                    {message}
                </p>}
            </div>
            <div className="flex gap-3 mt-6 mb-4">
                    <button
                        type="button"
                        className={`${styles.goback_btn} flex-x-cc flex-1`}
                        onClick={onCancel}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        className={`${styles.submit_btn} flex-x-cc btn-color flex-1`}
                        onClick={onOk}
                    >
                        {t('registerForm.goLogin')}
                    </button>
                </div>
        </Popup>
    );
};

export default RepeatModal; 