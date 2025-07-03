import React from 'react';
import { Image } from 'antd-mobile';
import './index.scss';
import iconAvatarDark from '@/components/assets/icons/public/icon_down_line.png';
import iconIdentityDark from '@/components/assets/icons/public/icon_down_line.png';

interface UserInfoCardProps {
  username?: string;
  email?: string;
  avatarUrl?: string;
  identityStatus?: 'unverified' | 'pending' | 'verified';
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  username = '--',
  email = '--',
  avatarUrl,
  identityStatus = 'unverified'
}) => {
  return (
    <div className="user-info-card">
      <div className="user-basic-info">
        <div className="avatar">
          <Image
            src={avatarUrl || iconAvatarDark}
            width={48}
            height={48}
            fit="cover"
            style={{ borderRadius: '50%' }}
          />
        </div>
        <div className="info">
          <div className="username">{username}</div>
          <div className="email">{email}</div>
        </div>
      </div>
      <div className="identity-status">
        <Image src={iconIdentityDark} width={20} height={20} />
        <span className={`status ${identityStatus}`}>
          {identityStatus === 'unverified' && '未认证'}
          {identityStatus === 'pending' && '审核中'}
          {identityStatus === 'verified' && '已认证'}
        </span>
      </div>
    </div>
  );
};

export default UserInfoCard; 