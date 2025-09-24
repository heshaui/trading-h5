import React from "react";
import { AssetsLayout, UserCenterLayout } from "@/components/MenuItems";
import styles from "../styles/spotAccount.module.scss";
import {
    Input,
    ConfigProvider,
    Form,
    Radio
} from "antd";
import { Iconify, SvgIcon } from "@/components/icon";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    getUserBalanceAll,
    getUserBalanceByDay,
    getTodayEarnings,
    getCoinById,
} from "@/services/assets";
import { Toast, Image, Checkbox, Modal } from "antd-mobile";
import { add, roundDown, cut, nul } from "@/utils";
import { useLanguage } from "@/hooks/useLanguage";
import appStore from "@/store";
import { observer } from "mobx-react-lite";
import { getRate, getCoinRate, getCoinRound, nulCoinRate, nulRate } from "@/utils/getUseRate";
import { DataType } from "@/type/assets/assetsAccount/assets";
import {
    BalanceAllType,
    TodayEarningsType,
    YesterdayBalanceType,
} from "@/type/assets/assetsAccount/assets";
import { NoData } from "@/components/noData";
import WebSocketService, { ConnectionState }  from "@/utils/websocket";
import { getToken } from "@/request";
import { CustomTable } from "@/components/CustomCom";
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import AccountPop from "../components/AccountPop";
import { useWithdraw ,useRecharge} from "@/hooks/useWithdraw";
import { ReactComponent as EyeSvg } from '@/assets/icons/assets/icon_eye.svg';
import { ReactComponent as EyeCloseSvg } from '@/assets/icons/assets/icon- closeEye.svg';


const AssetsMainPage = observer(() => {
    const { t } = useLanguage(['assets', 'flash']);
    const [initTableData, setInitTableData] = useState<DataType[]>([])
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const navigate = useNavigate();
    const [total, setTotal] = useState(0);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [balanceAll, setBalanceAll] = useState<BalanceAllType>({} as BalanceAllType);
    const [balanceDay, setBalanceDay] = useState<YesterdayBalanceType>({} as YesterdayBalanceType);
    const [rateKeyName, setRateKeyName] = useState('');

    const paramdataRef = useRef(pageParam);
    // 获取币种列表
    const coinList = appStore.getCoinList(); // 获取币种信息
    const [form] = Form.useForm();
    // 获取汇率数据
    const rateData = appStore.getRateData() || [];
    const lang = appStore.getLang();
    const coinPair = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
    const rateKey = appStore.getRateKey()?.replace(/\s+/g, ""); // 汇率key
    const userInfo = appStore.getUserInfo();
    const [accountPopData, setAccountPopData] = useState<DataType>({} as DataType);
    // const [withdrawStatusPopOpen, setWithdrawStatusPopOpen] = useState(false);
    const { goWithdraw, WithdrawStatusPopComponent } = useWithdraw();
    const { goRecharge, RechargeStatusPopComponent } = useRecharge();

    // 使用 store 中的余额显示状态
    const banlanceShow = appStore.getBanlanceShow();
    const setBanlanceShow = (show: boolean) => appStore.setBanlanceShow(show);
    const [accountPopVisible, setAccountPopVisible] = useState(false);
    const balanceDataRef = useRef<WebSocketService | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const waxAndWane = (
        todayBalance: number | string,
        balanceLastDay: number | string
    ) => {
        // console.log(todayBalance, balanceLastDay, 99999);
        // balance今日余额 balanceLastDay昨日余额
        const banlanceShow = cut(Number(todayBalance), Number(balanceLastDay));
        return banlanceShow || 0;
    };
    // 获取法币精度
    const rateInfo = useMemo(() => {
        const rateInfo = rateData.find((item: any) => item.shortName === rateKey);
        return {
            accuracy: rateInfo?.accuracy || 2,
            symbol: rateInfo?.symbol || '--', // 汇率符号
        }
    }, [rateKey, rateData])

    // 使用 useMemo 缓存 waxAndWane 计算结果，当依赖项变化时自动重新计算
    //   const todayProfitUSDT = useMemo(() => {
    //     // return waxAndWane(
    //     //     balanceAll?.balance || 0,
    //     //     balanceDay?.balanceAll || 0,
    //     //     todayEarnings?.balance || 0,
    //     //     todayEarnings?.withdraw || 0,
    //     //     todayEarnings?.gift || 0
    //     // );
    //     return waxAndWane(
    //       balanceAll?.todayEarnings || 0,
    //       balanceDay?.balanceAll || 0
    //     );
    //   }, [balanceAll?.todayEarnings, balanceDay?.balanceAll]);
    const columns: ColumnType<DataType>[] = [
        {
            title: (_value, record) => {
                return <div className="flex align-center">
                    <Image
                        src={record?.iconUrl}
                        alt={_value}
                        width={28}
                        height={28}
                        style={{ borderRadius: "50%", height: "28px", width: "28px" }}
                        className="mr-1"
                    />
                    <p className="font-w-500 font-14 flex-y">
                        {`${_value}`}
                        <span className={`font-w-400 font-12 ${styles.tip_color}`}>
                            {record?.nameDefault}
                        </span>
                    </p>
                </div>
            }, //"币种",
            dataIndex: "coinName",
            key: "coinName",
            width: 128,
            align: "left",
            render: (_text, record) => {
                const coin = coinList.find(
                    (item: any) => item.coinName === record.coinName
                ); // 获取币种信息
                const text = add(record.balance || 0, record.releaseBalance || 0);
                const text2 = add(text, record.frozenBalance || 0);
                // 添加默认值和检查
                // const rateKeyName = rateKey.split("-")[0].trim();

                // 确保 rateKeyName 有值
                // const { rate,symbol } = getRate(record.coinName, text2, rateKeyName);
                const fiatRate = nulCoinRate(Number(text2) || 0, record.rateValue || 0).rate
                return (<>
                    <p className="flex-y align-end">
                        <span>{banlanceShow?text2 ? roundDown(text2, coin?.unitScale) : "0":'******'}</span>
                        <span className="ltr-text">{banlanceShow?`${rateInfo.symbol}${record.coinName ? roundDown(fiatRate, rateInfo.accuracy) : ""}`:'******'}</span>
                    </p>
                    <button className="ml-1" onClick={() => {
                        setAccountPopVisible(true)
                        setAccountPopData(record)
                    }}>
                        <Iconify icon="ri:more-2-line" size={24} />
                    </button>
                </>
                );
            },
        },

    ];
    // 添加客户端渲染标记
    const [isClient, setIsClient] = useState(false);
    const [banlanceLoading, setBanlanceLoading] = useState(true);
    // const [todayEarningsLoading, setTodayEarningsLoading] = useState(true);
    const [kLineLoading, setKLineLoading] = useState(true);

    const goFlash = async (coinName: string) => {
        navigate(`/flash?${coinName}`);
    };
    const searchInputChange = (e: any) => {
        const value = e.target.value;
        if (value) {
            const newData = initTableData.filter((item) =>
                item.coinName.toLowerCase().includes(value.toLowerCase())
            );
            setTableData(newData);
        } else {
            setTableData(initTableData);
        }
    };
    const hideZeroChange = (value: any) => {
        // const value = e.target.checked;
        // setHideZero(!hideZero)

        if (value && initTableData.length > 0) {
            const newData = initTableData.filter(
                (item) => item.balance.toString().trim() !== "0"
            );
            setTableData(newData);
        } else {
            setTableData(initTableData);
        }
    };
    // 获取所有币种余额
    const getUserBalanceAllData = async () => {
        setTableLoading(true);
        setBanlanceLoading(true);
        try {
            const res = await getUserBalanceAll();
            if (res.code === "0") {
                const shortData = res.data.slice()?.sort((a:any,b:any)=>{
                    const aTotal = add(
                        add(a.balance || 0, a.releaseBalance || 0),
                        a.frozenBalance || 0
                    );
                    const aUsdt = nul(aTotal, a.rateValue || 0);
                    const bTotal = add(
                        add(b.balance || 0, b.releaseBalance || 0),
                        b.frozenBalance || 0
                    );
                    const bUsdt = nul(bTotal, b.rateValue || 0);
                    return bUsdt - aUsdt;
                })
                setInitTableData(shortData || []);
                setTableData(shortData || []);


                const balance = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const coinUsdt = nul(coinTotal, curr.rateValue || 0);
                    return sum + Number(coinUsdt) || 0;
                }, 0);
                const todayBalance = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const coinTotalToday = coinTotalCount(
                        coinTotal,
                        curr.recharge,
                        curr.withdrawal,
                        curr.gift
                    );
                    const coinUsdtToday = nul(coinTotalToday, curr.rateValue || 0);

                    return sum + Number(coinUsdtToday) || 0;
                }, 0);
                // 汇总法币：逐币种 balance * rateValue 转法币相加
                const usdBalanceSum = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const { rate } = nulCoinRate(Number(coinTotal) || 0, curr.rateValue || 0);
                    return sum + Number(rate) || 0;
                }, 0);
                const usdTodayEarningsSum = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const coinTotalToday = coinTotalCount(
                        coinTotal,
                        curr.recharge,
                        curr.withdrawal,
                        curr.gift
                    );
                    const { rate } = nulCoinRate(Number(coinTotalToday) || 0, curr.rateValue || 0);
                    return sum + Number(rate) || 0;
                }, 0);
                setBalanceAll({
                    usdBalance: usdBalanceSum || 0,
                    balance: balance || 0,
                    usdTodayEarnings: usdTodayEarningsSum || 0,
                    todayEarnings: todayBalance || 0,
                });
                setBanlanceLoading(false);
                // 初始化WebSocket连接
                // await setupBalanceWebSocket();
            }
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
        } finally {
            setTableLoading(false);
        }
    };
    const coinTotalCount = (
        balance: number | string,
        recharge: number | string,
        withdrawal: number | string,
        gift: number | string
    ) => {
        const balanceNum = Number(balance);
        const rechargeNum = Number(recharge);
        const withdrawalNum = Number(withdrawal);
        const giftNum = Number(gift);
        const coinTotal = cut(
            add(Number(cut(balanceNum, rechargeNum)), withdrawalNum),
            giftNum
        );
        return coinTotal;
    };

    // 获取用户余额以及充值金额 日K线
    const getUserBalanceDay = async () => {
        setKLineLoading(true);
        try {
            const res = await getUserBalanceByDay();
            if (res.code === "0") {
                const rateKeyName = rateKey.split("-")[0].trim();
                // const usdRate = getRate('USDT', totalUsd, rateKeyName).rate
                const usdtRate = tableData.find((item: any) => item.coinName === 'USDT')
                const usdRate = nulCoinRate(res.data?.[0]?.balance || 0, usdtRate?.rateValue || 1)

                setBalanceDay({
                    balanceAll: res.data?.[0]?.balance || 0,
                    usdBalanceAll: usdRate.rate || 0,
                });
                setKLineLoading(false);
            }
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
        }
    };

    const todayProfitFiat = useMemo(() => {
        return waxAndWane(
            balanceAll?.usdTodayEarnings || 0,
            balanceDay?.usdBalanceAll || 0
        );
    }, [balanceAll?.usdTodayEarnings, balanceDay?.usdBalanceAll]);

  // 设置WebSocket连接
  const setupBalanceWebSocket = useCallback(() => {
    // 如果已经有连接，不要重复创建
    if (balanceDataRef.current && balanceDataRef.current.connectionState !== ConnectionState.CLOSED) return;
    if (banlanceLoading) return;

    // 创建新的WebSocket连接
    const token = getToken();
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const websocket = new WebSocketService(
        `${process.env.REACT_APP_ASSETS_API_BASE}/ws/asset?userId=${userInfo.userId}&sa-token=${token}`
      );
      balanceDataRef.current = websocket;
      // });

      websocket.connect((message: string) => {
        // console.log('收到WebSocket消息:', message);

        try {
          // 处理纯文本心跳
          if (typeof message === 'string' && (message.startsWith('ping') || message === '__ping__')) {
            websocket.send(JSON.stringify({ type: '__pong__' }));
            // console.log('资产页收到ping，回复pong');
            return;
          }
          const data = JSON.parse(message);
          // console.log('解析后的数据:', data);

          if (data.type === "__ping__") {
            websocket.send(JSON.stringify({ type: "__pong__" }));
            // console.log('资产页收到JSON ping，回复pong');
            return;
          }
          // 更新余额数据
          if (data.data && Array.isArray(data.data)) {
            // 初始化表格数据
            const filteredData = initTableData.map((item) => {
              // 在 data 数组中查找匹配的项目
              const matchedItem = data.find(
                (dataItem: any) => item.coinId === dataItem.coin_id
              );
              // 如果找到匹配项，则合并数据
              if (matchedItem) {
                return {
                  ...item,
                  balance: matchedItem.balance,
                  frozenBalance: matchedItem.frozen_balance,
                  releaseBalance: matchedItem.release_balance,
                };
              }
              // 如果没有找到匹配项，则返回原始项目
              return item;
            });
            // 更新表格数据
            const filteredTableData = tableData.map((item) => {
              const matchedItem = data.find(
                (dataItem: any) => item.coinId === dataItem.coin_id
              );
              if (matchedItem) {
                return {
                  ...item,
                  balance: matchedItem.balance,
                  frozenBalance: matchedItem.frozen_balance,
                  releaseBalance: matchedItem.release_balance,
                };
              }
              return item;
            });
            setInitTableData(filteredData);
            setTableData(filteredTableData);
            const balance = filteredTableData.reduce((sum: number, curr: any) => {
              const coinTotal = add(
                add(curr.balance || 0, curr.releaseBalance || 0),
                curr.frozenBalance || 0
              );
              const coinUsdt = nul(coinTotal, curr.rateValue || 0);
              return sum + Number(coinUsdt) || 0;
            }, 0);
            const todayBalance = filteredTableData.reduce((sum: number, curr: any) => {
              const coinTotal = add(
                add(curr.balance || 0, curr.releaseBalance || 0),
                curr.frozenBalance || 0
              );
              const coinTotalToday = coinTotalCount(
                coinTotal,
                curr.recharge,
                curr.withdrawal,
                curr.gift
              );
              const coinUsdtToday = nul(coinTotalToday, curr.rateValue || 0);
    
              return sum + Number(coinUsdtToday) || 0;
            }, 0);
            // 汇总法币：逐币种 balance * rateValue 转法币相加
            const usdBalanceSum =filteredTableData.reduce((sum: number, curr: any) => {
              const coinTotal = add(
                add(curr.balance || 0, curr.releaseBalance || 0),
                curr.frozenBalance || 0
              );
              const { rate } = nulCoinRate(Number(coinTotal) || 0, curr.rateValue || 0);
              return sum + Number(rate) || 0;
            }, 0);
            const usdTodayEarningsSum =filteredTableData.reduce((sum: number, curr: any) => {
              const coinTotal = add(
                add(curr.balance || 0, curr.releaseBalance || 0),
                curr.frozenBalance || 0
              );
              const coinTotalToday = coinTotalCount(
                coinTotal,
                curr.recharge,
                curr.withdrawal,
                curr.gift
              );
              const { rate } = nulCoinRate(Number(coinTotalToday) || 0, curr.rateValue || 0);
              return sum + Number(rate) || 0;
            }, 0);
            setBalanceAll({
              usdBalance: usdBalanceSum || 0,
              balance: balance || 0,
              usdTodayEarnings: usdTodayEarningsSum || 0,
              todayEarnings: todayBalance || 0,
            });
          }
        } catch (error) {
          console.error("WebSocket数据处理错误:", error);
          // 保持连接由底层重连处理，不立即置空引用
        }
      }, (err) => {
        console.error('资产WebSocket连接错误:', err);
        // 清理ping定时器
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        // 允许后续重建
        balanceDataRef.current = null;
        // 延迟重试，避免热循环
        setTimeout(() => {
          try { setupBalanceWebSocket(); } catch { }
        }, 3000);
      });
    } catch (err) {
      console.error("创建资产WebSocket连接失败:", err);
      // 设置为null以便下次可以重试
      balanceDataRef.current = null;
    }
  }, [userInfo?.userId, banlanceLoading]); // 移除initTableData依赖，减少不必要的重连

    useEffect(() => {
        if (!userInfo?.userId) return;
    
        // 组件卸载时清理WebSocket连接
        return () => {
          // 清理ping定时器
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
          if (balanceDataRef.current) {
            balanceDataRef.current.close();
            balanceDataRef.current = null;
          }
        };
      }, []);
    useEffect(() => {
        getUserBalanceAllData();
        getUserBalanceDay();
        // getTodayEarningsData()
        if (rateKey) {
            setRateKeyName(rateKey.split("-")[0].trim());
        }
    }, [rateKey, lang]);

    useEffect(() => {
        // 设置客户端渲染标记
        setIsClient(true);
        // 只在客户端执
        if (typeof window === "undefined") return;
        if (coinPair && coinPair.length > 0 && coinList && coinList.length > 0) return
        try {
            appStore.loadCurrencyPairs(); //加载币对数据
            appStore.loadCoinList(); //加载币种数据
        } catch (error) {
            console.error("初始化货币对数据错误:", error);
        }
    }, []);

    useEffect(() => {
        if (!isClient || !userInfo || typeof window === "undefined") return;
        //  || todayEarningsLoading
        if (banlanceLoading || kLineLoading) return;
        // 安全地使用currentPair
        setupBalanceWebSocket();
    }, [isClient, userInfo, banlanceLoading, kLineLoading]);

    useEffect(() => {
        if (!userInfo?.userId) return;
    
        // 组件卸载时清理WebSocket连接
        return () => {
          // 清理ping定时器
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
          if (balanceDataRef.current) {
            balanceDataRef.current.close();
            balanceDataRef.current = null;
          }
        };
      }, []);

    return (
        <div className={`px-4 ${styles.title_color}`}>
            <ConfigProvider
                theme={{
                    components: {
                        Input: {
                            activeBorderColor: "var(--theme-color)",
                            hoverBorderColor: "var(--theme-color)",
                            controlHeightLG: 50,
                            activeBg: "var(--background5)",
                            hoverBg: "var(--background5)",
                        },
                    },
                    token: {
                        colorBgContainer: "transparent",
                        controlItemBgHover: "var(--dropdown-menu-hover)",
                    },
                }}
            >
                <div className="flex justify-between align-center">
                    <h2 className={`font-w-500 font-20  py-4 `}>
                        {/* 现货账户 */}
                        {t("assets.assetsAccount")}
                    </h2>

                </div>
                <div className={`mt-3 `}>
                    <div className={` w-full`}>
                        <ul className="flex-y">
                            {/* <Skeleton
                                active
                                title={true}
                                loading={banlanceLoading && kLineLoading}
                                // loading={true}
                                paragraph={{ rows: 2 }}
                                className="px-1"
                            > */}
                            <li
                                className={`flex-y flex-wrap ${styles.header_content_item} mr-5`}
                            >
                                <p className={`${styles.title_color} font-w-500 font-12 flex-x align-center`}>
                                    {/* 总资产估值 */}
                                    {t("assetsAccount.assets2")}
                                    <button type='button' className='ml-1'
                                        onClick={() => setBanlanceShow(!banlanceShow)}
                                    >
                                        {/* {banlanceShow ? <Iconify icon={'clarity:eye-show-line'} className={`${styles.title_color} font-20`} /> :
                                         <Iconify icon={'ep:hide'} className={`${styles.tip_color} font-18`} />} */}
                                        {banlanceShow ? <EyeSvg className={`${styles.title_color} font-20`} /> :
                                            <EyeCloseSvg className={`${styles.tip_color} font-20`} />}
                                    </button>
                                </p>
                                {banlanceShow ? <div
                                    className={`${styles.tip_color}  flex-y`}
                                >
                                    {/* <p className={`${styles.title_color} font-w-700 font-24`}>
                                    {roundDown(todayProfitUSDT || 0, rateInfo.accuracy)}
                                        <span className="font-w-500 font-12">USDT</span>
                                    </p> */}
                                    <p className={`${styles.title_color} font-w-700 font-24`}>
                                        {roundDown(balanceAll.usdBalance || 0, rateInfo.accuracy)}
                                        <span className="font-w-500 font-12 ml-1">{!rateKeyName ||
                                            rateKeyName === "" ||
                                            rateKeyName === "NaN"
                                            ? "--"
                                            : rateKeyName}</span>
                                    </p>
                                </div> : <p className='font-w-700 font-24 mt-1 mb-0'>******</p>}
                            </li>
                            {/* </Skeleton>
                            <Skeleton
                                active
                                title={true}
                                loading={banlanceLoading && kLineLoading}
                                // loading={true}
                                paragraph={{ rows: 2 }}
                                className="py-1"
                            > */}
                            <li className={`${styles.header_content_item} w-full flex-1 font-14 flex-x align-center mt-1`} >
                                <div className={`${styles.tip_color} font-w-400 mr-1`}>
                                    {/* 今日盈亏 */}
                                    {t("assetsAccount.todayProfit")}
                                </div>
                                {banlanceShow ? <div className={`${styles.tip_color} font-w-500  flex-x 
                                    ${Number(todayProfitFiat) > 0 ? styles.success_icon : Number(todayProfitFiat) < 0 ? styles.error_icon : styles.tip_color}`}
                                >
                                    {/* <span
                                            className={`${styles.title_color} font-w-700 font-32`}
                                        >{getCoinRound("USDT", todayProfitUSDT)}&nbsp; USDT
                                        </span> */}
                                    <p className={`${Number(todayProfitFiat) > 0 ? styles.success_icon : Number(todayProfitFiat) < 0 ? styles.error_icon : styles.tip_color}`}>
                                        <span
                                        >
                                            &nbsp;{Number(todayProfitFiat) < 0 ? "" : "+"}
                                            {roundDown(todayProfitFiat || "0", rateInfo.accuracy)}
                                        </span>
                                        <span className="font-w-500 font-12 ml-1">
                                            {!rateKeyName ||
                                                rateKeyName === "" ||
                                                rateKeyName === "NaN" || rateKeyName?.includes("NaN")
                                                ? "--"
                                                : rateKeyName}
                                        </span>
                                    </p>
                                </div> : <p className={`${styles.tip_color} font-12 flex-x-cc`}>******</p>}
                            </li>
                            {/* </Skeleton> */}
                        </ul>
                        <div className="flex-row mt-4 w-full">
                            <button
                                className={`default_btn ${styles.btn_style} mr-4 flex-1`}
                                onClick={() => goRecharge()}
                            >
                                {/* 充值 */}
                                {t("assetsAccount.button.deposit")}
                            </button>
                            <button
                                className={`cancel_btn6 ${styles.btn_style} mr-4 flex-1`}
                                onClick={() => {
                                    goWithdraw();
                                }}
                            >
                                {/* 提现 */}
                                {t("assetsAccount.button.withdraw")}
                            </button>
                            <button
                                className={`cancel_btn6 ${styles.btn_style} flex-1`}
                                onClick={() => navigate('/assets/bill')}
                            >
                                {/* 现货账单  */}
                                {t("assetsAccount.button.bill")}
                            </button>
                        </div>
                    </div>
                    <div className={`${styles.table_box} w-full `}>
                        <div
                            className={`${styles.table_header} w-full mb-4 mt-[30px] flex align-center`}
                        >
                            {/* <Form form={form} layout="inline">
                        <Form.Item name="search"> */}
                            <Input
                                className={`${styles.input_box} modal-input mr-7`}
                                maxLength={25}
                                placeholder={t("assetsAccount.search")}
                                allowClear
                                prefix={
                                    <Iconify
                                        icon="garden:search-26"
                                        size={20}
                                        className={`${styles.title_color} `}
                                    />
                                }
                                onChange={searchInputChange}
                            />
                            {/* </Form.Item>
                        <Form.Item name="hideZero"> */}
                            <Checkbox
                                onChange={hideZeroChange}
                                className={`${styles.custom_checkbox} text-color-default`}
                                icon={checked =>
                                    checked ? (
                                        <Iconify icon='carbon:circle-filled' className="theme-color" size={18} />
                                    ) : (
                                        <Iconify icon='carbon:circle-outline' className={styles.tip_color2} size={18} />
                                    )
                                }
                            >
                                <span className={`${styles.title_color}`}>
                                    {t("assetsAccount.hideZero")}
                                </span>
                            </Checkbox>
                            {/* </Form.Item>
                    </Form> */}
                        </div>
                        <div className={`${styles.table_content} w-full `}>
                            <CustomTable
                                columns={columns}
                                dataSource={tableData}
                                className={`table-box`}
                                pagination={false}
                                loading={tableLoading}
                                locale={{ emptyText: <NoData /> }}
                                p1cardBorder={'none'}
                            />
                        </div>
                    </div>
                </div>
                <AccountPop
                    open={accountPopVisible}
                    onClose={() => setAccountPopVisible(false)}
                    recordData={accountPopData}
                />
                {/* <WithdrawStatusPop
                    open={withdrawStatusPopOpen}
                    onClose={() => setWithdrawStatusPopOpen(false)}
                /> */}
                <WithdrawStatusPopComponent />
                <RechargeStatusPopComponent />
            </ConfigProvider>
        </div>
    );
});

export default UserCenterLayout(AssetsMainPage);
