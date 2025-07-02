import { makeAutoObservable, runInAction } from "mobx";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { getWebConfig } from "@/store/kvConfig";
import { getUserInfo } from "@/store/userInfo"
import { UserInfoType } from "@/type/userCenter/overview"
import {
    fetchAllCurrencyPairs,
    fetchUserFavorites,
    addToFavorites,
    removeFromFavorites,
    fetchAllCoin,
    fetchUsdtPrice
} from './currencyPairService';
import { CurrencyPairType, CoinType } from "@/type/assets/spot/exchange"
import { getExchangeGroup, getExchangeCoinList, getUserExchangeCoinTypeList } from '@/services/spot';
import { inviteInfoType,usdtRateType } from "@/type/userCenter/overview"
import { registerInfoType } from "@/type/store"
import { getConfig } from '@/services/flash';
// const { isLoggedIn} = useAuth()
// 添加这个辅助函数来检查是否在浏览器环境
const isBrowser = () => typeof window !== 'undefined';

class AppStore {
    isDarkMode: boolean = false;
    userToken: string | null = null;
    authcodeState: { state: string | number | null, type: string | number | null } = { state: null, type: null };
    // 订单更新标志
    // @observable
    updateFlag: { orderPlace: number, orderUpdate: number, orderDelect: number } = {
        orderPlace: 0,
        orderUpdate: 0,
        orderDelect: 0
    };

    registerInfo: registerInfoType = {} as registerInfoType;
    userInfo: UserInfoType = {} as UserInfoType;

    // 添加币对信息列表
    currencyPairs: CurrencyPairType[] = [];
    // 添加当前选中的币对
    currentPair: CurrencyPairType | null = null;
    // 添加原始币对数据
    rawCurrencyData: any[] = [];
    // API加载状态
    isLoadingCurrencyData: boolean = false;

    // 添加币种列表
    coinList: any[] = [];
    // API加载状态
    isLoadingCoinData: boolean = false;
    // 汇率数据状态
    rateData: any[] = [];
    rateKey: string = '';
    lang: string = '';
    languageList: any[] = [];
    kvConfig: Record<string, any> = {};
    inviteInfo: inviteInfoType = {} as inviteInfoType;
    banlanceShow: boolean = true;
    
    // 添加 flash 配置状态
    flashConfig: any = { minTradeU: 0, maxTradeU: 0 };
    isLoadingFlashConfig: boolean = false;
    usdtRate: usdtRateType={} as usdtRateType

    constructor() {
        // 使状态响应式
        makeAutoObservable(this);

        // 仅在浏览器环境中初始化
        if (isBrowser()) {
            this.initToken();
            this.initInviteInfo();
            this.initCurrencyPairsFromStorage();
            this.initRateDataFromStorage();
            this.initUserInfoFromStorage();
            this.initRateKeyFromStorage(); // 初始化汇率key
            this.initLangFromStorage(); // 初始化语言
            this.initCoinList(); //加载币种数据
            this.initKvConfig();
            this.initBanlanceShow(); //初始化资产显示状态
            this.initFlashConfigFromStorage(); // 初始化闪兑配置
            this.initUsdtRateFromStorage(); //初始化USDT和USD汇率
        }
    }

    initToken() {
        if (!isBrowser()) return;
        this.userToken = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN) || null;
    }
    getToken() {
        return this.userToken;
    }
    setToken(token: string) {
        this.userToken = token;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.USER_TOKEN, token);
        }
    }
    clearToken() {
        this.userToken = null;
        localStorage.removeItem(LOCAL_STORAGE_KEY.USER_TOKEN);
    }

    // 更新订单标志
    updateOrderFlag(type: number = 0) {
        // 1 下单更新 2 修改更新  3 撤销更新 
        if (type === 0) {
            this.updateFlag = {
                orderUpdate: this.updateFlag.orderUpdate + 1,
                orderDelect: this.updateFlag.orderDelect + 1,
                orderPlace: this.updateFlag.orderPlace + 1
            };
        } else if (type === 1) {
            this.updateFlag = {
                ...this.updateFlag,
                orderPlace: this.updateFlag.orderPlace + 1
            };
        } else if (type === 2) {
            this.updateFlag = {
                ...this.updateFlag,
                orderUpdate: this.updateFlag.orderUpdate + 1
            };
        } else if (type === 3) {
            this.updateFlag = {
                ...this.updateFlag,
                orderDelect: this.updateFlag.orderDelect + 1
            };
        }

    }

    // 获取订单标志
    getUpdateFlag() {
        return this.updateFlag;
    }
    getUserInfo() {
        return this.userInfo;
    }
    setUserInfo(userInfo: UserInfoType) {
        this.userInfo = userInfo;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(userInfo));
        }
    }
    updateUserInfo(newUserInfo: Partial<typeof this.userInfo>) {
        this.userInfo = {
            ...this.userInfo,
            ...newUserInfo
        };
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(this.userInfo));
        }
    }
    clearUserInfo() {
        this.userInfo = {} as UserInfoType;
        if (isBrowser()) {
            localStorage.removeItem(LOCAL_STORAGE_KEY.USER_INFO);
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
    }

    setUserToken(token: string) {
        this.userToken = token;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.USER_TOKEN, token);
        }
    }
    clearUserToken() {
        this.userToken = null;
        if (isBrowser()) {
            localStorage.removeItem(LOCAL_STORAGE_KEY.USER_TOKEN);
        }
    }

    getUserToken() {
        return this.userToken;
    }



    setAuthcodeState(state: string | number, type: string | number) {
        this.authcodeState = { state, type };
    }

    clearAuthcodeState() {
        this.authcodeState = { state: null, type: null };
    }
    // 更新 loginInfo 
    // updateLoginInfo(newLoginInfo: Partial<typeof this.loginInfo>) {
    //     this.loginInfo = {
    //         ...this.loginInfo,
    //         ...newLoginInfo
    //     };
    // }
    updateRegisterInfo(newRegisterInfo: Partial<typeof this.registerInfo>) {
        this.registerInfo = {
            ...this.registerInfo,
            ...newRegisterInfo
        };
    }

    initInviteInfo() {
        if (!isBrowser()) return;
        const inviteInfoJson = localStorage.getItem(LOCAL_STORAGE_KEY.INVITE_INFO);
        this.inviteInfo = inviteInfoJson ? JSON.parse(inviteInfoJson) : {} as inviteInfoType;
    }
    setInviteInfo(inviteInfo: inviteInfoType) {
        this.inviteInfo = inviteInfo;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.INVITE_INFO, JSON.stringify(inviteInfo));
        }
    }
    getInviteInfo() {
        return this.inviteInfo;
    }
    clearInviteInfo() {
        this.inviteInfo = {} as inviteInfoType;
        if (isBrowser()) {
            localStorage.removeItem(LOCAL_STORAGE_KEY.INVITE_INFO);
        }
    }

    // 从本地存储初始化币对信息
    initCurrencyPairsFromStorage() {
        if (!isBrowser()) return;

        try {
            const pairsJson = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS);
            const currentPairJson = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_PAIR);

            if (pairsJson) {
                this.currencyPairs = JSON.parse(pairsJson);
            }

            if (currentPairJson) {
                this.currentPair = JSON.parse(currentPairJson);
            }
        } catch (error) {
            console.error('Failed to load currency pairs from storage:', error);
        }
    }
    //  设置汇率数据的方法
    setRateData(data: any[]) {
        this.rateData = data;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.RATE_DATA, JSON.stringify(data));
        }
    }

    // 获取汇率数据的方法
    getRateData() {
        return this.rateData;
    }

    // 清除汇率数据的方法
    clearRateData() {
        this.rateData = [];
        if (isBrowser()) {
            localStorage.removeItem(LOCAL_STORAGE_KEY.RATE_DATA);
        }
    }
    //  从本地存储初始化汇率数据
    initRateDataFromStorage() {
        if (!isBrowser()) return;

        try {
            const rateDataJson = localStorage.getItem(LOCAL_STORAGE_KEY.RATE_DATA);

            if (rateDataJson) {
                this.rateData = JSON.parse(rateDataJson);
            }
        } catch (error) {
            console.error('Failed to load rate data from storage:', error);
        }
    }
    //  从本地存储初始化用户信息
    initUserInfoFromStorage() {
        if (!isBrowser()) return;

        try {
            const userInfoJson = localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO);
            if (userInfoJson) {
                this.userInfo = JSON.parse(userInfoJson);
            }
        } catch (error) {
            console.error('Failed to load user info from storage:', error);
        }
    }
    // 从本地存储初始化 rate_key
    initRateKeyFromStorage() {
        if (!isBrowser()) return;

        try {
            // 首先尝试从 rate_key 获取
            const rateKey = localStorage.getItem(LOCAL_STORAGE_KEY.RATE_KEY);

            if (rateKey) {
                this.rateKey = rateKey;
                // return rateKey;
            } else {

                // 如果没有 rate_key，尝试从 rateData 获取第一项
                const rateData = localStorage.getItem(LOCAL_STORAGE_KEY.CACHED_RATE_DATA);
                if (rateData) {
                    const parsedData = JSON.parse(rateData);

                    if (parsedData && parsedData.length > 0) {
                        this.rateKey = parsedData[0].span;
                        // return parsedData[0].span;
                    }
                }
            }

        } catch (error) {
            console.error('Error getting rate key:', error);
        }
    }
    // 从本地存储初始化lang
    initLangFromStorage() {
        if (!isBrowser()) return;

        try {
            // 首先尝试从 lang 获取语言
            const lang = localStorage.getItem(LOCAL_STORAGE_KEY.LANG);
            const languageList = localStorage.getItem(LOCAL_STORAGE_KEY.LANGUAGE_LIST);
            if (languageList) {
                this.languageList = JSON.parse(languageList)
            } else {
                this.languageList = []
            }

            if (lang) {
                this.lang = lang;
            } else {
                this.lang = '';
            }
            // else {
            //     // 如果没有，尝试从 cachedLanguageList 获取第一项
            //     if (languageList) {
            //         const parsedData = JSON.parse(languageList);

            //         if (parsedData && parsedData.length > 0) {
            //             this.lang = parsedData[0].key;
            //             // return parsedData[0].span;
            //         }
            //     }
            // }


        } catch (error) {
            console.error('Error getting rate key:', error);
        }
    }
    // 获取用户信息
    async loadGetUserInfo(type: string = 'init') {
        const result = await getUserInfo();
        if (result.success) {
            if (type === 'init') {
                this.setUserInfo(result.data);
            } else if (type === 'upData') {
                this.updateUserInfo(result.data);
            }
        }
    }
    // 从API加载币对信息
    async loadCurrencyPairs() {
        try {
            this.isLoadingCurrencyData = true;

            // 使用currencyPairService中的方法替代重复代码
            const result = await fetchAllCurrencyPairs();

            if (result.success) {
                // 更新原始数据
                this.rawCurrencyData = result.rawData;

                // 更新币对列表
                this.setCurrencyPairs(result.data);
                this.usdtRate = result.usdtPrice;
                this.setUsdtRate(result.usdtPrice);

                // 如果没有当前选中的币对，设置第一个为当前币对
                if (!this.currentPair && result.data.length > 0) {
                    this.setCurrentPair(result.data[0]);
                }

                return result.data;
            } else {
                throw result.error;
            }
        } catch (error) {
            runInAction(() => {
                // 可能需要设置错误状态
            });
            console.error('Error loading currency pairs:', error);
            throw error;
        } finally {
            runInAction(() => {
                this.isLoadingCurrencyData = false;
            });
        }
    }

    // 设置币对列表
    setCurrencyPairs(pairs: CurrencyPairType[]) {
        this.currencyPairs = pairs;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS, JSON.stringify(pairs));
        }
    }

    // 设置当前选中的币对
    setCurrentPair(pair: CurrencyPairType) {
        this.currentPair = pair;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.CURRENT_PAIR, JSON.stringify(pair));
        }
    }

    // 根据ID查找币对
    getCurrencyPairById(id: string) {
        return this.currencyPairs.find(pair => pair.id === id) || null;
    }

    // 根据基础货币筛选币对
    getCurrencyPairsByBase(baseSymbol: string) {
        return this.currencyPairs.filter(pair => pair.baseSymbol === baseSymbol) || this.currencyPairs.filter(pair => pair.symbol === baseSymbol)
    }

    // 获取当前选中的币对
    getCurrentPair() {
        return this.currentPair;
    }
    // 获取所有币对列表
    getCurrentPairList() {
        return this.currencyPairs;
    }

    // 更新币对信息1
    updateCurrencyPair(pairId: string, data: Partial<CurrencyPairType>) {
        const pairIndex = this.currencyPairs.findIndex(pair => pair.id === pairId);
        if (pairIndex > -1) {
            this.currencyPairs[pairIndex] = {
                ...this.currencyPairs[pairIndex],
                ...data
            };

            // 如果更新的是当前选中的币对，也更新currentPair
            if (this.currentPair?.id === pairId) {
                this.currentPair = this.currencyPairs[pairIndex];
            }

            if (isBrowser()) {
                localStorage.setItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS, JSON.stringify(this.currencyPairs));
            }
        }
    }
    // 更新某个币对信息2
    updateCoinPair(coinSymbol: string, baseSymbol: string, data: Partial<CurrencyPairType>) {
        const pairIndex = this.currencyPairs.findIndex(pair => pair.coinSymbol === coinSymbol && pair.baseSymbol === baseSymbol);
        if (pairIndex > -1) {
            this.currencyPairs[pairIndex] = {
                ...this.currencyPairs[pairIndex],
                ...data
            };
            // 如果更新的是当前选中的币对，也更新currentPair
            if (this.currentPair?.coinSymbol === coinSymbol && this.currentPair?.baseSymbol === baseSymbol) {
                this.currentPair = this.currencyPairs[pairIndex];
            }

            if (isBrowser()) {
                localStorage.setItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS, JSON.stringify(this.currencyPairs));
            }
        }
    }
    // 更新所有
    updateCurrencyPairAll(data: Partial<CurrencyPairType>[]) {
        this.currencyPairs = this.currencyPairs.map(pair => {
            const currentPair = data.find((d: any) => d.coinSymbol === pair.coinSymbol && d.baseSymbol === pair.baseSymbol)
            if (this.currentPair?.id === pair.id) {
                this.currentPair = {
                    ...pair,
                    ...currentPair
                }
            }
            return {
                ...pair,
                ...currentPair
            };
        });
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS, JSON.stringify(this.currencyPairs));
        }
    }


    // 使用计算属性替代方法
    get favoritePairs() {
        return this.currencyPairs.filter(pair => pair.isFavorite);
    }

    // 清除币对信息
    clearCurrencyPairs() {
        this.currencyPairs = [];
        this.currentPair = null;
        this.rawCurrencyData = [];
        if (isBrowser()) {
            localStorage.removeItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS);
            localStorage.removeItem(LOCAL_STORAGE_KEY.CURRENT_PAIR);
        }
    }

    // 从服务器重新加载自选币对
    async loadFavoriteCoins() {
        if (!this.userToken) return;

        try {
            const response = await getUserExchangeCoinTypeList();
            if (response.code === '0') {
                const favoriteCoins = response.data || [];

                // 更新现有币对的收藏状态
                const updatedPairs = this.currencyPairs.map(pair => {
                    const isFavorite = favoriteCoins.some((favCoin: any) =>
                        favCoin.coinSymbol === pair.coinSymbol &&
                        favCoin.baseSymbol === pair.baseSymbol
                    );

                    return {
                        ...pair,
                        isFavorite
                    };
                });

                this.setCurrencyPairs(updatedPairs);

                // 如果当前选中的币对也发生了变化，更新它
                if (this.currentPair) {
                    const currentPairUpdated = updatedPairs.find(p => p.id === this.currentPair?.id);
                    if (currentPairUpdated) {
                        this.currentPair = currentPairUpdated;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load favorite coins:', error);
        }
    }

    // 从API加载币种信息
    async loadCoinList(needPrice: boolean = false) {
        try {
            this.isLoadingCoinData = true;

            const result = await fetchAllCoin(needPrice);

            if (result.success) {
                runInAction(() => {
                    this.coinList = result.data;
                    this.setCoinList(result.data);
            
                });
                return result.data;
            } else {
                throw result.error;
            }
        } catch (error) {
            runInAction(() => {
                // 可能需要设置错误状态
            });
            console.error('Error loading coin list:', error);
            throw error;
        } finally {
            runInAction(() => {
                this.isLoadingCoinData = false;
            });
        }
    }
    initCoinList() {
        if (!isBrowser()) return;
        const coinListJson = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_COIN);
        if (coinListJson) {
            this.coinList = JSON.parse(coinListJson);
        }
    }
    // 获取币种列表
    getCoinList() {
        return this.coinList;
    }
    setCoinList(coinList: CoinType[]) {
        this.coinList = coinList;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.CURRENT_COIN, JSON.stringify(coinList));
        }
    }
    // 清除币种列表
    clearCoinList() {
        this.coinList = [];
    }
    // 设置 rate_key 的方法
    setRateKey(key: string) {
        this.rateKey = key;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.RATE_KEY, key);
        }
    }

    // 获取 rate_key 的方法
    getRateKey() {
        return this.rateKey;
    }

    // 清除 rate_key 的方法
    clearRateKey() {
        this.rateKey = '';
        if (isBrowser()) {
            localStorage.removeItem(LOCAL_STORAGE_KEY.RATE_KEY);
        }
    }
    // 设置语言
    setLang(lang: string) {
        this.lang = lang;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.LANG, lang);
        }
    }
    // 获取语言
    getLang() {
        return this.lang;
    }
    // 设置语言
    setLanguageList(langList: string[]) {
        this.languageList = langList;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.LANGUAGE_LIST, JSON.stringify(langList));
        }
    }
    // 获取语言
    getLangList() {
        return this.languageList;
    }
    initKvConfig() {
        if (!isBrowser()) return;
        try {
            // 首先尝试从 kv_config 获取
            const kvConfig = localStorage.getItem(LOCAL_STORAGE_KEY.KV_CONFIG);

            if (kvConfig) {
                this.kvConfig = JSON.parse(kvConfig);
            } else {
                this.kvConfig = {};
            }
        } catch (error) {
            console.error('Error getting kv config:', error);
        }
    }
    // 设置kv配置
    setKvConfig(key: string, value: any) {
        runInAction(() => {
            this.kvConfig[key] = value;
            if (isBrowser()) {
                localStorage.setItem(LOCAL_STORAGE_KEY.KV_CONFIG, JSON.stringify(this.kvConfig));
            }
        });
    }
    // 更新kv配置
    updateKvConfig(data: Record<string, any>) {
        runInAction(() => {
            this.kvConfig = { ...this.kvConfig, ...data };
            if (isBrowser()) {
                localStorage.setItem(LOCAL_STORAGE_KEY.KV_CONFIG, JSON.stringify(this.kvConfig));
            }
        });
    }

    // 获取指定键名的KV配置
    getKvConfig(key: string) {
        return this.kvConfig[key];
    }
    // 获取所有KV配置
    getKvConfigAll() {
        return this.kvConfig;
    }
    // 从API加载币种信息
    async getKvConfigAllFromApi() {
        try {
            this.isLoadingCoinData = true;

            const result = await getWebConfig();

            if (result?.success) {
                runInAction(() => {
                    this.kvConfig = result.data;
                    this.updateKvConfig(result.data);
                });
            } else {
                throw result?.error;
            }
        } catch (error) {
            runInAction(() => {
                // 可能需要设置错误状态
            });
            console.error('Error loading coin list:', error);
            throw error;
        } finally {
            runInAction(() => {
                this.isLoadingCoinData = false;
            });
        }
    }

    // 资产显示状态
    getBanlanceShow() {
        return this.banlanceShow;
    }
    setBanlanceShow(banlanceShow: boolean) {
        this.banlanceShow = banlanceShow;
        if (isBrowser()) {
            sessionStorage.setItem('banlanceShow', JSON.stringify(banlanceShow));
        }
    }
    initBanlanceShow() {
        if (!isBrowser()) return;
        const banlanceShow = sessionStorage.getItem('banlanceShow') || 'true';
        if (banlanceShow) {
            this.banlanceShow = JSON.parse(banlanceShow);
        }
    }

    // Flash 配置相关方法
    initFlashConfigFromStorage() {
        if (!isBrowser()) return;
        try {
            const flashConfigJson = localStorage.getItem(LOCAL_STORAGE_KEY.FLASH_CONFIG);
            if (flashConfigJson) {
                this.flashConfig = JSON.parse(flashConfigJson);
            }
        } catch (error) {
            console.error('Failed to load flash config from storage:', error);
        }
    }

    async loadFlashConfig() {
        try {
            this.isLoadingFlashConfig = true;
            const data = {};
            const res = await getConfig(data);
            
            if (res.code === '0') {
                this.setFlashConfig(res.data);
                return res.data;
            } else {
                throw new Error('Failed to load flash config');
            }
        } catch (error) {
            console.error('Error loading flash config:', error);
            throw error;
        } finally {
            runInAction(() => {
                this.isLoadingFlashConfig = false;
            });
        }
    }

    setFlashConfig(config: any) {
        this.flashConfig = config;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.FLASH_CONFIG, JSON.stringify(config));
        }
    }

    getFlashConfig() {
        return this.flashConfig;
    }
    clearFlashConfig() {
        this.flashConfig = { minTradeU: 0, maxTradeU: 0 };
        if (isBrowser()) {
            localStorage.removeItem(LOCAL_STORAGE_KEY.FLASH_CONFIG);
        }
    }

    async loadUsdtRate() {
        const result = await fetchUsdtPrice();
        if (result.success) {
                this.setUsdtRate(result.data);

        }
    }
    initUsdtRateFromStorage() {
        if (!isBrowser()) return;
        try {
            const usdtRateJson = localStorage.getItem(LOCAL_STORAGE_KEY.USDT_RATE);
            if (usdtRateJson) {
                this.usdtRate = JSON.parse(usdtRateJson);
            }
        } catch (error) {
            console.error('Failed to load usdt rate from storage:', error);
        }
    }
    setUsdtRate(price: any) {
        this.usdtRate = price;
        if (isBrowser()) {
            localStorage.setItem(LOCAL_STORAGE_KEY.USDT_RATE, JSON.stringify(price));
        }
    }
    getUsdtRate(): usdtRateType {
        return this.usdtRate;
    }
}

const appStore = new AppStore();
export default appStore;