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
  userId: number;
  id: number;
  levelId: number;
  createTime: number;
  updateTime: number;
  tenantId: string;
  status: number;
  value: string;
  benefitId: number;
  benefitName: string;
  benefitValue: string;
  status0?: number;
  value0?: string;
  params0?: string;
  status1?: number;
  value1?: string;
  params1?: string;
  remark?: string;
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
  remark?: string;
}

interface NoAuthProps {
   identityInfo: infoType;
   levelBenefit: levelBenefitType[];
}

const NoAuth: React.FC<NoAuthProps> = () => {
    const { t } = useLanguage('userCenter');
    return (
    
        <div className="py-6 px-4">
				<h3 className="leading-7 text-[20px] font-medium mb-4">{ t('safeCenter.identity') }</h3>
				
                 <div className="border-color border-[1px] p-4 mb-4 rounded-[8px]">
                    <div className="text-[18px] leading-5 mt-1 font-medium mb-3 flex t">
                        {/* 标准身份认证 */}
                        {t("identity.standardAuth.title")} 
                        <div className="text-[14px] text-[var(--text-color6)] ml-[10px] flex">
                           <Iconify
                    icon="mingcute:safe-alert-line" className="w-[20px] h-[20px] mr-1" size={20} />
                                             
                        {/* 未认证 */}
                        {t("identity.status.unverified")}
                        </div>
                    </div>
                    <div className="text-[12px] text-[var(--text-color6)] mb-5">
                     <Iconify icon="emojione-monotone:small-blue-diamond" className="" size={20}/>
                  
                        {/* 仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险 */}
                        {t("identity.standardAuth.unverifiedTip")}
                     </div>
                    <div className="text-[18px] font-medium mb-[10px]">
                        {/* 身份认证需要提供一下信息： */}
                        {t("identity.standardAuth.requiredInfo")}
                     </div>
                    <div className="flex ">
                        <div className="flex items-center text-[var(--text-color6)]">
                            <img className="w-[16px] h-[16px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                            <span>
                              {/* 基本信息 */}
                              {t("identity.standardAuth.basicInfo")}
                           </span>
                        </div>
                        <div className="flex items-center text-[var(--text-color6)] ml-5">
                           <img className="w-[16px] h-[16px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                           <span>
                              {/* 身份认证 */}
                              {t("identity.standardAuth.idVerification")}
                           </span>
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <button type="button" className="min-w-[78px] h-[28px] justify-center items-center rounded-[53px] default_btn">
                           {/* 去认证 */}
                           {t("identity.button.goVerify")}
                        </button>
                        <img className="w-[60px] h-[54px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                     </div>

                 </div>

                  <div className="flex pt-1 pb-3 leading-[25px] font-medium text-[18px]" >
                     <img className="w-[24px] h-[24px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                     {/* 认证权益 */}
                     {t("identity.benefits.title")}
                  </div>
                 <ul >
                    <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px] rounded-[8px]">
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">
                              {/* 服务 */}
                              {t("identity.benefits.service")}
                           </span> 
                           <span>加密货币提现</span>
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">
                              {/* 尚未认证 */}
                              {t("identity.benefits.unverified")}
                           </span> 
                           <Iconify icon="ep:circle-close-filled" className="text-[20px] text-[#a4a5ac]" />
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">
                              {/* 完成标准身份认证后 */}
                              {t("identity.benefits.afterVerification")}
                           </span> 
                           <span>50K USDT每日</span>
                        </p>
                        
                    </li>
                    <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px] rounded-[8px]">
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">服务</span> 
                           <span>加密货币提现</span>
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">尚未认证</span> 
                           <Iconify icon="ep:circle-close-filled" className="text-[20px] text-[#a4a5ac]" />
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">完成标准身份认证后</span> 
                           <Iconify icon="ep:circle-check-filled" className="text-[20px] text-[#00c788]" />
                        </p>
                        
                    </li>
                    <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px] rounded-[8px]">
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">服务</span> 
                           <span>加密货币提现</span>
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">尚未认证</span> 
                           <Iconify icon="ep:circle-close-filled" className="text-[20px] text-[#a4a5ac]" />
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">完成标准身份认证后</span> 
                           <Iconify icon="ep:circle-check-filled" className="text-[20px] text-[#00c788]" />
                        </p>
                        
                    </li>
                 </ul>

			</div>
    );
};

export default NoAuth;