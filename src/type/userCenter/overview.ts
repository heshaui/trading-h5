export interface LoginInfoType {
    userId: number,
    account: string,
    status: number,
    email: string,
    password: string,
    phone: string,
    inviteCode: string,
    parentUserId: number,
    isGoogleAuth: number,
    isPhoneAuth: number,
    isEmailAuth: number,
    realnessStatus: number,
    addressStatus: number,
    fundPassword: string,
    countryCode: string,
    userLevel: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
    salt: string,
    transactionStatus: number,
    withdrawalStatus: number,
    famousAphorisms: string,
    registerAccount: string,
    securityIntensity: number,
    avatarUrl: string,
    remark: string
}
export interface LoginLogListType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: string,
    tokenTime: string,
    createTime: number,
    updateTime: number,
    tenantId: string
}
export interface carouselImageContentsType {
    id: number,
    languageCode: string,
    title: string,
    carouselImageId: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
    accessType: number,
    accessUrl: string,
    imageUrl: string
}

export interface CarouselPicType {
    id: number,
    isShow: number,
    sort: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
    carouselImageContents: carouselImageContentsType[]
}
export interface UserInfoType {
    userId: number,
    nickname: string,
    avatarUrl: string,
    token: string,
    tokenExpiration: number,
    registerAccount: string,
    account: string,
    status: number,
    email: string,
    phone: string,
    inviteCode: string,
    parentUserId: number,
    isGoogleAuth: number,
    isPhoneAuth: number,
    isEmailAuth: number,
    realnessStatus: number,
    addressStatus: number,
    countryCode: string,
    userLevel: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
    transactionStatus: number,
    withdrawalStatus: number,
    famousAphorisms: string,
    securityIntensity: number,
    remark: string | null,
    googleCode: boolean
}
export interface inviteInfoType {
    inviteCode: string,
    coinId: number,
    coinName: string,
    rebateRatio: string,
    validTime: string,
    rechargeLimit: number,
    isRealname: string
}
export interface usdtRateType {
    nowPrice: string|number,
    yesterdayPrice: string|number

}