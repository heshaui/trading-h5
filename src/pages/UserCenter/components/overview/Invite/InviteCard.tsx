import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

import InviteLightIcon from '@/components/assets/images/userCenter/overview/icon_invite_day.png'
import InviteDarkIcon from '@/components/assets/images/userCenter/overview/icon_invite_dark.png'

const InviteCard: React.FC = () => {
    const { t } = useLanguage('userCenter');
    const { isDark } = useTheme();
    const navigate = useNavigate();

    return (
        <>
            <div className="leading-[25px] text-[18px] font-medium mb-[12px] mt-[30px]">
                {/* 为你推荐 */}
                {t('overview.recommend.title')}
            </div>
            <div 
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
            </div>
        </>
    )
}

export default InviteCard;