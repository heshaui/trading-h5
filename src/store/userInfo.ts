import { LOCAL_STORAGE_KEY, KV_KEYS } from '@/config/apiConfig';
import { getKvObject } from '@/services/kv';
import {parseJsonString} from "@/utils/parseJsonString";
import { getLoginUserInfo } from "@/services/userCenter"

export async function getUserInfo() {
    try {
        const response = await getLoginUserInfo();
        if (response.code === '0') {
            return {
                success: true,
                data: response.data || []
            };
        }
        return {
            success: false,
            data: [],
            error: new Error('获取用户信息失败')
        };
    } catch (error) {
        console.error('获取用户信息出错:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
} 
