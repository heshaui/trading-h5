import React, {useState, useEffect, useMemo} from 'react';
import {Popup, Image} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage, useTheme } from '@/hooks';
import { Position as DataType } from "@/pages/Contract/components/ContractOrder/hooks";
import { Side, SideMap, Type, PositionType, Open, Status, TypeMap, PositionTypeMap } from '@/pages/Contract/components/ContractOrder/configs/columns';
import { BigNumber } from 'bignumber.js';
import appStore from '@/store';
import dayjs from 'dayjs';
import { QRCode, Checkbox } from "antd";

import ShareDark from '@/assets/images/contract/share-dark.png';
import ShareLight from '@/assets/images/contract/share-light.png';
import ShareIcon from '@/assets/images/contract/share-icon.png';

type Props = {
  open: boolean;
  data: DataType;
  onConfirm: () => void;
  onCancel: () => void;
};

const SharePopup:React.FC<Props> = ({open, onConfirm, onCancel, data}) => {
    const {t} = useLanguage('contract');
    const { isDark } = useTheme();
    // 获取当前合约信息
	const currentContractInfo = appStore.getCurrentContractInfo();
	const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;
    const userInfo = appStore.getUserInfo();
    const [inviteInfo, setInviteInfo] = useState({
        inviteCode: '',
        inviteLink: ''
    });
    const [showAccount, setShowAccount] = useState(false);

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
    return (
        <Popup
            visible={open}
            onClose={onCancel}
            closeOnMaskClick
            destroyOnClose
            position="bottom"
            bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
            bodyClassName={`!h-auto !bg-[var(--background17)] !text-[var(--text-color5)]`}
        >
            <div className="px-4 pt-[30px] pb-[20px]">
                <div className="leading-[22px] text-[16px] font-medium mb-1">{data.symbol || '--'}</div>
                <div className="flex items-center text-[12px] font-medium leading-[17px] tip-color mb-[6px]">
                    <span
                        className={`
                            ${data.orderSide === Side.BUY ? 'success_icon' : 'error_icon'}
                        `}
                    >
                        {t(SideMap[data.orderSide])}
                    </span>
                    <span className="h-[13px] px-[6px] border-r border-l border-color mx-[6px]">{data.leverageLevel ?? 1}x</span>
                    <span>{t(PositionTypeMap[data.positionType])}</span>
                </div>
                <div className="leading-[17px] text-[12px] theme-color mb-1">{t('order.shareModal.tip')}</div>
                <div className="flex mb-[20px] justify-between">
                    <div className="flex-1 mr-[9px] pt-4">
                        <div className="flex-col gap-y-[4px] mb-[30px]">
                            <span className="text-[14px] tip-color leading-[20px]">{t('order.positionColumn.returnRate')}</span>
                            <span
                                className={`text-[32px] font-[700] leading-[39px]
                                    ${data.returnRate > 0 ? 'success_icon' : data.returnRate < 0 ? 'error_icon' : ''}
                                `}
                            >{data.returnRate > 0 ? '+' : data.returnRate < 0 ? '-' : ''}{new BigNumber(data.returnRate).toFormat(2)}%</span>
                        </div>
                        <div className="flex justify-between mb-[20px]">
                            <p className="flex flex-col gap-y-[4px] text-[14px]">
                                <span className="tip-color">{t('order.positionColumn.openAvgPrice')}</span>
                                <span className="font-medium">{new BigNumber(data.openAvgPrice).toFormat(symbolPricePrecision)}</span>
                            </p>
                            <p className="flex flex-col gap-y-[4px] text-[14px]">
                                <span className="tip-color">{t('order.positionColumn.reducePrice')}</span>
                                <span className="font-medium">{new BigNumber(data.reducePrice).toFormat(symbolPricePrecision)}</span>
                            </p>
                        </div>
                        <div className="leading-[17px] text-[12px] tip-color">{dayjs().format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                    <Image 
                        src={isDark ? ShareDark : ShareLight}
                        alt=""
                        className="w-[190px] h-[190px] shrink-0" 
                    />
                </div>
                <div className="px-4 py-3 rounded-[8px] bg-[var(--background14)] flex justify-between items-center mb-[20px]">
                    <div className="flex gap-x-[8px]">
                        <Image 
                            src={ShareIcon}
                            alt=""
                            className="w-[36px] h-[36px]" 
                        />
                        <div className="flex-col text-[14px]">
                            <span className="leading-[20px] mb-[2px] font-medium">IMBIT</span>
                            <span className="tip-color">{t('order.shareModal.inviteCode')} {inviteInfo.inviteCode}</span>
                        </div>
                    </div>
                    <QRCode
                        className="min-w-[58px] min-h-[58px] !bg-[#fff] p-[4px]"
                        value={`${inviteInfo.inviteLink || ""}`}
                        size={58}
                    />              
                </div>
                <Checkbox 
                    className="mb-[30px] custom-checkbox" 
                    checked={showAccount}
                    onChange={e => setShowAccount(e.target.checked)}
                >
                    <p className="text-[14px] text-[var(--text-color5)]">
                        {/* 不再提醒,可在交易设置中，开启或关闭提示。 */}
                        {t('order.shareModal.showAccount')}
                    </p>
                </Checkbox>
                <button
                    type="button"
                    className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mt-[30px] rounded-[25px]
                        bg-[var(--theme-color)]
                    `}
                    onClick={onConfirm}
                >{t('order.shareModal.save')}</button>
                <button
                    type="button"
                    className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mt-[10px] rounded-[25px]
                        bg-[var(--background14)]
                    `}
                    onClick={onCancel}
                >{t('order.shareModal.cancel')}</button>
            </div>
        </Popup>
    )
}

export default SharePopup;