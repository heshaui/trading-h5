export const API_MODULE_NAME = {
	AMBIT_HOME_WEB:'ambit-home-web' , 
	AMBIT_INFORM_WEB:"ambit-inform-web",
	AMBIT_AUTH:"ambit-auth",//认证接口/用户登录注册相关
	AMBIT_USER_WEB:"ambit-user-web",//用户接口
	AMBIT_OSS:"ambit-oss",
	AMBIT_ASSETS_WEB:"ambit-assets-web",//资产接口
};
// 本地存储key
export const LOCAL_STORAGE_KEY = {
	USER_INFO:'imbit_userInfo' , // 用户信息
    USER_TOKEN: "imbit_userToken", // 用户token
    INVITE_INFO: "imbit_invite_info", // 邀请信息
    OUT_MONEY:"imbit_out_money", // 提现数据
    CURRENCY_PAIRS: 'currency_pairs', // 币对数据
    CURRENT_PAIR: 'current_pair', // 当前币对
    CURRENT_COIN: 'current_coin', // 币种数据
    RATE_DATA: 'rate_data', //汇率数据
    PATH_FORBIDDEN: 'path_forbidden', // 禁止路径
    RATE_KEY: 'rate_key', // 汇率key
    CACHED_RATE_DATA: 'cachedRateData', // 缓存汇率数据
    LANG: 'i18nextLng', // 当前语言
    LANGUAGE_LIST:'cachedLanguageList', //语言列表
    KV_CONFIG:'kv_config', // kv配置
    FLASH_CONFIG: 'flash_config', // 闪兑配置
    USDT_RATE:'usdt_rate' // USDT汇率
};

export const KV_KEYS = [
    "theme", //主题色
    "logo", //logo
    "footer_setting", //底部设置
    "fee_direction", //手续费方向
    "out_money", //提现配置
    "tenant_cache_name", //商户名称
    "account_configuration", //邀请开关
    "nickname_modify_time", //昵称修改时间
    "flash_img", //闪兑配置
    // 可以根据需要添加更多配置项
];

