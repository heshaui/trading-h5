import React from "react";
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from "../styles/spotAccount.module.scss";
import { Input, Steps, Breadcrumb, ConfigProvider, Dropdown, Select, Form, QRCode, Button, Skeleton } from "antd";
import { Iconify } from "@/components/icon";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState, useEffect, useRef, useMemo, } from "react";
import { useThemeMode } from "@/hooks/useThemeMode";
import { Image } from 'antd-mobile';
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useLanguage } from '@/hooks/useLanguage';
import { NoData, NoAddress } from "@/components/noData";
import { IndexBar, List } from 'antd-mobile'
import {
  getWithdrawCoinAll,
} from "@/services/assets";
// import { toast } from 'sonner'
import { Toast } from 'antd-mobile';
import {
  coinSelectType,
  SearchHistoryItem,
  coinExtSelectType
} from "@/type/assets/assetsAccount/topUp";
import appStore from "@/store";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
// import { DownOutlined } from "@ant-design/icons";
// import NoUseCom from "../components/noSM";
interface CoinInfoStepsProps {
  goSteps: (coinInfo: any) => void
  coinList: any
}
const CoinInfoSteps = ({ goSteps,coinList }: CoinInfoStepsProps) => {
  const { t } = useLanguage("assets");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // 获取路由参数
  const coinId = searchParams.get('coinId');
  const coinName = searchParams.get('coinName');

  const userInfo = appStore.getUserInfo()
  const { isDayMode } = useThemeMode(); // 使用 hook
  const [form] = Form.useForm();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [coinInfo, setCoinInfo] = useState({} as any);
  const [coinInfoGroups, setCoinInfoGroups] = useState({} as any);
  const [coinLoading, setCoinLoading] = useState(false);

  const [current, setCurrent] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState<string>(''); // 搜索关键词
  const [isMemo, setIsMemo] = useState(false); // 是否为memo币

  const [protoOpen, setProtoOpen] = useState(false);
  const protoWrapRef = useRef<HTMLDivElement | null>(null);
  const routeAppliedRef = useRef(false);




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


  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!protoOpen) return;
      const el = protoWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setProtoOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [protoOpen]);

  // 按首字母分组函数
  // 返回数据结构示例（包含完整的A-Z字母）:
  // [
  //   { key: 'A', groups: [{ coinName: 'ADA', coinId: 1, ... }, { coinName: 'ATOM', coinId: 2, ... }] },
  //   { key: 'B', groups: [{ coinName: 'BTC', coinId: 3, ... }, { coinName: 'BNB', coinId: 4, ... }] },
  //   { key: 'C', groups: [] }, // 如果没有C开头的币种，groups为空数组
  //   { key: 'D', groups: [] }, // 如果没有D开头的币种，groups为空数组
  //   { key: 'E', groups: [{ coinName: 'ETH', coinId: 5, ... }] },
  //   ...
  //   { key: 'Z', groups: [] } // 所有A-Z字母都会被包含
  // ]
  const groupCoinsByFirstLetter = (coinList: any[]) => {
    // 初始化所有A-Z字母，确保每个字母都有对应的分组
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const grouped: { [key: string]: any[] } = {};

    // 为每个字母初始化空数组
    allLetters.forEach(letter => {
      grouped[letter] = [];
    });

    // 将币种分配到对应的字母分组中
    coinList.forEach((coin) => {
      const firstLetter = coin.coinName.charAt(0).toUpperCase();
      // 确保首字母是有效的A-Z字母
      if (allLetters.includes(firstLetter)) {
        grouped[firstLetter].push(coin);
      }
    });

    // 按字母排序并转换为所需的数据结构（所有A-Z字母都会被包含）
    const sortedGroups = allLetters.map((letter) => ({
      key: letter,
      groups: grouped[letter] // 可能为空数组
    }));

    return sortedGroups;
  };

  // 获取分组后数据的使用示例函数
  const getCoinsByLetter = (letter: string) => {
    const group = coinInfoGroups.find((group: any) => group.key === letter);
    return group ? group.groups : [];
  };

  // 使用 useMemo 实现搜索过滤和分组
  const filteredAndGroupedCoins = useMemo(() => {
    // 如果没有搜索关键词，返回所有分组数据
    if (!searchKeyword.trim()) {
      return groupCoinsByFirstLetter(coinList);
    }

    // 根据搜索关键词过滤币种
    const searchQuery = searchKeyword.toLowerCase().trim().replace(/\s+/g, '');
    const filteredCoins = coinList.filter((coin: any) => {
      return (
        coin.coinName?.toLowerCase().includes(searchQuery) ||
        coin.nameDefault?.toLowerCase().includes(searchQuery)
      );
    });

    // 对过滤后的币种进行分组
    return groupCoinsByFirstLetter(filteredCoins);
  }, [coinList, searchKeyword]);

  // 搜索输入框变化处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 清空搜索
  const handleSearchClear = () => {
    setSearchKeyword('');
  };

  // 删除历史记录
  const delHistory = () => {
    localStorage.removeItem("rechargeCoinHistory");
    setSearchHistory([]);
  };
  const updateSearchHistory = (option: any) => {
    // 更新历史记录
    const newHistoryItem = {
      value: option.value,
      coinId: option.coinId,
      coinName: option.coinName,
      nameDefault: option.nameDefault,
      iconUrl: option.iconUrl,
      chainType: option.chainType // 确保包含图标URL
    };
    const filtered = searchHistory.filter((i: any) => i.value !== newHistoryItem.value);
    const next = [newHistoryItem, ...filtered].slice(0, 4);
    localStorage.setItem('rechargeCoinHistory', JSON.stringify(next));
    setSearchHistory(next as any);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rechargeCoinHistory");
      if (isNotAllowToUp) return
      if (saved && coinList.length > 0) {
        const history = JSON.parse(saved).filter((item: any) => {
          return coinList.some((coin: any) => coin.coinId === item.coinId || coin.coinName === item.coinName)
        })
        setSearchHistory(history);
      }
    }
  }, [coinList, userInfo, isNotAllowToUp]);





  return (<>
    <div className={` page-h w-full bg-[var(--page-background)] flex-y align-center `}>
      <div className={`${styles.card_box} w-full`}>
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
          return needsMerchantRecharge ? <></> : needsKyc ? <></> : <></>
        })()}
        <ConfigProvider
          theme={{
            components: {
              Form: {
                itemMarginBottom: 16,
              },
              Select: {
                clearBg: "#ffffff",
                selectorBg: "transparent", // select框背景色 //var(--background7)
                singleItemHeightLG: 50,
                paddingXXS: 10, // 下拉框选项最小内边距
                optionHeight: 40, //选项高度
                optionLineHeight: 2, //选项行高
              },
            },
          }}
        >
          <Form form={form} disabled={isNotAllowToUp} style={{ width: '100%' }}>
            <Form.Item name="coinName" >
              <div className="flex-x align-center">
              <Input
                placeholder={t("withdrawMoney.select")}
                className={`${styles.input_box} modal-input w-full`}
                allowClear={true}
                prefix={<Iconify icon="eva:search-fill" size={16} />}
                value={searchKeyword}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
              />
              <Button type="text" htmlType="button" 
              style={{padding:0}}
              className="ml-2"
              onClick={handleSearchClear}>{t("toUpSteps.cancel")}</Button>
            
              </div></Form.Item>
            <div className="">
              <div className={`${styles.tip_color2} w-full flex-x justify-between`}
              >
                {/* 搜索历史 */}
                <span> {t("withdrawMoney.searchHistory")}</span>

                <button type="button" onClick={() => delHistory()}>
                  <Iconify
                    icon="mingcute:delete-2-line"
                    size={20}
                    className={`${styles.title_color}`}
                  />
                </button>
              </div>
              {searchHistory.length > 0 ?<div className="mt-2_5 flex-x flex-wrap">
                { searchHistory.map((item, index) => (
                  <button
                    key={`key-${index}`}
                    className={`${styles.btn_style} cancel_btn5 mr-2`}
                    onClick={() => {
                      console.log(item, 999);
                      updateSearchHistory(item)
                      goSteps?.(item)
                    }}>
                    {item.coinName}
                  </button>
                ))}
              </div> : <p className="mt-2 mb-2_5">
                              {t("withdrawMoney.noRecord")}
                            </p>}

            </div>
          </Form>
          <div style={{ height: window.innerHeight, maxHeight: 'calc(100vh - 200px)' }}
            className="mt-4">
            {/* 搜索结果提示 */}
            {/* {searchKeyword.trim() && (
              <div className={`${styles.tip_color2} text-center py-2 font-12 mb-2`}>
                {(() => {
                  const totalCount = filteredAndGroupedCoins.reduce((total, group) => total + group.groups.length, 0);
                  return totalCount > 0 
                    ? t("toUpSteps.searchResult", { searchKeyword, totalCount })
                    : t("toUpSteps.searchResult2", { searchKeyword });
                })()}
              </div>
            )} */}
            <IndexBar className={styles.enent_IndexBar}>
              {coinList.length > 0 ? (filteredAndGroupedCoins.map((group: any) => {
                const { key, groups } = group
                return (
                  <IndexBar.Panel
                    index={key}
                    title={`${key}`}
                    key={key}
                  >
                    <List>
                      {groups.length > 0 ? (
                        groups.map((item: any, index: number) => (
                          <List.Item
                            key={`${key}-${index}`}
                            // onClick={() => {
                            //   goSteps?.(item)
                            // }}
                            className={`cursor-pointer `}
                            style={{ background: 'transparent' }}
                          >
                            <div className="flex-x align-center font-14 font-w-400"
                              onClick={() => {
                                updateSearchHistory(item)
                                goSteps?.(item)
                              }}>
                              <Image
                                src={item.iconUrl}
                                alt={item.coinName}
                                width={20}
                                height={20}
                                className={`${styles.coninIcon} mr-2`}
                              />
                              <span className={styles.title_color}>{item.coinName}</span>
                              <span className={`${styles.tip_color} ml-2`}>
                                {item.nameDefault}
                              </span>
                            </div>
                          </List.Item>
                        ))
                      ) : (
                        <List.Item>
                          <div className={`${styles.tip_color} text-center py-1 font-12`}>
                             {t("toUpSteps.noRecord")}
                          </div>
                        </List.Item>
                      )}
                    </List>
                  </IndexBar.Panel>)
              }))
                : <NoData />}
            </IndexBar>
          </div>
        </ConfigProvider>
      </div>
      {/* <TopUpSteps type="topUp" className="flex-1 ml-5 max-w-[500px]" style={{ width: '50%' }} /> */}
    </div>
    <div className={`${styles.table_box} w-full `}>
      {/* <RechargeTable coinId={coinInfo?.coinId || form.getFieldValue('coinName') || ''} /> */}
      {/* TODO: Implement recharge table component */}
    </div>
  </>
  );
};

export default CoinInfoSteps;
