export const getNextJsLocale = (langCode: string, type: number = 0): string => {
    // 0: 缩写简称 1:缩写全称
    // 确保 langCode 是小写的，以便更一致地匹配
    const lowerLangCode = langCode.toLowerCase();
    if (type === 0) {
        if (lowerLangCode.startsWith('zh_')) return 'zh';
        if (lowerLangCode.startsWith('ja_')) return 'ja';
        if (lowerLangCode.startsWith('ko_')) return 'ko';
        if (lowerLangCode.startsWith('tw_')) return 'tw';
        return 'en';
    }else {
        // 更精确的匹配
        if (lowerLangCode.startsWith('zh_') || lowerLangCode === 'zh') return 'zh_CN';
        if (lowerLangCode.startsWith('ja_') || lowerLangCode === 'ja') return 'ja_JP';
        if (lowerLangCode.startsWith('ko_') || lowerLangCode === 'ko') return 'ko_KR';
        return 'en_US';
    }
};

export const isShowArr = (isGoogleAuth:number,isEmailAuth:number,isPhoneAuth:number,type:'login'|'password',openAll:number) => {
    let showList = []
    if (type === 'login') {
        
    
        if (openAll === 1) {
            // 新设备/IP登录，验证全部绑定的验证方式
            if (isGoogleAuth === 1) {
                showList.push('google')
            }
            if (isEmailAuth === 1) {
                showList.push('email')
            }
            if (isPhoneAuth === 1) {
                showList.push('phone')
            }
        } else if (openAll === 0) {
            // 非新设备/IP登录，只验证一个，优先级：谷歌 > 邮箱 > 手机号
            if (isGoogleAuth === 1) {
                showList.push('google')
            } else if (isEmailAuth === 1) {
                showList.push('email')
            } else if (isPhoneAuth === 1) {
                showList.push('phone')
            }
        }
        return showList
    }
    if (type === 'password') {
        const bindCount = isGoogleAuth + isEmailAuth + isPhoneAuth;
        
        if (bindCount === 1) {
            // 只绑定了1项，验证1个，优先级：邮箱 > 手机号 > 谷歌
            if (isEmailAuth === 1) {
                showList.push('email');
            } else if (isPhoneAuth === 1) {
                showList.push('phone');
            } else if (isGoogleAuth === 1) {
                showList.push('google');
            }
        } else if (bindCount >= 2) {
            // 绑定了2个或3个，验证2个
            // 优先组合：谷歌+邮箱、谷歌+手机号、手机号+邮箱
            if (isGoogleAuth === 1 && isEmailAuth === 1) {
                showList.push('google', 'email');
            } else if (isGoogleAuth === 1 && isPhoneAuth === 1) {
                showList.push('google', 'phone');
            } else if (isPhoneAuth === 1 && isEmailAuth === 1) {
                showList.push('email', 'phone');
            }
        }
        
        return showList;
        
    }
}