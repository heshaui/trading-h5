import FingerprintJS from "@fingerprintjs/fingerprintjs";

// 获取浏览器指纹
export const getFingerprint = async () => {
    const result = await FingerprintJS.load();
    const visitorId = await result.get();
    // console.log(visitorId.components.vendor);
    return visitorId.visitorId;
};