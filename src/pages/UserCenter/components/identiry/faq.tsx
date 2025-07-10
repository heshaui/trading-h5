import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';

const Faq: React.FC = () => {
    const { t } = useLanguage('userCenter');
    return (

        <div className="border-color border-[1px] px-[10px] pt-[20px] rounded-[8px]"> 
            <p className="font-medium text-[18px] pb-4">常见问题</p>
                <ul>
                    <li className="pb-[20px]">
                        <div className="flex justify-between mb-2">
                            <div className="font-medium text-[14px]">什么是KYC验证？</div>
                            <div>
                                <Iconify icon="ep:circle-check-filled" className="text-[20px] text-[#00c788]" />
                            </div>
                        </div>
                        <div className="text-[12px] font-normal text-[var(--text-color6)]">
                            KYC (Know Your Customer)是一种身份验证和调查过程，旨在核实客户的身份信息和背景，以确保金融机构或服务提供商遵守反洗(AML) 和反恐怖融资(CFT) 法规。它有助于保证账户安全，减少欺诈和非法活勤的风险。
                        </div>
                    </li>
                    <li className="pb-[20px]">
                        <div className="flex justify-between mb-2">
                            <div className="font-medium text-[14px]">为什么我需要进行KYC 验证？</div>
                            <div>
                                <Iconify icon="ep:circle-check-filled" className="text-[20px] text-[#00c788]" />
                            </div>
                        </div>
                        <div className="text-[12px] font-normal text-[var(--text-color6)]">
                            KYC 是了保您的赈户安全和权益。保障您的身份信息和背景，防止他人冒用您的身份谁行欺菲或非法活勤。
                        </div>
                    </li>
                    <li className="pb-[20px]">
                        <div className="flex justify-between mb-2">
                            <div className="font-medium text-[14px]">身份验证遇到问题</div>
                            <div>
                                 <Iconify icon="ep:circle-check-filled" className="text-[20px] text-[#00c788]" />
                            </div>
                        </div>
                        <div className="text-[12px] font-normal text-[var(--text-color6)]">
                           如果您在 KYC 程中遇到任何问题，请向我们的客服寻求帮助。我们的客服团队将竭诚为您提供支持和解答。请提供具体问题和相关信息，以便我们能够更快速地帮助您完成认证。
                        </div>
                    </li>
                </ul>              
        </div> 

        );
};

export default Faq;