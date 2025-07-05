
import React from 'react';
import styles from '../styles/assistant.module.scss';
// import Image from 'next/image'
// import { useTranslation } from 'next-i18next';
import appStore from '@/store';
import { useEffect } from 'react';
export default function Experience() {
    // const { t,i18n } = useTranslation(['home']);
    const allConfig = appStore.getKvConfigAll();
    // useEffect(() => {
        
    // }, [i18n.language]);
    return (<></>
        // <div className={`${styles.comup_page}`}>
        //     <div className={`${styles.assistant_main} flex-column flex-ai-center flex-jc-center`}>
        //         <div className={`flex flex-ai-center flex-jc-between ${styles.comup_title}`}>
        //             <div style={{width: '50%'}}>
        //                 <h2 className={`${styles.comup_main_title1}`}>
        //                     {/* 走近MetaWave */}
        //                     {t('title1', {name: allConfig?.tenant_cache_name || '--'})}
        //                 </h2>
        //                 <h3 className={`${styles.comup_main_title2}`}>
        //                     {/* 在我们世界级合作伙伴的帮助下，了解为什么IMBIT会是你最喜爱的数字货币交易 App */}
        //                 {t('tip1')}
        //                 </h3>
        //             </div>
        //             {/* <Image className={`${styles.logo_pic}`} src="/images/home/logo.png" alt="" width={300} height={71}/> */}
        //         </div>

        //         <div className={`${styles.comup_main_pic} flex flex-jc-between`}>
        //             <div className={`${styles.pic_box} position-relative`} >
        //                 <Image className={`${styles.pic}`} src="/images/home/rectangle1.png" alt="" width={350} height={100}/>
        //                 <div className={`${styles.text_icon} flex-col flex-jc-between`}>
        //                     <div className={`text-right ${styles.title_box}`}>
        //                         <p className='font-22 font-w-500'>
        //                             {/* 何塞普·瓜迪奥拉教练 */}
        //                             {t('title2')}
        //                         </p>
        //                         <p className='font-16 font-w-400'>
        //                             {/* 讲解“疯狂足球战术” */}
        //                             {t('tip2')}
        //                             </p>
        //                     </div>
        //                     <Image src="/images/home/viedo.png" alt="" width={350} height={100}/>
        //                 </div>
        //             </div>
        //             <div className={`${styles.pic_box} position-relative`} >
        //                 <Image className={`${styles.pic}`} src="/images/home/rectangle2.png" alt="" width={350} height={100}/>
        //                 <div className={`${styles.text_icon} flex-col flex-jc-between`}>
        //                     <div className={`text-right ${styles.title_box}`}>
        //                         <p className='font-22 font-w-500'>
        //                             {/* 重塑系统 */}
        //                             {t('title3')}
        //                         </p>
        //                         <p className='font-16 font-w-400'>
        //                             {/* 欢迎来到 Web3 */}
        //                             {t('tip3')}
        //                         </p>
        //                     </div>
        //                     <Image src="/images/home/viedo.png" alt="" width={350} height={100}/>
        //                 </div>
        //             </div>
        //             <div className={`${styles.pic_box} position-relative`} >
        //                 <Image className={`${styles.pic}`} src="/images/home/rectangle3.png" alt="" width={350} height={100}/>
        //                 <div className={`${styles.text_icon} flex-col flex-jc-between`}>
        //                     <div className={`text-right ${styles.title_box}`}>
        //                         <p className='font-22 font-w-500'>
        //                             {/* 单板滑雪运动员斯科特·詹姆斯练 */}
        //                             {t('title4')}
        //                         </p>
        //                         <p className='font-16 font-w-400'>
        //                             {/* 领导全家欢聚 */}
        //                             {t('tip4')}
        //                         </p>
        //                     </div>
        //                     <Image src="/images/home/viedo.png" alt="" width={350} height={100}/>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
}
