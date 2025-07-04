function add(arg1: number, arg2: number): number {
  let r1: number;
  let r2: number;
  let m = 0;

  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = 10 ** Math.max(r1, r2);
  return (arg1 * m + arg2 * m) / m;
}

function cut(arg1: number, arg2: number): string {
  let r1: number;
  let r2: number;
  let m = 0;
  let n = 0;

  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = 10 ** Math.max(r1, r2);
  n = r1 >= r2 ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

function nul(arg1: number | string, arg2: number | string): number {
  if (arg1 === undefined || arg1 === null || arg2 === undefined || arg2 === null) {
    return 0;
  }

  let m = 0;
  const s1 = String(arg1);
  const s2 = String(arg2);

  try {
    m += s1.split('.')[1]?.length || 0;
  } catch (e) {
  }
  try {
    m += s2.split('.')[1]?.length || 0;
  } catch (e) {
  }
  return (
    (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) /
    10 ** m
  );
}

function division(arg1: number, arg2: number): number {
  let t1 = 0;
  let t2 = 0;
  let r1: number;
  let r2: number;

  try {
    t1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    // No decimal places in arg1
  }
  try {
    t2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    // No decimal places in arg2
  }
  r1 = Number(arg1.toString().replace('.', ''));
  r2 = Number(arg2.toString().replace('.', ''));
  return (r1 / r2) * 10 ** (t2 - t1);
}

function lastD(num: number | string | null | undefined): string | number | null | undefined {
  if (!num) return num;

  const newNum: string = `${num}`;
  const str: string | undefined = newNum.split('.')[1];
  if (!str) return newNum;

  function substring(stri: string): string {
    const arr: string[] = stri.split('');
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (arr[i] === '0') {
        arr.splice(i);
      } else {
        break;
      }
    }
    if (!arr.length) return newNum.split('.')[0];
    return `${newNum.split('.')[0]}.${arr.join('')}`;
  }

  return substring(str);
}

function thousandsComma(num: number | string | undefined | null): string {
  let Num: string = (num || 0).toString();
  let symbol = '';

  // 判断是否有正负号
  if (/^\+|^-/.test(Num)) {
    symbol = Num.substr(0, 1);
    Num = Num.substr(1);
  }

  let floatNum = ''; // 小数部分
  let intNum = ''; // 整数部分

  // 判断是否有小数位，有则截取小数点后的数字
  if (Num.indexOf('.') > 0) {
    const number = Num.indexOf('.'); // 获取小数点出现的位置
    floatNum = Num.substr(number); // 截取小数点及后续数字
    intNum = Num.substring(0, number); // 截取小数点前的数字
  } else {
    intNum = Num; // 没有小数的情况
  }

  const result: string[] = [];
  let counter = 0;
  const intNumArray = intNum.split(''); // 将整数部分转换为字符数组

  // 利用3的倍数，向数组插入','
  for (let i = intNumArray.length - 1; i >= 0; i -= 1) {
    counter += 1;
    result.unshift(intNumArray[i]); // 从尾部插入当前字符
    if (counter % 3 === 0 && i !== 0) {
      result.unshift(','); // 每3位插入一个逗号
    }
  }

  return symbol + result.join('') + (floatNum || ''); // 拼接正负号、整数部分和小数部分
}

/**
 * 四舍五入保留小数位数
 * @param num 要处理的数字
 * @param places 要保留的小数位数，默认为0
 * @returns 处理后的数字
 */
function roundOff(num: number | string | undefined | null, places: number = 0): number | string {
  if (num === undefined || num === null || !num) return 0;

  // 将输入转换为字符串
  const numStr = typeof num === 'string' ? num : num.toString();

  // 如果输入是0，直接返回0
  if (parseFloat(numStr) === 0) return 0;

  // 分割整数和小数部分
  const [intPart, decPart = ''] = numStr.split('.');

  // 如果没有小数部分，或者要求的精度为0
  if (!decPart) {
    // 如果是整数且需要精度，补充指定数量的0
    return places > 0 ? `${intPart}.${'0'.repeat(places)}` : parseInt(intPart);
  }
  if (places === 0) {
    return parseInt(intPart);
  }

  // 处理小数部分
  const truncatedDecimal = decPart.slice(0, places);
  const nextDigit = decPart[places] ? parseInt(decPart[places]) : 0;

  // 判断是否需要进位（四舍五入）
  const shouldRoundUp = nextDigit >= 5;

  if (shouldRoundUp) {
    // 需要进位，将截取的小数部分转为数字并加1
    const decimalAsNumber = parseInt(truncatedDecimal) + 1;
    const maxDecimal = Math.pow(10, places);

    if (decimalAsNumber >= maxDecimal) {
      // 如果小数部分进位后溢出，整数部分加1，小数部分归零
      return `${parseInt(intPart) + 1}.${'0'.repeat(places)}`;
    } else {
      // 正常进位
      return `${intPart}.${decimalAsNumber.toString().padStart(places, '0')}`;
    }
  }

  // 不需要进位，直接返回截取后的数字
  return `${intPart}.${truncatedDecimal.padEnd(places, '0')}`;
}

/**
 * 去尾法保留小数位数
 * @param num 要处理的数字
 * @param placesNum 要保留的小数位数，默认为0
 * @returns 处理后的数字
 */
function roundDown(num: number | string | undefined | null, placesNum: number | string = 0): string {
  if (num === undefined || num === null || !num) return '0';
  const places = Number(placesNum);
  // 将输入转换为字符串
  const numStr = typeof num === 'string' ? num : num.toString();

  // 如果输入是0，直接返回0
  if (parseFloat(numStr) === 0) return '0';

  // 分割整数和小数部分
  const [intPart, decPart = ''] = numStr.split('.');

  // 如果要求的精度为0，直接返回整数部分
  if (places === 0) {
    return parseInt(intPart).toString()
  }

  // 如果没有小数部分，补充指定数量的0
  if (!decPart) {
    return `${intPart}.${'0'.repeat(places)}`;
  }

  // 处理小数部分：只保留指定位数，并补充0到指定精度
  const truncatedDecimal = decPart.slice(0, places).padEnd(places, '0');

  // 组合整数和小数部分，转换回数字
  // return parseFloat(`${intPart}.${truncatedDecimal}`);
  return `${intPart}.${truncatedDecimal}`
}

/**
* 进一法保留小数位数
* @param num 要处理的数字
* @param places 要保留的小数位数，默认为0
* @returns 处理后的数字
*/
function roundUp(num: number | string | undefined | null, places: number = 0): number | string {
  if (num === undefined || num === null || !num) return 0;

  // 将输入转换为字符串
  const numStr = typeof num === 'string' ? num : num.toString();

  // 如果输入是0，直接返回0
  if (parseFloat(numStr) === 0) return 0;

  // 分割整数和小数部分
  const [intPart, decPart = ''] = numStr.split('.');

  // 如果没有小数部分，或者要求的精度为0
  if (!decPart) {
    // 如果是整数且需要精度，补充指定数量的0
    return places > 0 ? `${intPart}.${'0'.repeat(places)}` : parseInt(intPart);
  }
  if (places === 0) {
    return parseInt(intPart);
  }

  // 处理小数部分
  const truncatedDecimal = decPart.slice(0, places);
  const remainingDecimal = decPart.slice(places);

  // 判断是否需要进位
  const shouldRoundUp = remainingDecimal.length > 0 && /[1-9]/.test(remainingDecimal);

  if (shouldRoundUp) {
    // 需要进位，将截取的小数部分转为数字并加1
    const decimalAsNumber = parseInt(truncatedDecimal) + 1;
    const maxDecimal = Math.pow(10, places);

    if (decimalAsNumber >= maxDecimal) {
      // 如果小数部分进位后溢出，整数部分加1，小数部分归零
      return `${parseInt(intPart) + 1}.${'0'.repeat(places)}`;
    } else {
      // 正常进位
      return `${intPart}.${decimalAsNumber.toString().padStart(places, '0')}`;
    }
  }

  // 不需要进位，直接返回截取后的数字
  return `${intPart}.${truncatedDecimal.padEnd(places, '0')}`;
}

function formatted(price: number | string): string {
  if (!price) return '0';
  
  // 将价格转换为字符串
  const priceStr = price.toString();
  
  // 分割整数和小数部分
  const [intPart, decPart = ''] = priceStr.split('.');
  
  // 对整数部分添加千位分隔符
  const formattedIntPart = Number(intPart).toLocaleString();
  
  // 如果没有小数部分，直接返回整数部分
  if (!decPart) {
    return formattedIntPart;
  }
  
  // 对小数部分每三位添加逗号分隔符
  let formattedDecPart = '';
  for (let i = 0; i < decPart.length; i++) {
    formattedDecPart += decPart[i];
    // 每三位添加一个逗号，但不在最后添加
    if ((i + 1) % 3 === 0 && i !== decPart.length - 1) {
      formattedDecPart += ',';
    }
  }
  
  // 组合整数和小数部分
  return `${formattedIntPart}.${formattedDecPart}`;
}

export {
  add, // 加法
  cut, // 减法
  nul, // 乘法
  division, // 除法
  lastD, // 删除小数点最后面的0
  thousandsComma, // 千位数字每三位加逗号
  roundOff, // 四舍五入
  roundDown, // 向下取整
  roundUp, // 向上取整
  formatted // 格式化数字
};