import appStore from '@/store';
import { nul, roundDown, division } from '@/utils';
import BigNumber from 'bignumber.js';
/*
* @param symbolName 币种符号
* @param num 数量
* @param baseSymbolName 基础币种符号
* @param type 方向 0:正向-币种coinSymbol换算 计价币种baseSymbol 1:反向-计价币种计价币种baseSymbol换算 币种币种coinSymbol换算
* @returns coinRate换算后结果,price汇率
*/
// 单个币种数量-币种汇率换算
export const getCoinRate = (symbolName: string, priceNum: string | number, baseSymbolName: string = 'USDT', type: number = 0) => {
    try {
        const coinInfo = appStore.getCurrentPairList() || [];
        const usdtPrice = appStore.getUsdtRate() || appStore.usdtRate;
        const usdtRate = usdtPrice?.nowPrice || usdtPrice?.yesterdayPrice || 1;

        // USDT 特殊处理
        if (symbolName.toUpperCase() === 'USDT') {
            return {
                coinRate: Number(priceNum) || 0,
                price: 1,
            };
        }

        // 辅助函数：获取币对价格信息
        const getPairPrice = (coinSymbol: string, baseSymbol: string) => {
            const directPair = coinInfo.find((item: any) =>
                item.coinSymbol === coinSymbol && item.baseSymbol === baseSymbol
            );
            const reversePair = coinInfo.find((item: any) =>
                item.coinSymbol === baseSymbol && item.baseSymbol === coinSymbol
            );

            const extractPrice = (pair: any) => {
                return pair?.price && Number(pair.price) > 0 ? Number(pair.price) :
                    pair?.yesterdayPrice && Number(pair.yesterdayPrice) > 0 ? Number(pair.yesterdayPrice) :
                        pair?.openingPrice && Number(pair.openingPrice) > 0 ? Number(pair.openingPrice) : 0;
            };

            if (directPair) {
                return { price: extractPrice(directPair), isReverse: false, found: true };
            }
            if (reversePair) {
                return { price: extractPrice(reversePair), isReverse: true, found: true };
            }
            return { price: 0, isReverse: false, found: false };
        };

        // 辅助函数：根据类型和方向计算汇率
        const calculateRate = (price: number, isReverse: boolean) => {
            const shouldMultiply = (type === 0 && !isReverse) || (type === 1 && isReverse);
            return shouldMultiply 
                ? (Number(priceNum) === 0 ? 0 : nul(Number(priceNum), price))
                : (price === 0 ? 0 : division(Number(priceNum), price));
        };

        // 第一步：尝试直接币对转换
        const directResult = getPairPrice(symbolName, baseSymbolName);
        if (directResult.found && directResult.price > 0) {
            const useRate = calculateRate(directResult.price, directResult.isReverse);
            return {
                coinRate: useRate || 0,
                price: directResult.price || 0,
            };
        }

        // 第二步：尝试两次换算
        const allCoins = new Set<string>();
        coinInfo.forEach((pair: any) => {
            allCoins.add(pair.coinSymbol);
            allCoins.add(pair.baseSymbol);
        });

        const intermediateCoins = Array.from(allCoins).filter(coin => 
            coin !== symbolName && coin !== baseSymbolName
        );

        for (const intermediateCoin of intermediateCoins) {
            const step1 = getPairPrice(symbolName, intermediateCoin);
            const step2 = getPairPrice(intermediateCoin, baseSymbolName);

            if (step1.found && step1.price > 0 && step2.found && step2.price > 0) {
                // 计算两次换算的最终价格
                const intermediatePrice = step1.isReverse ? division(1, step1.price) : step1.price;
                const finalPrice = step2.isReverse 
                    ? division(intermediatePrice, step2.price) 
                    : nul(intermediatePrice, step2.price);

                if (finalPrice > 0 && isFinite(finalPrice)) {
                    const useRate = type === 0 
                        ? (Number(priceNum) === 0 ? 0 : nul(Number(priceNum), finalPrice))
                        : (finalPrice === 0 ? 0 : division(Number(priceNum), finalPrice));

                    // 调试日志
                    // console.log(`Two-step conversion: ${symbolName} -> ${intermediateCoin} -> ${baseSymbolName}, price: ${finalPrice}`);

                    return {
                        coinRate: useRate || 0,
                        price: finalPrice || 0,
                    };
                }
            }
        }

        // 所有方法失败，返回默认值
        console.warn(`No conversion path found for ${symbolName}/${baseSymbolName}`);
        return {
            coinRate: 0,
            price: 0,
        };

    } catch (error) {
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
            // 如果没有汇率数据，返回 '--'
            if (!exchangeRate) {
                return '--';
            }

            // 特殊处理：如果源币种是USDT且目标币种也是USDT，直接计算
            if (symbolName.toUpperCase() === 'USDT' && baseSymbolName.toUpperCase() === 'USDT') {
                // 使用 BigNumber 保持 priceNum 的精度
                const priceNumBN = new BigNumber(priceNum);
                const num2 = nul(priceNumBN.toNumber(), exchangeRate);
                return num2;
            }

            // 调用 getCoinRate 获取币种间的汇率
            const coinRateResult = getCoinRate(symbolName, priceNum, baseSymbolName, 0);
            
            // 如果币种汇率计算失败，返回 0
            if (!coinRateResult.coinRate || coinRateResult.coinRate <= 0) {
                console.warn(`Failed to get coin rate for ${symbolName}/${baseSymbolName}. Conversion path attempted.`);
                return 0;
            }

            // 将币种汇率结果与法币汇率相乘
            const num2 = nul(coinRateResult.coinRate, exchangeRate);
            
            // 添加调试信息
            // console.log(`getRate calculation: ${symbolName}(${priceNum}) -> ${baseSymbolName}(${coinRateResult.coinRate}) -> ${rateName}(${num2})`);
            
            return num2;
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

// 测试函数：验证两次换算功能
export const testTwoStepConversion = () => {
    console.log('=== Testing Two-Step Conversion ===');
    
    // 测试 getCoinRate 函数
    console.log('--- Testing getCoinRate ---');
    // 测试案例1: ADA -> USDT (coin rate)
    const coinResult1 = getCoinRate('ADA', 100, 'USDT', 0);
    console.log('ADA to USDT coin rate (type 0):', coinResult1);
    
    // 测试案例2: BTC -> USDT (coin rate, direct)
    const coinResult2 = getCoinRate('BTC', 1, 'USDT', 0);
    console.log('BTC to USDT coin rate (direct):', coinResult2);
    
    // 测试 getRate 函数（重构后调用 getCoinRate）
    console.log('--- Testing getRate (using getCoinRate) ---');
    // 测试案例3: ADA -> USDT -> USD (通过 getCoinRate)
    const result1 = getRate('ADA', 100, 'USD', 'USDT');
    console.log('ADA to USD (via getCoinRate):', result1);
    
    // 测试案例4: BTC -> USDT -> USD (直接币对)
    const result2 = getRate('BTC', 1, 'USD', 'USDT');
    console.log('BTC to USD (direct via getCoinRate):', result2);
    
    // 测试案例5: USDT -> USDT -> USD (特殊情况)
    const result3 = getRate('USDT', 100, 'USD', 'USDT');
    console.log('USDT to USD (special case):', result3);
    
    // 测试案例6: DOT -> BTC -> EUR (两次换算 + 欧元)
    const result4 = getRate('DOT', 50, 'EUR', 'BTC');
    console.log('DOT to EUR (via BTC):', result4);
    
    console.log('=== Test Complete ===');
};