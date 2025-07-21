import { useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);
    const userInfo = localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO);
    setIsLoggedIn(!!token && !!userInfo);
  }, []);

  return { isLoggedIn };
}; 

export default useAuth;