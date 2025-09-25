// hooks/useAssetsRate.tsx
import { useEffect } from 'react'
import appStore from '@/store'
import assetsAndRateWS from '@/store/assetsAndRate'

export const useAssetsAndRateWs = (enabled: boolean = true) => {
    const userInfo = appStore.getUserInfo();
    useEffect(() => {
    if ( !userInfo || typeof window === "undefined") return;

        if (!enabled) return;
        assetsAndRateWS.ensure(userInfo.userId);
        return () => {
            // 全局单例，不在组件卸载时关闭
        }
    }, [userInfo, enabled]);

    return {
        ensure: assetsAndRateWS.ensure.bind(assetsAndRateWS),
        stop: assetsAndRateWS.stop.bind(assetsAndRateWS),
    }

}