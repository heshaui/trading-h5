import React from "react";
import { AssetsLayout } from "@/components/MenuItems";
import styles from "../styles/spotAccount.module.scss";
import {
    Input,
    ConfigProvider,
    Form,
    Radio
} from "antd";
import { Iconify, SvgIcon } from "@/components/icon";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    getUserBalanceAll,
    getUserBalanceByDay,
    getTodayEarnings,
    getCoinById,
} from "@/services/assets";
import { Toast, Image,Checkbox } from "antd-mobile";
import { add, roundDown, cut, nul } from "@/utils";
import { useLanguage } from "@/hooks/useLanguage";
import appStore from "@/store";
import { observer } from "mobx-react-lite";
import { getRate, getCoinRate, getCoinRound } from "@/utils/getUseRate";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { DataType } from "@/type/assets/assetsAccount/assets";
import {
    BalanceAllType,
    TodayEarningsType,
    YesterdayBalanceType,
} from "@/type/assets/assetsAccount/assets";
import { NoData } from "@/components/noData";
import WebSocketService from "@/utils/websocket";
import { getToken } from "@/request";
import { CustomTable } from "@/components/CustomCom";
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import AccountPop from "../components/AccountPop";

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
    const balanceDataRef = useRef<WebSocketService | null>(null);
    const [banlanceShow, setBanlanceShow] = useState(false);
    const [hideZero, setHideZero] = useState(false);
    const [accountPopVisible, setAccountPopVisible] = useState(false);
    const columns: ColumnType<DataType>[] = [
        {
            title:(_value, record) => {
                return  <div className="flex align-center">
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
                const rateKeyName = rateKey.split("-")[0].trim();

                // 确保 rateKeyName 有值
                const { ratetext } = getRate(record.coinName, text2, rateKeyName);

                return (<>
                    <p className="flex-y align-end">
                        <span>{text2 ? roundDown(text2, coin?.unitScale) : "0"}</span>
                        <span className="ltr-text">{record.coinName ? ratetext : ""}</span>
                    </p>
                    <button className="ml-1" onClick={() => setAccountPopVisible(true)}>
                        <Iconify icon="ri:more-2-line" size={24} />
                    </button>
                    </>
                );
            },
        },
        // {
        //     title: t("assetsAccount.balance"), //"持仓",
        //     dataIndex: "balance",
        //     key: "balance",
        //     align: "center",
        //     // width: 128,
        //     render: (_text, record) => {
        //         const coin = coinList.find(
        //             (item: any) => item.coinName === record.coinName
        //         ); // 获取币种信息
        //         const text = add(record.balance || 0, record.releaseBalance || 0);
        //         const text2 = add(text, record.frozenBalance || 0);
        //         // 添加默认值和检查
        //         const rateKeyName = rateKey.split("-")[0].trim();

        //         // 确保 rateKeyName 有值
        //         const { ratetext } = getRate(record.coinName, text2, rateKeyName);

        //         return (
        //             <p className="flex-y align-end">
        //                 <span>{text2 ? roundDown(text2, coin?.unitScale) : "0"}</span>
        //                 <span className="ltr-text">{record.coinName ? ratetext : ""}</span>
        //             </p>
        //         );
        //     },
        //     sorter: (a, b) => {
        //         const totalA = add(
        //             add(a.balance || 0, a.releaseBalance || 0),
        //             a.frozenBalance || 0
        //         );
        //         const totalB = add(
        //             add(b.balance || 0, b.releaseBalance || 0),
        //             b.frozenBalance || 0
        //         );
        //         return totalA - totalB;
        //     },
        // },
        // {
        //     title: t("assetsAccount.available"), //"可用",
        //     dataIndex: "balance",
        //     key: "balance",
        //     align: "center",
        //     // width: 158,
        //     render: (_text, record) => {
        //         const coin = coinList.find(
        //             (item: any) => item.coinName === record.coinName
        //         );
        //         return <span>{_text ? roundDown(_text, coin?.unitScale) : "0"}</span>;
        //     },
        //     sorter: (a, b) => a.balance - b.balance,
        // },
        // {
        //     title: t("assetsAccount.frozen"), //"冻结",
        //     key: "releaseBalance",
        //     dataIndex: "releaseBalance",
        //     width: 128,
        //     align: "center",
        //     render: (_text, record) => {
        //         const coin = coinList.find(
        //             (item: any) => item.coinName === record.coinName
        //         );
        //         return <span>{_text ? roundDown(_text, coin?.unitScale) : "0"}</span>;
        //     },
        //     sorter: (a, b) => a.releaseBalance - b.releaseBalance,
        // },
        // {
        //     title: t("assetsAccount.order"), //"下单锁定",
        //     key: "frozenBalance",
        //     dataIndex: "frozenBalance",
        //     width: 128,
        //     align: "center",
        //     render: (_text, record) => {
        //         const coin = coinList.find(
        //             (item: any) => item.coinName === record.coinName
        //         );
        //         return <span>{_text ? roundDown(_text, coin?.unitScale) : "0"}</span>;
        //     },
        //     sorter: (a, b) => a.frozenBalance - b.frozenBalance,
        // },
        // {
        //     title: t("assetsAccount.operation"), //"操作",
        //     key: "action",
        //     dataIndex: "action",
        //     // width: 128,
        //     align: "center",
        //     render: (_text, record) => {
        //         console.log("recordLIst", record);
        //         const coin = coinList.find(
        //             (item: any) => item.coinName === record.coinName
        //         );
        //         const coinPairData = coinPair.find(
        //             (item: any) =>
        //                 item.baseSymbol === record.coinName ||
        //                 item.coinSymbol === record.coinName ||
        //                 record.coinId === item.baseSymbol ||
        //                 record.coinId === item.coinSymbol
        //         );
        //         return (
        //             <Space size={4}>
        //                 <Space size={12}>
        //                     {/* 闪兑 */}
        //                     {coinList.find((item) => item.coinName === record.coinName)
        //                         ?.isTradeConvert === 1 && (
        //                             <button
        //                                 className={`${coinPairData ? styles.theme_color : styles.tip_color2
        //                                     } font-12 font-w-500`}
        //                                 onClick={() => goFlash(record.coinName)}
        //                             >
        //                                 闪兑
        //                             </button>
        //                         )}
        //                     {/* 理财 */}
        //                     {true && (
        //                         <button
        //                             className={`${coinPairData ? styles.theme_color : styles.tip_color2
        //                                 } font-12 font-w-500`}
        //                             onClick={() => goFlash(record.coinName)}
        //                         >
        //                             理财
        //                         </button>
        //                     )}

        //                     {/* 提现 */}
        //                     {/* <button
        //       className={`${
        //         coin?.canWithdraw === 1 ? styles.theme_color : styles.tip_color2
        //       } mr-3 font-12 font-w-500`}
        //       onClick={() => getCoinList("1", record.coinId, coin?.canWithdraw)}
        //     >
        //       {t("assetsAccount.button.withdraw")}
        //     </button> */}
        //                     {/* 充值 */}
        //                     {/* <button
        //       className={`${
        //         coin?.canRecharge === 1 ? styles.theme_color : styles.tip_color2
        //       } mr-3 font-12 font-w-500`}
        //       onClick={() => getCoinList("2", record.coinId, coin?.canRecharge)}
        //     >
        //       {t("assetsAccount.button.deposit")}
        //     </button> */}
        //                     {/* 交易 */}
        //                     {/* <button
        //       className={`${
        //         coinPairData ? styles.theme_color : styles.tip_color2
        //       } mr-3 font-12 font-w-500`}
        //       onClick={() =>
        //         getCoinList(
        //           "3",
        //           record.coinId,
        //           coinPairData ? 1 : 0,
        //           coinPairData ? true : false
        //         )
        //       }
        //     >
        //       {t("assetsAccount.button.trade")}
        //     </button> */}
        //                 </Space>
        //                 {/* <Dropdown
        //                     placement="bottomRight"
        //                     trigger={["click"]}
        //                     menu={{
        //                         items: [
        //                             {
        //                                 label: t("assetsAccount.button.withdraw"),
        //                                 key: "withdraw",
        //                                 onClick: () =>
        //                                     getCoinList("1", record.coinId, coin?.canWithdraw),
        //                             },
        //                             {
        //                                 label: t("assetsAccount.button.deposit"),
        //                                 key: "deposit",
        //                                 onClick: () =>
        //                                     getCoinList("2", record.coinId, coin?.canRecharge),
        //                             },
        //                             {
        //                                 label: t("assetsAccount.button.trade"),
        //                                 key: "trade",
        //                                 onClick: () =>
        //                                     getCoinList(
        //                                         "3",
        //                                         record.coinId,
        //                                         coinPairData ? 1 : 0,
        //                                         coinPairData ? true : false
        //                                     ),
        //                             },
        //                         ],
        //                         style: { minWidth: 120 },
        //                     }}
        //                 >
        //                     <SvgIcon
        //                         viewBox="0 0 18 18"
        //                         size={18}
        //                         style={{ color: "var(--theme-color)", cursor: "pointer" }}
        //                         path="M9 12.375C9.29837 12.375 9.58452 12.4935 9.7955 12.7045C10.0065 12.9155 10.125 13.2016 10.125 13.5C10.125 13.7984 10.0065 14.0845 9.7955 14.2955C9.58452 14.5065 9.29837 14.625 9 14.625C8.70163 14.625 8.41548 14.5065 8.2045 14.2955C7.99353 14.0845 7.875 13.7984 7.875 13.5C7.875 13.2016 7.99353 12.9155 8.2045 12.7045C8.41548 12.4935 8.70163 12.375 9 12.375ZM9 7.875C9.29837 7.875 9.58452 7.99353 9.7955 8.2045C10.0065 8.41548 10.125 8.70163 10.125 9C10.125 9.29837 10.0065 9.58452 9.7955 9.7955C9.58452 10.0065 9.29837 10.125 9 10.125C8.70163 10.125 8.41548 10.0065 8.2045 9.7955C7.99353 9.58452 7.875 9.29837 7.875 9C7.875 8.70163 7.99353 8.41548 8.2045 8.2045C8.41548 7.99353 8.70163 7.875 9 7.875ZM9 3.375C9.29837 3.375 9.58452 3.49353 9.7955 3.7045C10.0065 3.91548 10.125 4.20163 10.125 4.5C10.125 4.79837 10.0065 5.08452 9.7955 5.2955C9.58452 5.50647 9.29837 5.625 9 5.625C8.70163 5.625 8.41548 5.50647 8.2045 5.2955C7.99353 5.08452 7.875 4.79837 7.875 4.5C7.875 4.20163 7.99353 3.91548 8.2045 3.7045C8.41548 3.49353 8.70163 3.375 9 3.375Z"
        //                     />
        //                 </Dropdown> */}
        //             </Space>
        //         );
        //     },
        // },
    ];
    // 添加客户端渲染标记
    const [isClient, setIsClient] = useState(false);
    const [banlanceLoading, setBanlanceLoading] = useState(true);
    // const [todayEarningsLoading, setTodayEarningsLoading] = useState(true);
    const [kLineLoading, setKLineLoading] = useState(true);

    const goFlash = async (coinName: string) => {
        navigate(`/flash?${coinName}`);
    };

    const getCoinList = async (
        type: string,
        coinId: any,
        coinCan?: any,
        coinPair?: boolean
    ) => {
        if (type === "1" || type === "2") {
            try {
                const res = await getCoinById(coinId);
                const { data, code } = res;
                if (code === "0") {
                    if (type === "1") {
                        if (data?.canWithdraw === 1) {
                            //   navigate(ROUTER_KEY_ASSETS.WITHDRAW_MONEY);
                        } else {
                            Toast.show({
                                content: t("assetsAccount.button.withdrawError2"),
                                icon: 'fail'
                            });
                        }
                        // //重新加载币种数据
                        // if (coinCan !== data?.canWithdraw) {
                        //     appStore.loadCoinList() //加载币种数据
                        // }
                    } else if (type === "2") {
                        if (data?.canRecharge === 1) {
                            //   navigate(ROUTER_KEY_ASSETS.TOP_UP);
                        } else {
                            Toast.show({
                                content: t("assetsAccount.button.depositError2"),
                                icon: 'fail'
                            });
                        }
                        // //重新加载币种数据
                        // if (coinCan !== data?.canRecharge) {
                        //     appStore.loadCoinList() //加载币种数据
                        // }
                    }
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
            }
        } else if (type === "3") {
            if (coinPair) {
                // router.push(ROUTER_KEY_SPOT.INDEX);
            } else {
                Toast.show({
                    content: t("assetsAccount.button.tradeError2"),
                    icon: 'fail'
                });
            }
        }
    };
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize,
        };
        setPageParam(pageData);
        paramdataRef.current = pageData;
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
                setInitTableData(res.data || []);
                setTableData(res.data || []);
                // const totalUsd = res.data.reduce((sum: number, curr: any) => {
                //     const coinTotal = add(
                //         add(curr.balance || 0, curr.releaseBalance || 0),
                //         curr.frozenBalance || 0
                //     );
                //     const coinTotalToday=coinTotalCount(coinTotal, curr.recharge, curr.withdrawal, curr.gift)
                //     const balance = getCoinRate(curr.coinName, coinTotal).coinRate
                //     const todayBalance = getCoinRate(curr.coinName, coinTotalToday).coinRate
                //     return {
                //         balance: sum + Number(balance) || 0,
                //         todayBalance: sum + Number(todayBalance) || 0
                //     }
                // }, { balance: 0, todayBalance: 0 });
                const balance = res.data.reduce((sum: number, curr: any) => {
                    const coinTotal = add(
                        add(curr.balance || 0, curr.releaseBalance || 0),
                        curr.frozenBalance || 0
                    );
                    const balance = getCoinRate(curr.coinName, coinTotal).coinRate;

                    return sum + Number(balance) || 0;
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
                    const todayBalance = getCoinRate(
                        curr.coinName,
                        coinTotalToday
                    ).coinRate;

                    return sum + Number(todayBalance) || 0;
                }, 0);

                const rateKeyName = rateKey.split("-")[0].trim();
                const usdRate = getRate("USDT", balance || 0, rateKeyName).rate;
                const usdTodayEarnings = getRate(
                    "USDT",
                    todayBalance || 0,
                    rateKeyName
                ).rate;
                setBalanceAll({
                    usdBalance: usdRate || 0,
                    balance: balance || 0,
                    usdTodayEarnings: usdTodayEarnings || 0,
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
    const waxAndWane = (
        todayBalance: number | string,
        balanceLastDay: number | string
    ) => {
        // console.log(todayBalance, balanceLastDay, 99999);
        // balance今日余额 balanceLastDay昨日余额
        const banlanceShow = cut(Number(todayBalance), Number(balanceLastDay));
        return banlanceShow || 0;
    };
    // 获取用户余额以及充值金额 日K线
    const getUserBalanceDay = async () => {
        setKLineLoading(true);
        try {
            const res = await getUserBalanceByDay();
            if (res.code === "0") {
                const rateKeyName = rateKey.split("-")[0].trim();
                // const usdRate = getRate('USDT', totalUsd, rateKeyName).rate
                const usdBalance = await getRate(
                    "USDT",
                    res.data?.[0]?.balance || 0,
                    rateKeyName
                );
                // const usdRecharge = await getRate('USDT', res.data?.[0]?.recharge || 0, rateKeyName);
                // const usdWithdraw = await getRate('USDT', res.data?.[0]?.withdraw || 0, rateKeyName)

                setBalanceDay({
                    balanceAll: res.data?.[0]?.balance || 0,
                    // balance: res.data?.[0]?.recharge || 0,
                    // withdraw: res.data?.[0]?.withdraw || 0,
                    usdBalanceAll: usdBalance.rate || 0,
                    // usdBalance: usdRecharge.rate || 0,
                    // usdWithdraw: usdWithdraw.rate || 0
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


    // 使用 useMemo 缓存 waxAndWane 计算结果，当依赖项变化时自动重新计算
    const todayProfitUSDT = useMemo(() => {
        // return waxAndWane(
        //     balanceAll?.balance || 0,
        //     balanceDay?.balanceAll || 0,
        //     todayEarnings?.balance || 0,
        //     todayEarnings?.withdraw || 0,
        //     todayEarnings?.gift || 0
        // );
        return waxAndWane(
            balanceAll?.todayEarnings || 0,
            balanceDay?.balanceAll || 0
        );
    }, [balanceAll?.todayEarnings, balanceDay?.balanceAll]);

    const todayProfitFiat = useMemo(() => {
        return waxAndWane(
            balanceAll?.usdTodayEarnings || 0,
            balanceDay?.usdBalanceAll || 0
        );
    }, [balanceAll?.usdTodayEarnings, balanceDay?.usdBalanceAll]);

    // 设置WebSocket连接
    const setupBalanceWebSocket = useCallback(() => {
        // 如果已经有连接，不要重复创建
        if (typeof window === "undefined") return;

        // 创建新的WebSocket连接
        const token = getToken();
        if (!token) {
            console.error("No token found");
            return;
        }

        try {
            // const websocket = new WebSocketService(
            //   `${process.env.NEXT_PUBLIC_ASSETS_API_BASE}/ws/asset?userId=${userInfo.userId}&sa-token=${token}`
            // );
            // balanceDataRef.current = websocket;

            // websocket.connect((message: string) => {
            //   // console.log('收到WebSocket消息:', message);

            //   try {
            //     const data = JSON.parse(message);
            //     // console.log('解析后的数据:', data);

            //     if (data.type === "__ping__") {
            //       websocket.send(JSON.stringify({ type: "__pong__" }));
            //       return;
            //     }
            //     // 更新余额数据
            //     if (data && Array.isArray(data)) {
            //       // 初始化表格数据
            //       const filteredData = initTableData.map((item) => {
            //         // 在 data 数组中查找匹配的项目
            //         const matchedItem = data.find(
            //           (dataItem) => item.coinId === dataItem.coin_id
            //         );
            //         // 如果找到匹配项，则合并数据
            //         if (matchedItem) {
            //           return {
            //             ...item,
            //             balance: matchedItem.balance,
            //             frozenBalance: matchedItem.frozen_balance,
            //             releaseBalance: matchedItem.release_balance,
            //           };
            //         }
            //         // 如果没有找到匹配项，则返回原始项目
            //         return item;
            //       });
            //       // 更新表格数据
            //       const filteredTableData = tableData.map((item) => {
            //         const matchedItem = data.find(
            //           (dataItem) => item.coinId === dataItem.coin_id
            //         );
            //         if (matchedItem) {
            //           return {
            //             ...item,
            //             balance: matchedItem.balance,
            //             frozenBalance: matchedItem.frozen_balance,
            //             releaseBalance: matchedItem.release_balance,
            //           };
            //         }
            //         return item;
            //       });
            //       setInitTableData(filteredData);
            //       setTableData(filteredTableData);
            //       // 更新余额
            //       const balance = filteredData.reduce((sum: number, curr: any) => {
            //         const coinTotal = add(
            //           add(curr.balance || 0, curr.releaseBalance || 0),
            //           curr.frozenBalance || 0
            //         );
            //         const balance = getCoinRate(curr.coinName, coinTotal).coinRate;
            //         return sum + Number(balance) || 0;
            //       }, 0);

            //       const todayBalance = filteredData.reduce(
            //         (sum: number, curr: any) => {
            //           const coinTotal = add(
            //             add(curr.balance || 0, curr.releaseBalance || 0),
            //             curr.frozenBalance || 0
            //           );
            //           const coinTotalToday = coinTotalCount(
            //             coinTotal,
            //             curr.recharge,
            //             curr.withdrawal,
            //             curr.gift
            //           );
            //           const todayBalance = getCoinRate(
            //             curr.coinName,
            //             coinTotalToday
            //           ).coinRate;

            //           return sum + Number(todayBalance) || 0;
            //         },
            //         0
            //       );

            //       const rateKeyName = rateKey.split("-")[0].trim();
            //       const usdRate = getRate("USDT", balance || 0, rateKeyName).rate;
            //       const usdTodayEarnings = getRate(
            //         "USDT",
            //         todayBalance || 0,
            //         rateKeyName
            //       ).rate;
            //       setBalanceAll({
            //         usdBalance: usdRate || 0,
            //         balance: balance || 0,
            //         usdTodayEarnings: usdTodayEarnings || 0,
            //         todayEarnings: todayBalance || 0,
            //       });

            //       // const rateKeyName = rateKey?.split('-')[0].trim()
            //       // const usdRate = getRate('USDT', balance || 0, rateKeyName).rate
            //       // setBalanceAll({
            //       //     ...balanceAll,
            //       //     usdBalance: usdRate || 0,
            //       //     balance: balance || 0
            //       // });
            //     }
            //   } catch (error) {
            //     console.error("WebSocket数据处理错误:", error);
            //     // balanceDataRef.current = null;
            //   }
            // });
        } catch (err) {
            console.error("创建资产WebSocket连接失败:", err);
            // 设置为null以便下次可以重试
            // balanceDataRef.current = null;
        }
    }, [userInfo?.userId, banlanceLoading]); // 移除initTableData依赖，减少不必要的重连

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
            // if (balanceDataRef.current) {
            //   balanceDataRef.current.close();
            //   balanceDataRef.current = null;
            // }
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
                                        {banlanceShow ? <Iconify icon={'clarity:eye-show-line'} className={`${styles.title_color} font-20`} /> : <Iconify icon={'ep:hide'} className={`${styles.tip_color} font-18`} />}
                                    </button>
                                </p>
                                {banlanceShow ? <div
                                    className={`${styles.tip_color}  flex-y`}
                                >
                                    {/* <p
                      className={`${styles.title_color} font-w-700 font-24`}
                    >
                      {getCoinRound("USDT", balanceAll?.balance || 0)}&nbsp;
                      <span className="font-w-500 font-12">USDT</span>
                    </p> */}
                                    <p className={`${styles.title_color} font-w-700 font-24`}>
                                        {balanceAll.usdBalance || 0}
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
                                    <p>
                                        <span
                                            className={`${Number(todayProfitFiat) > 0 ? styles.success_icon : Number(todayProfitFiat) < 0 ? styles.error_icon : styles.tip_color}`}>
                                            &nbsp;{Number(todayProfitFiat) < 0 ? "-" : "+"}
                                            {todayProfitFiat || "0"}
                                        </span>
                                        <span className="font-w-500 font-12 ml-1">
                                            {!rateKeyName ||
                                                rateKeyName === "" ||
                                                rateKeyName === "NaN"
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
                                onClick={() => navigate('/assets/deposit')}
                            >
                                {/* 充值 */}
                                {t("assetsAccount.button.deposit")}
                            </button>
                            <button
                                className={`cancel_btn6 ${styles.btn_style} mr-4 flex-1`}
                                onClick={() => navigate('/assets/withdraw')}
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
                                        <Iconify icon='carbon:circle-filled' className="theme-color"/>
                                    ) : (
                                      <Iconify icon='carbon:circle-outline' className={styles.tip_color2} />
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
                />
            </ConfigProvider>
        </div>
    );
});

export default AssetsLayout(AssetsMainPage);
