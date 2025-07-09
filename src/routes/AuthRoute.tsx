import React from 'react';
import { Navigate } from 'react-router-dom';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig'

const isLoggedIn = () => {
  return !!localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

export default AuthRoute;
