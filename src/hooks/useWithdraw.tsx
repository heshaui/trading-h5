import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Modal, Toast, Image } from 'antd-mobile';
import { Iconify } from '@/components/icon';
import appStore from '@/store';
import Icon_NoWithdraw from "@/assets/images/assets/icon_nosm_2.png";
import WithdrawStatusPop from "@/components/withDrawStatusPop";

interface UserInfo {
    withdrawalStatus?: number;
    merchantWithdrawalStatus?: number;
    realnessStatus?: number;
    isGoogleAuth?: boolean;
    userLevel?: string;
}

export const useWithdraw = () => {
    const { t } = useLanguage('assets');
    const navigate = useNavigate();
    const [withdrawStatusPopOpen, setWithdrawStatusPopOpen] = useState(false);
    const goWithdraw = useCallback((userInfo?: UserInfo) => {
        // 如果没有传入 userInfo，从 store 获取
        const currentUserInfo = userInfo || appStore.getUserInfo();




        // 检查身份认证和安全设置
        // const needsKyc = currentUserInfo?.merchantWithdrawalStatus === 1 && currentUserInfo?.realnessStatus === 0;
        const needsKyc = currentUserInfo?.merchantWithdrawalStatus === 0&&currentUserInfo?.userLevel==='L0'
        const needsGoogleAuth = !currentUserInfo?.isGoogleAuth;

        if (needsKyc || needsGoogleAuth) {
            setWithdrawStatusPopOpen(true);
            return;
        }
        // 检查提现状态
        if (currentUserInfo?.withdrawalStatus !== 1||currentUserInfo?.merchantWithdrawalStatus !== 1) {
            // 显示禁止提现弹窗
            Modal.show({
                content: <>
                    <div className={`flex-y align-center justify-center title_color`}>
                        <Image src={Icon_NoWithdraw}
                            alt="logo" className={`icon_sm mr-6 mt-5`} />
                        <p className='flex-y-cc mb-10'>
                            <span className={` font-w-500 font-18`}>
                                {/* 禁止提现 */}
                                {t('assetsAccount.button.withdrawError')}
                            </span>
                            <span className={`font-w-500 font-12 mt-3`}>
                                {/* 交易所禁止提现，如有问题请与客服联系！ */}
                                {t('assetsAccount.button.tip3')}
                            </span>
                        </p>
                    </div>
                </>,
                closeOnMaskClick: true,
                showCloseButton: true,
            })
            return;
        }
        // 所有条件满足，跳转到提现页面
        navigate('/assets/withdraw');
    }, [navigate, t]);

    return {
        goWithdraw,
        withdrawStatusPopOpen,
        setWithdrawStatusPopOpen,
        WithdrawStatusPopComponent: () => (
            <WithdrawStatusPop
                open={withdrawStatusPopOpen}
                onClose={() => setWithdrawStatusPopOpen(false)}
            />
        )
    };
}; 