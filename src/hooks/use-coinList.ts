import { useEffect, useState } from 'react';
import appStore from '@/store';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
export const useCoinList = (needPrice: boolean = false) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadCoinList = async () => {
        try {
            setLoading(true);
            setError(null);
            await appStore.loadCoinList(needPrice);
            localStorage.setItem(LOCAL_STORAGE_KEY.CURRENT_COIN, JSON.stringify(appStore.getCoinList()));
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoinList();
    }, []);

    return {
        coinList: appStore.getCoinList(),
        loading,
        error,
        reload: loadCoinList
    };
};