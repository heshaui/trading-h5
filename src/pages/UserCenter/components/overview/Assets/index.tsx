import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from '@/pages/UserCenter/overview/index.module.scss';
import { Iconify } from "@/components/icon"
import AssetsAreaChart from '../../charts/AreaChart';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { getUserBalanceAll, getUserBalanceByDay,  } from '@/services/assets';
import { DataType } from '@/type/assets/assetsAccount/assets'
import { add, roundDown, cut, nul } from '@/utils'
import { getRate, getCoinRate } from '@/utils/getUseRate';
import appStore from '@/store';
import { observer } from 'mobx-react-lite';
import { BalanceAllType, TodayEarningsType, YesterdayBalanceType } from '@/type/assets/assetsAccount/assets'
import  {useWithdraw} from "@/hooks/useWithdraw";

import { ReactComponent as CloseeyeSvg } from '@/assets/icons/userCenter/close-eye.svg';
import { ReactComponent as OpeneyeSvg } from '@/assets/icons/userCenter/open-eye.svg';

interface chartDataType {
    balance: string,
    time: string,
    recharge: string,
    symbol: string
}
const AssetsPage: React.FC = observer(() => {
    const { t } = useLanguage('userCenter');
    const navigate = useNavigate();
    const { goWithdraw } = useWithdraw();

    // 使用 store 中的余额显示状态
    const banlanceShow = appStore.getBanlanceShow();
    const setBanlanceShow = (show: boolean) => appStore.setBanlanceShow(show);
    
    // 获取币种列表
    // const { coinList } = useCoinList();
    const rateKey = appStore.getRateKey()?.replace(/\s+/g, ''); // 汇率key
    const userInfo = appStore.getUserInfo();
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [balanceByDay, setBalanceByDay] = useState<chartDataType[]>([]);
    const [balanceAll, setBalanceAll] = useState<BalanceAllType>({} as BalanceAllType);
    const [balanceDay, setBalanceDay] = useState<YesterdayBalanceType>({} as YesterdayBalanceType);

    // 获取所有币种余额
    const getUserBalanceAllData = async () => {
        try {
            const res = await getUserBalanceAll();
            if (res.code === '0') {
                setTableData(res.data || []);
                const balance = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const balance = getCoinRate(curr.coinName, coinTotal).coinRate

                    return sum + Number(balance) || 0
                }, 0);
                const todayBalance = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const coinTotalToday = coinTotalCount(coinTotal, curr.recharge, curr.withdrawal, curr.gift)
                    const todayBalance = getCoinRate(curr.coinName, coinTotalToday).coinRate

                    return sum + Number(todayBalance) || 0
                }, 0);
                const rateKeyName = rateKey.split('-')[0].trim()
                const usdRate = getRate('USDT', balance || 0, rateKeyName).rate
                const usdTodayEarnings = getRate('USDT', todayBalance || 0, rateKeyName)
                setBalanceAll({
                    usdBalance: usdRate || 0,
                    balance: balance || 0,
                    usdTodayEarnings: usdTodayEarnings.rate || 0,
                    todayEarnings: todayBalance || 0,
                    symbol: usdTodayEarnings.symbol
                });
            }
        } catch (error) {
			Toast.show({
				icon: 'fail',
				content: String(error),
			})
        }
    };
    const waxAndWane = (todayBalance: number | string, balanceLastDay: number | string) => {
        // balance今日余额 balanceLastDay昨日余额
        const banlanceShow = cut(Number(todayBalance), Number(balanceLastDay))
        return banlanceShow || 0
    }
    
    const todayProfit = useMemo(() => {
        return waxAndWane(
            balanceAll?.usdTodayEarnings || 0,
            balanceDay?.usdBalanceAll || 0
        );
    }, [balanceAll?.usdTodayEarnings, balanceDay?.usdBalanceAll])
    const coinTotalCount = (balance: number | string,
        recharge: number | string,
        withdrawal: number | string,
        gift: number | string,
    ) => {
        const balanceNum = Number(balance);
        const rechargeNum = Number(recharge);
        const withdrawalNum = Number(withdrawal);
        const giftNum = Number(gift);
        const coinTotal = cut(add(
            Number(cut(balanceNum, rechargeNum)),
            withdrawalNum
        ), giftNum)
        return coinTotal
    }
    // 获取用户余额以及充值金额 日K线
    const getUserBalanceDay = async () => {
        try {
            const res = await getUserBalanceByDay();
            if (res.code === '0') {
                const rateKeyName = rateKey.split('-')[0].trim()
                // const usdRate = await getRate('USDT', res.data[0].balance, rateKeyName);
                // const withdraw = getRate('USDT', res.data[0].withdraw, rateKeyName)

                const usdBalance = await getRate('USDT', res.data?.[0]?.balance || 0, rateKeyName);
                // const usdRecharge = await getRate('USDT', res.data?.[0]?.recharge || 0, rateKeyName);
                // const usdWithdraw = await getRate('USDT', res.data?.[0]?.withdraw || 0, rateKeyName)
                const initData = res.data.map((item: any) => {
                    const usdBalance = getRate('USDT', item.balance, rateKeyName)
                    return {
                        balance: Number(usdBalance.rate).toFixed(2) || 0,
                        time: item.time,
                        recharge: Number(item.recharge).toFixed(2) || 0,
                        symbol: usdBalance.symbol
                    }
                }).sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
                setBalanceByDay(initData);
                setBalanceDay({
                    balanceAll: res.data?.[0]?.balance || 0,
                    // balance: res.data?.[0]?.recharge || 0,
                    // withdraw: res.data?.[0]?.withdraw || 0,
                    usdBalanceAll: usdBalance.rate || 0,
                    // usdBalance: usdRecharge.rate || 0,
                    // usdWithdraw: usdWithdraw.rate || 0
                });
            }
        } catch (error) {
            Toast.show({
				icon: 'fail',
				content: String(error),
			})
        }
    };
    
    useEffect(() => {
        getUserBalanceAllData();
        getUserBalanceDay()
    }, [rateKey]);
    useEffect(() => {
        try {
            appStore.loadCurrencyPairs()
        } catch (error) {
            console.error('初始化货币对数据错误:', error);
        }
    }, []);
	// 资产
    return (
        <div className={styles.mt30}>
            <div className={styles.assetTit} >
                {/* 资产 */}
                {t('overview.assets.title')}
                <button type='button' className={styles.assetBtn} onClick={() => navigate('/assets')}>
                    <Iconify icon="mingcute:arrow-right-line" className={styles.assetIcon} />
                </button>
            </div>
            <div className={`flex-row justify-between align-center`}>
                <div className="flex-1">
                    <div className={`${styles.tip_color} line-22 flex-row align-center font-14 font-w-400`} >
                        {/* 总资产折合 */}
                        {t('overview.assets.totalAssets')}
                        <button type='button' className='ml-1'
                            onClick={() => setBanlanceShow(!banlanceShow)}
                        >
                            {banlanceShow ? <OpeneyeSvg className="tip-color text-[20px]" /> : <CloseeyeSvg className="tip-color text-[20px]" />}
                        </button>
                    </div>
                    {banlanceShow ? <> <p className='text-[24] font-w-700 mt-1 line-32 mb-0'>{balanceAll.balance ? Number(balanceAll.balance).toFixed(2) : '0.00'} USDT
                        {/* {tableData?.[0]?.balance || '--'} */}
                    </p>
                        <p className={`${styles.tip_color} font-14 line-20 mt-1 ltr-text`}>≈&nbsp;{balanceAll?.symbol||'--'}&nbsp;{balanceAll.usdBalance ? Number(balanceAll.usdBalance).toFixed(2) : '0.00'}</p></> :
                        <>
                            <p className='text-[24] font-w-700 mt-1 line-32 mb-0'>******</p>
                            <p className={`${styles.tip_color} font-14 line-20 mt-1`}>******</p>
                        </>}
                    <div className='font-14 mt-4 flex-x align-center line-20'>
                        {/* 今日盈亏 */}
                        {t('overview.assets.todayProfitLoss')}
                        <Iconify icon="ep:warning" className={`${styles.tip_color} font-12 mx-1`} />
                        {banlanceShow ? <span className={`ltr-text ${Number(todayProfit) > 0 ? styles.success_icon : Number(todayProfit) < 0 ? styles.error_icon : styles.tip_color} font-12`}>
                            {Number(todayProfit) < 0 ? "-" : "+"}
                            &nbsp;{balanceAll?.symbol||'--'}&nbsp;
                            {Number(todayProfit) ? Math.abs(Number(todayProfit)).toFixed(2) : 0}
                        </span> :
                            <span className={`${styles.tip_color} font-12 flex-x-cc`}>******</span>
                        }
                    </div>
                </div>
                <div className={`${styles.assets_chart}`} >
                    <AssetsAreaChart chartData={balanceByDay} />
                </div>
            </div>
            <div className='mt-5 flex'>
                <button type='button' className={`${styles.btn} mr-4 ${styles.saveBtn}`}
                    onClick={() => navigate('/assets/toUp')}
                >
                    {/* 充值 */}
                    {t('overview.assets.deposit')}
                </button>
                <button type='button' className={`${styles.cancleBtn}  ${styles.btn}`}
                    onClick={() => goWithdraw()}
                >
                    {/* 提现 */}
                    {t('overview.assets.withdraw')}
                </button>
            </div>
        </div>
    );
});
export default AssetsPage;