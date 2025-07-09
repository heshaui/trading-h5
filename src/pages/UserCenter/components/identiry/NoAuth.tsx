import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';

const NoAuth: React.FC = () => {
    const { t } = useLanguage('userCenter');
    return (
    
        <div className="py-6 px-4">
				<h3 className="leading-7 text-[20px] font-medium mb-4">{ t('safeCenter.identity') }</h3>
				
                 <div className="border-color border-[1px] p-4 mb-4">
                    <div className="text-[18px] leading-5 mt-1 font-medium mb-3 flex t">
                        标准身份认证  
                        <div className="text-[14px] text-[var(--text-color6)] ml-[10px] flex">
                            <img className="w-[20px] h-[20px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                            未认证
                        </div>
                    </div>
                    <div className="text-[12px] text-[var(--text-color6)] mb-5">仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险</div>
                    <div className="text-[18px] font-medium mb-[10px]">身份认证需要提供一下信息：</div>
                    <div className="flex ">
                        <div className="flex items-center tip_color">
                            <img className="w-[16px] h-[16px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                            基本信息
                        </div>
                        <div className="flex items-center tip_color">
                            <img className="w-[16px] h-[16px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                            基本信息
                        </div>

                    </div>

                 </div>
                <div className="flex pt-1 pb-3 leading-[25px] font-medium text-[18px]" >
                    <img className="w-[24px] h-[24px] mr-1" src="https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/05/14/35b050a0-d36f-403d-90b1-e678c8c03b5b.svg"></img>
                    认证权益
                </div>
                 <ul >
                    <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px]">
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">服务</span> 
                           <span>加密货币提现</span>
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[20px] flex justify-between">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">尚未认证</span> 
                           <Iconify icon="ep:circle-close-filled" className="text-[20px] text-[#a4a5ac]" />
                        </p>
                        <p className="text-[14px] font-medium leading-5 mb-[18px] flex justify-between ">
                           <span className="text-[12px] font-normal text-[var(--text-color6)]">完成标准身份认证后</span> 
                           <span>50K USDT每日</span>
                        </p>
                        
                    </li>
                    <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px]">
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
                    <li className="border-color border-[1px] px-2.5 mb-4 pt-[18px]">
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