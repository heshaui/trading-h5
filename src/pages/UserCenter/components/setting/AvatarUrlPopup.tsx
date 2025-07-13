import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Upload } from 'antd';
import type { UploadProps } from 'antd';
import { Toast, Popup, Image, Segmented, ProgressCircle } from 'antd-mobile';

import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { Iconify } from "@/components/icon/index";
import { fileImg } from "@/services/open";
import { updateUserCenter } from '@/services/userCenter';
import { encryptData } from '@/utils/encrypt';
import CustomTab from '@/components/CustomCom/CustomTab';

import iconAvatarDark from '@/assets/images/userCenter/overview/icon_avatarUrl_dark.png';
import iconAvatarLight from '@/assets/images/userCenter/overview/icon_avatarUrl_day.png';

type Props = {
  open: boolean;
  userId: number;
  currentAvatar?: string;
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
  { id: 1, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png', alt: 'avatar', type: 'male' },
  { id: 2, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png', alt: 'avatar', type: 'female' },
  { id: 3, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar3.png', alt: 'avatar', type: 'male' },
  { id: 4, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar4.png', alt: 'avatar', type: 'male' },
  { id: 5, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar5.png', alt: 'avatar', type: 'female' },
  { id: 6, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar6.png', alt: 'avatar', type: 'female' },
  { id: 7, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar7.png', alt: 'avatar', type: 'male' },
  { id: 8, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar8.png', alt: 'avatar', type: 'female' },
  { id: 9, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar9.png', alt: 'avatar', type: 'male' },
  { id: 10, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar10.png', alt: 'avatar', type: 'male' },
  { id: 11, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar11.png', alt: 'avatar', type: 'female' },
  { id: 12, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar12.png', alt: 'avatar', type: 'male' },
  { id: 13, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar13.png', alt: 'avatar', type: 'female' },
  { id: 14, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar14.png', alt: 'avatar', type: 'male' },
  { id: 15, src: 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar15.png', alt: 'avatar', type: 'male' },
];

const AvatarUrlPopup: React.FC<Props> = ({ open, onCancel, userId, onOk, currentAvatar }) => {
  const { t } = useLanguage(['common']);
  const { isDark } = useTheme();

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);
  const [fileUrl, setFileUrl] = useState<string>(currentAvatar || '');
  const [selectedType, setSelectedType] = useState<'upload' | 'default' | null>(null);
  const [imageTypeValue, setImageTypeValue] = useState<string | number>('all');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(50);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log(currentAvatar)
    setSelectedAvatar(currentAvatar || null);
    setFileUrl(currentAvatar || '');

    if (currentAvatar) {
      // 判断是默认头像还是上传头像
      const isDefault = initAvatarList.some((item) => item.src === currentAvatar);
      setSelectedType(isDefault ? 'default' : 'upload');
    } else {
      setSelectedType(null);
    }
  }, [open, currentAvatar]);

  const getCurrentAvatar = () => {
    if (selectedType === 'upload' && fileUrl) return fileUrl;
    if (selectedType === 'default' && selectedAvatar) return selectedAvatar;
    return isDark ? iconAvatarDark : iconAvatarLight;
  };
  
  // 默认图片列表
  const siftAvatarList = useMemo(() => {
    if (imageTypeValue === 'all') return initAvatarList;
    return initAvatarList.filter((item) => item.type === imageTypeValue);
  }, [imageTypeValue]);

  // 默认图片选中
  const handleAvatarClick = (item: AvatarItem) => {
    if (selectedType === 'default' && selectedAvatar === item.src) {
      setSelectedAvatar(null);
      setSelectedType(null);
    } else {
      setSelectedAvatar(item.src);
      setSelectedType('default');
      setFileUrl('');
    }
  };

  // 删除上传的图片
  const handleDeleteImage = () => {
    setFileUrl('');
    setSelectedAvatar(null);
    setSelectedType(null);
  };

  const handCancel = () => onCancel();
  
  const handOk = async () => {
    if (!fileUrl && !selectedAvatar) {
      Toast.show({ icon: 'fail', content: t('usersetting.selectAvatar') });
      return;
    }

    try {
      const params = {
        avatarUrl: selectedType === 'upload' ? fileUrl : selectedAvatar,
      };

      const encrypted = await encryptData(params);
      await updateUserCenterApi(encrypted);
    } catch (err) {
      Toast.show({ icon: 'fail', content: String(err) });
    }
  };

  // 上传开始计时
  const startUpload = () => {
     setUploadProgress(50);
    // 清除已有定时器（避免重复）
    if (intervalRef.current) clearInterval(intervalRef.current);

    // 从当前值开始+1
    intervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 98) {
          return prev + 1;
        } else {
          // 防止无限增长
          return prev;
        }
      });
    }, 100);
  };

  // 上传成功消除定时器
  const finishUpload = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setUploadProgress(100);
  };

  const updateUserCenterApi = async (params: any) => {
    try {
      const res = await updateUserCenter(params);
      if (res.code === '0') {
        Toast.show({ icon: 'success', content: t('usersetting.avatarSuccess') });
        onOk(true);
        onCancel();
      } else {
        Toast.show({ icon: 'fail', content: res.message });
      }
    } catch (error) {
      Toast.show({ icon: 'fail', content: String(error) });
    }
  };

  const uploadProps: UploadProps = {
    showUploadList: false,
    maxCount: 1,
    beforeUpload: (file) => {
      const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
      const isAllowed = allowedTypes.includes(file.type);
      if (!isAllowed) {
        Toast.show({ icon: 'fail', content: `${file.name} ${t('usersetting.invalidFileType')}` });
      }
      return isAllowed || Upload.LIST_IGNORE;
    },
    customRequest: async ({ file }) => {
      setUploadLoading(true);
      startUpload()
      try {
        const res = await fileImg(file as File);
        if (res.code === '0') {
          setFileUrl(res.data.data);
          setSelectedType('upload');
          setSelectedAvatar(null);
        } else {
          Toast.show({ icon: 'fail', content: res.message });
        }
        setUploadLoading(false);
        finishUpload();
      } catch (error) {
        Toast.show({ icon: 'fail', content: String(error) });
        setUploadLoading(false);
        finishUpload();
      }
    },
  };
  
  // 默认列表
  const AvartarList = () => (
    <div>
      <Segmented
        options={[
          { label: t('usersetting.avatarFilter.all'), value: 'all' },
          { label: t('usersetting.avatarFilter.male'), value: 'male' },
          { label: t('usersetting.avatarFilter.female'), value: 'female' },
        ]}
        value={imageTypeValue}
        onChange={(value) => setImageTypeValue(value)}
        className="avatarSegmented"
      />
      <ul className="grid grid-cols-5 gap-y-[10px] gap-x-[13px]">
        {siftAvatarList.map((item) => (
          <li
            key={item.id}
            className={`${selectedAvatar === item.src ? 'border border-[var(--theme-color)] rounded-lg' : ''} w-[58px] h-[58px]`}
            onClick={() => handleAvatarClick(item)}
          >
            <img src={item.src} className="rounded-full w-full h-full" alt={item.alt} />
          </li>
        ))}
      </ul>
    </div>
  );
  
  // 上传
  const UploadAvatar = () => (
    <div className="flex flex-col items-center">
      <div className="w-[88px] h-[88px] mb-[14px] relative">
        <img
            src={getCurrentAvatar()}
            alt="avatar"
            className="!w-[88px] !h-[88px] rounded-full object-cover"
        />

        {
        uploadLoading ? 
          (<div className="w-full h-full absolute top-0 flex justify-center items-center text-[#fff] font-medium text-[20px]">
              {uploadProgress}%
          </div>)
        :
        selectedType && (
          <div className="w-full h-full absolute top-0 flex justify-center items-center">
            <Iconify
              icon="fluent:delete-12-filled"
              className="text-[24px] text-[#fff]"
              onClick={handleDeleteImage}
            />
          </div>
        )}
      </div>

      <Upload {...uploadProps}>
        <button className="min-w-[120px] h-[32px] px-[38px] border border-solid border-[var(--theme-color)] rounded-[16px] flex items-center text-[12px] font-medium theme_color">
          <Iconify icon="material-symbols:upload-sharp" className="text-[16px]" />
          <span className="ml-1">{t('usersetting.uploadAvatar')}</span>
        </button>
      </Upload>
      <p className="leading-[17px] text-[12px] tip-color mt-[10px]">{t('usersetting.avatarFormatTip')}</p>
    </div>
  );

  return (
    <Popup
      visible={open}
      onClose={onCancel}
      closeOnMaskClick
      position="bottom"
      bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
      bodyClassName="!h-[433px] !bg-[var(--background5)] !text-[var(--text-color5)]"
    >
      <p className="flex justify-between items-center h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
        <span>{t('usersetting.modifyAvatar')}</span>
        <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
      </p>

      <CustomTab
        tabsItems={[
          { key: '1', title: t('usersetting.defaultAvatar'), children: <AvartarList /> },
          { key: '2', title: t('usersetting.uploadAvatar'), children: <UploadAvatar /> },
        ]}
        stretch={false}
        activeLineMode="fixed"
        className="avatarTabs"
      />

      <div className="flex justify-between gap-x-[10px] px-4">
        <button className="w-[50%] rounded-[22px] h-[44px] cancel_btn2 flex justify-center items-center" onClick={handCancel}>
          {t('cancel')}
        </button>
        <button className="w-[50%] rounded-[22px] h-[44px] default_btn flex justify-center items-center" onClick={handOk}>
          {t('save')}
        </button>
      </div>
    </Popup>
  );
};

export default AvatarUrlPopup;
