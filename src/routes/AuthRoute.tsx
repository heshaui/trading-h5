import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig'

const isLoggedIn = () => {
  return !!localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);
};

interface AuthRouteProps {
  children: JSX.Element;
  requireAuth?: boolean; // 默认 true: 必须登录
}

const AuthRoute = ({ children, requireAuth = true }: AuthRouteProps) => {
  const location = useLocation();
  const login = isLoggedIn();

  // 特殊规则：如果是登录页且已登录 → 跳首页
  if (location.pathname === '/login' && login) {
    return <Navigate to="/" replace />;
  }

  // 普通规则：必须登录才能访问的页面
  if (requireAuth && !login) {
    return <Navigate to="/login" replace />;
  }

  // 其他情况正常渲染
  return children;
};

export default AuthRoute;
