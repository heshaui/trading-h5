import React from 'react';
import styles from '../styles/try.module.scss';
// import Image from 'next/image';
// import { useTranslation } from 'next-i18next';
// import { getNextJsLocale } from '@/utils/filterLang';
// import appStore from '@/store';

export default function Experience() {
    // const { t } = useTranslation(['home']);
    // const langKey = appStore.getLang()
    //    const defaultPic=() => {
    //          const lang = getNextJsLocale(langKey)
    //          if (lang === 'zh') {
    //              return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_rate.png'
    //          } else {
    //              return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/en_rate.png'
    //          }
    //      }
    return (
        <div className={`${styles.try_page}`}>
            {/* <div className={`${styles.try_main} flex flex-ai-center flex-jc-around`}>
                <div className={`${styles.try_main_pic}`}>
                    <Image className='' src={defaultPic()} alt="" width={400} height={400} />
                </div>
                <div>
                    <h2 className={`${styles.try_main_title1}`}>{t('appTitle')}</h2>
                    <h3 className={`${styles.try_main_title2}`}>{t('tradeTip')}</h3>
                </div>
            </div> */}
        </div>
    );
}
