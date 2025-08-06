import React, { useState, useEffect } from 'react';
import { Image, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

import { LoginInfoType } from '@/type/userCenter/overview'
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { getLoginInfo } from '@/services/overview';
import { encryptString } from '@/utils/encrypt';
import { Iconify } from "@/components/icon"
import IdentifyStatus from './IdentifyStatus';
import styles from '@/pages/UserCenter/overview/index.module.scss';

import iconAvatarDark from '@/assets/images/userCenter/overview/icon_avatarUrl_dark.png';
import iconAvatarLight from '@/assets/images/userCenter/overview/icon_avatarUrl_day.png';

const UserInfo: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage('userCenter');
  const { isDark } = useTheme();
  const [loginInfo, setLoginInfo] = useState<LoginInfoType>({} as LoginInfoType);
  const [loadingSkeleton, setLoadingSkeleton] = useState(true)
  const { copyFn } = useCopyToClipboard();

  // 获取用户信息
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
  // 账号状态
  const getStatusText = (info: typeof loginInfo | undefined): string => {
    if (!info) return '';
    const { status, transactionStatus, withdrawalStatus } = info;

    if (status === 1 && transactionStatus === 1 && withdrawalStatus === 1) {
      return t('overview.normal');
    }

    const messages: string[] = [];
    if (status === 0) messages.push(t('overview.loginFrozen'));
    if (transactionStatus === 0) messages.push(t('overview.tradeFrozen'));
    if (withdrawalStatus === 0) messages.push(t('overview.withdrawFrozen'));

    return messages.join(' / ');
  };
  // 跳转到身份认证
  const goIdentity = (status: number) => {
      if (status === 1 || status === 0 || status === 3) {
          navigate(`/userCenter/identity`)
      } else {
          localStorage.setItem('identity_authStatus', status.toString())
          navigate(`/userCenter/identity/info?userId=${loginInfo?.userId}&authStatus=${status}`)
      }
  }
  useEffect(() => {
      getLoginInfoData()
  }, [currentLanguage]);
  return (
    <div>
      {/* 用户信息 */}
      <div className={`${styles.userInfo} gap-x-[10px]`}>
        <div className="flex flex-1 min-w-0">
          <div className="mr-2 shrink-0">
            {loginInfo?.avatarUrl ? 
            <Image src={loginInfo?.avatarUrl}
              alt="avatarUrl"
              fit="cover"
              className={styles.userInfo_pic} />
            :
            <Image 
              src={isDark ? iconAvatarDark : iconAvatarLight}
              alt="avatarUrl"
              className={styles.userInfo_pic} 
            />}
          </div>
          <div className="flex-1 min-w-0">
              <div className={`${styles.userInfo_name} truncate`}>{loginInfo?.account || '--'}</div>
              <div className={styles.userInfo_uid}>
                  UID：{loginInfo?.userId || '--'}
                  <Iconify icon="icon-park-solid:copy"
                      className='ml-1 cursor-pointer' size={18}
                      onClick={() => copyFn(loginInfo?.userId?.toString() || '')}
                  />
              </div>
          </div>
        </div>
        <div className="shrink-0">
            <button type='button' className={`${styles.userInfo_btn}`} onClick={() => navigate('/userCenter/setting')}>
                {/* 个人资料 */}
                {t('overview.personalInfo')}
            </button>
        </div>
      </div>
      {/* 注册账号 */}
      <div className={styles.otherInfo}>
        {/* 注册账号 */}
        <div className={styles.otherLeft}>{t('overview.registerAccount')}</div>
        <div className={styles.otherRight}>{encryptString(loginInfo?.registerAccount)}</div>
      </div>
      {/* 身份认证 */}
      <div className={styles.otherInfo}>
        <div className={styles.otherLeft}
            onClick={() => goIdentity(loginInfo?.realnessStatus)}>
            {/* 身份认证 */}
            {t('overview.identityAuth.title')}
            <Iconify icon="mingcute:right-line" className={`${styles.tip_color} font-16 ml-1 font-w-500`} />
        </div>
        <IdentifyStatus realnessStatus={loginInfo?.realnessStatus} />
      </div>
      {/* 账号状态 */}    
      <div className={styles.otherInfo}>
        {/* 账号状态 */}       
        <div className={styles.otherLeft}>{t('overview.accountStatus')}</div>
        <div className={styles.otherRight}>{getStatusText(loginInfo)}</div>
      </div>
    </div>
  );
};

export default UserInfo; 