import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

import InviteLightIcon from '@/assets/images/userCenter/overview/icon_invite_day.png'
import InviteDarkIcon from '@/assets/images/userCenter/overview/icon_invite_dark.png'
import { Swiper, Image } from 'antd-mobile'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCarouselImageList } from '@/services/userCenter';
import { carouselImageContentsType } from '@/type/userCenter/overview'
import styles from '@/pages/UserCenter/overview/index.module.scss';

const InviteCard: React.FC = () => {
    const { t, currentLanguage } = useLanguage('userCenter');
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [carouselPic, setCarouselPic] = useState<any[]>([]);
    const getCarouselPic = async () => {
        const res = await getCarouselImageList()
        if (res.code === '0') {
            setCarouselPic(res.data)
        }
    }
    const getLanguage = useCallback((carouselImageContents: carouselImageContentsType[]) => {
        // const carouselImageContents: carouselImageContentsType[] = carouselPic
        const language = localStorage.getItem('lang') || 'en_US'
        let imgRes = carouselImageContents.filter((item: carouselImageContentsType) => item.languageCode === language)
        // 3. 如果当前语言没有对应内容，则使用英文内容
        if (!imgRes || imgRes.length === 0) {
            imgRes = carouselImageContents.filter((item: carouselImageContentsType) =>
                item.languageCode === 'en_US'
            );
        }
        return imgRes[0]
    }, [currentLanguage])
    const picClick = (url: string) => {
        window.open(url, '_blank', 'noopener')
    }
    useEffect(() => {
        getCarouselPic()
    }, [currentLanguage]);
    return (
        <>
            <div className="leading-[25px] text-[18px] font-medium mb-[12px] mt-[30px]">
                {/* 为你推荐 */}
                {t('overview.recommend.title')}
            </div>
            {carouselPic.length === 0 ? <div
                className="px-[16px] py-[20px] border border-[var(--border-color4)] rounded-md"
                onClick={() => navigate('/invite')}
            >
                <div className="leading-[25px] text-[18px] font-medium mb-[34px]">
                    {/* 邀请新用户 */}
                    {t('overview.recommend.invite')}
                </div>
                <div className="flex justify-between items-center h-[58px]">
                    <div className="w-[154px] leading-[20px] text-[14px] font-normal">
                        {t('overview.recommend.inviteNewUser')}
                    </div>
                    <img
                        src={isDark ? InviteDarkIcon : InviteLightIcon}
                        className="w-[58px] h-[58px]"
                    />
                </div>
            </div> :
                <div className="rounded-md">
                    <Swiper autoplay={true} loop={true}
                        style={{
                            '--border-radius': '8px',
                            '--track-padding': ' 0 0 0 0',
                        }}
                        indicatorProps={{
                            style: {
                                '--dot-color': '#FFFFFF',
                                '--active-dot-color': 'var(--theme-color)',
                                // '--dot-size': '10px',
                                // '--active-dot-size': '30px',
                                // '--dot-border-radius': '50%',
                                // '--active-dot-border-radius': '15px',
                                // '--dot-spacing': '8px',
                            }
                        }}
                    >
                        {carouselPic.map((item: any) => (
                            <Swiper.Item key={item.id} onClick={() => picClick(getLanguage(item.carouselImageContents)?.accessUrl)}>
                                <div className={`${styles.bannerImg_box} w-full`} >
                                    <Image src={getLanguage(item.carouselImageContents)?.imageUrl} className={`w-full pointer ${styles.banner_mg}`}
                                        alt={getLanguage(item.carouselImageContents)?.title || ''}
                                    />
                                </div>

                            </Swiper.Item>
                        ))}
                    </Swiper>
                </div>}
        </>
    )
}

export default InviteCard;