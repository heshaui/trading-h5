import React from 'react';
import { Popup, Toast, Image } from 'antd-mobile';
import styles from './styles/repeatModal.module.scss';
import { useLanguage } from '@/hooks/useLanguage';
import resetSuccessIcon from '@/assets/images/public/icon_success.png';

type Props = {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
};

const ResetSuccessModal: React.FC<Props> = ({ open,  onOk, onCancel }) => {
    const { t } = useLanguage("resetPassword");
    const handCancel = () => {
        onCancel()
    };

    const handOk = () => {
        onOk()
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };
    return (
        <Popup
            visible={open}
            onClose={handCancel}
            closeOnMaskClick
            position='bottom'
            bodyStyle={{ minHeight: '30vh', paddingBottom: '5%' }}
            bodyClassName={styles.userCenterPopContainer}
            className={`${styles.login_form}`}
        >
            <div className="flex-col flex-ai-center">
                <Image src={resetSuccessIcon} alt="" className={`${styles.icon_box}`}/>
                <p className={`${styles.title} `}>{t('resetSuccess')}</p>
                <p className={`${styles.msg_color} mt-4`}>{t('resetSuccessMsg')}</p>
            </div>
            <div className="flex-x-cc mt-10 mb-8">
                {/* <button
                    type="button"
                    className="px-14 py-1 shadow-none"
                    onClick={handleCancel}
                >
                    取消
                </button> */}
                <button
                    type="button"
                    className={`${styles.submit_btn} flex-x-cc font-16 btn-color`}
                    onClick={handOk}
                >
                    {/* 登录 */}
                    {t('gologin')}
                </button>
            </div>
        </Popup>
    );
};

export default ResetSuccessModal; 