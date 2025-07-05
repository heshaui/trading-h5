import { LOCAL_STORAGE_KEY, KV_KEYS } from '@/config/apiConfig';
import { getKvObject } from '@/services/kv';
import {parseJsonString} from "@/utils/parseJsonString";

export async function getWebConfig() {
     // 请求多个配置项
     const keys = KV_KEYS;
    try {
        const response = await getKvObject(keys) as { code: string; data: Record<string, any> }
        if (response?.code === '0' && response.data) {
            const parsedConfig: Record<string, any> = {};

            // 处理每个配置项
            Object.entries(response.data).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    const parsedValue = parseJsonString(value);
                    if (parsedValue ||parsedValue.toString()==='0') {
                        parsedConfig[key] = parsedValue;
                        // appStore.setKvConfig(key, parsedValue);
                    }
                } else {
                    parsedConfig[key] = value;
                    // appStore.setKvConfig(key, value);
                }
            });

            return {
                success: true,
                data: parsedConfig
            };
        }
    } catch (error) {
        console.error('获取币对价格出错:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
} 