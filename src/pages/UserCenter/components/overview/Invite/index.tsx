import React from 'react';
import styles from '@/pages/UserCenter/overview/index.module.scss';
import { Iconify } from "@/components/icon"
import {  useState, useEffect } from "react";
import { Image } from 'antd-mobile'
import { useLanguage } from '@/hooks/useLanguage';
import appStore from '@/store';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface InviteInfoType {
    inviteCode: string,
    inviteLink: string,
}
const InvitePage: React.FC = () => {
    const { t } = useLanguage('userCenter');
    const userInfo = appStore.getUserInfo()
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
        <div className={`${styles.card_bgc}  mt-6 ${styles.aside_invite2} flex-y flex-1`}>
            <div className={`flex-row justify-between font-18 font-w-500 mb-3 ${styles.box_padding}`} >

                {t('overview.recommend.inviteFriend')}
            </div>
            <div className={`${styles.qr_code} flex-x align-center  flex-1`}>
				<Image src={inviteInfo.inviteLink} />
                <div className={`flex-1 ${styles.invite_code_box} flex-col justify-between`}>
                    <div >
                        <p className='font-14 font-w-400'>{t('overview.recommend.inviteCode')}</p>
                        <div className={`${styles.invite_code} font-12 flex align-center justify-between`}>
                            <span className={`${styles.tip_color}`}>{inviteInfo.inviteCode || '--'}</span>
                            <Iconify icon="bx:copy" className='cursor-pointer' size={20}
                                onClick={() => copyFn(inviteInfo.inviteCode || '')}
                            />
                        </div>
                    </div>
                    <div  >
                        <p className='font-14 font-w-400' >{t('overview.recommend.inviteLink')}</p>
                        <div className={`${styles.invite_code} font-12 flex align-center justify-between`}>
                            <span className={`${styles.tip_color} ${styles.line1} line-2 mr-1`}>{`${inviteInfo.inviteLink}`}</span>
                            <Iconify icon="bx:copy" className='cursor-pointer' size={20}
                                onClick={() => copyFn(`${inviteInfo.inviteLink}`)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>
    );
};
export default InvitePage;