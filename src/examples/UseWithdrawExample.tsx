import React from 'react';
import { Button } from 'antd-mobile';
import { useWithdraw } from '@/hooks/useWithdraw';
import appStore from '@/store';

const UseWithdrawExample: React.FC = () => {
  const { goWithdraw, WithdrawStatusPopComponent } = useWithdraw();

  // 获取用户信息
  const userInfo = appStore.getUserInfo();

  const handleWithdrawClick = () => {
    // 调用 goWithdraw 方法，会自动处理所有逻辑
    // 转换类型以匹配 Hook 的接口
    const withdrawUserInfo = userInfo ? {
      withdrawalStatus: userInfo.withdrawalStatus,
      merchantWithdrawalStatus: userInfo.merchantWithdrawalStatus,
      realnessStatus: userInfo.realnessStatus,
      isGoogleAuth: Boolean(userInfo.isGoogleAuth), // 转换为 boolean
    } : undefined;
    goWithdraw(withdrawUserInfo);
  };

  // 也可以传入自定义的用户信息
  const handleWithdrawWithCustomUser = () => {
    const customUserInfo = {
      withdrawalStatus: 1,
      merchantWithdrawalStatus: 1,
      realnessStatus: 0, // 未实名认证
      isGoogleAuth: false, // 未绑定谷歌验证器
    };
    goWithdraw(customUserInfo);
  };

  // 模拟不同状态的用户
  const handleDisabledWithdraw = () => {
    const disabledUser = {
      withdrawalStatus: 0, // 提现功能被禁用
      merchantWithdrawalStatus: 1,
      realnessStatus: 1,
      isGoogleAuth: true,
    };
    goWithdraw(disabledUser);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">useWithdraw Hook 使用示例</h2>
      
      <div className="space-y-2">
        <Button 
          block 
          color="primary" 
          onClick={handleWithdrawClick}
        >
          提现 (使用当前用户信息)
        </Button>
        
        <Button 
          block 
          color="warning" 
          onClick={handleWithdrawWithCustomUser}
        >
          提现 (模拟需要认证的用户)
        </Button>
        
        <Button 
          block 
          color="danger" 
          onClick={handleDisabledWithdraw}
        >
          提现 (模拟被禁用的用户)
        </Button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Hook 特性：</h3>
        <ul className="text-sm space-y-1">
          <li>• 自动检查用户提现权限</li>
          <li>• 自动检查身份认证状态</li>
          <li>• 自动检查谷歌验证器绑定状态</li>
          <li>• 使用 JSX 渲染美观的弹窗界面</li>
          <li>• 支持一键跳转到对应设置页面</li>
          <li>• 条件满足时自动跳转到提现页面</li>
        </ul>
      </div>

      {/* 渲染弹窗组件 */}
      <WithdrawStatusPopComponent />
    </div>
  );
};

export default UseWithdrawExample; 