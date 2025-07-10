import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';


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

export const getBenefitValue = (text: string) => {
    let text1 = JSON.parse(text);
    const amount = Number(text1.amountLimit);
    let amountRes = '';
    if (!isNaN(amount) && amount > 1000) {
        // 去掉末尾三个 0 并添加 'K' 后缀
        amountRes = (amount / 1000).toString() + 'K';
    } else {
        amountRes = amount.toString();
    }
    return `${amountRes} ${text1.coin} ${text1.time}h`
}


// const Auth: React.FC = () => {
//     const { t } = useLanguage('userCenter');
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
        // {
        //     label: t('identity.certified.idTypes.hkMacauPass'), // 港澳通行证
        //     value: '3'
        // },
        // {
        //     label: t('identity.certified.idTypes.taiwanPass'), // 台湾通行证
        //     value: '4'
        // },
        // {
        //     label: t('identity.certified.idTypes.taiwanId'), // 台湾身份证
        //     value: '5'
        // },
        // {
        //     label: t('identity.certified.idTypes.foreignerId'), // 外国人永久居住身份证
        //     value: '6'
        // }
    ]
    // const getBenefitValue = (text: string) => {
    //     let text1 = JSON.parse(text);
    //     const amount = Number(text1.amountLimit);
    //     let amountRes = '';
    //     if (!isNaN(amount) && amount > 1000) {
    //         // 去掉末尾三个 0 并添加 'K' 后缀
    //         amountRes=(amount / 1000).toString() + 'K';
    //     }else{
    //         amountRes = amount.toString();
    //     }
    //     return `${amountRes} ${text1.coin} ${text1.time}h`

    // }
    const lableShow = (key: string) => {
        console.log(key,999);
        
        if(key==='cyptocurrency_withdrawal'){
            return t('identity.withdrawal')
        } else if (key === 'cyptocurrency_recharge') {
            return t('identity.recharge')
        } else {
            return key||'--'
        }
        
    }

    return (
                    <div className="py-6 px-4">
                        <h3 className="leading-7 text-[20px] font-medium mb-4">{ t('safeCenter.identity') }</h3>
                        
                         <div className="border-color border-[1px] p-4 mb-4 rounded-[8px]">
                            <div className="text-[18px] leading-5 mt-1 font-medium mb-3 flex t">
                                {/* 标准身份认证 */}
                                {t('identity.standardAuth.title')}    
                                <div className="text-[14px] text-[var(--text-color6)] ml-[10px] flex">
                                    <Iconify icon="mingcute:safety-certificate-line" className="w-[20px] h-[20px] mr-1" size={20} />
                                    {/* 已认证 */}
                                    {t('identity.status.verified')}
                                </div>
                            </div>

                            
                            <div className="flex justify-between items-end">
                                <div className="text-[12px] text-[var(--text-color6)] mb-5">
                                    <Iconify icon="emojione-monotone:small-blue-diamond" className="" size={20} />
                                    {/* 已完成身份认证，开始您的货币之旅吧！ */}
                                    {t('overview.identityAuth.verified')}
                                </div>
                                <img className="w-[60px] h-[54px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                             </div>
        
                         </div>
                        <div className="flex pt-1 pb-3 leading-[25px] font-medium text-[18px]" >
                            <img className="w-[24px] h-[24px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
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
                                {/* <p className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between">
                                   <span className="text-[12px] font-normal text-[var(--text-color6)]">加密货币充值</span> 
                                   <span>允许</span>
                                </p>
                                <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                                   <span className="text-[12px] font-normal text-[var(--text-color6)]">C2C交易</span> 
                                   <span>禁止</span>
                                </p> */}
                                
                            </li>
                            ))}
                         </ul>


                         <div className="flex pt-1 pb-3 leading-[25px] font-medium text-[18px]" >
                            <img className="w-[24px] h-[24px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                            {/* 个人信息 */}
                            {t('identity.certified.personalInfo')}
                        </div>
                         <ul >
                            <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px] rounded-[8px]">
                                <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                                   <span className="text-[12px] font-normal text-[var(--text-color6)]">
                                    {/* 真实姓名 */}
                                    {t('identity.certified.info.realName')}</span> 
                                   <span>{'**'}&nbsp;{identityInfo?.firstName}</span>
                                </p>
                                <p className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between">
                                   <span className="text-[12px] font-normal text-[var(--text-color6)]">
                                        {/* 证件类型 */}
                                        {t('identity.certified.info.idType')}
                                    </span> 
                                   <span>{cardTypeSeelect.find(item => item.value === identityInfo?.cardType.toString())?.label}</span>
                                </p>
                                <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                                   <span className="text-[12px] font-normal text-[var(--text-color6)]">
                                        {/* 国家 */}
                                        {t('identity.certified.info.country')}
                                    </span> 
                                   <span>
                                        {identityInfo?.countryId === 1 ?
                                        t('identity.certified.info.countries.mainland') :
                                        t('identity.certified.info.countries.hongkong')}
                                    </span> 
                                </p>
                                <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                                   <span className="text-[12px] font-normal text-[var(--text-color6)]">
                                        {/* 证件号 */}
                                        {t('identity.certified.info.idNumber')}
                                    </span> 
                                   <span>
                                    {/* {encryptIdCard(identityInfo?.cardCode)} */}
                                        12345667
                                   </span>
                                </p>
                                
                            </li>
                            
                         </ul>
        
                    </div>
    );
};

export default Auth;

export type { infoType, levelBenefitType }