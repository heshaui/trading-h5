
import { useState, useEffect } from 'react';
import React from 'react';
import styles from '../styles/assistant.module.scss';
import { Input, Button ,Image} from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';
import { autoConvertLangCode } from '@/utils/stringMap';
import appStore from '@/store';
import comup1 from "@/assets/images/home/comup1_dark.png"
import comup2 from "@/assets/images/home/comup2_dark.png"
import comup3 from "@/assets/images/home/comup3_dark.png"
import comup1_day from "@/assets/images/home/comup1_day.png"
import comup2_day from "@/assets/images/home/comup2_day.png"
import comup3_day from "@/assets/images/home/comup3_day.png"
// import { useDayModeChange } from '@/hooks/dayModeChange'; // 使用 hook
import { useThemeMode } from '@/hooks/useThemeMode';

export default function Experience() {
    // 添加客户端渲染标记
    const { t } = useLanguage();
    // const { isDayMode } = useDayModeChange(); // 使用 hook
    const { isDayMode } = useThemeMode(); // 使用 hook


    return (
        <div className={`${styles.assistant_page}`}>
            <div className={`${styles.assistant_main} flex-y-cc`}>
                <div className={`${styles.assistant_main_title_box} flex-y-cc`}>
                    <h2 className={`${styles.assistant_main_title1} flex-y-cc font-28 text-center`}>{t('assistantTitle',{ns:'home'})}</h2>
                    <h3 className={`${styles.assistant_main_title2} font-16 text-center`}>{t('assistantTip',{ns:'home'})}</h3>
                </div>
                <div className={`${styles.assistant_main_pic} flex-y flex-ai-center flex-jc-between`}>
                    {/* "/images/home/comup1.png" */}
                    <Image className={`${styles.assistant_pic}`} 
                    src={isDayMode ? comup1_day :comup1} alt=""  />
                    <Image className={`${styles.assistant_pic}`} src={isDayMode ? 
                        comup2_day :comup2} alt=""  />
                    <Image className={`${styles.assistant_pic}`} src={isDayMode ? 
                        comup3_day :comup3} alt=""  />
                </div>
            </div>
        </div>
    );
}
