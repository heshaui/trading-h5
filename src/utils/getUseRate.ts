import appStore from '@/store';
import { nul, roundDown, division } from '@/utils';
import BigNumber from 'bignumber.js';
/*
* @param symbolName 币种符号
* @param num 数量
* @param baseSymbolName 基础币种符号
* @param type 方向 0:正向-币种coinSymbol换算 计价币种baseSymbol 1:反向-计价币种计价币种baseSymbol换算 币种币种coinSymbol换算
* @returns 汇率
*/
// 单个币种数量-币种汇率换算
export const getCoinRate = (symbolName: string, priceNum: string | number, baseSymbolName: string = 'USDT', type: number = 0) => {
    try {
        // 获取币种信息 coin-usdt
        const coinInfo = appStore.getCurrentPairList() || [] //appStore.getCoinList()
        // 获取usdt价格
        const usdtPrice = appStore.getUsdtRate() || appStore.usdtRate
        const usdtRate = usdtPrice?.nowPrice || usdtPrice?.yesterdayPrice || 1

        // 如果是 USDT，根据计价币种决定是否需要汇率转换
        if (symbolName.toUpperCase() === 'USDT') {

            return {
                coinRate: Number(priceNum) * Number(usdtRate) || 0,
                price: Number(usdtRate),
            };
        }

        // 查找正向币对 (symbolName/baseSymbolName)
        const directCoin = coinInfo.find((item: any) =>
            item.coinSymbol === symbolName && item.baseSymbol === baseSymbolName
        );

        // 查找反向币对 (baseSymbolName/symbolName)
        const reverseCoin = coinInfo.find((item: any) =>
            item.coinSymbol === baseSymbolName && item.baseSymbol === symbolName
        );

        // 获取币种价格
        let price = 0;
        let isReversePair;

        if (directCoin) {
            // 使用正向币对价格
            price = directCoin?.price && Number(directCoin?.price) > 0 ? Number(directCoin?.price) :
                directCoin?.yesterdayPrice && Number(directCoin?.yesterdayPrice) > 0 ? Number(directCoin?.yesterdayPrice) :
                    directCoin?.openingPrice && Number(directCoin?.openingPrice) > 0 ? Number(directCoin?.openingPrice) : 0;
            isReversePair = false;

            // // 如果计价币是USDT，正向币对需要乘以usdtRate
            // if (baseSymbolName.toUpperCase() === 'USDT' && price > 0 && Number(usdtRate) > 0) {
            //     price = nul(price, Number(usdtRate));
            // }
        } else if (reverseCoin) {
            // 使用反向币对价格
            price = reverseCoin?.price && Number(reverseCoin?.price) > 0 ? Number(reverseCoin?.price) :
                reverseCoin?.yesterdayPrice && Number(reverseCoin?.yesterdayPrice) > 0 ? Number(reverseCoin?.yesterdayPrice) :
                    reverseCoin?.openingPrice && Number(reverseCoin?.openingPrice) > 0 ? Number(reverseCoin?.openingPrice) : 0;
            isReversePair = true;

            // // 如果计价币是USDT，反向币对需要除以usdtRate
            // if (baseSymbolName.toUpperCase() === 'USDT' && price > 0 && Number(usdtRate) > 0) {
            //     price = division(price, Number(usdtRate));
            // }
        }

        let useRate = 0;

        // 根据币对方向和类型选择计算方法
        if ((type === 0 && !isReversePair) || (type === 1 && isReversePair)) {
            // 正向币对且type=0 或 反向币对且type=1：使用乘法
            useRate = Number(priceNum) === 0 ? 0 : nul(Number(priceNum), price || 0);
        } else {
            // 反向币对且type=0 或 正向币对且type=1：使用除法
            useRate = price === 0 ? 0 : division(Number(priceNum), price);
        }

        return {
            coinRate: useRate || 0, // 价格
            price: price || 0,
        };

    } catch (error) {
        // 发生错误时返回默认值
        console.error('Error in getCoinRate:', error);
        return {
            coinRate: 0,
            price: 0
        };
    }
};

/*
* @param symbolName 币种符号
* @param num 数量
* @param rateName 汇率名称
* @returns ratetext 汇率返回内容1,rate 换算后汇率,symbol 汇率符号,shortName 汇率名称
*/
// 单个币种数量-法币汇率换算
export const getRate = (symbolName: string, priceNum: string | number, rateName: string = 'USD', baseSymbolName: string = 'USDT') => {
    try {

        // 获取汇率数据 usdt-$
        const rateData = appStore.getRateData() || [];
        // 获取币种信息 coin-usdt
        const coinInfo = appStore.getCurrentPairList() || [] //appStore.getCoinList() 
        // ||appStore.getCoinList() || [];
        // 获取usdt价格
        const usdtPrice = appStore.getUsdtRate() || appStore.usdtRate
        const usdtRate = usdtPrice?.nowPrice || usdtPrice?.yesterdayPrice || 1

        // 获取币种价格
        const getCoinPrice = () => {
            // 如果是 USDT，直接返回 usdtRate
            if (symbolName.toUpperCase() === 'USDT') {
                return {
                    price: Number(usdtRate),
                    isReversePair: false
                };
            }

            // 查找正向币对 (symbolName/baseSymbolName)
            const directCoin = coinInfo.find((item: any) =>
                item.coinSymbol === symbolName && item.baseSymbol === baseSymbolName
            );

            // 查找反向币对 (baseSymbolName/symbolName)
            const reverseCoin = coinInfo.find((item: any) =>
                item.coinSymbol === baseSymbolName && item.baseSymbol === symbolName
            );
            // 获取币种价格
            let price = 0;
            let isReversePair;

            if (directCoin) {
                // 使用正向币对价格
                price = directCoin?.price && Number(directCoin?.price) > 0 ? Number(directCoin?.price) :
                    directCoin?.yesterdayPrice && Number(directCoin?.yesterdayPrice) > 0 ? Number(directCoin?.yesterdayPrice) :
                        directCoin?.openingPrice && Number(directCoin?.openingPrice) > 0 ? Number(directCoin?.openingPrice) : 0;
                isReversePair = false;

                // 如果计价币是USDT，正向币对需要乘以usdtRate
                if (baseSymbolName.toUpperCase() === 'USDT' && price > 0 && Number(usdtRate) > 0) {
                    price = nul(price, Number(usdtRate));
                }
            } else if (reverseCoin) {
                // 使用反向币对价格
                price = reverseCoin?.price && Number(reverseCoin?.price) > 0 ? Number(reverseCoin?.price) :
                    reverseCoin?.yesterdayPrice && Number(reverseCoin?.yesterdayPrice) > 0 ? Number(reverseCoin?.yesterdayPrice) :
                        reverseCoin?.openingPrice && Number(reverseCoin?.openingPrice) > 0 ? Number(reverseCoin?.openingPrice) : 0;
                isReversePair = true;

                // 如果计价币是USDT，反向币对需要除以usdtRate
                if (baseSymbolName.toUpperCase() === 'USDT' && price > 0 && Number(usdtRate) > 0) {
                    price = division(price, Number(usdtRate));
                }
            } else {
                price = 0;
                isReversePair = false;
            }

            return {
                price,
                isReversePair
            };
        };

        // 获取汇率
        const getExchangeRate = () => {
            const rate = rateData.find((item: any) =>
                item.shortName === rateName.trim()
            );

            return {
                ...rate,
                exchangeRate: Number(rate?.exchangeRate),
                symbol: rate?.symbol || '',
                shortName: rate?.shortName || ''
            }
        };

        const { exchangeRate, symbol, shortName, accuracy } = getExchangeRate();
        // 计算最终结果
        const calculateRate = () => {
            const { price, isReversePair } = getCoinPrice();

            // 如果没有汇率数据，返回 '--'
            if (!exchangeRate) {
                return '--';
            }

            // 使用 BigNumber 保持 priceNum 的精度
            const priceNumBN = new BigNumber(priceNum);
            const num1 = !isReversePair ? nul(price, priceNumBN.toNumber()) : price ? division(priceNumBN.toNumber(), price) : 0;
            // const num1 = getCoinRate(symbolName, priceNumBN.toNumber(), baseSymbolName).price
            // console.log(price,priceNum,isReversePair,num1,999);
            const num2 = nul(num1, exchangeRate);
            // 使用 nul 函数计算最终结果
            // return roundDown(num2,accuracy||2);
            return num2
        };

        return {
            ratetext: `${symbol || ''} ${calculateRate() || 0}`, // 汇率返回内容
            rate: calculateRate() || 0, // 汇率结果
            symbol: symbol || '', // 汇率符号
            shortName: shortName || '' // 汇率名称
        };

    } catch (error) {
        // 发生错误时返回默认值
        console.error('Error in getRate:', error);
        return {
            ratetext: '--',
            rate: '0',
            symbol: '--',
            shortName: '--'
        };
    }
};

/*
* @param num 币对价格
* @param rateName 汇率名称
* @returns rate 换算后汇率,rateSymbol 汇率符号,shortName 汇率名称
*/
// 币对价格-换算为法币
export const getPairsRate = (num: string | number, rateName: string = 'USD') => {
    // 获取汇率数据 usdt-$
    const rateData = appStore.getRateData() || [];
    // ||appStore.getCoinList() || [];
    // 获取usdt价格
    // const usdtPrice = appStore.getUsdtRate() || appStore.usdtRate
    // const usdtRate = usdtPrice?.nowPrice || usdtPrice?.yesterdayPrice || 1
    // 获取汇率
    const getExchangeRate = () => {
        const rate = rateData.find((item: any) =>
            item.shortName === rateName.trim()
        );

        return {
            ...rate,
            exchangeRate: Number(rate?.exchangeRate),
            rateSymbol: rate?.symbol || '',
            shortName: rate?.shortName || ''
        }
    };

    const { exchangeRate, rateSymbol, shortName } = getExchangeRate();
    const result=nul(num,exchangeRate)
    return {
        rate: result,
        rateSymbol: rateSymbol,
        shortName: shortName
    }
}


// 币对精度
export const getRound = (symbolPairs: string, num: string | number, symbolName?: string, baseSymbolName?: string,) => {

    try {
        const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
        const coin = coinList.find((item: any) => {
            return (item.coinSymbol === symbolName && item.baseSymbol === baseSymbolName) ||
                (item.symbol === symbolPairs)
        });
        const scaleResult = roundDown(num, coin?.coinScale || 0);
        const baseScaleResult = roundDown(num, coin?.baseCoinScale || 0);
        return {
            scaleResult: scaleResult,
            baseScaleResult: baseScaleResult,
            coinScale: coin?.coinScale || 0,
            baseCoinScale: coin?.baseCoinScale || 0,
            baseSymbol: coin?.baseSymbol || '--',
            coinSymbol: coin?.coinSymbol || '--'
        }
    } catch (error) {
        // 发生错误时返回默认值
        console.error('Error in getRound:', error);
        return {
            scaleResult: 0,
            baseScaleResult: 0,
            coinScale: 0,
            baseCoinScale: 0,
            baseSymbol: '--',
            coinSymbol: '--'
        };
    }
};

// 币种精度
export const getCoinRound = (coinName: string, num: string | number) => {

    try {
        const coinList = appStore.getCoinList(); // 货币对列表
        const coin = coinList.find((item: any) => item.coinName === coinName);
        const scaleResult = roundDown(num, coin?.unitScale || 0);
        return scaleResult
    } catch (error) {
        // 发生错误时返回默认值
        console.error('Error in getRound:', error);
        return 0;
    }
}