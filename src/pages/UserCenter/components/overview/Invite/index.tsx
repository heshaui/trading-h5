import React from 'react';
import { QRCode } from "antd";
import styles from '@/pages/UserCenter/overview/index.module.scss';
import { Iconify } from "@/components/icon"
import {  useState, useEffect } from "react";
import { Image } from 'antd-mobile'
import { useLanguage } from '@/hooks/useLanguage';
import appStore from '@/store';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import InviteCard from './InviteCard';

interface InviteInfoType {
    inviteCode: string,
    inviteLink: string,
}
const InvitePage: React.FC = () => {
    const { t } = useLanguage('userCenter');
    const userInfo = appStore.getUserInfo()
	const kvConfig=appStore.getKvConfigAll()

    const [inviteInfo, setInviteInfo] = useState<InviteInfoType>({
        inviteCode: '',
        inviteLink: ''
    });
    const { copyFn } = useCopyToClipboard();

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
    return (< >
        <InviteCard />
        {kvConfig?.account_configuration === '1' &&<div className="border border-[var(--border-color4)] rounded-md mt-[20px]">
            <div className="px-[20px] border-b border-[var(--border-color4)] h-[50px] leading-[50px] text-[18px] font-medium">
                {t('overview.recommend.inviteFriend')}
            </div>
            <div className="px-[20px] py-[28px] flex justify-between items-center">
                <QRCode
                    className="min-w-[68px] min-h-[68px] !bg-[#fff] p-[6px] shrink-0"
                    value={`${inviteInfo.inviteLink || ""}`}
                    size={68}
                />
                <div className="flex-1 ml-5 min-w-0">
                    <p className="text-sm font-normal mb-[6px]">{t('overview.recommend.inviteCode')}</p>
                    <div className="border border-[var(--border-color4)] rounded flex items-center px-[10px] h-[37px]">
                        <div className="flex-1 text-[12px] font-normal text-[#9e9e9e] line-1 mr-[10px]">
                            {inviteInfo.inviteCode || '--'}
                        </div>
                        <Iconify icon="bx:copy" className="text-[18px] shrink-0"
                            onClick={() => copyFn(inviteInfo.inviteCode || '')}
                        />
                    </div>
                    <p className="text-sm font-normal mb-[6px] mt-[14px]">{t('overview.recommend.inviteLink')}</p>
                    <div className="border border-[var(--border-color4)] rounded flex items-center px-[10px] h-[37px]">
                        <div className="flex-1 text-[12px] font-normal text-[#9e9e9e] truncate mr-[10px] min-w-0">
                            {inviteInfo.inviteLink}
                        </div>
                        <Iconify icon="bx:copy" className="text-[18px] shrink-0"
                            onClick={() => copyFn(inviteInfo.inviteLink || '')}
                        />
                    </div>
                </div>
            </div>
        </div>}
    </>
    );
};
export default InvitePage;