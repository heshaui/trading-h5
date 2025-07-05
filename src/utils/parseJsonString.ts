// JSON字符串解析
export const parseJsonString = (value: string) => {
    if (!value) return null;

    // 如果不是以 { 或 [ 开头，说明不是 JSON 字符串，直接返回原值
    if (!value.trim().startsWith('{') && !value.trim().startsWith('[')) {
        return value;
    }

    try {
        // 修复JSON格式问题
        const fixedJsonString = value
            .replace(/([{,]\s*)([a-zA-Z0-9_]+):/g, '$1"$2":')
            .replace(/:\s*'([^']*?)'/g, ':"$1"');
        
        return JSON.parse(fixedJsonString);
    } catch (error) {
        console.error('解析JSON失败:', error);
        // 如果解析失败，返回原始值
        return value;
    }
};
