
import React from 'react';
import { useMemo } from "react";
import styles from '../styles/deal.module.scss'
import { Image } from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';
import { autoConvertLangCode } from '@/utils/stringMap';

export default function Experience() {
    const { t, currentLanguage } = useLanguage();
    const langKey = currentLanguage || 'en_US';
    const defaultPic = useMemo(() => {
        const langShort = autoConvertLangCode(langKey, 'short');
        if (langShort === 'zh') {
            return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_trade.png'
        } else {
            return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/en_trade.png'
        }
    }, [langKey])
    return (
        <div className={`${styles.deal_page}`}>
            <div className={`${styles.deal_main} flex-y-cc`}>
                <div className={`${styles.deal_main_title_box}`}>
                    <h2 className={`${styles.deal_main_title1} font-28`}>{t('detailTitle', { ns: 'home' })}</h2>
                    <h3 className={`${styles.deal_main_title2} font-16`}>{t('detailTip', { ns: 'home' })}</h3>
                </div>

                <div className={`${styles.deal_main_pic} flex-y-cc`}>
                    <Image src={defaultPic} alt=""
                        className={`${styles.deal_main_pic_img}`}
                    />
                </div>
            </div>
        </div>
    );
}
