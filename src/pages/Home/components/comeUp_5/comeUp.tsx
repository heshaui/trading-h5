
import React from 'react';
import styles from '../styles/assistant.module.scss';
import { Image } from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';
import { autoConvertLangCode } from '@/utils/stringMap';
import appStore from '@/store';
import { useEffect } from 'react';
import rectangle1 from '@/assets/images/home/rectangle1.png'
import rectangle2 from '@/assets/images/home/rectangle2.png'
import rectangle3 from '@/assets/images/home/rectangle3.png'
import viedo from '@/assets/images/home/viedo.png'

export default function Experience() {
    const { t } = useLanguage();
    const allConfig = appStore.getKvConfigAll();
    const picList=[
        {
            title: t('title2',{ns:'home'}),
            tip: t('tip2',{ns:'home'}),
            pic: rectangle1
        },
        {
            title: t('title3',{ns:'home'}),
            tip: t('tip3',{ns:'home'}),
            pic: rectangle2
        },
        {
            title: t('title4',{ns:'home'}),
            tip: t('tip4',{ns:'home'}),
            pic: rectangle3
        },
        
    ]
    return (
        <div className={`${styles.comup_page}`}>
            <div className={`${styles.assistant_main} flex-column flex-ai-center flex-jc-center`}>
                <div className={`flex flex-ai-center flex-jc-between ${styles.comup_title}`}>
                    <div  className='flex-y-cc'>
                        <h2 className={`${styles.comup_main_title1} text-center font-28`}>
                            {/* 走近MetaWave */}
                            {t('title1',{name: allConfig?.tenant_cache_name || '--',ns:'home'})}
                        </h2>
                        <h3 className={`${styles.comup_main_title2} text-center font-16`}>
                            {/* 在我们世界级合作伙伴的帮助下，了解为什么IMBIT会是你最喜爱的数字货币交易 App */}
                        {t('tip1',{ns:'home'})}
                        </h3>
                    </div>
                    {/* <Image className={`${styles.logo_pic}`} src="/images/home/logo.png" alt="" width={300} height={71}/> */}
                </div>

                <div className={`${styles.comup_main_pic} flex-y flex-jc-between`}>
                    {picList.map((item,index)=>(
                        <div className={`${styles.pic_box} position-relative`} key={`pic-${index}`}>
                        <Image className={`${styles.pic}`} src={item.pic} alt="" />
                        <div className={`${styles.text_icon} flex-col flex-jc-between`}>
                            <div className={`text-right ${styles.title_box}`}>
                                <p className='font-22 font-w-500'>
                                    {/* 何塞普·瓜迪奥拉教练 */}
                                    {item.title}
                                </p>
                                <p className='font-16 font-w-400'>
                                    {/* 讲解“疯狂足球战术” */}
                                    {item.tip}
                                    </p>
                            </div>
                            <Image src={viedo} alt="" />
                        </div>
                    </div>
                    ))}
                 
                </div>
            </div>
        </div>
    );
}
