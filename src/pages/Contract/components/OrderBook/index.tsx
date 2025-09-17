import { useState, useEffect, useMemo } from "react";
import { Image } from 'antd-mobile';
import { useLanguage } from "@/hooks";
import appStore from "@/store";
import { observer } from "mobx-react-lite";
import { nul } from "@/utils/index";
import { Iconify } from '@/components/icon'
import { useContract } from "@/context/exchange-providers/ContractProvider";
import { getPairsRate } from "@/utils/getUseRate";
import styles from './style/OrderBook.module.css'
import { NoData } from "@/components/noData";
import SelectPop from '@/components/SelectPop';
import { getRound } from '@/utils/getUseRate';
import { roundDown } from '@/utils/index'
import { BigNumber } from "bignumber.js";
import { useMarketInfo } from "@/hooks/useMarketInfo";

import OrderHoverIcon from '@/assets/images/exchange/icon_order_hover.png';
import OrderIcon from '@/assets/images/exchange/icon_order.png';
import GreenHoverIcon from '@/assets/images/exchange/icon_green_hover.png';
import GreenIcon from '@/assets/images/exchange/icon_green.png';
import RedHoverIcon from '@/assets/images/exchange/icon_red_hover.png';
import RedIcon from '@/assets/images/exchange/icon_red.png';
import { ReactComponent as UpIcon } from '@/assets/images/order_book/up.svg';
import { ReactComponent as DownIcon } from '@/assets/images/order_book/down.svg';
import { ReactComponent as TagIcon } from '@/assets/images/exchange/icon_tag.svg';

// 定义订单类型
interface Order {
  price: number;
  amount: number;
  total: number;
}

// 修改精度列表的类型定义
interface PrecisionItem {
  label: number;
  value: number;
}

const OrderBookPanel = observer(({type = 'orderbook'}: {type: string}) => {
  const { t } = useLanguage (["spot", "contract"]);
  const {depthData: bookData, orderData, klineData, updateTradePrice } = useContract();
  // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
  const currentContractInfo = appStore.getCurrentContractInfo();
  const { marketInfo, loadMarketInfo } = useMarketInfo();
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [buyRatio, setBuyRatio] = useState(0);
  const [sellRatio, setSellRatio] = useState(0);
  const [colorMode, setColorMode] = useState(1); // 1: 全部 2: 买单 3: 卖单
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | "">("");
  // 当前聚合区间
  const [mergeDepth, setMergeDepth] = useState<number>(0.01);
  // 合约精度
  const symbolPricePrecision=currentContractInfo?.coinResultVo?.symbolPricePrecision ?? 2;

  // 动态设置深度精度，即聚合区间 币对设置中的深度精度：1-9表示小数位数，10即以上表示具体区间
  const depthPrecisionList = useMemo(() => {
    const precisionList = currentContractInfo?.coinResultVo?.depth.filter(Boolean).map((item:string) => Number(item)) ?? [];
    console.log('精度列表', precisionList)
    const result = precisionList.map((num: number) => ({
      label: num,
      value: num < 10 ? Number((1 / Math.pow(10, num)).toFixed(num)) : num
    }));
    result.length && setMergeDepth(result[0].value)
    return result ?? [{label: 2, value: 0.01}]
  }, [currentContractInfo.symbol, currentContractInfo.id])

  // 反显深度精度的值
	const getLabel = (value: number) => {
		const currentData = depthPrecisionList.find((item: PrecisionItem) => item.value === value)
		return currentData?.label
	}

  // 处理价格和数量的精度
  const formatPrice = (price: number) => {
    // 使用合约当前的精度
    const priceResult = roundDown(price, symbolPricePrecision);
    // 聚合精度
    const currentPrecision = Number(getLabel(mergeDepth));
    return currentPrecision >= 10 ? priceResult : roundDown(price, currentPrecision);
  };

  const formatAmount = (amount: number) => {
    return roundDown(amount, 2) as unknown as number;
  };

  /**
   * 根据合并深度计算价格区间的起始价格
   * 例如：价格 50025，合并深度 50，则返回 50000
   * @param price 起始价格
   * @param mergeDepth 聚合区间
   * @returns 起始价格
   */
  const aggregatePrice = (price: number, mergeDepth: number) => {
    return Math.floor(price / mergeDepth) * mergeDepth;
  };

  // 添加订单聚合函数
  const aggregateOrders = (orders: [number, number][], mergeDepth: number, isAsk: boolean) => {
    // 使用 Map 来存储聚合后的数据，key 是区间起始价格
    const aggregatedMap = new Map<number, { amount: number; total: number }>();

    orders.forEach(([price, amount]) => {
      // 获取价格所属的区间起始价格
      const intervalStart = aggregatePrice(price, mergeDepth);
      
      if (!aggregatedMap.has(intervalStart)) {
        aggregatedMap.set(intervalStart, { amount: 0, total: 0 });
      }
      
      const current = aggregatedMap.get(intervalStart)!;
      current.amount += amount;
      // 使用区间起始价格计算总额，保证一致性
      current.total = nul(intervalStart, current.amount);
    });

    // 转换回数组并排序
    const aggregatedArray = Array.from(aggregatedMap.entries()).map(([price, { amount, total }]) => ({
      price,  // 这里的价格是区间起始价格
      amount: formatAmount(amount),
      total
    }));
    // 卖单从高到低，买单从低到高, 目前都是从高到低
    return aggregatedArray.sort((a, b) => 
      isAsk ? b.price - a.price : b.price - a.price // a.price - b.price
    );
  };

  // 当币对变化时，重置所有订单数据
  // 当币对变化时，重置所有订单数据
  useEffect(() => {
    setSellOrders([]);
    setBuyOrders([]);
    setPriceDirection("up");
  }, [currentContractInfo.symbol, currentContractInfo.id]);

  useEffect(() => {
    // 直接使用WebSocket推送的完整档位数据
    if (bookData && bookData.tick) {
      console.log('委托列表', bookData)
      const {asks, buys: bids, priceChange} = bookData.tick;
      const  direction = priceChange ? priceChange >=0 ? 'up' : 'down' : 'up';
      setPriceDirection(direction);
      // 处理卖单数据
      if (asks && Array.isArray(asks)) {
        const aggregatedSells = aggregateOrders(asks, mergeDepth, true);
        // 根据显示模式限制显示数量
        const maxSellOrders = colorMode === 1 ? 10 : 20;
        setSellOrders(aggregatedSells.slice(0, maxSellOrders));
      }

      // 处理买单数据
      if (bids && Array.isArray(bids)) {
        const aggregatedBuys = aggregateOrders(bids, mergeDepth, false);
        // 根据显示模式限制显示数量
        const maxBuyOrders = colorMode === 1 ? 10 : 20;
        setBuyOrders(aggregatedBuys.slice(0, maxBuyOrders));
      }

      // 计算当前价格和买卖比例
      if (asks?.length > 0 && bids?.length > 0) {
        
        // 计算买卖比例
        const totalSellAmount = asks.reduce(
          (sum: number, item: [number, number]) => sum + Number(item[1]),
          0
        );
        const totalBuyAmount = bids.reduce(
          (sum: number, item: [number, number]) => sum + Number(item[1]),
          0
        );
        const total = totalSellAmount + totalBuyAmount;

        if (total > 0) {
          setBuyRatio(Number(((totalBuyAmount / total) * 100).toFixed(2)));
          setSellRatio(Number(((totalSellAmount / total) * 100).toFixed(2)));
        }
      } 
    }
  }, [bookData, mergeDepth, colorMode]);

  // 使用 useMemo 优化性能，处理实时成交数据
  const trades = useMemo(() => {
    // 只使用真实的实时成交数据
    if (orderData && Array.isArray(orderData) && orderData.length > 0) {
      // 限制显示的数据量，只显示最新的50条记录
      return orderData.slice(0, 50);
    }
    return [];
  }, [orderData]);
  // 格式化时间显示
  const formatTime = (timeStr: string) => {
    try {
      // 尝试解析时间字符串 "2025-08-25 14:31:28"
      const date = new Date(timeStr);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      // 如果解析失败，返回原字符串的时间部分
      return timeStr.split(' ')[1] || timeStr;
    }
  };

  const getPriceColor = (side: "BUY" | "SELL") => {
    if (side === "SELL") {
      return colorMode === 1 || colorMode === 3
        ? "error_icon"
        : "success_icon";
    } else {
      return colorMode === 1 || colorMode === 2
        ? "success_icon"
        : "error_icon";
    }
  };

  const renderColorModeButtons = () => {
    return (
      <div className="flex h-[34px] px-[16px] justify-between items-center border-b border-color">
        {/* 显示买卖盘 */}
        <div className="flex gap-x-[8px] h-[34px] items-center">
          <img
            src={
              colorMode === 1 ? OrderHoverIcon : OrderIcon
            }
            alt="color-mode"
            className="!w-[20px] !h-[20px]"
            onClick={() => setColorMode(1)}
          />
          <img
            src={
              colorMode === 2 ? GreenHoverIcon : GreenIcon
            }
            alt="color-mode"
            className="!w-[20px] !h-[20px]"
            onClick={() => setColorMode(2)}
          />
          <img
            src={
              colorMode === 3 ? RedHoverIcon : RedIcon
            }
            alt="color-mode"
            className="!w-[20px] !h-[20px]"
            onClick={() => setColorMode(3)}
          />
        </div>
        <SelectPop 
            value={mergeDepth}
            options={depthPrecisionList}
            title={t('spot.select.placeholder')} 
            onChange={(value: any) => setMergeDepth(value)}
            activeType="icon"
            renderBtn={(open) => (
                <button 
                    type="button" 
                    className={`text-[14px] leading-[20px] tip-color`}
                    onClick={open}
                >
                    <span>{getLabel(mergeDepth)}</span>
                    <Iconify icon="eva:arrow-down-fill" className="text-[16px] text-[#9e9e9e] ml-1" />
                </button>
            )}
        />
      </div>
    );
  };

  const renderTrades = () => {
    return (
      <div className="px-4 py-[10px]">
        <div className={styles.labels}>
          <span className="text-left">
            {t("spot.orderBook.price")}({currentContractInfo?.quote})
          </span>
          <span className="text-right">
            {t("spot.orderBook.amount")}({currentContractInfo?.base})
          </span>
          <span className="text-right">{t("spot.orderBook.time")}</span>
        </div>
        <ul
          className={trades.length ? 'max-h-[450px] hideScrollBar' : ''}
        >
          {trades.length ? trades.map((trade, index) => (
            <li key={index} className="flex justify-between h-[17px] mb-[15px] last:mb-0 items-center text-[12px]">
              <span
                className={`flex-1 text-left ${getPriceColor(trade.side)}`}
                onClick={() => updateTradePrice(trade.price)}
              >
                {trade.price}
              </span>
              <span className="flex-1 text-right">
                {trade.vol}
              </span>
              <span className="flex-1 text-right">{formatTime(trade.ds)}</span>
            </li>
          )):
          (
            <li className="px-5 flex justify-center">
              <NoData />
            </li>
          )
        }
        </ul>
      </div>
    );
  }

  if (type === 'trades') return renderTrades();

  return (
    <div>
      {/* 渲染盘口控制按钮 */}
      {renderColorModeButtons()}
      <div className="px-4 py-[10px]">
          <div className={styles.labels}>
            <span className="text-left">
              {t("spot.orderBook.price")}({currentContractInfo?.quote})
            </span>
            <span className="text-right">
              {t("spot.orderBook.amount")}({currentContractInfo?.base})
            </span>
            <span className="text-right">
              {t("contract:orderBookList.total")}({currentContractInfo?.quote})
            </span>
          </div>

          {/* 卖单 */}
          {(colorMode === 1 || colorMode === 3) && (
            <div className={styles.orderList}>
              {sellOrders.map((order, index) => {
                const percentWidth = Math.min(
                  (order.total / Math.max(...sellOrders.map((o) => o.total))) *
                    100,
                  100
                );
                return (
                  <div
                    key={index}
                    className={`${styles.orderRow} ${styles.sell} text-[12px]`}
                  >
                    <span
                      className={styles.price}
                      style={{ cursor: "pointer" }}
                      onClick={() => updateTradePrice(order.price)}
                    >
                      {formatPrice(order.price)}
                    </span>
                    <span className={styles.amount}>
                      {order.amount}
                    </span>
                    <div className={styles.totalColumn}>
                      <div
                        className={styles.background}
                        style={{
                          width: `${percentWidth}%`,
                          transition: "width 0.3s ease-in-out",
                        }}
                      />
                      <span className={styles.total}>
                        {order.total > 10000
                          ? `${(order.total / 10000).toFixed(2)}万`
                          : order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 当前价格 */}
          {colorMode === 1 && <div className="h-[24px] flex items-center justify-between my-[10px]">
            <div className="flex items-center">
              <span
                className="text-[20px] font-medium mr-1"
                style={{
                  color:
                    priceDirection === "up"
                      ? "#00b373" // 绿色
                      : priceDirection === "down"
                      ? "#ff5252" // 红色
                      : "inherit",
                }}
              >
                {orderData?.length ? new BigNumber(orderData[0].price).toFixed(symbolPricePrecision || 2) : '--'}
              </span>
              <span
                className={styles.priceChange}
                style={{
                  color:
                    priceDirection === "up"
                      ? "#00b373"
                      : priceDirection === "down"
                      ? "#ff5252"
                      : "inherit",
                }}
              >
                {priceDirection === "up" ? (
                  <UpIcon className="!w-[16px] !h-[16px]" />
                ) : priceDirection === "down" ? (
                  <DownIcon className="!w-[16px] !h-[16px]" />
                ) : (
                  "-"
                )}
              </span>
            </div>
            <div className="flex items-center">
                <TagIcon className="!w-[12px] !h-[12px] theme-color mr-1" />
                <span className="text-[12px] theme-color">{marketInfo?.tagPrice ? new BigNumber(marketInfo.tagPrice).toFixed(symbolPricePrecision || 2): '--'}</span>
            </div>
          </div>}

          {/* 买单 */}
          {(colorMode === 1 || colorMode === 2) && (
            <div className={`${styles.orderList} text-[12px]`}>
              {buyOrders.map((order, index) => {
                const percentWidth = Math.min(
                  (order.total / Math.max(...buyOrders.map((o) => o.total))) *
                    100,
                  100
                );
                return (
                  <div
                    key={index}
                    className={`${styles.orderRow} ${styles.buy}`}
                  >
                    <span
                      className={styles.price}
                      style={{ cursor: "pointer" }}
                      onClick={() => updateTradePrice(order.price)}
                    >
                      {formatPrice(order.price)}
                    </span>
                    <span className={styles.amount}>
                      {order.amount}
                    </span>
                    <div className={styles.totalColumn}>
                      <div
                        className={styles.background}
                        style={{
                          width: `${percentWidth}%`,
                          transition: "width 0.3s ease-in-out",
                        }}
                      />
                      <span className={styles.total}>
                        {order.total > 10000
                          ? `${(order.total / 10000).toFixed(2)}万`
                          : order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 买单/卖单比例 */}
          <div className={styles.ratio}>
            <div className={styles.buyBox}>B</div>
            <div className={styles.ratioBar}>
              <div
                className={styles.buyRatio}
                style={{ width: `${buyRatio}%` }}
              >
                <span className={styles.buyPercent}>{buyRatio}%</span>
              </div>
              <div
                className={styles.sellRatio}
                style={{ width: `${sellRatio}%` }}
              >
                <span className={styles.sellPercent}>{sellRatio}%</span>
              </div>
            </div>
            <div className={styles.sellBox}>S</div>
          </div>
        </div>
    </div>
  );
});

export default OrderBookPanel; 