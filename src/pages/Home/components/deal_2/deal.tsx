
import React from 'react';
import styles from  '../styles/deal.module.scss'
// import Image from 'next/image'
// import { useTranslation } from 'next-i18next';
// import { getNextJsLocale } from '@/utils/filterLang';
// import appStore from '@/store';
export default function Experience() {
// const { t } = useTranslation(['home']);
// const langKey = appStore.getLang()
//      const defaultPic=() => {
//          const lang = getNextJsLocale(langKey)
//          if (lang === 'zh') {
//              return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_trade.png'
//          } else {
//              return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/en_trade.png'
//          }
//      }
    return (
        <div className={`${styles.deal_page}`}>
        {/* <div className={`${styles.deal_main} flex-column flex-ai-center`}>
            <h2 className={`${styles.deal_main_title1}`}>{t('detailTitle')}</h2>
            <h3 className={`${styles.deal_main_title2}`}>{t('detailTip')}</h3>
            <div className={`${styles.deal_main_pic}`}>
                <Image className='' src={defaultPic()} alt="" width={1020} height={610}/>
            </div>
        </div> */}
    </div>
    );
}
