import React from 'react';
import './index.scss';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon'

interface UserHeaderProps {
  title: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ title }) => {
  const { t } = useLanguage();
  const iconMap: Record<string, string> = {
    'safeCenter.overView': 'pixelarticons:dashboard',
    'safeCenter.security': 'mingcute:safety-certificate-line',
    'safeCenter.identity': 'mingcute:idcard-line',
    'safeCenter.account': 'icon-park-outline:setting-two'
  };

  return (
    <div className="user-header">
      <div className="user-header-left">
        <Iconify icon={iconMap[title]} className="left-icon" />
        <span>{t(title)}</span>
      </div>
      <Iconify icon="icon-park-outline:down" className="right-icon"/>
    </div>
  );
};

export default UserHeader;
