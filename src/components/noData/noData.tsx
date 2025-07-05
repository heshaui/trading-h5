// pages/userCenter/pages/index.tsx
import React from 'react';
import {Image} from 'antd-mobile';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useLanguage } from '@/hooks/useLanguage';

import styles from './styles/modal.module.scss';
import { useNavigate } from 'react-router-dom';
import nodaDay from '@/assets/images/public/iocn_nodata_day.png';
import nodaNight from '@/assets/images/public/iocn_nodata_night.png';

type NoDataProps = {
    title?: string;
    textColor?: string;
    height?: string;
    position?: string;
    button?: React.ReactNode | boolean;
    buttonTitle?: string;
    buttonClick?: () => void;
    url?: string;
    urlText?: string;
    className?: string|string[]
}
const NoData = ({ title, textColor, height, position = 'center', button, buttonTitle, buttonClick,url,urlText,className }: NoDataProps) => {
    const navigate = useNavigate();
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { t } = useLanguage();
    const overclassName = () => {
        if (position === 'center') return 'flex-y-cc'
        if (position === 'top') return 'flex-y align-center justify-start'
    }
    return (<div
        className={`${overclassName()} ${className}`}
        style={{ height: height || 'auto' }}
    >
        <Image
            src={isDayMode ? nodaDay : nodaNight}
            alt="empty" width={100} height={100} />
        <p className={`font-14 font-w-400 tip-color`}
            style={{ color: textColor ? textColor : '' }}
        >{title ? title : t('nodata')} {url && urlText ? <span className={`font-14 font-w-400 ${styles.url_color}`}
        style={{ color: textColor ? textColor : '' }}
        onClick={()=>{
            // router.push(url)
            navigate(url)
        }}
        >{urlText ? urlText : ''}</span> : null}</p>
       
        {button || buttonTitle ? <>
            {buttonTitle && !button ? <button
                type='submit' className={`default_btn  mt-5 ${styles.invite_btn}`}
                onClick={buttonClick}>
                {buttonTitle || 'Click'}
            </button> : button}</>
            : null}
    </div>
    );
};

export default NoData;