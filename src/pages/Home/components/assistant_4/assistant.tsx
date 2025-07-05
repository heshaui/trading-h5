
import { useState, useEffect } from 'react';
import React from 'react';
import styles from '../styles/assistant.module.scss';
// import { Input, Button } from "antd";
// import Image from 'next/image'
// import { useTranslation } from 'next-i18next';
import comup1 from "@/public/images/home/comup1.png"
import comup2 from "@/public/images/home/comup2.png"
import comup3 from "@/public/images/home/comup3.png"
import comup1_day from "@/public/images/home/comup1_day.png"
import comup2_day from "@/public/images/home/comup2_day.png"
import comup3_day from "@/public/images/home/comup3_day.png"
// import { useDayModeChange } from '@/hooks/dayModeChange'; // 使用 hook
import { useThemeMode } from '@/hooks/useThemeMode';

export default function Experience() {
    // 添加客户端渲染标记
    // const { t } = useTranslation(['home']);
    // // const { isDayMode } = useDayModeChange(); // 使用 hook
    // const { isDayMode } = useThemeMode(); // 使用 hook


    return (
        <div className={`${styles.assistant_page}`}>
            <div className={`${styles.assistant_main} flex-column flex-ai-center flex-jc-center`}>
                {/* <h2 className={`${styles.assistant_main_title1}`}>{t('assistantTitle')}</h2>
                <h3 className={`${styles.assistant_main_title2}`}>{t('assistantTip')}</h3> */}
                <div className={`${styles.assistant_main_pic} flex flex-jc-between`}>
                    {/* "/images/home/comup1.png" */}
                    {/* <Image className={`${styles.assistant_pic}`} src={isDayMode ? comup1_day : comup1} alt="" width={200} height={100} />
                    <Image className={`${styles.assistant_pic}`} src={isDayMode ? comup2_day : comup2} alt="" width={200} height={100} />
                    <Image className={`${styles.assistant_pic}`} src={isDayMode ?  comup3_day:comup3 } alt="" width={200} height={100} /> */}
                </div>
            </div>
        </div>
    );
}
