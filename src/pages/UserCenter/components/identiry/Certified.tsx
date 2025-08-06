import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { encryptIdCard, getBenefitValue } from '@/utils/encrypt';

import { ReactComponent as IdentifyIcon } from '@/assets/images/userCenter/identity/icon_Identity.svg';
import { ReactComponent as AccountIcon } from '@/assets/images/userCenter/identity/icon_account.svg';
import { ReactComponent as IDCardIcon } from '@/assets/images/userCenter/identity/icon_IDcard.svg'


interface ButtonConfig {
    title: string;
    onok?: () => void;
    onbind?: () => void;
}

interface textType {
    amountLimit: number;
    coin: string;
    time: number;
}
interface levelBenefitType {
    id: number;
    levelId: number;
    createTime: number;
    updateTime: number;
    tenantId: string;
    status: number;
    // value: textType;
    value: string;
    benefitId: number;
    benefitName: string;
    benefitValue:string
    status0?: number;
    value0?: string;
    params0?: string;
    status1?: number;
    value1?: string;
    params1?: string;
}
interface infoType {
    id: number;
    userId: number;
    surname: string;
    firstName: string;
    countryId: number;
    cardType: number;
    cardCode: string;
    cardName: string;
    birthday: string;
    currentLanguage: string;
    firstCheckTime: number;
    currentCheckTime: number;
    authStatus: number;
    frontUrl: string;
    backUrl: string;
    selfieUrl: string;
    createTime: number;
    updateTime: number;
    tenantId: string;

}

const Auth: React.FC<{ identityInfo: infoType, levelBenefit: levelBenefitType[] }> = ({ identityInfo, levelBenefit }) => {
    const { t } = useLanguage(['userCenter']);

    const cardTypeSeelect: { label: string, value: string }[] = [
        {
            label: t('identity.certified.idTypes.idCard'), // 居民身份证
            value: '1'
        },
        {
            label: t('identity.certified.idTypes.passport'), // 普通护照
            value: '2'
        },
        {
            label: t('identity.certified.idTypes.driverLicense'), // 驾驶证
            value: '3'
        },
    ]

    const lableShow = (key: string) => {
        if(key==='cyptocurrency_withdrawal'){
            return t('identity.withdrawal')
        } else if (key === 'cyptocurrency_recharge') {
            return t('identity.recharge')
        } else {
            return key||'--'
        }
        
    }

    return (
        <div>
            <div className="border-color border-[1px] p-4 mb-4 rounded-[8px] relative">
                <div className="text-[18px] leading-5 mt-1 font-medium mb-3 flex items-center">
                    {/* 标准身份认证 */}
                    <div>{t('identity.standardAuth.title')}</div> 
                    <div className="text-[14px] text-[var(--text-color6)] ml-[10px] flex items-center">
                        <Iconify icon="mingcute:safety-certificate-line" className="text-[20px] success_icon mr-1" />
                        {/* 已认证 */}
                        {t('identity.status.verified')}
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <div className="text-[12px] text-[var(--text-color6)] mb-5 max-w-[209px]">
                        <Iconify icon="emojione-monotone:small-blue-diamond" className="text-[20px] error_icon" />
                        {/* 已完成身份认证，开始您的货币之旅吧！ */}
                        {t('overview.identityAuth.verified')}
                    </div>
                </div>
                <IdentifyIcon className="absolute bottom-[-20px] right-[-14px] w-[120px] h-[114px]" />
            </div>
            <div className="flex pt-1 pb-3 leading-[25px] font-medium text-[18px]" >
                <AccountIcon className="w-[24px] h-[24px] mr-1" />
                {/* 账户权益 */}
                {t('identity.certified.accountBenefits')}
            </div>
            <ul >
                {levelBenefit && levelBenefit.map((item: levelBenefitType) => (
                <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px] rounded-[8px]" key={item.benefitId}>
                    <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                        <span className="text-[12px] font-normal text-[var(--text-color6)]">{lableShow(item.benefitValue)}</span> 
                        <span>{
                            item.status1 === 0 ?
                                t('identity.certified.forbidden') : // 禁止
                                (item.value1 && item.params1) ? getBenefitValue(item.value1) : t('identity.certified.allow') // 允许
                        }</span>
                    </p>
                </li>
                ))}
            </ul>
            <div className="flex pt-1 pb-3 leading-[25px] font-medium text-[18px]" >
                <IDCardIcon className="w-[24px] h-[24px] mr-1" />
                {/* 个人信息 */}
                {t('identity.certified.personalInfo')}
            </div>
            <ul className="border-color border-[1px] px-2.5 mb-4 pt-[18px] rounded-[8px]">
                <li className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                    <span className="text-[12px] font-normal text-[var(--text-color6)]">
                    {/* 真实姓名 */}
                    {t('identity.certified.info.realName')}</span> 
                    <span>{'**'}&nbsp;{identityInfo?.firstName}</span>
                </li>
                <li className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between">
                    <span className="text-[12px] font-normal text-[var(--text-color6)]">
                        {/* 证件类型 */}
                        {t('identity.certified.info.idType')}
                    </span> 
                    <span>{cardTypeSeelect.find(item => item.value === identityInfo?.cardType.toString())?.label}</span>
                </li>
                <li className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                    <span className="text-[12px] font-normal text-[var(--text-color6)]">
                        {/* 国家 */}
                        {t('identity.certified.info.country')}
                    </span> 
                    <span>
                        {identityInfo?.countryId === 1 ?
                        t('identity.certified.info.countries.mainland') :
                        t('identity.certified.info.countries.hongkong')}
                    </span> 
                </li>
                <li className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                    <span className="text-[12px] font-normal text-[var(--text-color6)]">
                        {/* 证件号 */}
                        {t('identity.certified.info.idNumber')}
                    </span> 
                    <span>
                        {encryptIdCard(identityInfo?.cardCode)}
                    </span>
                </li>
            </ul>
        </div>
    );
};

export default Auth;