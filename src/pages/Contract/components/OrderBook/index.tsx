import { useState, useEffect, useMemo } from "react";
import { Image } from 'antd-mobile';
import { useLanguage } from "@/hooks";
import appStore from "@/store";
import { nul } from "@/utils/index";
import { Iconify } from '@/components/icon'
import { useExchange } from "@/context/exchange-providers/ExchangeProvider";
import { getPairsRate } from "@/utils/getUseRate";
import styles from './style/OrderBook.module.css'
import { NoData } from "@/components/noData";
import SelectPop from '@/components/SelectPop';
import { getRound } from '@/utils/getUseRate';
import { roundDown } from '@/utils/index'

import OrderHoverIcon from '@/assets/images/exchange/icon_order_hover.png';
import OrderIcon from '@/assets/images/exchange/icon_order.png';
import GreenHoverIcon from '@/assets/images/exchange/icon_green_hover.png';
import GreenIcon from '@/assets/images/exchange/icon_green.png';
import RedHoverIcon from '@/assets/images/exchange/icon_red_hover.png';
import RedIcon from '@/assets/images/exchange/icon_red.png';
import { ReactComponent as UpIcon } from '@/assets/images/order_book/up.svg';
import { ReactComponent as DownIcon } from '@/assets/images/order_book/down.svg';

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

const OrderBookPanel = ({type = 'orderbook'}: {type: string}) => {
  const { t } = useLanguage (["spot"]);
  const {depthData: bookData, orderData, klineData, updateTradePrice } = useExchange();
  // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [buyRatio, setBuyRatio] = useState(0);
  const [sellRatio, setSellRatio] = useState(0);
  const [priceScale, setPriceScale] = useState();
  const [colorMode, setColorMode] = useState(1);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | "">("");
  const [priceSource, setPriceSource] = useState<"buy" | "sell" | "">("");
  const [lastPrice, setLastPrice] = useState(0);
  // 当前聚合区间
  const [mergeDepth, setMergeDepth] = useState<number>(0.01);

  // 动态设置深度精度，即聚合区间 币对设置中的深度精度：1-9表示小数位数，10即以上表示具体区间
  const depthPrecisionList = useMemo(() => {
    const precisionList = [
      Number(currentPair.depthOne), 
      Number(currentPair.depthTwo), 
      Number(currentPair.depthThree), 
      Number(currentPair.depthFour), 
      Number(currentPair.depthFive)
    ].filter(Boolean)
    const result = precisionList.map(num => ({
      label: num,
      value: num < 10 ? Number((1 / Math.pow(10, num)).toFixed(num)) : num
    }));
    setMergeDepth(result[0].value)
    return result
  }, [currentPair])

  // 反显深度精度的值
	const getLabel = (value: number) => {
		const currentData = depthPrecisionList.find((item: PrecisionItem) => item.value === value)
		return currentData?.label
	}

  // 添加最新成交数据状态
  const [trades, setTrades] = useState<
    { price: number; amount: number; time?: string; type: "buy" | "sell" }[]
  >([]);

  // 处理价格和数量的精度
  const formatPrice = (price: number) => {
    const priceInfo = getRound(
      `${currentPair?.coinSymbol}/${currentPair?.baseSymbol}`,
      price,
      currentPair?.coinSymbol,
      currentPair?.baseSymbol
    );
    const currentPrecision = Number(getLabel(mergeDepth));
    return currentPrecision >= 10 ? priceInfo.baseScaleResult as number : roundDown(price, currentPrecision);
  };

  const formatAmount = (amount: number) => {
    const amountInfo = getRound(
      `${currentPair?.coinSymbol}/${currentPair?.baseSymbol}`,
      amount,
      currentPair?.coinSymbol,
      currentPair?.baseSymbol
    );
    return amountInfo.scaleResult as number;
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
    setCurrentPrice(0);
    setTrades([]);
    setPriceDirection("");
    setPriceSource("");
  }, [currentPair]);

  useEffect(() => {
    
    // 直接使用WebSocket推送的完整档位数据
    if (bookData && (bookData.asks || bookData.bids)) {
      console.log(bookData)
      // 处理卖单数据
      if (bookData.asks && Array.isArray(bookData.asks)) {
        const aggregatedSells = aggregateOrders(bookData.asks, mergeDepth, true);
        // 根据显示模式限制显示数量
        const maxSellOrders = colorMode === 1 ? 10 : 20;
        setSellOrders(aggregatedSells.slice(0, maxSellOrders));
      }

      // 处理买单数据
      if (bookData.bids && Array.isArray(bookData.bids)) {
        const aggregatedBuys = aggregateOrders(bookData.bids, mergeDepth, false);
        // 根据显示模式限制显示数量
        const maxBuyOrders = colorMode === 1 ? 10 : 20;
        setBuyOrders(aggregatedBuys.slice(0, maxBuyOrders));
      }

      // 计算当前价格和买卖比例
      if (bookData.asks?.length > 0 && bookData.bids?.length > 0) {
        const topAskPrice = Number(bookData.asks[0][0]);
        const topBidPrice = Number(bookData.bids[0][0]);
        
        // 计算买卖比例
        const totalSellAmount = bookData.asks.reduce(
          (sum: number, item: [number, number]) => sum + Number(item[1]),
          0
        );
        const totalBuyAmount = bookData.bids.reduce(
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
  }, [bookData, mergeDepth, colorMode]); // 将sellOrders和buyOrders从依赖数组中排除，以避免潜在的循环更新
  // 注意：这里故意不将sellOrders和buyOrders添加到依赖数组中，因为每次更新这些状态会触发新的effect执行，造成无限循环

  // 添加处理交易数据的效果
  useEffect(() => {
    if (orderData && Array.isArray(orderData)) {
      const processedTrades = orderData
        .map((item) => {
          // 解析JSON字符串
          const tradeData = item.data;
          // 检查数据是否有效
          if (!tradeData) return null;

          return {
            price: Number(tradeData?.buy_price) || 0, // 确保数值有效
            amount: Number(tradeData?.quantity) || 0,
            time: tradeData?.timestamp
              ? new Date(tradeData.timestamp).toLocaleTimeString()
              : "--",
            type: tradeData?.taker_side === "Buy" ? "buy" : "sell",
            tradePrice: tradeData?.trade_price || 0,
          };
        })
        .filter((trade) => trade !== null); // 过滤掉无效的交易数据

      // 确保 processedTrades 中的 type 字段是 "buy" 或 "sell"
      const typedProcessedTrades = processedTrades.map((trade) => ({
        ...trade,
        price: Number(trade?.price),
        amount: Number(trade?.amount),
        type: trade?.type === "buy" ? "buy" : ("sell" as "buy" | "sell"),
      }));

      setTrades(typedProcessedTrades);

      // 更新最后成交价
      if (typedProcessedTrades.length > 0) {
        const newPrice = typedProcessedTrades[0].price;
        const newType = typedProcessedTrades[0].type;

        setLastPrice((prevPrice) => {
          if (prevPrice > 0) {
            // 设置价格方向
            setPriceDirection(
              newPrice > prevPrice ? "up" : newPrice < prevPrice ? "down" : ""
            );
          }

          setPriceSource(newType);

          return newPrice;
        });
      }

      // 计算最近20条交易的买卖单占比
      const recentTrades = typedProcessedTrades;
      let buyCount = 0;
      let sellCount = 0;

      recentTrades.forEach((trade) => {
        if (trade.type === "buy") {
          buyCount++;
        } else {
          sellCount++;
        }
      });

      const totalCount = buyCount + sellCount;
      if (totalCount > 0) {
        const newBuyRatio = (buyCount / totalCount) * 100;
        const newSellRatio = (sellCount / totalCount) * 100;
        setBuyRatio(Number(newBuyRatio.toFixed(2)));
        setSellRatio(Number(newSellRatio.toFixed(2)));
      }
    }
  
  }, [orderData]); // 保持正确的依赖项

  // 使用klineData的收盘价更新currentPrice
  useEffect(() => {

    if (klineData && klineData.data && Array.isArray(klineData.data) && klineData.data.length > 0) {
      // 获取最新的K线数据（最后一个元素）
      const latestKline = klineData.data[klineData.data.length - 1];
      if (latestKline && Array.isArray(latestKline) && latestKline.length > 4) {
        const closePrice = Number(latestKline[4]); // 收盘价在索引4的位置
        if (closePrice > 0) {
          setCurrentPrice((prevPrice) => {
            if (prevPrice > 0) {
              // 设置价格方向
              setPriceDirection(
                closePrice > prevPrice ? "up" : closePrice < prevPrice ? "down" : ""
              );
            }
            return closePrice;
          });
        }
      }
    }
  }, [klineData]);

  // 移除之前的精度列表更新 useEffect，因为现在使用固定的合并区间

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
            {t("spot.orderBook.price")}({currentPair?.baseSymbol})
          </span>
          <span className="text-right">
            {t("spot.orderBook.amount")}({currentPair?.coinSymbol})
          </span>
          <span className="text-right">{t("spot.orderBook.time")}</span>
        </div>
        <ul
          className={trades.length ? 'max-h-[450px] hideScrollBar' : ''}
        >
          {trades.length ? trades.map((trade, index) => (
            <li key={index} className="flex justify-between h-[17px] mb-[15px] last:mb-0 items-center text-[12px]">
              <span
                className={`flex-1 text-left ${
                  trade.type === "buy" ? styles.buyPrice : styles.sellPrice
                }`}
              >
                {trade.price.toFixed(currentPair?.baseCoinScale || 1)}
              </span>
              <span className="flex-1 text-right">
                {trade.amount.toFixed(currentPair?.coinScale || 8)}
              </span>
              <span className="flex-1 text-right">{trade.time}</span>
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
              {t("spot.orderBook.price")}({currentPair?.baseSymbol})
            </span>
            <span className="text-right">
              {t("spot.orderBook.amount")}({currentPair?.coinSymbol})
            </span>
            <span className="text-right">
              {t("spot.orderBook.total")}({currentPair?.baseSymbol})
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
          <div className="h-[24px] flex items-center my-[10px]">
            <span
                className="text-[20px] font-medium mr-1"
                style={{
                  color:
                    priceSource === "buy" || priceDirection === "up"
                      ? "#00b373" // 绿色
                      : priceSource === "sell" || priceDirection === "down"
                      ? "#ff5252" // 红色
                      : "inherit",
                }}
              >
                {currentPrice.toFixed(currentPair?.baseCoinScale || 1)}
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
              <span className="text-[12px] tip-color ml-2">
                ¥ {getPairsRate(currentPrice, 'CNY').rate.toFixed(2)}
              </span>
          </div>

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
};

export default OrderBookPanel; 