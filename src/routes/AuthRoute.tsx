import React from 'react';
import { Navigate } from 'react-router-dom';

const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

export default AuthRoute;
