import React from 'react';
import styles from '../styles/experience.module.scss'
import { Input, Button, Image } from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';

import { CSSProperties } from "react";
import { getPic2, getHomeImage } from "@/services/open";
import { useEffect, useState, useMemo } from "react";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useThemeMode } from '@/hooks/useThemeMode'
import appStore from '@/store';
import { autoConvertLangCode } from '@/utils/stringMap';
// import { checkImageUrl } from '@/hooks/useKv'

const bgStyle: CSSProperties = {
    // backgroundImage: "url('/images/home/experience_bg.png')",
    backgroundSize: 'contain', // 改为contain以保持图像原始比例 cover
    backgroundPosition: 'right',
    backgroundRepeat: 'no-repeat', // 改为no-repeat防止重复

};
interface isLoginType {
    buttonText: string,
    image: string,
    subtitle: string,
    title: string,
    url: string
}
interface isDayModeType {
    before_login: isLoginType,
    after_login: isLoginType
}
interface LoginPicType {
    dark: isDayModeType,
    light: isDayModeType
}
interface HomePicType {
    [key: string]: LoginPicType
}
export default function Experience() {
    // const { t } = useTranslation('common');
    const { t, currentLanguage } = useLanguage();

    const [homePic, setHomePic] = useState<LoginPicType | null>(null)
    const [homeImage, setHomeImage] = useState<HomePicType>({} as HomePicType)
    // const [email, setEmail] = useState('');
    const { isDayMode } = useThemeMode()
    const langKey = appStore.getLang() || 'en_US';
    const token = appStore.getToken();

    const onChange = (e: any) => {
        console.log('Change:', e.target.value);
        // setEmail(e.target.value)
    };

    const getBgc = async () => {
        try {
            // const res=await getPic(['pcLogin'])
            const res = await getPic2('HomeBanner')
            if (res.code === '0') {
                const resdata = JSON.parse(res.data)
                setHomeImage(resdata)
                // const langCode = autoConvertLangCode(langKey,'long')

                // const langData = resdata[langCode]
                // if (langData) {
                //     setHomePic(resdata[langCode])
                // } else {
                //     setHomePic(resdata['en_US'])
                // }

            }
        } catch (error) {

        }
    }
    const bgUrl = useMemo(() => {
        // let isDayMode = '';
        let token = '';
        if (typeof window !== 'undefined') {
            // isDayMode = localStorage.getItem('isDayMode') || ''
            token = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN) || ''
        }
        const langCode = autoConvertLangCode(langKey, 'long')

        const langData = homeImage[langCode]
        let homePic = {} as LoginPicType
        if (langData) {
            // setHomePic(homeImage[langCode])
            homePic = homeImage[langCode]
        } else {
            // setHomePic(homeImage['en_US']
            homePic = homeImage['en_US']
        }
        if (isDayMode) {
            if (token) {
                return homePic?.light.after_login
            } else {
                return homePic?.light.before_login
            }
        } else {
            if (token) {
                return homePic?.dark.after_login
            } else {
                return homePic?.dark.before_login
            }
        }
    }, [langKey, homeImage, isDayMode, token])
    const picClick = (url: string) => {
        if (url) {
            window.open(url, '_blank', 'noopener')
        }
    }
    const defaultPic = () => {
        const lang = autoConvertLangCode(langKey, 'short')
        if (lang === 'zh') {
            return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_spot.png'
        } else {
            return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/en_spot.png'
        }
    }
    useEffect(() => {
        getBgc()
        // getHommePic()
    }, [currentLanguage, langKey]);

    return (
        <div className={`${styles.experience_page} flex-y-cc`}
        // style={{ background: 'lightblue' }}
        >
            <div className={`${styles.experience_main} flex-y justify-between`}
                // style={{ ...bgStyle, backgroundImage: `url(${bgUrl?.image})` }}
            >
                <div className={`${styles.experience_main_box} flex-y align-center mt-10 w-full`}>
                    <div className='flex-y align-center text-center'>
                        <h2 className={`font-32`}>{bgUrl?.title}</h2>
                        <h3 className={`font-18 font-w-400 ${styles.assistant_main_title2}`}>{bgUrl?.subtitle}</h3>
                    </div>
                    <div className={`flex-y flex-ai-center ${styles.experience_main_email} w-full`}>
                        {typeof window !== 'undefined' && !token &&
                            <Input type="text" placeholder={t('email')} 
                            // onChange={(val) => onChange(val)} 
                            className={`${styles.custom_input_home}`} />}
                        <button className={`${styles.experience_main_btn} font-16 flex-x-cc mt-4`}
                            onClick={() => picClick(bgUrl?.url)}
                        >{bgUrl?.buttonText}</button>
                    </div>
                </div>
                <div
                    className={`${styles.experience_main_pic}`}
                // style={{ ...bgStyle, backgroundImage: `url(${bgUrl?.image})` }}
                style={{ ...bgStyle
                    , backgroundImage:isDayMode?
                     `url('https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/phone.png')`
                     :`url('https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/phone_dark.png')` }}
                >
                </div>
            </div>
        </div>
    );
}
