import { makeAutoObservable } from 'mobx';
import apiService from '../services/api';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
  isVip: boolean;
}

class UserStore {
  user: UserInfo | null = null;
  isLoggedIn = false;
  loading = false;

  constructor() {
    makeAutoObservable(this);
    this.initUser();
  }

  private initUser() {
    const token = localStorage.getItem('token');
    if (token) {
      this.getUserInfo();
    }
  }

  async login(username: string, password: string) {
    this.loading = true;
    try {
      const response = await apiService.post('/auth/login', {
        username,
        password,
      });
      
      const { token, user } = response;
      localStorage.setItem('token', token);
      this.user = user;
      this.isLoggedIn = true;
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      this.loading = false;
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    this.loading = true;
    try {
      const response = await apiService.post('/auth/register', userData);
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      this.user = user;
      this.isLoggedIn = true;
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      this.loading = false;
    }
  }

  async getUserInfo() {
    this.loading = true;
    try {
      const user = await apiService.get('/user/info');
      this.user = user;
      this.isLoggedIn = true;
    } catch (error) {
      this.logout();
    } finally {
      this.loading = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.user = null;
    this.isLoggedIn = false;
  }

  updateBalance(amount: number) {
    if (this.user) {
      this.user.balance = amount;
    }
  }
}

export const userStore = new UserStore();
export default userStore; 