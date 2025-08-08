import React from 'react';
import styles from './styles/invite.module.scss';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Iconify } from "@/components/icon"
import InviteBanner from './components/invite_banner';
import InviteContent from './components/invite_content';
import InviteModal from './components/modal/invite_Modal';
import { useEffect, useState } from 'react';
// import { getLoginInfo } from '@/services/overview';
import { useNavigate } from 'react-router-dom';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { useLanguage } from '@/hooks/useLanguage';
import appStore from '@/store';

interface InviteInfoType {
    inviteCode: string,
    inviteLink: string,
}

const InvitePage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage('invite');
    const { isDayMode } = useThemeMode(); // 使用 hook
    // const { copyFn } = useCopyToClipboard();
    const [open, setOpen] = useState(false);
    const [inviteInfo, setInviteInfo] = useState<InviteInfoType>({
        inviteCode: '',
        inviteLink: ''
    });
    // const BASE_URL = process.env.NEXT_PUBLIC_INVITE_BASE;
    const userInfo = appStore.getUserInfo()

    const onInviteReturn = () => {
        setOpen(true)
    }
    
    const inviteModalOK = () => {
        // navigate(`/register?inviteCode=${inviteInfo.inviteCode}`)
        setOpen(false)
    }
    
    const getLoginInfoData = async () => {
        const getBaseUrl = () => {
            return window.location.origin;
        };
        if (typeof window !== 'undefined') {
            const param = {
                inviteCode: userInfo.inviteCode || '',
                inviteLink: `${getBaseUrl()}/register?inviteCode=${userInfo.inviteCode || ''}`
            }
            setInviteInfo(param)
        }
    }
    
    useEffect(() => {
        getLoginInfoData();
    }, [])
    
    useEffect(() => {
        // 只在客户端执行
        if (typeof window === 'undefined') return;

        try {
            appStore.loadCurrencyPairs()
        } catch (error) {
            console.error('初始化货币对数据错误:', error);
        }
    }, []);
    
    return (
        <div className={`${styles.invite_page} flex-y align-center`}>
            <div className={`${styles.main_page_box} font-16 fontw-400`}>
                <InviteBanner onReturn={onInviteReturn} inviteInfo={inviteInfo} />
                <InviteContent onReturn={onInviteReturn} />
                <InviteModal open={open} onCancel={() => setOpen(false)} onOk={inviteModalOK} />
            </div>
        </div>
    );
};

// 设置页面布局为 main layout
export const layout = 'main';

export default InvitePage;