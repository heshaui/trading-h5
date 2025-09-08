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
import { encryptData } from "@/utils/encrypt";
import { Toast, Popover } from 'antd-mobile';
import { CustomTab } from "@/components/CustomCom";
import appStore from "@/store";
import { observer } from 'mobx-react-lite';
import useAuth from "@/hooks/useAuth";
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';
import { useContract } from '@/context/exchange-providers/ContractProvider';
import { useUserConfig } from "@/hooks/useUserConfig";
import { transferAll } from "@/services/assets";

import ConfirmOrder from "./ConfirmOrder";
import MarginModeModal from "../components/MarginModePopup";
import LeverageModal from "../components/LeveragePopup";
import FundTransferModal from "../components/FundTransferPopup";

type Props = {
  segmentedType?: string;
  onOk: () => void;
  onCancel: () => void;
  symbol?: string;
  availableBalance?: number;
  spotBalance?: any;
  contractBalance?: any;
  onOrderSubmit?: (orderData: any) => void;
  onBalanceUpdate?: () => void; // 新增余额更新回调
  priceSetterRef?: React.MutableRefObject<((price: number) => void) | null>; // 新增价格设置器ref
  priceData?: any; // 新增价格数据
};
const SpotTradePage = observer(({ 
  segmentedType, onOk, onCancel,
  symbol, availableBalance = 1, spotBalance, onOrderSubmit, onBalanceUpdate,
  priceSetterRef, priceData, contractBalance=1
}: Props) => {
  const { t } = useLanguage(["spot"]);
  const { isLight } = useTheme();
  const { popType, setPopType } = usePopTypeContext();
  const [form] = Form.useForm();

  // 状态管理 - 按固定顺序声明所有状态
  const [currentCategory, setCurrentCategory] = useState<1 | 2 | 3>(1);
  const [transactionType, setTransactionType] = useState<1 | 2>(1);
  const [leverageLevel, setLeverageLevel] = useState(1);
  const [price, setPrice] = useState<string | number>();
  const [quantity, setQuantity] = useState<string | number>();
  const [percentage, setPercentage] = useState(0);
  const [enableTPSL, setEnableTPSL] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState<string | number>("");
  const [stopLossPrice, setStopLossPrice] = useState<string | number>("");
  const [marginModel, setMarginModel] = useState<1 | 2>(1);
  const [showMarginModeModal, setShowMarginModeModal] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showOrderSettingsModal, setShowOrderSettingsModal] = useState(false);
  const [showTradingSettingsDrawer, setShowTradingSettingsDrawer] =
    useState(false);
  const [showFundTransferModal, setShowFundTransferModal] = useState(false);
  const [showOrderConfirmModal, setShowOrderConfirmModal] = useState(false);
  const [orderUnit, setOrderUnit] = useState<"BTC" | "USDT" | "张">("BTC");
  const [showCalculator, setShowCalculator] = useState(false);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  // 新增触发价状态
  const [triggerPrice, setTriggerPrice] = useState<string>("");
  const [submitData, setSubmitData] = useState({}); //下单提交数据
  const [confirmData, setConfirmData] = useState({
    direction: 0,
    type: 1,
    price: "" as string | number,
    amount: 0 as string | number,
    account: 0,
    symbol: symbol,
    marginMode: 1 as number,
    leverage: 65,
    orderType: "limit",
  }); //二次确认数据

  // 新增验证错误状态
  const [validationErrors, setValidationErrors] = useState<{
    price?: string;
    quantity?: string;
    triggerPrice?: string;
  }>({});

  // 在所有Hooks声明之后获取store数据
  const currentContractInfo = appStore.getCurrentContractInfo();
  const { userConfig } = useUserConfig();
  const symbolPricePrecision=currentContractInfo.coinResultVo.symbolPricePrecision
  //限价最大成交金额
  const maxLimitMoney=currentContractInfo.coinResultVo.maxLimitMoney
  //限价最大成交量
  const maxLimitVolume=currentContractInfo.coinResultVo.maxLimitVolume
  //市价最大成交金额
  const maxMarketMoney=currentContractInfo.coinResultVo.maxMarketMoney
  //市价最大成交量
  const maxMarketVolume=currentContractInfo.coinResultVo.maxMarketVolume
  
  // 获取当前订单类型
  const getOrderType = useCallback(() => {
    if (currentCategory === 1) return "limit";
    if (currentCategory === 2) return "market";
    if (currentCategory === 3) return "conditional";
    return "limit";
  }, [currentCategory]);

  const orderType = getOrderType();

  // 格式化数字显示 - 如果小数点后都是0则显示整数
  const formatNumber = useCallback((num: number, precision: number = 4) => {
    if (num === 0) return "0";

    const fixed = num.toFixed(precision);
    // 移除末尾的0和小数点
    const formatted = fixed.replace(/\.?0+$/, "");
    return formatted;
  }, []);

  // 计算可买/可卖数量
  const calculateMaxQuantity = useCallback((side?: "BUY" | "SELL") => {
    if (availableBalance <= 0 || leverageLevel <= 0) return 0;

    // 获取合约信息
    const contractInfo = currentContractInfo;
    const faceValue = contractInfo?.multiplier || 1; // 面值
    const marginRate = contractInfo?.marginRate || 1; // 保证金汇率
    const contractSide = contractInfo?.contractSide; // 1: 正向合约, 2: 反向合约

    let calculationPrice = 0;

    // 根据订单类型和方向确定价格
    if (orderType === "limit") {
      // 限价单使用输入的价格
      const priceNum = typeof price === "string" ? parseFloat(price as string) : price;
      if (!priceNum || priceNum <= 0) return 0;
      calculationPrice = priceNum;
    } else {
      // 市价单根据买卖方向使用不同价格
      const lastPrice = priceData?.lastPrice || priceData?.close || 1;
      const bidPrice = priceData?.bidPrice || lastPrice; // 买一价
      const askPrice = priceData?.askPrice || lastPrice; // 卖一价

      if (side === "BUY") {
        // 买入使用卖一价
        calculationPrice = typeof askPrice === "string" ? parseFloat(askPrice) : askPrice;
      } else if (side === "SELL") {
        // 卖出使用买一价
        calculationPrice = typeof bidPrice === "string" ? parseFloat(bidPrice) : bidPrice;
      } else {
        // 默认使用最新价
        calculationPrice = typeof lastPrice === "string" ? parseFloat(lastPrice) : lastPrice;
      }
    }

    if (calculationPrice <= 0) return 0;

    // 计算最大数量
    let maxQuantity = 0;
    const totalBalance = availableBalance * leverageLevel * marginRate;

    if (contractSide === 2) {
      // 反向合约：可用余额 * 杠杆 * 价格 / 面值
      maxQuantity = totalBalance * calculationPrice / faceValue;
    } else {
      // 正向合约：可用余额 * 杠杆 / (面值 * 价格)
      maxQuantity = totalBalance / (faceValue * calculationPrice);
    }

    return Math.max(0, maxQuantity);
  }, [priceData, price, orderType, availableBalance, leverageLevel, currentContractInfo]);

  // 计算成本 - 支持指定方向
  const calculateCost = useCallback((side?: "BUY" | "SELL") => {
    const quantityNum = typeof quantity === "string" ? parseFloat(quantity) : quantity;
    const priceNum = typeof price === "string" ? parseFloat(price) : price;

    if (!quantityNum || quantityNum <= 0) return 0;

    // 获取合约信息
    const contractInfo = currentContractInfo;
    const faceValue = contractInfo?.multiplier || 1; // 面值
    const marginRate = contractInfo?.marginRate || 1; // 保证金汇率，默认为1
    const contractSide = contractInfo?.contractSide; // 1: 正向合约, 2: 反向合约

    let cost = 0;
    let calculationPrice = 0;

    if (currentCategory === 1 || currentCategory === 3) { // 限价单或条件限价单
      if (!priceNum || priceNum <= 0) return 0;
      calculationPrice = priceNum;
    } else if (currentCategory === 2) { // 市价单
      // 市价单根据做多做空方向使用不同价格
      const lastPrice = priceData?.lastPrice || priceData?.close || 1;
      const bidPrice = priceData?.bidPrice || lastPrice; // 买一价
      const askPrice = priceData?.askPrice || lastPrice; // 卖一价

      if (side === "BUY") {
        // 做多使用卖一价（买入时需要支付卖方的价格）
        calculationPrice = typeof askPrice === "string" ? parseFloat(askPrice) : askPrice;
      } else if (side === "SELL") {
        // 做空使用买一价（卖出时按照买方的价格）
        calculationPrice = typeof bidPrice === "string" ? parseFloat(bidPrice) : bidPrice;
      } else {
        // 默认使用最新价
        calculationPrice = typeof lastPrice === "string" ? parseFloat(lastPrice) : lastPrice;
      }
    }

    if (calculationPrice > 0) {
      if (contractSide === 2) {
        // 反向合约：成本 = (张数 × 面值 ÷ 价格 ÷ 杠杆) × 保证金汇率
        cost = (quantityNum * faceValue / calculationPrice / leverageLevel) * marginRate;
      } else {
        // 正向合约：成本 = (张数 × 面值 × 价格 ÷ 杠杆) × 保证金汇率
        cost = (quantityNum * faceValue * calculationPrice / leverageLevel) * marginRate;
      }
    }

    return cost;
  }, [quantity, price, currentCategory, leverageLevel, currentContractInfo, priceData]);

  // 实时验证函数
  const validateField = useCallback((field: 'price' | 'quantity' | 'triggerPrice', value: string | number): string | undefined => {
    if (!value || value.toString().trim() === "") {
      return t("tradingPanel.validation.required");
    }

    const numValue = parseFloat(value.toString());
    if (isNaN(numValue)) {
      return t("tradingPanel.validation.invalidNumber");
    }

    if (numValue <= 0) {
      return t("tradingPanel.validation.mustBePositive");
    }

    // 价格精度验证
    if ((field === 'price' || field === 'triggerPrice') && symbolPricePrecision !== undefined) {
      const valueStr = value.toString();
      const decimalIndex = valueStr.indexOf('.');
      if (decimalIndex !== -1) {
        const decimalPlaces = valueStr.length - decimalIndex - 1;
        if (decimalPlaces > symbolPricePrecision) {
          return t("tradingPanel.validation.exceedsPricePrecision", { precision: symbolPricePrecision });
        }
      }
    }

    // 特定字段的额外验证
    if (field === 'quantity') {
      // 验证是否为正整数
      if (!Number.isInteger(numValue)) {
        return t("tradingPanel.validation.mustBeInteger");
      }
      
      // 验证最大成交量限制
      const orderType = getOrderType();
      if (orderType === 'limit' && maxLimitVolume && numValue > maxLimitVolume) {
        return t("tradingPanel.validation.exceedsMaxLimitVolume", { max: maxLimitVolume });
      }
      if (orderType === 'market' && maxMarketVolume && numValue > maxMarketVolume) {
        return t("tradingPanel.validation.exceedsMaxMarketVolume", { max: maxMarketVolume });
      }
      
      const maxQuantity = transactionType === 1 ? calculateMaxQuantity("BUY") : calculateMaxQuantity("SELL");
      if (numValue > maxQuantity) {
        return t("tradingPanel.validation.exceedsMaxQuantity", { action: transactionType === 1 ? t("buy") : t("sell") });
      }
    }

    // 价格和数量组合验证 - 验证最大成交金额
    if ((field === 'price' || field === 'quantity') && price && quantity) {
      const priceNum = typeof price === 'string' ? parseFloat(price) : price;
      const quantityNum = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
      
      if (priceNum > 0 && quantityNum > 0) {
        const orderAmount = priceNum * quantityNum;
        const orderType = getOrderType();
        
        if (orderType === 'limit' && maxLimitMoney && orderAmount > maxLimitMoney) {
          return t("tradingPanel.validation.exceedsMaxLimitAmount", { max: maxLimitMoney });
        }
        if (orderType === 'market' && maxMarketMoney && orderAmount > maxMarketMoney) {
          return t("tradingPanel.validation.exceedsMaxMarketAmount", { max: maxMarketMoney });
        }
      }
    }

    return undefined;
  }, [calculateMaxQuantity, transactionType, symbolPricePrecision, getOrderType, maxLimitVolume, maxMarketVolume, maxLimitMoney, maxMarketMoney, price, quantity, t]);

  // 处理外部设置价格 - 使用 useCallback 避免依赖项问题
  const handleSetPriceFromExternal = useCallback((newPrice: number) => {
    const priceStr = newPrice.toString();
    setPrice(priceStr);

    // 验证新设置的价格
    if (currentCategory === 1 || currentCategory === 3) {
      const error = validateField('price', priceStr);
      setValidationErrors(prev => ({
        ...prev,
        price: error
      }));
    }
  }, [currentCategory, validateField]);

  // 监听 userConfig.nowLevel 变化，同步更新本地 leverageLevel 状态
  useEffect(() => {
    if (userConfig?.nowLevel && userConfig.nowLevel !== leverageLevel) {

      setLeverageLevel(userConfig.nowLevel);
    }
  }, [userConfig?.nowLevel, leverageLevel]);

  // 将设置价格的函数暴露给父组件
  useEffect(() => {
    if (priceSetterRef) {
      priceSetterRef.current = handleSetPriceFromExternal;
    }
  }, [priceSetterRef, handleSetPriceFromExternal]);

  // 处理百分比滑块变化
  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    // 根据当前交易类型计算最大数量
    const maxQuantity = transactionType === 1 ? calculateMaxQuantity("BUY") : calculateMaxQuantity("SELL");
    const newQuantity = (maxQuantity * value) / 100;
    setQuantity(newQuantity);
  };

  const handleSettings = () => {
    setShowTradingSettingsDrawer(true);
  };

  // 检查是否应该跳过下单确认
  const getShouldSkipConfirm = (): boolean => {
    try {
      // 优先检查新的设置格式
      const savedSettings = localStorage.getItem('tradingSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return !settings.preOrderConfirm; // preOrderConfirm为false时跳过确认
      }
      
      // 兼容旧的设置格式
      return localStorage.getItem("dontShowOrderConfirm") === "true";
    } catch (error) {
      console.error('读取下单确认设置失败:', error);
      // 出错时默认显示确认框
      return false;
    }
  };

  // 处理订单提交
  const handleSubmit = (side: "BUY" | "SELL") => {
    // 表单验证
    if (!validateForm()) {
      return;
    }

    setSide(side);
    
    // 检查用户的下单确认设置
    const shouldSkipConfirm = getShouldSkipConfirm();

    if (shouldSkipConfirm) {
      // 直接执行下单，不显示确认框
      const orderData = {
        direction: transactionType === 1 ? 0 : 1,
        type: currentCategory === 1 ? 1 : 0,
        price: price,
        amount: quantity || 0,
        account:
          (typeof quantity === "string"
            ? parseFloat(quantity)
            : quantity || 0) *
          (typeof price === "string" ? parseFloat(price) : price || 0),
        symbol: symbol,
        marginMode: marginModel,
        leverage: leverageLevel,
        orderType:
          currentCategory === 1
            ? "limit"
            : currentCategory === 2
              ? "market"
              : "conditional",
      };
      handleConfirmOrder(orderData, false);
      return;
    }

    const orderData = {
      direction: transactionType === 1 ? 0 : 1, // 0: 买入, 1: 卖出
      type: currentCategory === 1 ? 1 : 0, // 1: 限价, 0: 市价
      price: price || 0,
      amount: quantity || 0,
      account:
        (typeof quantity === "string" ? parseFloat(quantity) : quantity || 0) *
        (typeof price === "string" ? parseFloat(price) : price || 0),
      symbol: symbol,
      marginMode: marginModel,
      leverage: leverageLevel,
      btnText: side,
      orderType:
        currentCategory === 1
          ? "limit"
          : currentCategory === 2
            ? "market"
            : "conditional",
    };

    setConfirmData(orderData);
    setShowOrderConfirmModal(true);
  };

  // 表单验证函数
  const validateForm = (): boolean => {
    // 验证触发价格（条件单必填）
    if (currentCategory === 3) {
      if (!triggerPrice || triggerPrice.trim() === "") {
        message.error(t("tradingPanel.validation.enterTriggerPrice"));
        return false;
      }
      const triggerPriceNum = parseFloat(triggerPrice);
      if (isNaN(triggerPriceNum) || triggerPriceNum <= 0) {
        message.error(t("tradingPanel.validation.triggerPriceMustBePositive"));
        return false;
      }
    }

    // 验证委托价格（限价单和条件单必填）
    if (currentCategory === 1 || currentCategory === 3) {
      if (!price || price.toString().trim() === "") {
        message.error(t("tradingPanel.validation.enterOrderPrice"));
        return false;
      }
      const priceNum = parseFloat(price.toString());
      if (isNaN(priceNum) || priceNum <= 0) {
        message.error(t("tradingPanel.validation.orderPriceMustBePositive"));
        return false;
      }
    }

    // 验证委托数量
    if (!quantity || quantity.toString().trim() === "") {
      message.error(t("tradingPanel.validation.enterOrderQuantity"));
      return false;
    }
    const quantityNum = parseFloat(quantity.toString());
    if (isNaN(quantityNum) || quantityNum <= 0) {
      message.error(t("tradingPanel.validation.orderQuantityMustBePositive"));
      return false;
    }

    // 验证可用余额
    if (availableBalance <= 0) {
      message.error(t("tradingPanel.validation.insufficientBalance"));
      return false;
    }

    // 验证杠杆倍数
    if (leverageLevel <= 0 || leverageLevel > 125) {
      message.error(t("tradingPanel.validation.invalidLeverage"));
      return false;
    }

    // 验证数量是否超过可买/可卖数量
    const maxQuantity = transactionType === 1 ? calculateMaxQuantity("BUY") : calculateMaxQuantity("SELL");
    if (quantityNum > maxQuantity) {
      message.error(t("tradingPanel.validation.quantityExceedsMax", { action: transactionType === 1 ? t("buy") : t("sell") }));
      return false;
    }

    // 验证最大成交量限制
    const orderType = getOrderType();
    if (orderType === 'limit' && maxLimitVolume && quantityNum > maxLimitVolume) {
      message.error(t("tradingPanel.validation.exceedsMaxLimitVolume", { max: maxLimitVolume }));
      return false;
    }
    if (orderType === 'market' && maxMarketVolume && quantityNum > maxMarketVolume) {
      message.error(t("tradingPanel.validation.exceedsMaxMarketVolume", { max: maxMarketVolume }));
      return false;
    }

    // 验证最大成交金额限制
    if (currentCategory === 1 || currentCategory === 3) { // 限价单或条件单需要价格
      const priceNum = parseFloat(price?.toString() || '0');
      if (priceNum > 0) {
        const orderAmount = priceNum * quantityNum;
        if (orderType === 'limit' && maxLimitMoney && orderAmount > maxLimitMoney) {
          message.error(t("tradingPanel.validation.exceedsMaxLimitAmount", { max: maxLimitMoney }));
          return false;
        }
      }
    } else if (currentCategory === 2) { // 市价单
      // 市价单使用市场价格估算
      const lastPrice = priceData?.lastPrice || priceData?.close || 0;
      const marketPrice = typeof lastPrice === 'string' ? parseFloat(lastPrice) : lastPrice;
      if (marketPrice > 0) {
        const orderAmount = marketPrice * quantityNum;
        if (maxMarketMoney && orderAmount > maxMarketMoney) {
          message.error(t("tradingPanel.validation.exceedsMaxMarketAmount", { max: maxMarketMoney }));
          return false;
        }
      }
    }

    return true;
  };

  // 处理价格输入变化
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // 限制价格精度
    if (symbolPricePrecision !== undefined) {
      const decimalIndex = value.indexOf('.');
      if (decimalIndex !== -1 && value.length - decimalIndex - 1 > symbolPricePrecision) {
        value = value.substring(0, decimalIndex + symbolPricePrecision + 1);
      }
    }
    
    setPrice(value);

    // 实时验证
    if (currentCategory === 1 || currentCategory === 3) {
      const error = validateField('price', value);
      setValidationErrors(prev => ({
        ...prev,
        price: error
      }));
    }
  };

  // 处理数量输入变化
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // 只允许输入数字，不允许小数点
    value = value.replace(/[^\d]/g, '');
    
    // 如果为空或者为0开头的多位数，则处理为空或去掉前导0
    if (value === '' || (value.length > 1 && value.startsWith('0'))) {
      value = value.replace(/^0+/, '') || '';
    }
    
    setQuantity(value);

    // 实时验证
    if (value) {
      const error = validateField('quantity', value);
      setValidationErrors(prev => ({
        ...prev,
        quantity: error
      }));
    } else {
      // 清除数量字段的验证错误
      setValidationErrors(prev => ({
        ...prev,
        quantity: undefined
      }));
    }
  };

  // 处理触发价格输入变化
  const handleTriggerPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // 限制触发价格精度
    if (symbolPricePrecision !== undefined) {
      const decimalIndex = value.indexOf('.');
      if (decimalIndex !== -1 && value.length - decimalIndex - 1 > symbolPricePrecision) {
        value = value.substring(0, decimalIndex + symbolPricePrecision + 1);
      }
    }
    
    setTriggerPrice(value);

    // 实时验证
    if (currentCategory === 3) {
      const error = validateField('triggerPrice', value);
      setValidationErrors(prev => ({
        ...prev,
        triggerPrice: error
      }));
    }
  };

  // 清除验证错误
  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  // 处理确认下单
  const handleConfirmOrder = (orderData: any, dontRemind: boolean) => {
    const data = {
      positionType: 1, // 持仓类型(1 全仓，2 仓逐)
      side: side,
      leverageLevel: leverageLevel, // 杠杆倍数
      price: currentCategory === 1 ? price : 0, // 下单价格(市价单传0)
      volume: quantity, // 下单数量(开仓 市价单：开仓价值)
      triggerPrice: triggerPrice, // 触发价格
      open: transactionType === 1 ? "OPEN" : "CLOSE", // 开平仓方向(open 开仓，close 平仓)
      type: currentCategory === 1 ? 1 : currentCategory === 2 ? 2 : 3, // 订单类型 (1 limit， 2 market，3 IOC，4 FOK，5 POST_ONLY)
      isConditionOrder: currentCategory === 3, // 是否是条件单
      // expireTime: this.expireTime, // 到期时间
      isOto: enableTPSL, // 是否止盈止损单
      takerProfitTrigger: takeProfitPrice || null, // 止盈触发价
      takerProfitPrice: 0, // 止盈委托价格（0为市价）
      takerProfitType: 2, // 止盈类型
      stopLossTrigger: stopLossPrice || null, // 止损触发价格
      stopLossPrice: 0, // 止损委托价格（0为市价）
      stopLossType: 2, // 止损类型
      marginModel: marginModel,
    };

    // 如果用户选择不再提醒，可以在这里保存设置
    if (dontRemind) {
      // 保存到本地存储或全局状态
      localStorage.setItem("dontShowOrderConfirm", "true");
    }

    onOrderSubmit?.(data);
    setShowOrderConfirmModal(false);
  };

  // 处理保证金模式变更
  const handleMarginModeChange = (mode: 1 | 2) => {
    setMarginModel(mode);
  };

  // 处理杠杆变更
  const handleLeverageChange = (newLeverage: number) => {
    setLeverageLevel(newLeverage);
  };

  // 处理下单单位变更
  const handleOrderUnitChange = (unit: "BTC" | "USDT" | "张") => {
    setOrderUnit(unit);
  };

  const goTransfer = () => {
    setShowFundTransferModal(true);
  };

  // 处理资金划转确认
  const handleFundTransferConfirm = async (transferData: any) => {
    const dataEncrypt = await encryptData(transferData);
    const res = await transferAll(dataEncrypt);
    if (res.code === "0" && res.data) {
      message.success(t("tradingPanel.transferSuccess"));
      // 通知父组件更新余额
    } else {
      message.error(t("tradingPanel.transferFailed"));
    }
    onBalanceUpdate?.();
  };

  // 订单类型标签
  const orderTypeTabs = [
    { key: 1, label: t("tradingPanel.limitOrder") },
    { key: 2, label: t("tradingPanel.marketOrder") },
    // { key: 3, label: t("tradingPanel.conditionalOrder") } 2027-07-29 zyj暂时注释
  ];



  const handelSubmitOrder = () => {

  }

  if (popType === PopTypeEnum.PLACE_OREER) {
    return <ConfirmOrder 
      orderData={confirmData}
      onOk={() => handelSubmitOrder()} 
      onCancel={onCancel} 
    />
  }

  return (
    <div className="px-[16px] pt-[10px] pb-[20px]">
      <ConfigProvider
        theme={{
          components: {
             Segmented: {
              itemSelectedBg: "var(--theme-color)",
              itemHoverBg: "transparent",
              itemActiveBg: "transparent",
              itemColor: "var(--text-color6)",
              trackPadding: 3,
              borderRadius: 50,
              borderRadiusSM: 50,
              trackBg: "transparent"
            },
            Form: {
              itemMarginBottom: 16,
            },
            Slider: {
              controlSize: 18,
              dotActiveBorderColor: "var(--background17)",
              dotBorderColor: "var(--background17)",
              dotSize: 18,
              handleActiveColor: "none",
              handleActiveOutlineColor: "none",
              handleColor: "var(--background17)",
              handleLineWidthHover: 2,
              handleSize: 16,
              handleSizeHover: 16,
              railBg: "var(--background16)", // 滑块轨道背景色
              railHoverBg: "var(--background16)", // 滑块轨道悬浮背景色
              trackBg: "var(--theme-color)",
              trackBgDisabled: "var(--background16)",
              trackHoverBg: "var(--theme-color)"
            },
          },
        }}
      >
        <div className="flex gap-x-[10px] mb-[16px]">
          <button
            type="button"
            className="m-w-[78px] px-[10px] h-[28px] flex justify-center items-center bg-[var(--background14)] text-[12] rounded-[28px] font-medium"
            onClick={() => setShowMarginModeModal(true)}
          >
            {marginModel === 1 ? t("tradingPanel.crossMargin") : t("tradingPanel.isolatedMargin")}
          </button>
          <button
            type="button"
            className="m-w-[78px] px-[10px] h-[28px] flex justify-center items-center bg-[var(--background14)] text-[12] rounded-[28px] font-medium"
            onClick={() => setShowLeverageModal(true)}
          >
            {userConfig.nowLevel}x
          </button>
        </div>
        <Segmented
          shape="round"
          className="h-[50px] mb-[16px]  w-[100%] border border-[var(--theme-color)] bg-[transparent]"
          options={[
            {
              label: (
                <div className="h-[44px] flex items-center justify-center">
                  {" "}
                  {t("tradingPanel.openPosition")}
                </div>
              ),
              value: 1,
            },
            {
              label: (
                <div className="h-[44px] flex items-center justify-center">
                  {" "}
                  {t("tradingPanel.closePosition")}
                </div>
              ),
              value: 2,
            },
          ]}
          value={transactionType}
          block
          onChange={(value) => {
            setTransactionType(value as 1 | 2);
            clearValidationErrors(); // 清除验证错误
          }}
        />
        {/* 订单类型标签 */}
        <div className="flex gap-[10px] mb-[10px]">
          {
            orderTypeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setCurrentCategory(tab.key as any);
                  clearValidationErrors(); // 清除验证错误
                }}
                className={`text-[14px] font-[400] ${currentCategory === tab.key
                  ? "text-[var(--text-color5)] font-[500]"
                  : "text-[var(--text-color6)]"
                  }`}
              >
                {tab.label}
              </button>
            ))
          }
        </div>
         {/* 可用余额 */}
            <div className="flex items-center mb-[10px] text-[14px] text-[var(--text-color5)] gap-[4px]">
              <div className="flex items-center gap-[8px]">
                <span>{t("tradingPanel.available")}:</span>
                {/* {JSON.stringify(currentContractInfo)} */}
                <span>{availableBalance.toFixed(2)} {currentContractInfo.marginCoin}</span>
              </div>
              <Iconify
                icon="mdi:swap-horizontal"
                className="text-[16px] text-[var(--theme-color)] cursor-pointer"
                onClick={() => goTransfer()}
              />
            </div>

            <Form form={form} layout="vertical" className="m-[0]">
              {/* 触发价格 (条件单显示) */}
              {currentCategory === 3 && (
                <Form.Item>
                  <div className="flex flex-col gap-[8px]">
                    <div className="flex items-center">
                      <Input
                        value={triggerPrice}
                        onChange={handleTriggerPriceChange}
                        placeholder={t("tradingPanel.triggerPrice")}
                        className={`w-[100%] h-[32px] p-[0_12px] border-none text-[var(--text-color5)] font-[12px] rounded-[6px] bg-[#F5F5F5] ${validationErrors.triggerPrice ? styles.inputError : ''}`}
                        suffix="USDT"
                      />
                    </div>
                    {validationErrors.triggerPrice && (
                      <span className={styles.errorText}>{validationErrors.triggerPrice}</span>
                    )}
                  </div>
                </Form.Item>
              )}

              {/* 委托价格 (限价单和条件单显示) */}
              {(currentCategory === 1 || currentCategory === 3) && (
                <Form.Item style={{ marginBottom: "16px" }}>
                  <Input
                    value={price}
                    onChange={handlePriceChange}
                    placeholder={t("tradingPanel.orderPrice")}
                    className={`w-[100%] h-[50px] text-[var(--text-color5)] text-[14px] rounded-[6px] ${validationErrors.price ? styles.inputError : ''}`}
                    suffix="USDT"
                    style={{ width: currentCategory === 3 ? "80%" : "100%" }}
                  />
                  {currentCategory === 3 && <Button type="text">{t("tradingPanel.marketPrice")}</Button>}
                  {validationErrors.price && (
                    <span className={styles.errorText}>{validationErrors.price}</span>
                  )}
                </Form.Item>
              )}

              {/* 委托数量 */}
              <Form.Item style={{ marginBottom: "16px" }}>
                <Input
                  value={quantity}
                  onChange={handleQuantityChange}
                  placeholder={t("tradingPanel.orderQuantity")}
                  className={`w-[100%] h-[50px] text-[var(--text-color5)] text-[14px] rounded-[6px] ${validationErrors.quantity ? styles.inputError : ''}`}
                  suffix={t("tradingPanel.unit")}
                />
                {validationErrors.quantity && (
                  <span className={styles.errorText}>{validationErrors.quantity}</span>
                )}
              </Form.Item>

              {/* 百分比滑块 */}
              <Slider
                style={{
                  marginTop: " 16px",
                  marginBottom: "10px",
                }}
                value={percentage}
                onChange={handlePercentageChange}
                min={0}
                max={100}
                step={1}
                className="!my-[16px]"
                marks={{
                  0: " ",
                  25: " ",
                  50: " ",
                  75: " ",
                  100: " ",
                }}
                tooltip={{ formatter: (value) => `${value}%` }}
              />

              {/* 可买/可卖数量显示 */}
              <div className="mb-[16px]">
                <div className="flex items-center justify-between text-[14px] text-[var(--text-color6)] font-[400]">
                  <div className="flex items-center gap-[4px]">
                    <span style={{color:'#00C788'}}>{t("tradingPanel.canBuy")}</span>
                    <span>{formatNumber(calculateMaxQuantity("BUY"), symbolPricePrecision || 4)} {currentContractInfo.coUnit}</span>
                  </div>
                  <div className="flex items-center gap-[4px]">
                    <span  style={{color:'#FF4D4F'}}>{t("tradingPanel.canSell")}</span>
                    <span>{formatNumber(calculateMaxQuantity("SELL"), symbolPricePrecision || 4)} {currentContractInfo.coUnit}</span>
                  </div>
                </div>
              </div>

              {/* 止盈止损 */}
              {/* <div className={styles.tpslSection}>
          <div className={styles.tpslHeader}>
            <Checkbox
              checked={enableTPSL}
              onChange={(e) => setEnableTPSL(e.target.checked)}
              className={styles.tpslSwitch}
            />
            <span className={styles.tpslLabel}>止盈止损</span> 
          </div> 2027-07-29 zyj暂时注释 */}

              {/* 止盈止损输入框 */}
              {/* {enableTPSL && (
            <div className={styles.tpslInputs}>
              <div className={styles.tpslInputRow}>
                <Input
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(Number(e.target.value) || 0)}
                  placeholder="止盈触发价"
                  className={styles.tpslInput}
                  suffix="USDT"
                />
              </div>
              <div className={styles.tpslInputRow}>
                <Input
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value) || 0)}
                  placeholder="止损触发价"
                  className={styles.tpslInput}
                  suffix="USDT"
                />
              </div>
            </div>
          )}
        </div> 2027-07-29 zyj暂时注释*/}

              {/* 高级设置 */}
              {/* <div className="flex items-center mb-[22px] gap-[4px]">
                <span className="text-[14px] text-[var(--text-color6)] font-[400]">
                  {t("tradingPanel.advancedSettings")}
                </span>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      { key: "5", label: "P/O" },
                      { key: "3", label: "IOC" },
                      { key: "4", label: "FOK" },
                    ],
                  }}
                >
                  <Space size={4}>
                    GTC
                    <Iconify icon="mdi:chevron-down" />
                  </Space>
                </Dropdown>
              </div> 2027-08-28 zyj暂时注释*/}

              {/* 提交按钮 */}
              <div className="mb-[10px] flex justify-between gap-[12px]">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleSubmit("BUY")}
                  block
                  shape="round"
                  className=" text-[16px] font-[400] text-[#FFF] w-[144px]"
                  style={{
                    background: "#00C788",
                  }}
                  disabled={Object.keys(validationErrors).some(key => validationErrors[key as keyof typeof validationErrors])}
                  title={Object.keys(validationErrors).some(key => validationErrors[key as keyof typeof validationErrors]) ? t("tradingPanel.validation.solveErrorsFirst") : ""}
                >
                  {transactionType === 1 ? t("tradingPanel.buyLong") : t("tradingPanel.buyClose")}
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleSubmit("SELL")}
                  className=" text-[16px] font-[400] text-[#FFF] w-[144px]"
                  style={{
                    background: "#FF4D4F",
                  }}
                  block
                  shape="round"
                  disabled={Object.keys(validationErrors).some(key => validationErrors[key as keyof typeof validationErrors])}
                  title={Object.keys(validationErrors).some(key => validationErrors[key as keyof typeof validationErrors]) ? t("tradingPanel.validation.solveErrorsFirst") : ""}
                >
                  {transactionType === 2 ? t("tradingPanel.sellClose") : t("tradingPanel.sellShort")}
                </Button>
              </div>

              {/* 验证错误提示 */}
              {Object.keys(validationErrors).some(key => validationErrors[key as keyof typeof validationErrors]) && (
                <div className={styles.validationError}>
                  <div className={styles.validationErrorTitle}>
                    {t("tradingPanel.validation.solveFollowingProblems")}
                  </div>
                  <ul className={styles.validationErrorList}>
                    {Object.entries(validationErrors).map(([key, error]) =>
                      error ? <li key={key}>• {error}</li> : null
                    )}
                  </ul>
                </div>
              )}

              {/* 成本显示 */}
              <div className="flex items-center justify-between  font-[400] text-[14px] text-[var(--text-color6)]">
                <div className="flex gap-[4px]">
                  <span>{t("tradingPanel.cost")}</span>
                  <span>{formatNumber(calculateCost("BUY"), symbolPricePrecision || 4)} {currentContractInfo.marginCoin}</span>
                </div>
                <div className="flex gap-[4px]">
                  <span>{t("tradingPanel.cost")}</span>
                  <span>{formatNumber(calculateCost("SELL"), symbolPricePrecision || 4)} {currentContractInfo.marginCoin}</span>
                </div>
              </div>
            </Form>
      </ConfigProvider>
       {/* 保证金模式弹框 */}
        <MarginModeModal
          visible={showMarginModeModal}
          onClose={() => setShowMarginModeModal(false)}
          currentMode={marginModel}
          onModeChange={handleMarginModeChange}
          symbol={symbol}
        />

        {/* 杠杆设置弹框 */}
        <LeverageModal
          visible={showLeverageModal}
          onClose={() => setShowLeverageModal(false)}
          currentLeverage={leverageLevel}
          onLeverageChange={handleLeverageChange}
          symbol={symbol}
          positionLimit={815.4018}
        />
        {/* 资金划转弹框 */}
        <FundTransferModal
          visible={showFundTransferModal}
          spotBalance={spotBalance}
          contractBalance={contractBalance}
          onClose={() => setShowFundTransferModal(false)}
          onConfirm={handleFundTransferConfirm}
        />
    </div>
  );
});

export default SpotTradePage;
