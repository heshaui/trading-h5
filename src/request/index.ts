import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import appStore from '@/store';
// import { useAuth } from '@/context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
import {autoConvertLangCode} from '@/utils/stringMap'
import { push } from '@/utils/history';

const BASE_URL = process.env.REACT_APP_API_BASE;
/**
 * 通用请求封装
 * @param endpoint 请求的 API 路径，例如 '/user'
 * @param options 请求选项，支持 method、body、headers 等
 * @returns 返回 Promise
 */
// const { logout } = useAuth();
interface RequestHeaders {
  [key: string]: string;
}
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // const url = `${BASE_URL}${endpoint}`;
  const url = BASE_URL ? `${BASE_URL}${endpoint}`: `${endpoint}`;
  // console.log('请求 URL:', url);
  
  const defaultHeaders:RequestHeaders = {
    // 'Content-Type': '',
    'Authorization': `${getToken()}`, // 获取 token（可选）
    'sa-token': `${getToken()}`,
    'lang': autoConvertLangCode(localStorage.getItem(LOCAL_STORAGE_KEY.LANG) || 'en_US', 'long'),
    // 'ambit-saas': process.env.NEXT_PUBLIC_AMBIT_SAAS||'',
  };
  
  // 仅在开发环境下添加 ambit-saas 头部
  if (process.env.NODE_ENV === 'development') {
    defaultHeaders['ambit-saas'] = process.env.REACT_APP_AMBIT_SAAS||'2e5bbf22907d4a31992e9641079af195';
  }

 // 发送 FormData 时才添加 Content-Type: application/json
 if (!(options.body instanceof FormData)) {
  defaultHeaders['Content-Type'] = 'application/json';
}
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    // 检查响应码是否为 10005
    if (data.code === '10005' //账户已禁用
      || data.code === '10046' //未登录
      || data.code === '10047' //Token 不存在或已过期，请重新登录
      || data.code === '10106' //登录超时
      || data.code === '10118' //账户已冻结
      || data.code === '10132' //商户已过期
    ) {
      logout();
    }
    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
}
  // 登出方法
  const logout = () => {
      appStore.clearToken();
      // 触发自定义事件
      push('/login');
  };
// 获取 Token（如果有鉴权）
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN) || '';
  }
  return '';
}