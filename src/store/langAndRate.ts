
import { homeMenu, getLanguage, exchangeRate } from '@/services/header';
import { getShortLangCode } from '@/utils/stringMap';

export const fetchRateData = async () => {
    // 获取汇率数据
    try {
        const rateResponse = await exchangeRate({ id: 0, shortName: "", status: 1 }) as any;
        if (rateResponse?.data && rateResponse.code === '0') {
            const formattedRateData = rateResponse.data.map((item: any) => ({
                ...item,
                span: `${item.shortName} - ${item.symbol}`,
                key: `${item.shortName}`,
            }));
            return {
                success: true,
                data: formattedRateData
            };
        } else {
            return {
                success: false,
                data: [],
                error: new Error(rateResponse?.message)
            };
        }
    } catch (error) {
        console.error('获取汇率数据出错:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
}

// 获取语言列表
export const fetchLangData = async () => {
    // 获取汇率数据
    try {
        const langResponse = await getLanguage({ lang: '' }) as any;
        if (langResponse?.data && langResponse.code === '0') {
            const formattedRateData = langResponse.data.map((item: any) => ({
                ...item,
                span: `${item.lang}`,
                key: `${item.langEncode}`,
                shortKey: getShortLangCode(item.langEncode)
            }));
            return {
                success: true,
                data: formattedRateData
            };
        } else {
            return {
                success: false,
                data: [],
                error: new Error(langResponse?.message)
            };
        }
    } catch (error) {
        console.error('获取汇率数据出错:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
}

