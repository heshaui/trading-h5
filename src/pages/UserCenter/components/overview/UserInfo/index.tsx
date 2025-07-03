import React, { CSSProperties, useState, useEffect } from 'react';
import { Image } from 'antd-mobile';
import { LoginInfoType, LoginLogListType, carouselImageContentsType, CarouselPicType } from '@/type/userCenter/overview'
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { Iconify, SvgIcon } from "@/components/icon"
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { getLoginInfo } from '@/services/overview';
import styles from './index.module.scss';
import iconAvatarDark from '@/components/assets/images/userCenter/overview/icon_avatarUrl_dark.png';
import iconAvatarLight from '@/components/assets/images/userCenter/overview/icon_avatarUrl_day.png';
import { Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

const UserInfo: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  const [loginInfo, setLoginInfo] = useState<LoginInfoType>({} as LoginInfoType);
  const [loadingSkeleton, setLoadingSkeleton] = useState(true)
  const { copyFn } = useCopyToClipboard();
  const getLoginInfoData = async () => {
      setLoadingSkeleton(true)
      try {
          const res = await getLoginInfo();
          if (res.code === '0') {
              setLoginInfo(res.data);
              setLoadingSkeleton(false)
              const localUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
              localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(Object.assign({}, localUserInfo, res.data)))
          }
      } catch (error) {
          Toast.show({
              icon: 'fail',
              content: String(error),
          })
      }

  }
  // 用户状态
  const statusText = (status: number) => {
      switch (status) {
          case 1:
              // 已认证
              return t('overview.auth');
          case 0:
              // 已驳回
              return t('overview.reject');
          case 2:
              // 未认证
              return t('overview.unAuth');
          case 3:
              // 审核中
              return t('overview.audit');
          default:
              return '--';
      }
  }
  useEffect(() => {
        getLoginInfoData()
  }, [currentLanguage]);
  return (
    <div className={styles.container}>
      <div>
        <div>
          <div>
            {loginInfo?.avatarUrl ? 
            <Image src={loginInfo?.avatarUrl}
              alt="" width={68} height={68}
              className={`${styles.userInfo_pic}`} />
            :
            <Image 
              src={isDark ? iconAvatarLight: iconAvatarDark}
              alt="" width={68} height={68}
              className={`${styles.userInfo_pic}`} 
            />}
          </div>
          <div className='ml-3'>
              <div className={`${styles.userInfo_name} font-18`}>{loginInfo?.account || '--'}</div>
              <div className={`${styles.userInfo_uid} font-14 flex-row align-baseline`}>
                  UID：{loginInfo?.userId || '--'}
                  <Iconify icon="icon-park-solid:copy"
                      className='ml-1 cursor-pointer' size={18}
                      onClick={() => copyFn(loginInfo?.userId?.toString() || '')}
                  />
              </div>
          </div>
        </div>
        <div className={`${styles.userInfo_detail} flex-row align-start justify-end flex-1 mt-6`} >
            <button type='button' className={`${styles.userInfo_btn} font-w-500`} onClick={() => navigate('/userCenter/userSettings')}>
                {/* 个人资料 */}
                {t('overview.personalInfo')}
            </button>
        </div>
      </div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default UserInfo; 