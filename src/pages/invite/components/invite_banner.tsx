import React from 'react';
import styles from '../styles/invite.module.css';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import type { CSSProperties } from 'react';
import { Form, Input } from 'antd-mobile';
import { Iconify } from "@/components/icon"
import { getLoginInfo } from '@/services/overview';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import InviteQRcodeModal from './modal/invite_QRcode';
import bannerDay from '@/assets/images/invite/banner_day.png';
import bannerDark from '@/assets/images/invite/banner_dark.png';

const mainBgcStyle: CSSProperties = {
    // backgroundImage: `url("/images/login/banner.png")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
};

type InviteBannerProps = {
    onReturn: () => void;
    inviteInfo: InviteInfoType
}

// interface LoginInfoType {
//     userId: number,
//     registerAccount: string,
//     status: number,
//     email: string,
//     inviteCode: string,
// }

interface InviteInfoType {
    inviteCode: string,
    inviteLink: string,
}

const InviteBanner = ({ onReturn, inviteInfo = { inviteCode: '', inviteLink: '' } }: InviteBannerProps) => {
    const { t } = useLanguage('invite');
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { copyFn } = useCopyToClipboard();
    const [form] = Form.useForm();
    const [qrcodeOpen, setQRcodeOpen] = useState(false);

    // const [inviteInfo, setInviteInfo] = useState({} as InviteInfoType)
    // let userInfo = {}
    // if (typeof window !== 'undefined') {
    //     userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
    // }
    
    const onSubmit = () => {
        form.validateFields()
            .then(async (values) => {
                console.log(values);
                onReturn();
            });
    }
    
    // const getLoginInfoData = async () => {
    //     const res = await getLoginInfo();
    //     if (res.code === '0') {
    //         setInviteInfo(res.data);
    //         form.setFieldsValue({
    //             inviteCode: res.data.inviteCode,
    //             inviteLink: `${BASE_URL}/register?inviteCode=${res.data.inviteCode}`
    //         });
    //     }
    // }
    // useEffect(() => {
    //     getLoginInfoData();
    // }, [])

    // 监听 inviteInfo 的变化，当数据到达时更新表单
    useEffect(() => {
        if (inviteInfo?.inviteCode) {
            form.setFieldsValue({
                inviteCode: inviteInfo.inviteCode || '',
                inviteLink: inviteInfo.inviteLink || ''
            });
        }
    }, [inviteInfo]);

    // 如果数据还没准备好，可以显示加载状态
    // if (!inviteInfo?.inviteCode) {
    //     return <div>Loading...</div>;
    // }

    return (
        <>
            <div className={`${styles.header_banner} flex-y-cc`}
                style={{
                    ...mainBgcStyle,
                    backgroundImage: `url(${isDayMode ? bannerDay
                        : bannerDark})`
                }}>
                <div className={` flex-y align-center justify-between`}>
                    <div className={`${styles.main_title} `} >
                        <p className={`${styles.title_color} font-28 font-w-600`}>
                            {t('invite.title1')} <span className={styles.strong_color}>{t('invite.title2')}</span> 
                        </p>
                        <p className={`${styles.tip_color} font-18 font-w-400 mt-5`}>{t('invite.tip2')}</p>
                    </div>
                    <div className={`${styles.card_bgc} flex-x-cc`}>
                        <Form
                            name="nickname"
                            form={form}
                            className={`${styles.invite_form}`}
                            style={{ width: "100%" }}
                        // initialValues={{ inviteCode: inviteInfo.inviteCode||'', inviteLink: inviteInfo.inviteLink||'' }}
                        >
                            <p className={`font-16 font-w-400 mb-2_5 ${styles.title_color}`}>{t('invite.inviteCode')}</p>
                            <div className='flex-x align-center justify-between'>
                                <Form.Item 
                                    name="inviteCode" 
                                    className={`flex-1 ${styles.form_item}`}
                                    rules={[{ required: true, message: t('invite.inputInviteCode2') }]}
                                >
                                    <Input 
                                        className={`${styles.input_box} modal-input`}
                                        maxLength={25}
                                        placeholder={t('invite.inputInviteCode')}
                                        disabled={true}
                                    />
                                </Form.Item>
                                <div className="flex-x align-center ml-2">
                                    <Iconify 
                                        icon="icon-park-outline:copy"
                                        className='cursor-pointer' 
                                        size={18}
                                        onClick={() => {
                                            copyFn(inviteInfo?.inviteCode || '')
                                        }}
                                    />
                                    <button type='button' className='cursor-pointer ml-3'
                                        onClick={() => {
                                            setQRcodeOpen(true)
                                        }}
                                    >
                                        <img 
                                            src={isDayMode ? "/images/invite/qrcode_day.png" : "/images/invite/qrcode_dark.png"} 
                                            alt="invite_modal" 
                                            width={20} 
                                            height={20} 
                                        />
                                    </button>
                                </div>
                            </div>

                            <p className={`font-16 font-w-400 mb-2_5 ${styles.title_color}`}>{t('invite.inviteLink')}</p>
                            <Form.Item 
                                name="inviteLink" 
                                className={styles.form_item}
                                rules={[{ required: true, message: t('invite.inputInviteLink2') }]}
                            >
                                <div className="flex-x align-center">
                                    <Input 
                                        className={`${styles.input_box} modal-input flex-1`}
                                        maxLength={25}
                                        placeholder={t('invite.inputInviteLink')}
                                        disabled={true}
                                    />
                                    <Iconify 
                                        icon="icon-park-outline:copy"
                                        className='ml-2 cursor-pointer' 
                                        size={18}
                                        onClick={() => {
                                            copyFn(inviteInfo.inviteLink)
                                        }}
                                    />
                                </div>
                            </Form.Item>
                            
                            <Form.Item className={styles.form_item}>
                                <button 
                                    type='submit' 
                                    className={`default_btn w-full ${styles.invite_btn}`}
                                    onClick={onSubmit}
                                >
                                    {t('invite.inviteBtn')}
                                </button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
            <InviteQRcodeModal 
                open={qrcodeOpen} 
                qrcode={inviteInfo.inviteLink} 
                onCancel={() => setQRcodeOpen(false)} 
                onOk={() => setQRcodeOpen(false)} 
            />
        </>
    );
};

export default InviteBanner;