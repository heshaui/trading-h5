import React from 'react';
import { Image, Button } from 'antd-mobile';
import './index.scss';
import iconIdentityDark from '@/components/assets/icons/public/icon_down_line.png';

interface IdentityStatusProps {
  status: 'unverified' | 'pending' | 'verified';
  onVerify?: () => void;
}

const IdentityStatus: React.FC<IdentityStatusProps> = ({
  status = 'unverified',
  onVerify
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'verified':
        return '已完成身份认证';
      case 'pending':
        return '身份认证审核中';
      default:
        return '未完成身份认证';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'verified':
        return '查看详情';
      case 'pending':
        return '查看进度';
      default:
        return '立即认证';
    }
  };

  const getButtonType = () => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <div className="identity-status-card">
      <div className="status-info">
        <Image src={iconIdentityDark} width={24} height={24} />
        <div className="text">
          <div className="title">身份认证</div>
          <div className={`status ${status}`}>{getStatusText()}</div>
        </div>
      </div>
      <Button
        className={`verify-button ${status}`}
        onClick={onVerify}
        fill="none"
        color={getButtonType()}
        size="small"
      >
        {getButtonText()}
      </Button>
    </div>
  );
};

export default IdentityStatus; 