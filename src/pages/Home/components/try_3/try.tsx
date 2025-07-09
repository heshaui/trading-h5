import React, { useMemo } from 'react';
import styles from '../styles/try.module.scss';
import { Image } from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';
import { autoConvertLangCode } from '@/utils/stringMap';
import appStore from '@/store';
import { useThemeMode } from '@/hooks/useThemeMode';

export default function Experience() {
    const { t } = useLanguage();
    const langKey = appStore.getLang()
    const { isDayMode } = useThemeMode()

    // const defaultPic = useMemo(() => {
    //     const lang = autoConvertLangCode(langKey, 'short')
    //     if (lang === 'zh') {
    //         return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_rate.png'
    //     } else {
    //         return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/en_rate.png'
    //     }
    // }, [langKey])
    return (
        <div className={`${styles.try_page}`}>
            <div className={`${styles.try_main} flex-y flex-ai-center flex-jc-around`}>
                <div className={`${styles.try_main_pic}`}>
                    <Image className={`${styles.try_pic}`} 
                    src={isDayMode ? 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_rate_day.png' :
                     'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_rate_dark.png'} alt=""
                     />
                </div>
                <div className={`${styles.try_main_title_box}`}>
                    <h2 className={`${styles.try_main_title1} font-28 text-center`}>{t('appTitle',{ns:'home'})}</h2>
                    <h3 className={`${styles.try_main_title2} font-16 text-center`}>{t('tradeTip',{ns:'home'})}</h3>
                </div>
            </div>
        </div>
    );
}
