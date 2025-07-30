// 参数加密及手机邮箱显示加密
import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
// 加密手机号的函数
export function encryptPhoneNumber(phoneNumber?: string | null): string {
    if (!phoneNumber) return "-"
    const length = phoneNumber.length;
    
    // 长度为5位，只显示末尾3位
    if (length === 5) {
        return '**' + phoneNumber.slice(-3);
    }
    // 长度小于7但大于5，显示首2末尾3位
    else if (length < 7) {
        return phoneNumber.slice(0, 2) + '*'.repeat(length - 5) + phoneNumber.slice(-3);
    }
    // 长度大于等于7，显示首3末尾3位
    return phoneNumber.slice(0, 3) + '*'.repeat(length - 6) + phoneNumber.slice(-3);
}

// 加密邮箱号的函数
export function encryptEmail(email?: string | null): string {
    if (!email) return "-"
    const [name, domain] = email.split('@');
    const nameLength = name.length;
    if (nameLength <= 4) {
        // 长度小于等于4时，保留后两位，前面用3个*
        return '***' + name.slice(-2) + '@' + domain;
    }
    // 长度大于4时，保留前两位和后两位，中间用3个*
    return name.slice(0, 2) + '***' + name.slice(-2) + '@' + domain;
}
// 判断字符串是邮箱还是手机号并进行加密的函数
export function encryptString(input: string | null): string {
    if (!input) return "-"
    // 邮箱正则表达式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // 手机号正则表达式（简单示例，仅匹配 11 位数字）
    const phoneRegex = /^\d{4,15}$/;
    if (emailRegex.test(input)) {
        return encryptEmail(input);
    } else if (phoneRegex.test(input)) {
        return encryptPhoneNumber(input);
    }
    // 如果既不是邮箱也不是手机号，原样返回
    return input;
}
// 身份证号加密
export function encryptIdCard(idCard: string): string {
    // 检查传入的参数是否为有效的字符串
    if (typeof idCard !== 'string' || idCard.length < 5) {
        return idCard;
    }
    // 提取身份证号的前两位
    const start = idCard.slice(0, 2);
    // 提取身份证号的后三位
    const end = idCard.slice(-3);
    // 生成用于替换中间部分的 * 字符串
    const encryptedPart = '*'.repeat(idCard.length - 5);
    // 拼接前两位、* 字符串和后三位
    return start + encryptedPart + end;
}
// 获取优惠值
export const getBenefitValue = (text: string) => {
    let text1 = JSON.parse(text);
    const amount = Number(text1.amountLimit);
    let amountRes = '';
    if (!isNaN(amount) && amount > 1000) {
        // 去掉末尾三个 0 并添加 'K' 后缀
        amountRes = (amount / 1000).toString() + 'K';
    } else {
        amountRes = amount.toString();
    }
    return `${amountRes} ${text1.coin} ${text1.time}h`
}


// 加密传参
// 定义单次加密的最大字节长度（根据实际RSA密钥长度调整）
// 例如：2048位RSA密钥可以加密最多245字节
const MAX_ENCRYPT_CHUNK_SIZE = 200; // 保守估计，留出一些余量

/**
 * 将字符串分割成指定大小的块
 * @param str 要分割的字符串
 * @param size 每个块的最大字节大小
 * @returns 分割后的字符串数组
 */
function splitStringIntoChunks(str: string, size: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    let currentSize = 0;
    
    // 遍历字符串中的每个字符
    for (let i = 0; i < str.length; i++) {
        // 获取当前字符的UTF-8编码字节长度
        const char = str[i];
        const charSize = new TextEncoder().encode(char).length;
        
        // 如果添加当前字符会超出块大小，则开始新块
        if (currentSize + charSize > size) {
            chunks.push(currentChunk);
            currentChunk = char;
            currentSize = charSize;
        } else {
            currentChunk += char;
            currentSize += charSize;
        }
    }
    
    // 添加最后一个块
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks;
}

/**
 * 加密数据，支持大数据分段加密
 * @param data 要加密的数据
 * @returns 加密后的数据对象
 */
export const encryptData = async (data: any) => {
    try {
        // 将数据转换为JSON字符串
        const jsonString = JSON.stringify(data);
        
        // 检查数据大小
        const dataBytes = new TextEncoder().encode(jsonString).length;
        
        let encryptedData: string;
        
        if (dataBytes <= MAX_ENCRYPT_CHUNK_SIZE) {
            // 数据大小在限制范围内，直接加密
            encryptedData = await encryptWithPublicKey(jsonString) || "";
        } else {
            // 数据超出大小限制，需要分段加密
            // 1. 分割数据
            const chunks = splitStringIntoChunks(jsonString, MAX_ENCRYPT_CHUNK_SIZE);
            
            // 2. 加密每个分段
            const encryptedChunks = await Promise.all(
                chunks.map(async (chunk) => {
                    const encrypted = await encryptWithPublicKey(chunk) || "";
                    return encrypted;
                })
            );
            
            // 3. 将加密后的分段用冒号拼接成一个字符串
            encryptedData = encryptedChunks.join(':');
        }
        
        // 构建返回对象
        const dataEncrypt = {
            data: encryptedData,
            time: dayjs(new Date().getTime()).valueOf(),
            reqNo: uuidv4(),
        };
        
        return dataEncrypt;
    } catch (error) {
        console.error('Encryption failed:', error);
        return {
            data: "",
            time: dayjs(new Date().getTime()).valueOf(),
            reqNo: uuidv4(),
            error: error instanceof Error ? error.message : 'Unknown encryption error'
        };
    }
};

// 加密ip
export const encryptIp = (ip: string) => {
  // 判断 IPv4 格式
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  }

  // 判断 IPv6 格式（8段以内）
  if (/^[0-9a-fA-F:]+$/.test(ip)) {
    const parts = ip.split(':');
    const masked = [
      parts[0] || '*',
      parts[1] || '*',
      '*', '*', '*', '*', '*', '*'
    ];
    return masked.join(':');
  }

  return ip;
}
