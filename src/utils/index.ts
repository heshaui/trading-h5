import { 
    add,
    cut, 
    nul, 
    division,
    lastD,
    roundOff, 
    roundDown, 
    roundUp,
    formatted
    } from './math';
// import myStorage from './myStorage'
import { diffTime,formatTime } from './time'

const withdrawFee = (amountNum: number, freeNum: number, minFee?: number) => {
    // 将手续费率转换为百分比
    const feeRate = division(freeNum, 100)
    
    // 计算实际手续费
    const actualFee = nul(amountNum, feeRate)
    console.log(actualFee);
    // 返回最终手续费(取最小手续费和实际费率计算结果的较大值)
    // return minFee && actualFee < minFee ? minFee : actualFee
    return minFee||0
}

// 预估金额
const countNum = (amountNum: number, freeNum: number, minFee?: number) => {
    // 获取最终手续费
    const finalFee = withdrawFee(amountNum, freeNum, minFee)
    
    // 预估到账 = 提现金额 - 最终手续费
    const estimatedAmount = cut(amountNum, finalFee)
    
    // 如果预估金额为负数，返回0
    return  Number(estimatedAmount) < 0 ? 0 : estimatedAmount
}

// 根据precision精度格式数字显示
const formatNumWithPrecision = (num: number | string | null | undefined, precision: number = 2): string => {
    if (!num || num === '' || num === null || num === undefined) return '--';  
    const numPrice = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numPrice)) return '--';
    precision = precision ?? 2;
    const result = formatted(roundDown(num, precision));
    return result.replace(/\.?0+$/, '');
};

// 辅助函数：格式化大额数字
const formatAmount = (amount: number, t: Function) => {
    if (amount >= 100000000) {
        return formatted((amount / 100000000).toFixed(2)) + t('spot:spot.header.billion');
    } else if (amount >= 10000) {
        return formatted((amount / 10000).toFixed(2)) + t('spot:spot.header.tenThousand');
    } else {
        return amount.toFixed(2);
    }
};

export {
    add, // 加法
    cut, // 减法
    nul, // 乘法
    division, // 除法
    lastD, // 删除小数点最后面的0
    diffTime,
    formatTime,
    roundOff, //精度 四舍五入
    roundDown, //精度 向下取整/去尾法
    roundUp, //精度 向上取整/进一法
    countNum, // 预估金额
    withdrawFee, // 手续费
    formatted,
    formatNumWithPrecision,
    formatAmount
}
