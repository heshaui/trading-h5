import React from 'react';
import { Image, List } from 'antd-mobile';
import './index.scss';
import iconLock from '@/components/assets/icons/public/icon_down_line.png';
import iconEmail from '@/components/assets/icons/public/icon_down_line.png';
import iconGoogle from '@/components/assets/icons/public/icon_down_line.png';

interface SecurityStatusProps {
  loginPassword?: boolean;
  emailVerified?: boolean;
  googleAuth?: boolean;
  onSettingClick?: (type: 'password' | 'email' | 'google') => void;
}

const SecurityStatus: React.FC<SecurityStatusProps> = ({
  loginPassword = false,
  emailVerified = false,
  googleAuth = false,
  onSettingClick
}) => {
  return (
    <div className="security-status">
      <div className="title">安全设置</div>
      <List>
        <List.Item
          prefix={<Image src={iconLock} width={24} height={24} />}
          extra={
            <span className={`status ${loginPassword ? 'verified' : 'unverified'}`}>
              {loginPassword ? '已设置' : '未设置'}
            </span>
          }
          onClick={() => onSettingClick?.('password')}
        >
          登录密码
        </List.Item>
        <List.Item
          prefix={<Image src={iconEmail} width={24} height={24} />}
          extra={
            <span className={`status ${emailVerified ? 'verified' : 'unverified'}`}>
              {emailVerified ? '已验证' : '未验证'}
            </span>
          }
          onClick={() => onSettingClick?.('email')}
        >
          邮箱验证
        </List.Item>
        <List.Item
          prefix={<Image src={iconGoogle} width={24} height={24} />}
          extra={
            <span className={`status ${googleAuth ? 'verified' : 'unverified'}`}>
              {googleAuth ? '已绑定' : '未绑定'}
            </span>
          }
          onClick={() => onSettingClick?.('google')}
        >
          谷歌验证
        </List.Item>
      </List>
    </div>
  );
};

export default SecurityStatus; 