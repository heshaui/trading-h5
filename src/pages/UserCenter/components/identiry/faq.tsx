import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { motion, AnimatePresence } from "framer-motion";

interface ItemType {
    key: string;
    label: string;
    content: string;
}

const Faq: React.FC = () => {
    const { t } = useLanguage('userCenter');
    const [activeMap, setActiveMap] = useState<Record<string, boolean>>({})

    // 隐藏/显示
    const toggleItem = (key: string) => {
        setActiveMap(prev => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const itemList: ItemType[] = [
        {
            key: '1',
            label: t('identity.title1'), // 什么是KYC验证？
            content: t('identity.content1'), // KYC (Know Your Customer)是一种身份验证和调查过程，旨在核实客户的身份信息和背景，以确保金融机构或服务提供商遵守反洗(AML) 和反恐怖融资(CFT) 法规。它有助于保证账户安全，减少欺诈和非法活勤的风险。
        },
        {
            key: '2',
            label: t('identity.title2'), // 为什么我需要进行KYC 验证？
            content: t('identity.content2'), // KYC 是了保您的赈户安全和权益。保障您的身份信息和背景，防止他人冒用您的身份谁行欺菲或非法活勤。
        },
        {
            key: '3',
            label: t('identity.title3'), // 身份验证遇到问题，如何获取帮助？
            content: t('identity.content3'), // 如果您在 KYC 程中遇到任何问题，请向我们的客服寻求帮助。我们的客服团队将竭诚为您提供支持和解答。请提供具体问题和相关信息，以便我们能够更快速地帮助您完成认证。
        },
    ];

    return (
        <div className="border-color border-[1px] px-[10px] pt-[20px] rounded-[8px] mt-5"> 
            <p className="font-medium text-[18px] pb-4">常见问题</p>
            <ul>
                {itemList.map((item: ItemType) => (
                    <li className="pb-[20px]">
                        <div className="flex justify-between mb-2">
                            <h4 className="font-medium text-[14px]">{ item.label }</h4>
                            <div>
                                <Iconify 
                                    icon={ activeMap[item.key] ? "icon-park-solid:up-one" : "icon-park-solid:down-one"}
                                    className='text-[20px] text-[#a4a5ac]'
                                    onClick={() => toggleItem(item.key)}
                                />
                            </div>
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key="content"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="text-[12px] font-normal text-[var(--text-color6)]"
                                >
                                    {item.content}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </li>
                ))}
            </ul>              
        </div> 

        );
};

export default Faq;