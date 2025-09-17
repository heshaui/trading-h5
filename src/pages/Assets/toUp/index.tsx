import React from "react";
import styles from "../styles/spotAccount.module.scss";
import { useState, useEffect, useRef, useMemo, } from "react";
import { Image } from 'antd-mobile';
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useLanguage } from '@/hooks/useLanguage';
import {
  getWithdrawCoinAll,
} from "@/services/assets";
// import { toast } from 'sonner'
import { Toast } from 'antd-mobile';
import appStore from "@/store";
// import { DownOutlined } from "@ant-design/icons";
import ContentLayout from '@/components/ContentHeader';
import CoinInfoSteps from '../components/rechargePop/CoinInfo';
import NetworkSteps from '../components/rechargePop/Network';

const TopUpPage = () => {
  const { t } = useLanguage("assets");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // 获取路由参数
  const coinId = searchParams.get('coinId');
  const coinName = searchParams.get('coinName');

  const userInfo = appStore.getUserInfo()
  const [coinInfo, setCoinInfo] = useState({} as any);

  const [current, setCurrent] = useState(1);

  const [coinList, setCoinList] = useState<any>([]);
  const [coinLoading, setCoinLoading] = useState(false);
  const routeAppliedRef = useRef(false);
  const [protocolInfo, setProtocolInfo] = useState<any>(undefined);




  const isNotAllowToUp = useMemo(() => {
    // const verified11 = currentUserInfo?.verifiedRechargeStatus === 1 && currentUserInfo?.realnessStatus === 1 //已认证且实名-允许
    const verified10 = userInfo?.verifiedRechargeStatus === 1 && userInfo?.realnessStatus !== 1 //已认证且未实名-判断unverifiedRechargeStatus
    // const unverifie10 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 0 //未认证且未实名-允许
    const unverifie11 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 1 //未认证且实名-判断verifiedRechargeStatus

    const needsKyc = verified10 && userInfo?.unverifiedRechargeStatus !== 1
    // const needsGoogleAuth = !userInfo?.isGoogleAuth || !userInfo?.googleCode
    const needsMerchantRecharge = (userInfo?.verifiedRechargeStatus !== 1 && userInfo?.unverifiedRechargeStatus !== 1) ||
      (unverifie11 && userInfo?.verifiedRechargeStatus !== 1)
    return needsKyc || needsMerchantRecharge
    // return false
  }, [userInfo])

  // 3.获取充值币种列表
  const getTopUpCoinAllList = async () => {
    setCoinLoading(true);
    try {
      const res = await getWithdrawCoinAll();
      if (res.code === "0") {
        // 先筛选 status === 1 的数据，然后再进行 map 转换
        const coinList = res.data
          .filter((item: any) => item.status === 1 && item.canRecharge === 1) // 添加筛选
          .map((item: any) => ({
            ...item,
            label: (
              <div className="flex-x align-center font-14 font-w-400">
                <Image
                  src={item.iconUrl}
                  alt={item.coinName}
                  width={20}
                  height={20}
                  className={styles.coninIcon}
                />
                &nbsp;
                <span className={styles.title_color}>{item.coinName}</span>
                &nbsp;{" "}
                <span className={styles.tip_color}>{item.nameDefault}</span>
              </div>
            ),
            value: item.coinId,
          }));
        setCoinList(coinList);
      } else {
        Toast.show({
          content: res.message,
          icon: 'fail'
        });
      }
    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail'
      });
    } finally {
      setCoinLoading(false);
    }
  };

  useEffect(() => {
    getTopUpCoinAllList();
  }, [])
  useEffect(() => {
    // 只在客户端执
    if (typeof window === "undefined") return;

    try {
      // appStore.loadCurrencyPairs(); //加载币对数据
      appStore.loadGetUserInfo(); //加载币种数据
    } catch (error) {
      console.error("初始化货币对数据错误:", error);
    }
  }, []);


  useEffect(() => {
    if (routeAppliedRef.current) return;
    if (coinList.length === 0) return;

    let target: any | undefined;
    if (coinId !== undefined && coinId !== null && coinId !== "") {
      target = coinList.find((c: any) => String(c.coinId) === String(coinId) || String(c.value) === String(coinId));
    }
    if (!target && coinName) {
      target = coinList.find((c: any) => String(c.coinName).toLowerCase() === String(coinName).toLowerCase());
    }
    if (target) {
      routeAppliedRef.current = true;
      setCoinInfo(target)
      setCurrent(2)
    }
  }, [coinId, coinName, coinList, isNotAllowToUp]);

  return (<ContentLayout
    title={current === 1 ? null :
      current === 2 ? t('toUpSteps.coinTitle', { name: coinInfo?.coinName || '' }) :
        current === 3 ? t('toUpSteps.coinTitle', { name: protocolInfo?.protocolName || '' }) :
          t('assets.deposit')
    }
    onBack={() => {
      if (current === 1) {
        navigate(-1);
      } else {
        setCurrent(1);
      }
    }}
  >
    <div className={` page-h w-full bg-[var(--page-background)] flex-y align-center `}>
      <div className={`${styles.spot_auth_box} max-w-[1200px]`}>

        <div className={`${styles.card_box} `}>
          {(() => {
            // const verified11 = currentUserInfo?.verifiedRechargeStatus === 1 && currentUserInfo?.realnessStatus === 1 //已认证且实名-允许
            const verified10 = userInfo?.verifiedRechargeStatus === 1 && userInfo?.realnessStatus !== 1 //已认证且未实名-判断unverifiedRechargeStatus
            // const unverifie10 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 0 //未认证且未实名-允许
            const unverifie11 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 1 //未认证且实名-判断verifiedRechargeStatus

            const needsKyc = verified10 && userInfo?.unverifiedRechargeStatus !== 1
            // const needsGoogleAuth = !userInfo?.isGoogleAuth || !userInfo?.googleCode
            const needsMerchantRecharge = (userInfo?.verifiedRechargeStatus !== 1 && userInfo?.unverifiedRechargeStatus !== 1) ||
              (unverifie11 && userInfo?.verifiedRechargeStatus !== 1)

            // TODO: Implement permission check components
            return needsKyc || needsMerchantRecharge ? <></> :

              <div
                className={` w-full flex-x justify-between ${styles.card_content2}`}
              >
                <div className={`${styles.step_box} flex-1 max-w-[500px]`} style={{ width: '50%' }}>
                  {current === 1 && <CoinInfoSteps goSteps={(option) => {
                    setCoinInfo(option)
                    setCurrent(2)
                  }} 
                  coinList={coinList} />}
                  {(current === 2 || current === 3) && <NetworkSteps coinInfo={coinInfo} goSteps={(option) => {
                    setCurrent(3)
                    setProtocolInfo(option)
                  }} />}
                </div>
              </div>
          })()}

        </div>

      </div>
    </div>
  </ContentLayout>
  );
};

export const layout = 'header-only';
export default TopUpPage;
