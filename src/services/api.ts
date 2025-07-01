import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Toast } from 'antd-mobile';

// 接口响应数据结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.example.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加语言标识
        const language = localStorage.getItem('language') || 'zh';
        config.headers['Accept-Language'] = language;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { code, message, data } = response.data;
        
        if (code === 200) {
          return data;
        } else {
          Toast.show({
            content: message || '请求失败',
            icon: 'fail',
          });
          return Promise.reject(new Error(message));
        }
      },
      (error) => {
        let errorMessage = '网络错误，请稍后重试';
        
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 401:
              errorMessage = '登录已过期，请重新登录';
              localStorage.removeItem('token');
              // 可以在这里跳转到登录页
              break;
            case 403:
              errorMessage = '没有权限访问';
              break;
            case 404:
              errorMessage = '请求的资源不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误';
              break;
            default:
              errorMessage = data?.message || errorMessage;
          }
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = '请求超时，请稍后重试';
        }

        Toast.show({
          content: errorMessage,
          icon: 'fail',
        });

        return Promise.reject(error);
      }
    );
  }

  // GET请求
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  // POST请求
  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  // PUT请求
  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  // DELETE请求
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  // 上传文件
  public upload<T = any>(url: string, file: File, onUploadProgress?: (progressEvent: any) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }
}

export const apiService = new ApiService();
export default apiService; 