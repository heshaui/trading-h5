import { getExchangeGroup, getExchangeCoinList, getUserExchangeCoinTypeList, getExchangeCoinAllPrice } from '@/services/spot';
import { getCoinAll } from '@/services/assets';
import appStore from '@/store/index';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig"
import { getUsdtPriceWithStables } from "@/services/marketData"
import { CurrencyPairType, CoinType } from "@/type/assets/spot/exchange"
import { usdtRateType } from "@/type/userCenter/overview"
// 获取所有币对数据
export async function fetchAllCurrencyPairs() {
    const userToken = appStore.getUserToken();
    try {
        // 1. 获取币种列表
        const coinListResponse = await getExchangeCoinList();
        if (coinListResponse.code !== '0') {
            throw new Error('Failed to load coin list');
        }

        const coinList = coinListResponse.data || [];
        // console.log('coinList', coinList);

        // 2. 获取交易对组信息
        const groupResponse = await getExchangeGroup();
        if (groupResponse.code !== '0') {
            throw new Error('Failed to load exchange groups');
        }

        const groups = groupResponse.data || [];
        // console.log('groups', groups);

        // 3. 获取用户自选币对（如果用户已登录）
        let favoriteCoins: any[] = [];

        if (userToken) {
            try {
                const favoriteResponse = await getUserExchangeCoinTypeList();
                if (favoriteResponse.code === '0') {
                    favoriteCoins = favoriteResponse.data || [];
                }
            } catch (error) {
                console.error('Error loading favorite coins:', error);
            }
        }

        // 4. 获取币对价格数据
        const priceResponse = await getExchangeCoinAllPrice();
        let priceData: any[] = [];
        if (priceResponse.code === '0') {
            priceData = priceResponse.data || [];
            // console.log('priceData', priceData);
        }

        // 5. 合并数据并转换为CurrencyPairType格式
        const processedPairs: CurrencyPairType[] = [];

        coinList.forEach((coin: any) => {
            // 查找对应的组信息
            const group = groups.find((g: any) =>
                g.baseSymbol === coin.baseSymbol &&
                g.coinSymbol === coin.coinSymbol
            );

            // 确定是否为自选币对
            const pairId = coin.id;
            const isFavorite = favoriteCoins.some((favCoin: any) =>
                favCoin === pairId.toString()
            );

            // 查找价格数据
            const priceInfo = priceData.find((p: any) =>
                p.baseSymbol === coin.baseSymbol &&
                p.coinSymbol === coin.coinSymbol
            );

            // 计算价格变化百分比
            let priceChangePercent = 0;
            if (priceInfo && priceInfo.yesterdayPrice && priceInfo.yesterdayPrice > 0) {
                priceChangePercent = ((priceInfo.price - priceInfo.yesterdayPrice) / priceInfo.yesterdayPrice) * 100;
            }

            // 转换为标准CurrencyPairType格式
            const currencyPair: CurrencyPairType = {

                id: pairId,
                symbol: `${coin.coinSymbol}/${coin.baseSymbol}`,
                baseSymbol: coin.baseSymbol,
                coinSymbol: coin.coinSymbol,
                groupStatus: group?.groupStatus,
                isFavorite: isFavorite,
                baseCoinScale: coin?.baseCoinScale,
                buyFee: coin?.buyFee,
                classLabel: coin?.classLabel,
                coinScale: coin?.coinScale,
                depthFour: coin?.depthFour,
                depthOne: coin?.depthOne,
                depthThree: coin?.depthThree,
                depthTwo: coin?.depthTwo,
                enable: coin?.enable,
                enableBuy: coin?.enableBuy,
                enableSell: coin?.enableSell,
                maxBaseVolume: coin?.maxBaseVolume,
                maxCurrentPrice: coin?.maxCurrentPrice,
                maxMarketPrice: coin?.maxMarketPrice,
                maxVolume: coin?.maxVolume,
                minBaseVolume: coin?.minBaseVolume,
                minVolume: coin?.minVolume,
                openingPrice: coin?.openingPrice,
                priceOffset: coin?.priceOffset,
                sellFee: coin?.sellFee,
                show: coin?.show,
                price: priceInfo?.price,
                yesterdayPrice: priceInfo?.yesterdayPrice,
                quantity: priceInfo?.quantity || 0,
                priceChangePercent: priceChangePercent
            };

            // console.log('currencyPair', currencyPair);
            processedPairs.push(currencyPair);
        });

        //6.  获取USDT相对USD价格
        const UsdPriceRes = await getUsdtPriceWithStables()
        if (UsdPriceRes.code !== '0') {
            throw new Error('Failed to load UsdtPrice');
        }
        const UsdPrice = UsdPriceRes.data;

        return {
            success: true,
            data: processedPairs,
            rawData: coinList,
            usdtPrice: UsdPrice
        };
    } catch (error) {
        console.error('Error fetching currency pairs:', error);
        return {
            success: false,
            error,
            data: [],
            rawData: [],
            usdtPrice: {} as usdtRateType
        };
    }
}

// 获取用户自选币对
export async function fetchUserFavorites() {
    try {
        const response = await getUserExchangeCoinTypeList();
        if (response.code === '0') {
            return {
                success: true,
                data: response.data || []
            };
        }
        return {
            success: false,
            data: [],
            error: new Error('Failed to get favorites')
        };
    } catch (error) {
        console.error('Failed to load favorite coins:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
}

// 添加自选币对到服务器（需实现）
export async function addToFavorites(baseCurrency: string, quoteCurrency: string) {
    // 实现添加自选币对的API调用
    // return await addFavoriteApi({ baseCurrency, quoteCurrency });
    console.log('Add to favorites', baseCurrency, quoteCurrency);
    return { success: true };
}

// 从服务器移除自选币对（需实现）
export async function removeFromFavorites(baseCurrency: string, quoteCurrency: string) {
    // 实现移除自选币对的API调用
    // return await removeFavoriteApi({ baseCurrency, quoteCurrency });
    console.log('Remove from favorites', baseCurrency, quoteCurrency);
    return { success: true };
}

// 获取币对价格数据
export async function fetchCurrencyPairPrices() {
    try {
        const response = await getExchangeCoinAllPrice();
        if (response.code === '0') {
            return {
                success: true,
                data: response.data || []
            };
        }
        return {
            success: false,
            data: [],
            error: new Error('获取币对价格失败')
        };
    } catch (error) {
        console.error('获取币对价格出错:', error);
        return {
            success: false,
            data: [],
            error
        };
    }
}

// 获取所有币种
// 获取所有币种
export async function fetchAllCoin(needPrice: boolean = false) {
    const userToken = appStore.getUserToken();
    if (!userToken) return {
        success: false,
        data: [],
        rawData: [],
        error: new Error('未登录')
    };
    try {
        // 1. 获取币种列表
        const coinListResponse = await getCoinAll();
        if (coinListResponse.code !== '0') {
            throw new Error('Failed to load coin list');
        }

        const coinList = coinListResponse.data || [];
        let processedCoins = coinList;

        // 2. 如果需要汇率价格数据，则获取并合并
        if (needPrice) {
            const priceResponse = await getExchangeCoinAllPrice();
            let priceData: any[] = [];
            if (priceResponse.code === '0') {
                priceData = priceResponse.data || [];
            }

            // 合并数据
            processedCoins = coinList.map((coin: any) => {
                const priceInfo = priceData.find((p: any) =>
                    p.coinSymbol === coin.coinName
                );
                return {
                    ...coin,
                    ...priceInfo
                };
            });
        }

        return {
            success: true,
            data: processedCoins,
            rawData: coinList
        };
    } catch (error) {
        console.error('获取币种列表出错:', error);
        return {
            success: false,
            data: [],
            rawData: [],
            error
        };
    }
}

// 获取USDT相对USD价格
export const fetchUsdtPrice = async () => {
    try {

        const UsdPriceRes = await getUsdtPriceWithStables()
        if (UsdPriceRes.code !== '0') {
            return {
                success: false,
                data: {},
            }
        }
        return {
            success: true,
            data: UsdPriceRes.data,
        }
    } catch (error) {
        return {
            success: false,
            data: {},
        }
    }
}