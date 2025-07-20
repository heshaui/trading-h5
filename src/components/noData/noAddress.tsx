// pages/userCenter/pages/index.tsx
import React from 'react';
import { Image } from 'antd-mobile';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useLanguage } from '@/hooks/useLanguage';
import noaddressDay from '@/assets/images/public/iocn_noaddress_day.png'
import noaddressNight from '@/assets/images/public/iocn_noaddress_night.png'
const NoData = () => {
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { t } = useLanguage('common');

    return (<div className='flex-y-cc'>
        <Image
            src={isDayMode ? noaddressDay : noaddressNight}
            alt="empty" width={100} height={100} />
        <p className={`font-14 font-w-400 tip-color`}>{t('noaddress')}</p>
    </div>
    );
};

export default NoData;