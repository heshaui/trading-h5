import React, { useState, useEffect } from 'react';

import { Toast, Popup, Image } from 'antd-mobile';

import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from "@/components/icon/index";
import { fileImg } from "@/services/open";
import { updateUserCenter } from '@/services/userCenter';
import {encryptData} from '@/utils/encrypt';
import CustomTab from '@/components/CustomCom/CustomTab';   

type Props = {
    open: boolean;
    userId: number;
    onOk: (bool: boolean) => void;
    onCancel: () => void;
};

interface AvatarItem {
    id: number;
    src: string;
    alt: string;
    type: string;
}
const initAvatarList: AvatarItem[] = [
    {
        id: 1,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 2,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 3,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar3.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 4,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar4.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 5,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar5.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 6,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar6.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 7,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar7.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 8,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar8.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 9,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar9.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 10,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar10.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 11,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar11.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 12,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar12.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 13,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar13.png',
        alt: 'avatar',
        type: 'female'
    },
    {
        id: 14,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar14.png',
        alt: 'avatar',
        type: 'male'
    },
    {
        id: 15,
        src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar15.png',
        alt: 'avatar',
        type: 'male'
    }
]

const AvartarList = () => {
    return (
        <div>
            <ul>
                <li></li>
            </ul>
        </div>
    )
}

const UploadAvatar = () => {
    return (
        <></>
    )
}

const AvatarUrlPopup: React.FC<Props> = ({ open, onCancel, userId, onOk }) => {
    const { t } = useLanguage('common');
    const tabsItems = [
		{
			key: '1',
			title: t('security.safeSet.loginRecord'),//'语言',
			children: <AvartarList />
		},
		{
			key: '2',
			title: t('security.safeSet.safeSetRecord'),//'语言',
			children: <UploadAvatar />
		},
	]
    return (
        <Popup
            visible={open}
            onClose={onCancel}
            closeOnMaskClick
            position='bottom'
            bodyStyle={{ 
                height: '60vh',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px' 
            }}
            bodyClassName="!bg-[var(--background5)] !text-[var(--text-color5)]"
        >
            <p className="flex justify-between items-center h-[50px] text-[14px] font-medium text-[var(--text-color5)] border-b broder-b-[var(--border-color6)] px-4">
                <span>{ t('usersetting.modifyAvatar') }</span>
                <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
            </p>
            <CustomTab
				tabsItems={ tabsItems }
				stretch={false}
				activeLineMode='fixed'
				className="safeTabs"
            />
            <div>
                <button></button>
                <button></button>
            </div>
        </Popup>
    )
}

export default AvatarUrlPopup;