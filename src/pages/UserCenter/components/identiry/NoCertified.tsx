import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { getBenefitValue } from "@/utils/encrypt";
import { useNavigate } from 'react-router-dom';
import IdentifyStatus from '../overview/UserInfo/IdentifyStatus';

import { ReactComponent as IdentifyIcon } from '@/assets/images/userCenter/identity/icon_Identity.svg';
import { ReactComponent as RightsIcon } from '@/assets/images/userCenter/identity/icon_rights.svg';

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

const NoAuth: React.FC<NoAuthProps> = ({identityInfo, levelBenefit}) => {
   const { t } = useLanguage('userCenter');
   const navigate = useNavigate();

   const goReAuth = (authStatus: number) => {
      localStorage.setItem("identity_authStatus", authStatus.toString());
      navigate(`/userCenter/identity/info?userId=${identityInfo.userId}&authStatus=${authStatus}`)
   };

   const btnText = () => {
      switch (identityInfo?.authStatus) {
         case 2: return t("identity.button.goVerify");
         case 0: return t("identity.button.reVerify");
         case 3: return t("identity.button.reviewing");
      }
   }

   const lableShow = (key: string) => {
      if (key === "cyptocurrency_withdrawal") {
         return t("identity.withdrawal");
      } else if (key === "cyptocurrency_recharge") {
         return t("identity.recharge");
      } else {
         return key || "--";
      }
   };

   return (
      <div>
         <div className="border-color border-[1px] p-4 mb-4 rounded-[8px] relative">
            {/* 认证标题 */}
            <div className="text-[18px] leading-5 mt-1 font-medium mb-3 flex items-center">
               {/* 标准身份认证 */}
               {t("identity.standardAuth.title")} 
               {/* <div className="text-[14px] text-[var(--text-color6)] ml-[10px] flex">
                  <Iconify
                  icon="mingcute:safe-alert-line" className="w-[20px] h-[20px] mr-1" size={20} />
                  {t("identity.status.unverified")}
               </div> */}
               <IdentifyStatus realnessStatus={identityInfo?.authStatus} textClassName={identityInfo?.authStatus === 2 ? 'tip-color' : 'text-[var(--text-color5)]' } />
            </div>
            {/* 认证状态-未认证 */}
            {identityInfo && identityInfo?.authStatus === 2 && (
               <>
                  <div className="text-[12px] text-[var(--text-color6)] mb-5">
                     <Iconify icon="emojione-monotone:small-blue-diamond" className="error_icon text-5" />
               
                     {/* 仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险 */}
                     {t("identity.standardAuth.unverifiedTip")}
                  </div>
                  <div className="text-[18px] font-medium mb-[10px]">
                     {/* 身份认证需要提供一下信息： */}
                     {t("identity.standardAuth.requiredInfo")}
                  </div>
                  <div className="flex">
                     <div className="flex items-center text-[var(--text-color6)]">
                        <Iconify icon="icon-park-outline:id-card" className="tip-color text-4" />
                        <span className="ml-1 text-[14px]">
                           {/* 基本信息 */}
                           {t("identity.standardAuth.basicInfo")}
                        </span>
                     </div>
                     <div className="flex items-center text-[var(--text-color6)] ml-5">
                        <Iconify icon="lucide:id-card" className="tip-color text-5" />
                        <span className="ml-1 text-[14px]">
                           {/* 身份认证 */}
                           {t("identity.standardAuth.idVerification")}
                        </span>
                     </div>
                  </div>
               </>
            )}
            {/* 认证状态-重新认证 */}
            {identityInfo && identityInfo?.authStatus === 0 && (
               <div
                className={`font-14 font-w-400 mt-3 tip-color flex align-start`}
               >
                  {!identityInfo?.remark ? (
                     <div className="flex align-center">
                        <Iconify
                           icon="emojione-monotone:small-blue-diamond"
                           className="error_icon text-[20px]"
                        />
                        --
                     </div>
                  ) : identityInfo.remark.includes("&") ? (
                     <>
                     <Iconify
                        icon="emojione-monotone:small-blue-diamond"
                        className="error_icon text-[20px]"
                     />
                     <span>{identityInfo.remark.split("&")[0]}</span>
                     </>
                  ) : (
                     <>
                        <Iconify
                           icon="emojione-monotone:small-blue-diamond"
                           className="error_icon text-[20px]"
                        />
                        <span>{identityInfo.remark}</span>
                     </>
                  )}
              </div>
            )}
            {/* 认证状态-审核中 */}
            {identityInfo && identityInfo?.authStatus === 3 && (
               <div className={`font-14 font-w-400 mt-3 tip-color`}>
                  <Iconify
                     icon="emojione-monotone:small-blue-diamond"
                     className="error_icon text-[20px]"
                  />
                  {/* 仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险 */}
                  {t("identity.standardAuth.unverifiedTip")}
               </div>
            )}
            <div className="flex justify-between items-end mt-[30px]">
               <button 
                  type="button" 
                  className="min-w-[78px] h-[28px] justify-center items-center rounded-[53px] default_btn"
                  onClick={() => goReAuth(identityInfo.authStatus)}
               >
                  {btnText()}
               </button>
            </div>
            <IdentifyIcon className="absolute bottom-[-20px] right-[-14px] w-[120px] h-[114px]" />
         </div>

         <div className="flex pt-1 pb-3 leading-[25px] font-medium text-[18px]" >
            <RightsIcon className="w-[24px] h-[24px] mr-1"  />
            {/* 认证权益 */}
            {t("identity.benefits.title")}
         </div>
         <ul>
            {
               levelBenefit && levelBenefit.length > 0 && levelBenefit.map((item: levelBenefitType) => (
                  <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px] rounded-[8px]">
                     <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">
                              {/* 服务 */}
                              {t("identity.benefits.service")}
                           </span> 
                           <span>{lableShow(item.benefitValue)}</span>
                     </p>
                     <p className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between">
                        <span className="text-[12px] font-normal text-[var(--text-color6)]">
                           {/* 尚未认证 */}
                           {t("identity.benefits.unverified")}
                        </span> 
                        {
                           item.status0 === 0 ? <Iconify icon="ep:circle-close-filled" className="text-[20px] text-[#a4a5ac]" /> :
                           item.value0 ? <span>
                              {item.value0 && item.params0
                              ? getBenefitValue(item.value0)
                              : item.value0}
                           </span> :
                           <Iconify icon="ep:circle-check-filled" className="text-[20px] text-[#00c788]" />
                        }
                     </p>
                     <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                        <span className="text-[12px] font-normal text-[var(--text-color6)]">
                           {/* 完成标准身份认证后 */}
                           {t("identity.benefits.afterVerification")}
                        </span> 
                        {
                           item.status1 === 0 ? <Iconify icon="ep:circle-close-filled" className="text-[20px] text-[#a4a5ac]" /> :
                           item.value1 ? <span>
                              {item.value1 && item.params0
                              ? getBenefitValue(item.value1)
                              : item.value1}
                           </span> :
                           <Iconify icon="ep:circle-check-filled" className="text-[20px] text-[#00c788]" />
                        }
                     </p>
                  </li>
               ))
            }
         </ul>
      </div>
   );
};

export default NoAuth;