import React from "react";
import styles from "./styles/tradeContent.module.scss";
import {
  Segmented,
  ConfigProvider,
  Form,
  Input,
  Slider,
  InputNumber,
  Button,
  message,
  notification,
  Tooltip,
} from "antd";
import { Iconify } from "@/components/icon";
import type { SliderSingleProps } from "antd";
import { useLanguage } from "@/hooks";
import { useTheme } from "@/hooks";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { TabsProps } from "antd";
import { createOrder } from "@/services/spot";
import { encryptData } from "@/utils/encrypt";
import { getUserBalance, getUserBalanceAll } from "@/services/assets";
import { Toast, Popover } from 'antd-mobile';
import { CustomTab } from "@/components/CustomCom";
import appStore from "@/store";
import { observer } from 'mobx-react-lite';
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { add, lastD, roundDown } from "@/utils";
import { useCoinList } from "@/hooks/use-coinList";
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';

import ConfirmOrder from "./ConfirmOrder";
import SpotBuyPopup from "./SpotBuyPopup";

interface DataType {
  data: any;
  id: number;
  userId: number;
  platformType: number;
  deviceNo: string;
  ip: string;
  address: string;
  token: number;
  tokenTime: number;
  createTime: number;
  updateTime: number;
  tenantId: string;
}
type Props = {
  segmentedType?: string;
  onOrderSuccess?: () => void; // 添加回调函数属性
  orderData?: DataType[];
  onOk: () => void;
  onCancel: () => void;
};
const SpotTradePage = observer(({ segmentedType, onOrderSuccess, orderData, onOk, onCancel }: Props) => {
  const { t } = useLanguage(["spot"]);
  const { isLight } = useTheme();
  const [form] = Form.useForm();
  // 添加 price state
  const [price, setPrice] = useState<string | number>("");
  const navigate = useNavigate();
  const { tradePrice } = useExchange();
  const containerRef = useRef<HTMLDivElement>(null);
  const updateOrder = appStore.getUpdateFlag();
  const { popType, setPopType } = usePopTypeContext();
  // 获取币种列表
  // const coinList = appStore.getCoinList();
  const { coinList } = useCoinList();
  const [segmentedvalue, setSegmentedValue] = useState(segmentedType);
  const [activeTab, setActiveTab] = useState('1');
  //是否限价
  const [priceDisabled, setPriceDisabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [userBalance, setUserBalance] = useState<any[]>([]);
  const { isLoggedIn } = useAuth();
  const [toastModal, setToastModal] = useState(false);
  const [spotModal, setSpotModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  // 添加一个状态变量用于强制组件重新渲染
  const [forceUpdate, setForceUpdate] = useState(false);
  const userToken = appStore.getUserToken();
  // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
  // 滑块的值
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // 根据类型更新
  useEffect(() => {
    setSegmentedValue(segmentedType);
  }, [segmentedType])

  // console.log('currentPair', currentPair);
  //  输入金额校验
  const checkAmount = (_: any, value: string) => {
    if (!value) return Promise.resolve();

    // 获取当前可用余额
    const baseBalance =
      userBalance.find((item) => item.coinName === currentPair?.baseSymbol)
        ?.balance || 0;

    // 将输入值转为数字进行比较
    const inputValue = parseFloat(value);

    // 检查最小下单金额
    const minBaseVolume = currentPair?.minBaseVolume || 0;
    if (inputValue < minBaseVolume) {
      return Promise.reject(
        new Error(
          t("spot.error.minTradeAmount", {
            amount: minBaseVolume,
            symbol: currentPair?.baseSymbol,
          })
        )
      );
    }

    // 检查最大下单金额
    const maxBaseVolume = currentPair?.maxBaseVolume || 0;
    if (maxBaseVolume > 0 && inputValue > maxBaseVolume) {
      return Promise.reject(
        new Error(
          t("spot.error.maxTradeAmount", {
            amount: maxBaseVolume,
            symbol: currentPair?.baseSymbol,
          })
        )
      );
    }

    // 检查余额是否充足
    if (segmentedvalue === "buy" && inputValue > baseBalance) {
      return Promise.reject(
        new Error(
          t("spot.error.insufficientBalance", {
            symbol: currentPair?.baseSymbol,
          })
        )
      );
    }

    return Promise.resolve();
  };

  // 添加数量校验函数
  const checkAmountLimit = (_: any, value: string) => {
    if (!value) return Promise.resolve();

    const inputValue = parseFloat(value);

    // 检查最小下单数量
    const minVolume = currentPair?.minVolume || 0;
    if (inputValue < minVolume) {
      return Promise.reject(
        new Error(
          t("spot.error.minOrderAmount", {
            amount: minVolume,
            symbol: currentPair?.coinSymbol,
          })
        )
      );
    }

    // 检查最大下单数量
    const maxVolume = currentPair?.maxVolume || 0;
    if (maxVolume > 0 && inputValue > maxVolume) {
      return Promise.reject(
        new Error(
          t("spot.error.maxOrderAmount", {
            amount: maxVolume,
            symbol: currentPair?.coinSymbol,
          })
        )
      );
    }

    return Promise.resolve();
  };

  const marks: SliderSingleProps["marks"] = {
    0: {
      label: <strong></strong>,
    },
    25: {
      label: <strong></strong>,
    },
    50: {
      label: <strong></strong>,
    },
    75: {
      label: <strong></strong>,
    },
    100: {
      label: <strong></strong>,
    },
  };

  // 修改处理精度的辅助函数，移除多余的0
  const formatWithPrecision = (value: number | string, precision: number) => {
    if (!value && value !== 0) return "";
    // 先格式化到指定精度，然后移除末尾多余的0和可能的小数点
    return Number(value)
      .toFixed(precision)
      .replace(/\.?0+$/, "");
  };

  // 添加滑块变化时的处理函数
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    // 限制最大值为98%
    const percentage = Math.min(value, 98) / 100;

    if (segmentedvalue === "buy") {
      // 买入操作，计算可买数量
      const baseBalance =
        userBalance.find((item) => item.coinName === currentPair?.baseSymbol)
          ?.balance || 0;
      const price = form.getFieldValue("price");

      if (price && !priceDisabled) {
        // 限价单
        const availableAmount = (baseBalance * percentage) / price;
        form.setFieldsValue({
          amount: formatWithPrecision(
            availableAmount,
            currentPair?.coinScale || 8
          ),
          account: formatWithPrecision(
            availableAmount * price,
            currentPair?.baseCoinScale || 8
          ),
        });
      } else if (priceDisabled) {
        // 市价单
        const availableFunds = baseBalance * percentage;
        form.setFieldsValue({
          account: formatWithPrecision(
            availableFunds,
            currentPair?.baseCoinScale || 8
          ),
        });
      }
    } else {
      // 卖出操作，计算可卖数量
      const coinBalance =
        userBalance.find((item) => item.coinName === currentPair?.coinSymbol)
          ?.balance || 0;
      const availableAmount = coinBalance * percentage;

      form.setFieldsValue({
        amount: formatWithPrecision(
          availableAmount,
          currentPair?.coinScale || 8
        ),
      });

      // 只有在限价单时才设置成交额
      const price = form.getFieldValue("price");
      if (price && !priceDisabled) {
        form.setFieldsValue({
          account: formatWithPrecision(
            availableAmount * price,
            currentPair?.baseCoinScale || 8
          ),
        });
      } else if (priceDisabled) {
        // 市价卖单时，清空account字段或设置为估算值
        form.setFieldsValue({ account: "" });
      }
    }
  };

  // 根据输入的数量更新滑块位置
  const updateSliderFromAmount = () => {
    const amount = form.getFieldValue("amount");
    const account = form.getFieldValue("account");

    if (segmentedvalue === "buy") {
      if (priceDisabled) {
        // 市价买单，根据account计算百分比
        if (account) {
          const baseBalance =
            userBalance.find(
              (item) => item.coinName === currentPair?.baseSymbol
            )?.balance || 0;
          if (baseBalance > 0) {
            const percentage = Math.min(
              (parseFloat(account) / baseBalance) * 100,
              100
            );
            setSliderValue(Math.round(percentage * 100) / 100);
          }
        }
      } else {
        // 限价买单，根据amount计算百分比
        if (amount) {
          const baseBalance =
            userBalance.find(
              (item) => item.coinName === currentPair?.baseSymbol
            )?.balance || 0;
          const price = form.getFieldValue("price");
          if (baseBalance > 0 && price) {
            const maxAmount = baseBalance / price;
            const percentage = Math.min(
              (parseFloat(amount) / maxAmount) * 100,
              100
            );
            setSliderValue(Math.round(percentage * 100) / 100);
          }
        }
      }
    } else {
      // 卖出操作，根据amount计算百分比
      if (amount) {
        const coinBalance =
          userBalance.find((item) => item.coinName === currentPair?.coinSymbol)
            ?.balance || 0;
        if (coinBalance > 0) {
          const percentage = Math.min(
            (parseFloat(amount) / coinBalance) * 100,
            100
          );
          setSliderValue(Math.round(percentage * 100) / 100);
        }
      }
    }
  };

  // 防抖函数实现 - 带TypeScript类型定义
  function debounce<F extends (...args: any[]) => any>(
    func: F,
    wait: number
  ): (...args: Parameters<F>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<F>): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const items = [
    {
      key: "1",
      title: t("spot.select.limit"), //"限价",
    },
    {
      key: "2",
      title: t("spot.select.market"), //'市价',
    },
  ];
  const onChange = (key: string) => {
    setSliderValue(0);
    setActiveTab(key);
    if (key === "1") {
      setPriceDisabled(false);
    } else {
      setPriceDisabled(true);
    }

    // 切换时重置所有表单字段
    form.resetFields();
  };
  const geSegmentedChange = (value: string | number) => {
    setSegmentedValue(value as string);
    setSliderValue(0);
    form.resetFields();
  };

  // 修改计算成交额的函数，应用精度
  const calculateTotal = () => {
    const price = form.getFieldValue("price");
    const amount = form.getFieldValue("amount");

    if (price && amount) {
      const total = price * amount;
      form.setFieldsValue({
        account: formatWithPrecision(total, currentPair?.baseCoinScale || 8),
      });
    } else {
      form.setFieldsValue({ account: "" });
    }
  };

  // 根据成交额计算数量的函数
  const calculateAmount = () => {
    const price = form.getFieldValue("price");
    const account = form.getFieldValue("account");

    if (!account) return; // 如果没有输入成交额，不需要计算

    // 市价模式下使用最新市场价格
    if (priceDisabled) {
      // 获取最新价格
      const { buyPrice } = getLatestPrices();

      if (buyPrice && buyPrice > 0) {
        const amount = account / buyPrice;
        form.setFieldsValue({
          amount: formatWithPrecision(amount, currentPair?.coinScale || 8),
        });
      }
    } else {
      // 限价模式下使用用户输入的价格
      if (price && price > 0) {
        const amount = account / price;
        form.setFieldsValue({
          amount: formatWithPrecision(amount, currentPair?.coinScale || 8),
        });
      } else {
        // 如果价格为0或不存在，不更新数量字段
        message.info(t("spot.error.enterValidPrice"));
      }
    }
  };

  // 监听价格和数量的变化，计算成交额
  useEffect(() => {
    // 初始化时计算一次总额
    calculateTotal();
    console.log("tradePrice", tradePrice);
    if (tradePrice) {
      form.setFieldsValue({
        price: tradePrice,
      });
    }
  }, [form, tradePrice]);

  const handelSubmitOrder = async () => {
    // 在提交时手动验证必填字段
    const values = popType === PopTypeEnum.PLACE_OREER ? modalData : form.getFieldsValue();
    let hasError = false;
    let errMsg;

    // 验证价格字段 - 只在限价模式下验证
    if (!priceDisabled && (!values.price || values.price === "")) {
      form.setFields([
        {
          name: "price",
          errors: [t("spot.error.enterPrice")],
        },
      ]);
      hasError = true;
      errMsg = t("spot.error.enterPrice");
    }

    // 验证数量字段
    if (
      (!priceDisabled || (priceDisabled && segmentedvalue === "sell")) &&
      (!values.amount || values.amount === "")
    ) {
      form.setFields([
        {
          name: "amount",
          errors: [t("spot.error.enterAmount")],
        },
      ]);
      hasError = true;
      errMsg = t("spot.error.enterAmount");
    }

    // 验证金额字段 - 市价买单或限价单都需要验证
    if ((priceDisabled && segmentedvalue === "buy") || !priceDisabled) {
      if (!values.account || values.account === "") {
        form.setFields([
          {
            name: "account",
            errors: [t("spot.error.enterTotal")],
          },
        ]);
        hasError = true;
        errMsg = t("spot.error.enterTotal");
      }
    }

    if (hasError) {
      if (popType === PopTypeEnum.PLACE_OREER) {
        message.error(errMsg);
        setPopType(PopTypeEnum.INDEX)
      }
      return;
    }

    form.validateFields().then(async () => {
      const params = {
        amount:
          priceDisabled && segmentedvalue === "buy"
            ? values.account
            : values.amount,
        baseSymbol: currentPair?.baseSymbol,
        coinSymbol: currentPair?.coinSymbol,
        direction: segmentedvalue === "buy" ? 0 : 1,
        price: values.price,
        symbol: currentPair?.symbol,
        type: priceDisabled ? 0 : 1,
      };
      console.log(params, "params");
      setLoading(true);
      try {
        const data = await encryptData(params);
        const res = await createOrder(data);
        if (res.code === "0") {
          getUserBalanceData();
          setModalOpen(false);
          form.resetFields();
          setSliderValue(0);

          // 通知父组件下单成功
          //if (typeof onOrderSuccess === "function") {
            // onOrderSuccess();
            appStore.updateOrderFlag(1);
            notification.success({
              message: t("spot.success.orderPlaced"),
              description: (
                <div>
                  <div>
                    {t("spot.label.pair")}: {currentPair?.coinSymbol}/
                    {currentPair?.baseSymbol}
                  </div>
                  {values.amount && (
                    <div>
                      {t("spot.label.amount")}: {values.amount}{" "}
                      {currentPair?.coinSymbol}
                    </div>
                  )}
                  <div>
                    {t("spot.label.price")}:{" "}
                    {priceDisabled
                      ? formatWithPrecision(
                          res.data[1],
                          currentPair?.baseCoinScale || 8
                        ) +
                        " " +
                        currentPair?.baseSymbol
                      : formatWithPrecision(
                          values.price,
                          currentPair?.baseCoinScale || 8
                        ) +
                        " " +
                        currentPair?.baseSymbol}
                  </div>
                </div>
              ),
              duration: 3,
            });
          //}
        } else {
          message.error(res.message);
        }
        setLoading(false);
        onOk();
      } catch (err) {
        setLoading(false);
        message.error(String(err))
      }  
    });
  };

  // 定义原始提交函数
  const handleSubmit = () => {
    // 检查当前是卖出操作且可卖数量为0的情况
    if (segmentedvalue === "sell") {
      const availableCoin =
        userBalance.find((item) => item.coinName === currentPair?.coinSymbol)
          ?.balance || 0;
        if (availableCoin <= 0) {
          Toast.show({
            icon: 'fail',
            content: t("spot.error.insufficientSellBalance", {
              symbol: currentPair?.coinSymbol,
            })
          })
          return;
        }
    }

    // 在提交时手动验证必填字段
    const values = form.getFieldsValue();
    let hasError = false;

    // 验证价格字段
    if (!priceDisabled && (!values.price || values.price === "")) {
      form.setFields([
        {
          name: "price",
          errors: [t("spot.error.enterPrice")],
        },
      ]);
      hasError = true;
    }

    // 验证数量字段
    if (
      (!priceDisabled || (priceDisabled && segmentedvalue === "sell")) &&
      (!values.amount || values.amount === "")
    ) {
      form.setFields([
        {
          name: "amount",
          errors: [t("spot.error.enterAmount")],
        },
      ]);
      hasError = true;
    }

    // 验证金额字段 - 市价买单或限价单都需要验证
    if ((priceDisabled && segmentedvalue === "buy") || !priceDisabled) {
      if (!values.account || values.account === "") {
        form.setFields([
          {
            name: "account",
            errors: [t("spot.error.enterTotal")],
          },
        ]);
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    form.validateFields().then(async (values) => {
      const modalData = {
        account: values.account,
        amount: values.amount,
        price: values.price,
        type: priceDisabled ? 0 : 1,
        direction: segmentedvalue === "buy" ? 0 : 1,
      };
      console.log(priceDisabled);
      let noRemind;
      if (!priceDisabled) {
        noRemind = localStorage.getItem("limitOrderConfirm");
      } else {
        noRemind = localStorage.getItem("marketOrderConfirm");
      }

      console.log(noRemind, "noRemind");
      if (noRemind === "true") {
        setModalData(modalData);
        // setModalOpen(true);
        setPopType(PopTypeEnum.PLACE_OREER);
      } else {
        // setModalOpen(false);
        handelSubmitOrder();
      }
    });
  };

  // 使用防抖处理的提交函数 - 300ms延迟
  const onSubmit = debounce(handleSubmit, 300);

  // 币种余额
  const getUserBalanceData = async () => {
    if (!userToken) return;
    try {
      const res = await getUserBalanceAll();
      if (res.code === "0") {
        setUserBalance(res.data);

        return res.data;
      } else {
		Toast.show({
			icon: 'fail',
			content: res.message
		})
      }
    } catch (error) {
	  Toast.show({
      icon: 'fail',
      content: String(error)
	  })
    }
  };
  //
  const roundNum = (coinName: string) => {
    const balance = lastD(
      userBalance.find((item: any) => item.coinName === coinName)?.balance || 0
    );
    const coin = coinList.find((item: any) => item.coinName === coinName);
    return roundDown(balance, coin?.unitScale);
  };

  useEffect(() => {
    getUserBalanceData();
  }, [updateOrder.orderDelect, updateOrder.orderUpdate]);

  // 添加函数获取最新交易价格
  const getLatestPrices = () => {
    if (!orderData || orderData.length === 0)
      return { buyPrice: 0, sellPrice: 0, tradePrice: 0 };

    // 按时间戳排序，获取最新的交易记录
    const sortedData = [...orderData].sort(
      (a, b) => b.data.timestamp - a.data.timestamp
    );
    const latestData = sortedData[0].data;

    return {
      buyPrice: latestData.buy_price,
      sellPrice: latestData.sell_price,
      tradePrice: latestData.trade_price, // 添加最新成交价
    };
  };

  // 计算可买卖数量的函数
  const calculateAvailableAmount = () => {
    const baseBalance =
      userBalance.find((item) => item.coinName === currentPair?.baseSymbol)
        ?.balance || 0;
    const coinBalance =
      userBalance.find((item) => item.coinName === currentPair?.coinSymbol)
        ?.balance || 0;

    // 获取用户输入的价格
    const userInputPrice = form.getFieldValue("price");
    // 如果没有用户输入的价格，则使用市场价格
    const { buyPrice, sellPrice } = getLatestPrices();

    // 如果没有价格数据，直接返回0
    if ((!userInputPrice && !buyPrice) || (!userInputPrice && !sellPrice)) {
      return { availableToBuy: 0, availableToSell: coinBalance };
    }

    // 计算可买数量
    // 如果用户输入了价格且不是市价单，则使用用户输入的价格
    const priceForCalculation =
      !priceDisabled && userInputPrice ? userInputPrice : buyPrice;
    const availableToBuy = formatWithPrecision(
      baseBalance / priceForCalculation,
      currentPair?.coinScale || 8
    );

    return {
      availableToBuy,
      availableToSell: formatWithPrecision(
        coinBalance,
        currentPair?.coinScale || 8
      ),
    };
  };

  // 直接定义可买数量的计算函数
  const getAvailableToBuy = () => {
    const baseBalance =
      userBalance.find((item) => item.coinName === currentPair?.baseSymbol)
        ?.balance || 0;
    const price = form.getFieldValue("price");

    if (!price || price <= 0) {
      // 如果没有有效价格，使用市场价格
      const { buyPrice } = getLatestPrices();
      return buyPrice
        ? formatWithPrecision(
            baseBalance / buyPrice,
            currentPair?.coinScale || 8
          )
        : "0";
    }

    // 使用表单中的当前价格计算
    return formatWithPrecision(
      baseBalance / price,
      currentPair?.coinScale || 8
    );
  };

  // 可卖数量计算
  const getAvailableToSell = () => {
    const coinBalance =
      userBalance.find((item) => item.coinName === currentPair?.coinSymbol)
        ?.balance || 0;
    return formatWithPrecision(coinBalance, currentPair?.coinScale || 8);
  };

  // 添加价格偏差验证函数
  const checkPriceDeviation = (_: any, value: string) => {
    if (!value || priceDisabled) return Promise.resolve();

    // 获取最新成交价
    const { tradePrice } = getLatestPrices();
    if (!tradePrice) return Promise.resolve();

    const inputPrice = parseFloat(value);
    const maxDeviation = currentPair?.priceOffset || 0;

    // 计算价格偏差百分比
    const deviation = Math.abs(((inputPrice - tradePrice) / tradePrice) * 100);

    if (deviation > maxDeviation) {
      return Promise.reject(
        // new Error(`价格偏差不能超过${maxDeviation}%，当前偏差${deviation.toFixed(2)}%`)
        new Error(
          t("spot.error.priceDeviation", {
            maxDeviation: maxDeviation,
            deviation: deviation.toFixed(2),
          })
        )
      );
    }

    return Promise.resolve();
  };

  // 自定义计数器函数 type: 0 减 1 加
  const handlePrice = (type: number) => {
    const current = Number(form.getFieldValue("price")) || 0;
    const precision = currentPair?.baseCoinScale || 8;
    
    // 根据精度计算步进值
    const step = Math.pow(10, -precision);
    
    // 计算新价格
    const updatePrice = type 
      ? current + step 
      : Math.max(current - step, 0);
    
    // 格式化价格并设置
    const formattedPrice = formatWithPrecision(updatePrice, precision);
    
    // 同时更新 form 和 state
    form.setFieldsValue({ price: formattedPrice });
    setPrice(formattedPrice);
    
    // 如果有数量，计算总额
    if (form.getFieldValue('amount')) {
      calculateTotal();
    }
  };

  const SliderRender = () => (
    <Slider
      marks={marks}
      defaultValue={0}
      max={100}
      step={0.01}
      onChange={handleSliderChange}
      disabled={!isLoggedIn}
      value={sliderValue}
      tooltip={{
        open: true,
        zIndex: 1000,
        placement: "top",
        arrow: false,
        className: "sliderTooltip",
        destroyOnHidden: true,
        getPopupContainer: (trigger) => trigger.parentNode as HTMLElement,
        color: "var(--theme-color)", // 设置悬浮框背景颜色为橙色
        formatter: (value) =>  `${value ? value.toFixed(2) : 0}%`,
        autoAdjustOverflow: false,
      }}
      className="spotSlider"
    />
  );

  if (popType === PopTypeEnum.PLACE_OREER) {
    return <ConfirmOrder 
      orderData={modalData}
      onOk={() => handelSubmitOrder()} 
      onCancel={onCancel} 
    />
  }

  return (
    <div ref={containerRef} className="p-4">
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemColor: "var(--text-color4)", //未选中颜色
              itemActiveBg: "transparent", //未选中背景色
              itemSelectedBg: segmentedvalue === "buy" ? "#00C788" : "#FF4D4F", //选中背景色
              itemSelectedColor: "#fff", //选中颜色
              trackBg: "transparent", //轨道背景色
            },
            Form: {
              itemMarginBottom: 16,
            },
            Input: {
              controlHeightLG: 50,
              activeBorderColor: "var(--theme-color)",
              hoverBorderColor: "var(--theme-color)",
              activeBg: "var(--background11)",
              hoverBg: "var(--background11)",
            },
            InputNumber: {
              controlHeightLG: 50,
              activeBorderColor: "var(--theme-color)",
              hoverBorderColor: "var(--theme-color)",
              activeBg: "var(--background7)",
              hoverBg: "var(--background7)",
              handleBg: "transparent", //操作按钮背景色
            },
            Button: {
              controlHeightLG: 50,
              defaultBg: segmentedvalue === "buy" ? "#00C788" : "#FF4D4F",
              defaultBorderColor:
                segmentedvalue === "buy" ? "#00C788" : "#FF4D4F",
              defaultColor: "#fff",
              // defaultActiveBg: '#fff',
              // defaultActiveBorderColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
              // defaultActiveColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
              // defaultHoverBg: '#fff',
              // defaultHoverBorderColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
              // defaultHoverColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
              defaultActiveBg: segmentedvalue === "buy" ? "#00C788" : "#FF4D4F",
              defaultActiveBorderColor:
                segmentedvalue === "buy" ? "#00C788" : "#FF4D4F",
              defaultActiveColor: "#fff",
              defaultHoverBg: segmentedvalue === "buy" ? "#00C788" : "#FF4D4F",
              defaultHoverBorderColor:
                segmentedvalue === "buy" ? "#00C788" : "#FF4D4F",
              defaultHoverColor: "#fff",
            },
            Slider: {
              controlSize: 16,
              dotActiveBorderColor: "var(--theme-05)",
              dotBorderColor: "var(--background5)",
              dotSize: 16,
              handleActiveColor: "var(--theme-color)",
              handleActiveOutlineColor: "var(--theme-02)",
              handleColor: "var(--theme-05)",
              railBg: "var(--background16)", // 滑块轨道背景色
              railHoverBg: "var(--background16)", // 滑块轨道悬浮背景色
              trackBg: "var(--theme-05)",
              trackBgDisabled: "var(--background16)",
              trackHoverBg: "var(--theme-color)"
            },
          },
        }}
      >
        <div  className={`mb-6`}>
          <Segmented
            options={[
              {
                label: (
                  // className={`default_btn ${styles.btn_style}`}
                  <div className={`${styles.segmented_label} rounded-l-[36px]`}>
                    <div>{t("spot.trade.buy")}</div>
                  </div>
                ),
                value: "buy",
              },
              {
                label: (
                  <div className={`${styles.segmented_label} rounded-r-[36px]`}>
                    <div>{t("spot.trade.sell")}</div>
                  </div>
                ),
                value: "sell",
              },
            ]}
            className={`spot-segmented ${
              segmentedvalue === "buy"
                ? styles.segmented_box
                : styles.segmented_box_red
            }`}
            value = {segmentedvalue}
            onChange={geSegmentedChange}
          />
        </div>
        {/* <BuyPage segmentedType={segmentedvalue} /> */}
        <div className="flex-y align-center w-full">
          <div className={`w-full`}>
            <CustomTab
              tabsItems={items}
              activeKey={activeTab}
              stretch={false}
              activeLineMode="fixed"
              className="tradeTabs"
              onChange={onChange}
            />
          </div>

          <div className={`mt-3 w-full`}>
            <Form
              form={form}
              style={{ width: "100%" }}
              onValuesChange={(changedValues) => {
                if ("price" in changedValues || "amount" in changedValues) {
                  calculateTotal();
                  // 价格变化时强制重新渲染组件，确保可买数量更新
                  if ("price" in changedValues) {
                    // 使用一个无关的状态更新来触发重新渲染
                    setForceUpdate((prev) => !prev);
                    // 价格变化时也需要更新滑块位置
                    setTimeout(() => {
                      updateSliderFromAmount();
                    }, 0);
                  }
                  // 当数量变化时，更新滑块位置
                  if ("amount" in changedValues) {
                    // 使用延时来确保表单值已经更新
                    setTimeout(() => {
                      updateSliderFromAmount();
                    }, 0);
                  }
                }
                if ("account" in changedValues) {
                  // 当成交额变化时，计算数量
                  calculateAmount();
                  // 当成交额变化时，也更新滑块位置（针对市价买单）
                  if (priceDisabled && segmentedvalue === "buy") {
                    setTimeout(() => {
                      updateSliderFromAmount();
                    }, 0);
                  }
                }
              }}
            >
              <Form.Item name="price" className="spot_number_box">
                <div className={priceDisabled ? '' : 'custom-input-number'}>
                  <InputNumber
                    className={`${styles.mail_input} spot_number_input `}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                    min={0}
                    formatter={(value: any) => {
                      if (value === "" || value === null || value === undefined)
                        return "";
                      const precision = currentPair?.baseCoinScale || 8;
                      return `${parseFloat(value.toString()).toFixed(
                        precision
                      )}`.replace(/\.?0+$/, "");
                    }}
                    parser={(value: any): string => {
                      if (value === "" || value === null || value === undefined)
                        return "";
                      // 只保留数字和第一个小数点
                      return value
                        .toString()
                        .replace(/[^\d.]/g, "")
                        .replace(/\.(?=.*\.)/g, "");
                    }}
                    value={price} 
                    onChange={(value) => { 
                      setPrice(value ?? "");
                      form.setFieldsValue({ price: value });
                      if (form.getFieldValue('amount')) {
                        calculateTotal();
                      }
                    }}
                    suffix={
                      !priceDisabled ? (
                        <div>{currentPair?.baseSymbol}</div>
                      ) : (
                        t("spot.select.market")
                      )
                    }
                    prefix={
                      <span className={`${styles.tip_color2}`}>
                        {t("spot.trade.price")}
                      </span>
                    }
                    controls={false}
                  />
                  {!priceDisabled && <div className="controls">
                    <button type="button" className="border-bottom" onClick={() => handlePrice(1)}>
                      <Iconify
                        icon="mdi:chevron-up"
                        size={20}
                        className={`${styles.title_color} ${styles.hover_color}`}
                      />
                    </button>
                    <button type="button" onClick={() => handlePrice(0)}>
                      <Iconify
                        icon="mdi:chevron-down"
                        size={20}
                        className={`${styles.title_color} ${styles.hover_color}`}
                      />
                    </button>
                  </div>}
                </div>
              </Form.Item>
              <Form.Item
                name="amount"
                rules={[{ validator: checkAmountLimit }]}
                style={{
                  display:
                    priceDisabled && segmentedvalue === "buy"
                      ? "none"
                      : "block",
                }}
              >
                <InputNumber
                  className={`${styles.mail_input} spot_number_input `}
                  style={{ width: "100%" }}
                  suffix={<div>{currentPair?.coinSymbol}</div>}
                  prefix={
                    <span className={`${styles.tip_color2}`}>
                      {t("spot.trade.amount")}
                    </span>
                  }
                  controls={false}
                  onBlur={(e) => {
                    // 失去焦点时手动检查最大和最小下单数量
                    const value = form.getFieldValue("amount");
                    if (value) {
                      const inputValue = parseFloat(value);
                      let needCorrection = false;
                      let correctedValue = inputValue;

                      // 检查最小下单数量
                      const minVolume = currentPair?.minVolume || 0;
                      if (inputValue < minVolume) {
                        // message.error(`最小下单数量为 ${minVolume} ${currentPair?.coinSymbol}`);
                        message.error(
                          t("spot.tooltip.minOrderAmount", {
                            amount: minVolume,
                            symbol: currentPair?.coinSymbol,
                          })
                        );
                        correctedValue = minVolume;
                        needCorrection = true;
                      }

                      // 检查最大下单数量
                      const maxVolume = currentPair?.maxVolume || 0;
                      if (maxVolume > 0 && inputValue > maxVolume) {
                        // message.error(`最大下单数量为 ${maxVolume} ${currentPair?.coinSymbol}`);
                        message.error(
                          t("spot.tooltip.maxOrderAmount", {
                            amount: maxVolume,
                            symbol: currentPair?.coinSymbol,
                          })
                        );
                        correctedValue = maxVolume;
                        needCorrection = true;
                      }

                      // 如果需要修正，更新表单值
                      if (needCorrection) {
                        form.setFieldsValue({
                          amount: formatWithPrecision(
                            correctedValue,
                            currentPair?.coinScale || 8
                          ),
                        });
                        // 如果是限价单，同时更新成交额
                        if (!priceDisabled) {
                          const price = form.getFieldValue("price");
                          if (price) {
                            form.setFieldsValue({
                              account: formatWithPrecision(
                                correctedValue * price,
                                currentPair?.baseCoinScale || 8
                              ),
                            });
                          }
                        }
                        // 更新滑块位置
                        setTimeout(() => {
                          updateSliderFromAmount();
                        }, 0);
                      } else {
                        // 即使没有校正，也要更新滑块位置
                        setTimeout(() => {
                          updateSliderFromAmount();
                        }, 0);
                      }
                    }
                  }}
                  formatter={(value) => {
                    if (value === "" || value === null || value === undefined)
                      return "";
                    const precision = currentPair?.coinScale || 8;
                    return `${parseFloat(value.toString()).toFixed(
                      precision
                    )}`.replace(/\.?0+$/, "");
                  }}
                  parser={(value) => {
                    if (value === "" || value === null || value === undefined)
                      return "";
                    // 只保留数字和第一个小数点
                    const parsed = value
                      .toString()
                      .replace(/[^\d.]/g, "")
                      .replace(/\.(?=.*\.)/g, "");
                    return parsed as unknown as number;
                  }}
                />
              </Form.Item>
              {/* slider */}
              {!priceDisabled && SliderRender()}
              <Form.Item
                name="account"
                rules={[{ validator: checkAmount }]}
                style={{
                  display:
                    !priceDisabled ||
                    (priceDisabled && segmentedvalue === "buy")
                      ? "block"
                      : "none",
                }}
              >
                <InputNumber
                  className={`${styles.mail_input} spot_number_input `}
                  style={{ width: "100%" }}
                  suffix={<div>{currentPair?.baseSymbol}</div>}
                  prefix={
                    <span className={`${styles.tip_color2}`}>
                      {t("spot.trade.amount2")}
                    </span>
                  }
                  controls={false}
                  onBlur={() => {
                    // 失去焦点时手动检查余额是否充足
                    const value = form.getFieldValue("account");
                    if (value) {
                      const inputValue = parseFloat(value);

                      // 检查余额是否充足
                      const baseBalance =
                        userBalance.find(
                          (item) => item.coinName === currentPair?.baseSymbol
                        )?.balance || 0;
                      if (
                        segmentedvalue === "buy" &&
                        inputValue > baseBalance
                      ) {
                        // message.error(`可用${currentPair?.baseSymbol}余额不足`);
                        message.error(
                          t("spot.tooltip.insufficientBalance", {
                            symbol: currentPair?.baseSymbol,
                          })
                        );
                        // 自动将金额调整为可用余额
                        form.setFieldsValue({
                          account: formatWithPrecision(
                            baseBalance,
                            currentPair?.baseCoinScale || 8
                          ),
                        });

                        // 如果是限价单，同时更新数量
                        if (!priceDisabled) {
                          const price = form.getFieldValue("price");
                          if (price) {
                            const newAmount = baseBalance / price;
                            form.setFieldsValue({
                              amount: formatWithPrecision(
                                newAmount,
                                currentPair?.coinScale || 8
                              ),
                            });
                          }
                        }
                        // 更新滑块位置
                        setTimeout(() => {
                          updateSliderFromAmount();
                        }, 0);
                      } else {
                        // 即使没有修正，也要更新滑块位置
                        setTimeout(() => {
                          updateSliderFromAmount();
                        }, 0);
                      }
                    }
                  }}
                  formatter={(value) => {
                    if (value === "" || value === null || value === undefined)
                      return "";
                    const precision = currentPair?.baseCoinScale || 8;
                    return `${parseFloat(value.toString()).toFixed(
                      precision
                    )}`.replace(/\.?0+$/, "");
                  }}
                  parser={(value) => {
                    if (value === "" || value === null || value === undefined)
                      return "";
                    // 只保留数字和第一个小数点
                    const parsed = value
                      .toString()
                      .replace(/[^\d.]/g, "")
                      .replace(/\.(?=.*\.)/g, "");
                    return parsed as unknown as number;
                  }}
                />
              </Form.Item>
              {priceDisabled && SliderRender()}
              <ul className={`font-14 mb-[30px]`}>
                <li className="flex justify-between align-center mb-[10px]">
                  <p className="tip-color">{t("spot.trade.available")}</p>
                  {/* <p>{userBalance.find(item => item.coinName === currentPair?.baseSymbol)?.balance || '--'} {currentPair?.baseSymbol}</p> */}
                  {isLoggedIn ? (
                    <p className="flex items-center">
                      <span>{roundNum(currentPair?.baseSymbol || "")}{" "}
                      {currentPair?.baseSymbol}{" "}</span>
					            <Iconify icon="gg:add" className="text-[20px] ml-1" onClick={() => {
                          setSpotModal(true);
                      }}/>
                    </p>
                  ) : (
                    <p>--</p>
                  )}
                </li>
                <li className="flex justify-between align-center">
                  <Popover
                      content={
                        !priceDisabled
                        ? segmentedvalue === "buy"
                          ? t("spot.tooltip.buyAvailableLimit")
                          : t("spot.tooltip.sellAvailableLimit")
                        : segmentedvalue === "buy"
                        ? t("spot.tooltip.buyAvailableMarket")
                        : t("spot.tooltip.sellAvailableMarket")
                      }
                      trigger='click'
                      placement='top'
                      mode={isLight ? 'light' : 'dark'}
                  >
                    <p className="tip-color leading-[20px] border-b border-dashed border-[#9e9e9e]">
                      {segmentedvalue === "buy"
                        ? t("spot.trade.canBuy")
                        : t("spot.trade.canSell")}
                    </p>
                  </Popover>

                  {isLoggedIn ? (
                    <p>
                      {segmentedvalue === "buy"
                        ? getAvailableToBuy()
                        : getAvailableToSell()}
                      {currentPair?.coinSymbol}
                    </p>
                  ) : (
                    <p>--</p>
                  )}
                </li>
              </ul>
            </Form>
            {isLoggedIn ? (
              <Button
                loading={loading}
                // className={`${styles.sumbit_btn} green_btn`}
                style={{ width: "100%", height: "50px", borderRadius: "32px" }}
                htmlType="submit"
                onClick={onSubmit}
                disabled={currentPair?.enable === 0}
              >
                {segmentedvalue === "buy"
                  ? t("spot.trade.buy")
                  : t("spot.trade.sell")}
                {currentPair?.coinSymbol}
              </Button>
            ) : (
              <Button
                // className={`${styles.sumbit_btn} green_btn`}
                style={{ width: "100%", height: "50px", borderRadius: "32px" }}
                htmlType="button"
                onClick={() => {
				          navigate('/login')
                }}
              >
                {t("spot.modal.login")}
              </Button>
            )}

            <div
              className={`${styles.fee_container} flex align-center mt-4`}
              style={{ borderBottom: "none" }}
            >
              <Popover
                  content={
                    <>
                      <div className={styles.fee_tooltip_title}>
                        {t("spot.label.fee")}
                      </div>
                      <div className={styles.fee_tooltip_details}>
                        {t("spot.label.feeDetails", {
                          maker: currentPair?.buyFee,
                          taker: currentPair?.sellFee,
                        })}
                      </div>
                    </>
                  }
                  trigger='click'
                  placement='left'
                  mode={isLight ? 'light' : 'dark'}
                  getContainer={() => containerRef.current!}
              >
                <div className="flex items-center">
                  <Iconify icon="mdi:percent-circle-outline" className="text-[16px] mr-1" />
                  <span className="text-[14px] border-b border-dashed border-[#9e9e9e]">
                    {t("spot.label.fee")}
                  </span>
                </div>
              </Popover>
            </div>
          </div>
          <SpotBuyPopup 
            open={spotModal}
            onCancel={() => {
              setSpotModal(false);
            }}
          />
        </div>
      </ConfigProvider>
    </div>
  );
});

export default SpotTradePage;
