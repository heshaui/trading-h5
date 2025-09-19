import React from "react";
import styles from "./styles/tradeContent.module.scss";
import {
  Segmented,
  ConfigProvider,
  Form,
  Input,
  Slider,
  InputNumber,
  Checkbox,
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
import { useNavigate } from "react-router-dom";
import { usePosition } from "../../ContractOrder/hooks/usePosition";
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';
import { useContract } from '@/context/exchange-providers/ContractProvider';
import { useUserConfig } from "@/hooks/useUserConfig";
import { getUserBalanceAll, transferAll } from "@/services/assets";
import { getLabel } from "@/utils";

import {
  createCoId,
  createOrder,
} from "@/services/contract";


import ConfirmOrder from "./ConfirmOrder";
import MarginModeModal from "../components/MarginModePopup";
import LeverageModal from "../components/LeveragePopup";
import FundTransferModal from "../components/FundTransferPopup";
import RiskDisclosureModal from '../../RiskDisclosureModal';
import TipModal from '../../ContractOrder/components/Popup/TipModal';
import SelectPop from "@/components/SelectPop";
import ContractInfo from "../../ContractInfo";


export interface AccountBalance {
  canUseAmount: string; // 可用余额
  isolateMargin: string; // 逐仓保证金
  lockAmount: string; // 锁定金额
  realizedAmount: string; // 已实现盈亏
  symbol: string; // 币种
  totalAmount: string; // 总余额
  totalMargin: string; // 总保证金
  totalMarginRate: string; // 总保证金率
  unRealizedAmount: string; // 未实现盈亏
}

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
  symbol, onOrderSubmit,
}: Props) => {
  const { t } = useLanguage('contract');
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { isLight } = useTheme();
  const { popType, setPopType } = usePopTypeContext();
  const { tradePrice, depthData: orderBookData, setAddOrderNotice } = useContract();
  const priceData = appStore.getActiveNewPrice();
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
  const [showFundTransferModal, setShowFundTransferModal] = useState(false);
  const [orderUnit, setOrderUnit] = useState<"BTC" | "USDT" | "张">("张");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false);
  const [advSetting, setAdvSetting] = useState('1');
  const [tipData, setTipData] = useState({
    title: '',
    content: ''
  });
  const [tipVisible, setTipVisible] = useState(false);
  // 新增触发价状态
  // 下单确认设置状态
  const [settingsUpdateTrigger, setSettingsUpdateTrigger] = useState(0);
  const [triggerPrice, setTriggerPrice] = useState<string>("");
  const [submitData, setSubmitData] = useState({}); //下单提交数据
  //二次确认数据
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
    btnText: '' // 按钮文本内容
  }); 
  
  // 余额
  const [contractAssets, setContractAssets] = useState<AccountBalance[]>([]); // 合约账户数据
  const [spotBalance, setSpotBalance] = useState<any[]>([]); // 现货账户余额数组

  // 新增验证错误状态
  const [validationErrors, setValidationErrors] = useState<{
    price?: string;
    quantity?: string;
    triggerPrice?: string;
  }>({});

  // 在所有Hooks声明之后获取store数据
  const currentContractInfo = appStore.getCurrentContractInfo();
  /**
   * maxLimitMoney:限价最大成交金额
   * maxLimitVolume:限价最大成交量
   * maxMarketMoney: 市价最大成交金额
   * maxMarketVolume: 市价最大成交量
   */
  const {symbolPricePrecision,priceRange,maxLimitMoney,maxLimitVolume,maxMarketMoney,maxMarketVolume,minOrderVolume,minOrderMoney} =currentContractInfo.coinResultVo
  const { userConfig } = useUserConfig();
  // 获取持仓数据
  const { positions, getPosition } = usePosition({
    contractId: currentContractInfo?.id
  });

  // 根据设置初始化单位
  // useEffect(() => {
	// 	setOrderUnit(appStore.tradingSetting.contractUnit as "BTC" | "USDT" | "张");
  // }, [currentContractInfo, [currentContractInfo, appStore.tradingSetting.contractUnit]])

  // 获取合约账户余额
	const getContractBalance = async () => {
		try {
			const accountList = await appStore.loadContractAssets();
			setContractAssets(accountList);
		} catch (error) { }
	}

	// 获取现货账户余额
	const getSpotBalance = async () => {
		try {
		const res = await getUserBalanceAll();
		console.log("getUserBalanceAll response:", res);
		console.log("getUserBalanceAll res.data:", res.data);
		console.log("getUserBalanceAll res.data type:", typeof res.data);

		if (res.code === "0" && Array.isArray(res.data)) {
			setSpotBalance(res.data);
		} else {
			console.error("获取现货余额失败:", res);
			setSpotBalance([]);
		}
		} catch (error) {
			console.error("获取现货余额异常:", error);
			setSpotBalance([]);
		}
	};

   // 获取特定币种的资产信息
  const getAssetBySymbol = (symbol: string): AccountBalance | undefined => {
    if (!contractAssets) return;
    return contractAssets.find((asset) => asset.symbol === symbol);
  };

  // 获取USDT资产可用余额，用于交易面板
  const getAvailableUSDTBalance = (): number => {
    // 如果保证金币种还没有加载，返回0
    if (!currentContractInfo.marginCoin) {
      return 0;
    }
    const usdtAsset = getAssetBySymbol(currentContractInfo.marginCoin);
    return parseFloat(usdtAsset?.canUseAmount || "0");
  };

  // 使用useMemo来计算可用余额，确保在相关状态变化时重新计算
  const availableBalance = React.useMemo(() => {
    return getAvailableUSDTBalance();
  }, [currentContractInfo.marginCoin, contractAssets]);

  // 高级设置选项
  const settingOptions = [
    { value: '1', label: "GTC"},
    { value: "5", label: "P/O" },
    { value: "3", label: "IOC" },
    { value: "4", label: "FOK" },
  ]

  // 数量单位选项
  const unitOptions = [
    {label: '张', value: '张'},
    {label: currentContractInfo.base ?? 'BTC', value: 'BTC'},
    {label: 'USDT', value: 'USDT'}
  ]
  
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

    const fixed = new BigNumber(num).toFormat(precision, BigNumber.ROUND_DOWN);
    // 移除末尾的0和小数点
    const formatted = fixed.replace(/\.?0+$/, "");
    return formatted;
  }, []);

  // 根据表格实现可买/可卖数量计算
  const calculateMaxQuantity = useCallback((side?: "BUY" | "SELL") => {
    // 基础检查：必须有余额、杠杆、价格数据
    if (availableBalance <= 0 || leverageLevel <= 0 || !priceData?.price) return 0;
    
    // 如果是限价单或条件单，且价格为空，则返回0
    if ((currentCategory === 1 || currentCategory === 3) && (!price || price.toString().trim() === "")) {
      return 0;
    }

    // 获取合约信息
    const contractInfo = currentContractInfo;
    if (!contractInfo) return 0;
    
    const faceValue = contractInfo.multiplier || 1; // 面值(multiplier)
    const marginRate = contractInfo.marginRate || 1; // 保证金汇率
    const contractSide = contractInfo.contractSide; // 1: 正向合约, 0: 反向合约
    const coUnitType = contractInfo.coUnitType || 2; // 1: 量(标的货币), 2: 张

    let calculationPrice = 0;

    // 获取当前最新价格
    const lastPrice = parseFloat(priceData.price);
    if (!lastPrice || lastPrice <= 0) return 0;

    // 从深度数据中获取真实的买一价和卖一价
    const bidPrice = orderBookData?.tick?.buys?.[0]?.[0] ? 
      parseFloat(orderBookData.tick.buys[0][0] as any) : lastPrice;
    const askPrice = orderBookData?.tick?.asks?.[0]?.[0] ? 
      parseFloat(orderBookData.tick.asks[0][0] as any) : lastPrice;

    if (side === "BUY") {
      calculationPrice = askPrice; // 买入使用卖一价(ask price)
    } else if (side === "SELL") {
      calculationPrice = bidPrice; // 卖出使用买一价(bid price)
    } else {
      calculationPrice = lastPrice;
    }

    if (calculationPrice <= 0) return 0;

    let maxQuantity = 0;

    // 根据表格实现计算逻辑
    if (contractSide === 1) {
      // 正向合约
      if (coUnitType === 2) {
        // 数量单位: 张 - 公式: (余额×杠杆÷汇率)÷(价格×面值)
        maxQuantity = (availableBalance * leverageLevel / marginRate) / (calculationPrice * faceValue);
      } else {
        // 数量单位: 量 - 公式: (余额×杠杆÷汇率)÷价格
        maxQuantity = (availableBalance * leverageLevel / marginRate) / calculationPrice;
      }
    } else {
      // 反向合约 (contractSide === 0)
      if (coUnitType === 2) {
        // 数量单位: 张 - 公式: (余额×杠杆×价格)÷面值
        maxQuantity = (availableBalance * leverageLevel * calculationPrice) / faceValue;
      } else {
        // 数量单位: 量 - 公式: 余额×杠杆×价格
        maxQuantity = availableBalance * leverageLevel * calculationPrice;
      }
    }

    return Math.max(0, maxQuantity);
  }, [priceData, orderBookData, availableBalance, leverageLevel, currentContractInfo, price, currentCategory]);

  // 计算可平数量 - 平仓时使用
  const calculateCloseableQuantity = useCallback((side: "BUY" | "SELL") => {
    if (!positions || positions.length === 0) return 0;

    // 找到对应方向的持仓
    const position = positions.find((pos:any) =>
      pos.contractId === currentContractInfo?.id &&
      pos.orderSide === side
    );

    return position?.canCloseVolume || 0;
  }, [positions, currentContractInfo?.id]);

  // 根据表格实现成本计算 - 区分限价单和市价单
  const calculateCost = useCallback((side?: "BUY" | "SELL") => {
    const quantityNum = typeof quantity === "string" ? parseFloat(quantity) : quantity;
    
    // 必须有输入数量才计算成本
    if (!quantityNum || quantityNum <= 0) return 0;
    
    // 必须有有效的价格数据和杠杆
    if (!priceData?.price || !leverageLevel || leverageLevel <= 0) return 0;

    // 获取合约信息
    const contractInfo = currentContractInfo;
    if (!contractInfo) return 0;
    
    const faceValue = contractInfo.multiplier || 1; // 面值(multiplier)
    const marginRate = contractInfo.marginRate || 1; // 保证金汇率
    const contractSide = contractInfo.contractSide; // 1: 正向合约, 0: 反向合约
    const isMarketOrder = currentCategory === 2; // 是否为市价单

    let calculationPrice = 0;

    // 获取当前最新价格
    const lastPrice = parseFloat(priceData.price);
    if (!lastPrice || lastPrice <= 0) return 0;

    // 限价单使用用户输入的价格，市价单使用市场价格
    if (!isMarketOrder) {
      // 限价单：使用用户输入的委托价格
      const userInputPrice = typeof price === "string" ? parseFloat(price) : price;
      if (userInputPrice && userInputPrice > 0) {
        calculationPrice = userInputPrice;
      } else {
        // 如果没有用户输入价格，回退到最新价
        calculationPrice = lastPrice;
      }
    } else {
      // 市价单：使用最新价估算
      calculationPrice = lastPrice;
    }

    if (calculationPrice <= 0) return 0;

    let cost = 0;

    // 统一的成本计算公式，市价单和限价单使用相同逻辑，只是价格来源不同
    const coUnitType = contractInfo.coUnitType || 2; // 1: 量(标的货币), 2: 张

    if (contractSide === 1) {
      // 正向合约
      if (coUnitType === 2) {
        // 数量单位: 张 - 公式: (量×面值×价格÷杠杆)×汇率
        cost = (quantityNum * faceValue * calculationPrice / leverageLevel) * marginRate;
      } else {
        // 数量单位: 量 - 公式: (量×价格÷杠杆)×汇率
        cost = (quantityNum * calculationPrice / leverageLevel) * marginRate;
      }
    } else {
      // 反向合约 (contractSide === 0)
      if (coUnitType === 2) {
        // 数量单位: 张 - 公式: (量×面值÷价格÷杠杆)×汇率
        cost = (quantityNum * faceValue / calculationPrice / leverageLevel) * marginRate;
      } else {
        // 数量单位: 量 - 公式: (量÷价格÷杠杆)×汇率
        cost = (quantityNum / calculationPrice / leverageLevel) * marginRate;
      }
    }

    return Math.max(0, cost);
  }, [quantity, leverageLevel, currentContractInfo, priceData, orderBookData, currentCategory]);

   // 根据activeNewPrice和priceRange计算允许的价格范围
  const getPriceRangeInfo = () => {
    const activeNewPrice = appStore.getActiveNewPrice();
    const currentPrice = activeNewPrice?.price;
    

    
    if (!currentPrice || !priceRange) {

      return { minPrice: 0, maxPrice: 0, currentPrice: 0, isValid: false };
    }

    const rangePercent = priceRange / 100; // 转换为小数
    const minPrice = currentPrice * (1 - rangePercent);
    const maxPrice = currentPrice * (1 + rangePercent);
    
    const result = { 
      minPrice: Number(minPrice.toFixed(8)), 
      maxPrice: Number(maxPrice.toFixed(8)), 
      currentPrice: Number(currentPrice), 
      isValid: true 
    };
    

    return result;
  };

  const priceRangeInfo = getPriceRangeInfo();

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

    // 价格范围验证（仅限价格字段）
    if (field === 'price') {
      const currentPriceRangeInfo = getPriceRangeInfo();
      if (currentPriceRangeInfo.isValid) {
        const { minPrice, maxPrice } = currentPriceRangeInfo;
        
        if (numValue < minPrice || numValue > maxPrice) {
          return t('tradingPanel.validation.priceOutOfRange', { 
            minPrice, 
            maxPrice 
          }) || `价格范围：${minPrice} - ${maxPrice}`;
        }
      }
    }

    // 特定字段的额外验证
    if (field === 'quantity') {
      // 验证是否为正整数
      if (!Number.isInteger(numValue)) {
        return t("tradingPanel.validation.mustBeInteger");
      }
      
      // 验证最小成交量限制
      if (minOrderVolume && numValue < minOrderVolume) {
        return t("tradingPanel.validation.belowMinVolume", { min: minOrderVolume }) || `最小委托数量: ${minOrderVolume}`;
      }
      
      // 验证最大成交量限制
      const orderType = getOrderType();
      if (orderType === 'limit' && maxLimitVolume && numValue > maxLimitVolume) {
        return t("tradingPanel.validation.exceedsMaxLimitVolume", { max: maxLimitVolume });
      }
      if (orderType === 'market' && maxMarketVolume && numValue > maxMarketVolume) {
        return t("tradingPanel.validation.exceedsMaxMarketVolume", { max: maxMarketVolume });
      }
    }

    // 价格和数量组合验证 - 验证最小和最大成交金额
    if ((field === 'price' || field === 'quantity') && price && quantity) {
      const priceNum = typeof price === 'string' ? parseFloat(price) : price;
      const quantityNum = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
      
      if (priceNum > 0 && quantityNum > 0) {
        const orderAmount = priceNum * quantityNum;
        const orderType = getOrderType();
        
        // 验证最小成交金额
        if (minOrderMoney && orderAmount < minOrderMoney) {
          return t("tradingPanel.validation.belowMinAmount", { min: minOrderMoney }) || `最小委托金额: ${minOrderMoney}`;
        }
        
        // 验证最大成交金额
        if (orderType === 'limit' && maxLimitMoney && orderAmount > maxLimitMoney) {
          return t("tradingPanel.validation.exceedsMaxLimitAmount", { max: maxLimitMoney });
        }
        if (orderType === 'market' && maxMarketMoney && orderAmount > maxMarketMoney) {
          return t("tradingPanel.validation.exceedsMaxMarketAmount", { max: maxMarketMoney });
        }
      }
    }

    return undefined;
  }, [calculateMaxQuantity, transactionType, symbolPricePrecision, getOrderType, maxLimitVolume, maxMarketVolume, maxLimitMoney, maxMarketMoney, minOrderVolume, minOrderMoney, price, quantity, t, getPriceRangeInfo]);

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

  // 将最新成交点击的价格传进来
  useEffect(() => {
    tradePrice && handleSetPriceFromExternal(tradePrice);
  }, [tradePrice, handleSetPriceFromExternal]);

  // 监听 userConfig.nowLevel 变化，同步更新本地 leverageLevel 状态
  useEffect(() => {
    if (userConfig?.nowLevel && userConfig.nowLevel !== leverageLevel) {
      setLeverageLevel(userConfig.nowLevel);
    }
  }, [userConfig?.nowLevel]);

  // 处理百分比滑块变化
  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    // 根据当前交易类型和开仓/平仓状态计算最大数量
    let maxQuantity = 0;
    if (transactionType === 1) {
      // 开仓模式
      maxQuantity = calculateMaxQuantity("BUY");
    } else {
      // 平仓模式 - 根据当前选择的买入/卖出方向选择对应的可平数量
      // 注意：平空使用SELL持仓，平多使用BUY持仓
      maxQuantity = calculateCloseableQuantity("SELL"); // 这里需要根据具体的买卖方向调整
    }
    const newQuantity = (maxQuantity * value) / 100;
    setQuantity(newQuantity);
  };

  // 获取持仓数据 - 合约变化时刷新
  useEffect(() => {
    if (currentContractInfo?.id && getPosition) {
      getPosition({ showLoading: false, showMessage: false });
    }
  }, [currentContractInfo?.id, getPosition]);

  // 检查是否应该跳过下单确认
  const getShouldSkipConfirm = useCallback((): boolean => {
    return localStorage.getItem("dontShowOrderConfirm") === "true";
  }, []);

  // 处理订单提交
  const orderSubmit = async (orderData: any) => {
    const params = {
      contractId: appStore.getCurrentContractInfo().id,
      ...orderData,
    };
    const res = await createOrder(params);
    if (res.code === "0") {
        Toast.show({
            icon: 'success',
            content: t("contract:orderSubmitSuccess"),
        });
        setAddOrderNotice((prev:any) => prev++);
    } else {
        Toast.show({
            icon: 'fail',
            content: res.msg,
        });
    }
  }

  // 按钮文本
  const getBtnText = (side: "BUY" | "SELL") => {
    switch (side) {
      case 'BUY': return transactionType === 1 ? t("tradingPanel.buyLong") : t("tradingPanel.buyClose");
      case 'SELL': return transactionType === 2 ? t("tradingPanel.sellClose") : t("tradingPanel.sellShort");
    }
  }

  const handleSubmit = (side: "BUY" | "SELL") => {
    // 检查用户是否登录
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }


    // 检查用户是否已开通合约交易
    if (userConfig.openContract !== 1) {
      // 用户未开通合约，触发风险确认书
      setShowRiskDisclosure(true)
    }


    // 表单验证
    if (!validateForm()) {
      return;
    }


    setSide(side);
    
    // 检查用户的下单确认设置
    const shouldSkipConfirm = getShouldSkipConfirm();
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
        btnText: getBtnText(side)
      };

    if (shouldSkipConfirm) {
      // 直接提交订单，不需要调用handleConfirmOrder（避免重置设置）
      orderSubmit(orderData);
      return;
    }

    setConfirmData(orderData as any);
    //setShowOrderConfirmModal(true);
    setPopType(PopTypeEnum.PLACE_OREER);
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

    // 验证最小委托数量
    if (minOrderVolume && quantityNum < minOrderVolume) {
      message.error(t("tradingPanel.validation.belowMinVolume", { min: minOrderVolume }) || `最小委托数量: ${minOrderVolume}`);
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

    // // 验证数量是否超过余额限制
    // const maxQuantity = transactionType === 1 ? calculateMaxQuantity("BUY") : calculateMaxQuantity("SELL");
    // if (quantityNum > maxQuantity) {
    //   message.error(t("tradingPanel.validation.insufficientMargin") || "保证金余额不足");
    //   return false;
    // }

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

    // 验证最小和最大成交金额限制
    if (currentCategory === 1 || currentCategory === 3) { // 限价单或条件单需要价格
      const priceNum = parseFloat(price?.toString() || '0');
      if (priceNum > 0) {
        const orderAmount = priceNum * quantityNum;
        
        // 验证最小成交金额
        if (minOrderMoney && orderAmount < minOrderMoney) {
          message.error(t("tradingPanel.validation.belowMinAmount", { min: minOrderMoney }) || `最小委托金额: ${minOrderMoney}`);
          return false;
        }
        
        // 验证最大成交金额
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
        
        // 验证最小成交金额
        if (minOrderMoney && orderAmount < minOrderMoney) {
          message.error(t("tradingPanel.validation.belowMinAmount", { min: minOrderMoney }) || `最小委托金额: ${minOrderMoney}`);
          return false;
        }
        
        // 验证最大成交金额
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
  const handleConfirmOrder = () => {
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

    orderSubmit(data);
    // setShowOrderConfirmModal(false);
    onCancel()
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
    appStore.updateSetting('contractUnit', unit)
    setOrderUnit(unit);
  };

  const goTransfer = () => {
    setShowFundTransferModal(true);
  };

  const onBalanceUpdate = () => {
    getContractBalance();
    getSpotBalance();
  };
  
  // 处理资金划转确认
  const handleFundTransferConfirm = async (transferData: any) => {
    const dataEncrypt = await encryptData(transferData);
    const res = await transferAll(dataEncrypt);
    console.log("res:", res);
    if (res.code === "0" && res.data) {
      Toast.show({icon: 'success', content: t('contract:tradingPanel.transferSuccess')});
      // 通知父组件更新余额
    } else {
      Toast.show({icon: 'fail', content: t('contract:tradingPanel.transferFailed')});
    }
    onBalanceUpdate();
  };

  // 订单类型标签
  const orderTypeTabs = [
    { key: 1, label: t("tradingPanel.limitOrder") },
    { key: 2, label: t("tradingPanel.marketOrder") },
    { key: 3, label: t("tradingPanel.conditionalOrder") }
  ];

  // 处理风险确认书取消
  const handleRiskDisclosureCancel = () => {
    setShowRiskDisclosure(false);
  };

  // 处理风险确认书确认
  const handleRiskDisclosureConfirm = async () => {
    setShowRiskDisclosure(false);
    // 这里可以处理用户确认风险的逻辑，比如开通合约交易
    try {
      const res = await createCoId({
        contractId: currentContractInfo.id,
        openContract: 1,
      });
      if (res.code === "0") {
        Toast.show({
            icon: 'success',
            content: t("contract:contractOpenSuccess"),
        });
      }
    } catch (error) {
      console.error("开通合约交易失败:", error);
    }
  };

  if (popType === PopTypeEnum.PLACE_OREER) {
    return <ConfirmOrder 
      orderData={confirmData}
      onOk={handleConfirmOrder} 
      onCancel={onCancel} 
    />
  }

  return (
    <div className="px-[16px] pt-[10px] pb-[20px] flex-1 min-h-0 hideScrollBar">
      <ConfigProvider
        theme={{
          components: {
             Segmented: {
              itemSelectedBg: "var(--theme-color)",
              itemHoverBg: "transparent",
              itemActiveBg: "transparent",
              itemColor: "var(--text-color6)",
              itemSelectedColor: "var(--text-color5)",
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
            className="min-w-[78px] px-[10px] h-[28px] flex justify-center items-center bg-[var(--background14)] text-[12] rounded-[28px] font-medium"
            onClick={() => {
              if(!isLoggedIn) navigate('/login')
              setShowMarginModeModal(true)
            }}
          >
            {marginModel === 1 ? t("tradingPanel.crossMargin") : t("tradingPanel.isolatedMargin")}
          </button>
          <button
            type="button"
            className="min-w-[78px] px-[10px] h-[28px] flex justify-center items-center bg-[var(--background14)] text-[12] rounded-[28px] font-medium"
            onClick={() => {
              if(!isLoggedIn) navigate('/login')
              setShowLeverageModal(true)
            }}
          >
            {leverageLevel}x
          </button>
        </div>
        <Segmented
          shape="round"
          className="h-[50px] mb-[16px]  w-[100%] border border-[var(--theme-color)] bg-[transparent]"
          options={[
            {
              label: (
                <div className="h-[44px] flex items-center font-medium justify-center">
                  {t("tradingPanel.openPosition")}
                </div>
              ),
              value: 1,
            },
            {
              label: (
                <div className="h-[44px] flex items-center font-medium justify-center">
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
                <span className="border-b border-dashed border-[var(--text-color5)]"
                  onClick={() => {
                    setTipData({
                      title: t("tradingPanel.available"),
                      content: t("tradingPanel.tips.available")
                    })
                    setTipVisible(true)
                  }}
                >{t("tradingPanel.available")}:</span>
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
                        className={`trade-input ${validationErrors.triggerPrice ? styles.inputError : ''}`}
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
                  <div className="flex gap-x-[5px]">
                    <Input
                      value={price}
                      onChange={handlePriceChange}
                      placeholder={t("tradingPanel.orderPrice")}
                      className={`trade-input flex-1 w-full ${validationErrors.price ? styles.inputError : ''}`}
                      suffix="USDT"
                    />
                    {currentCategory === 3 && <span 
                      className="w-[90px] h-[50px] border input-border rounded-[8px] text-[14px] text-[var(--text-color5)] pr-[15px] flex items-center justify-end"
                    >
                        {t("tradingPanel.marketPrice")}
                    </span>}
                  </div>
                  {validationErrors.price && (
                    <span className={styles.errorText}>{validationErrors.price}</span>
                  )}
                </Form.Item>
              )}

              {/* 委托数量 */}
              <Form.Item className="mb-[16px]">
                <Input
                  value={quantity}
                  onChange={handleQuantityChange}
                  placeholder={t("tradingPanel.orderQuantity")}
                  className={`trade-input ${validationErrors.quantity ? styles.inputError : ''}`}
                  suffix={orderUnit
                    // <SelectPop 
                    //   value={orderUnit}
                    //   options={unitOptions}
                    //   title={t('placeholder')} 
                    //   onChange={(value: any) => handleOrderUnitChange(value)}
                    //   activeType="icon"
                    //   showSearch={false}
                    //   renderBtn={(open) => (
                    //       <button 
                    //           type="button" 
                    //           className="flex items-center text-[14px] text-[var(--text-color5)]"
                    //           onClick={(e) => {
                    //             e.preventDefault(); // 阻止默认行为
                    //             e.stopPropagation();  // 阻止冒泡到 Input
                    //             open()
                    //           }}
                    //       >
                    //           <span>{getLabel(orderUnit, unitOptions)}</span>
                    //           <Iconify icon="mdi:chevron-down" className="text-[24px]" />
                    //       </button>
                    //   )}
                    // />
                  }
                />
                {validationErrors.quantity && (
                  <span className={styles.errorText}>{validationErrors.quantity}</span>
                )}
              </Form.Item>

              {/* 百分比滑块 */}
              <Slider
                value={percentage}
                onChange={handlePercentageChange}
                min={0}
                max={100}
                step={1}
                marks={{
                  0: " ",
                  25: " ",
                  50: " ",
                  75: " ",
                  100: " ",
                }}
                tooltip={{
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

              {/* 可买/可卖数量显示 */}
              <div className="mb-[5px]">
                <div className="flex items-center justify-between text-[14px] text-[var(--text-color5)] font-[400]">
                  <div className="flex leading-[20px] items-center gap-[4px]">
                    <span style={{color:'#00C788'}}>{t("tradingPanel.canBuy")}</span>
                    <span>{formatNumber(calculateMaxQuantity("BUY"), symbolPricePrecision || 4)} {currentContractInfo.coUnit}</span>
                  </div>
                  <div className="flex leading-[20px] items-center gap-[4px]">
                    <span  style={{color:'#FF4D4F'}}>{t("tradingPanel.canSell")}</span>
                    <span>{formatNumber(calculateMaxQuantity("SELL"), symbolPricePrecision || 4)} {currentContractInfo.coUnit}</span>
                  </div>
                </div>
              </div>

              {/* 止盈止损 */}
              {currentCategory !== 3 && <div className={`flex items-center h-[20px] gap-x-[8px] ${currentCategory === 2 ? 'mb-[22px]' : 'mb-[10px]'}`}>
                <Checkbox
                  checked={enableTPSL}
                  onChange={(e) => setEnableTPSL(e.target.checked)}
                  className="custom-checkbox"
                />
                <span className="text-[var(--text-color5)] text-[14px]">{t('tpsl')}</span> 
              </div>} 

              {/* 止盈止损输入框 */}
              {enableTPSL && (
              <div className={`flex-col gap-y-[10px] ${currentCategory === 2 ? 'mb-[22px]' : 'mb-[10px]'}`}>
                <Input
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(Number(e.target.value) || 0)}
                    placeholder={t('tradingPanel.profitPrice')}
                    className="trade-input"
                    suffix="USDT"
                />
                <Input
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value) || 0)}
                  placeholder={t('tradingPanel.lossPrice')}
                  className="trade-input"
                  suffix="USDT"
                />
              </div>
            )}

            {/* 高级设置 */}
            {currentCategory !==2 && <div className="flex items-center mb-[22px] gap-[4px] h-[20px]">
              <span className="text-[14px] tip-color">
                {t("tradingPanel.advancedSettings")}
              </span>
              <SelectPop 
                  value={advSetting}
                  options={settingOptions}
                  title={t('placeholder')} 
                  onChange={(value:any) => setAdvSetting(value)}
                  activeType="icon"
                  showSearch={false}
                  renderBtn={(open) => (
                      <button 
                          type="button" 
                          className="flex items-center text-[14px] text-[var(--text-color5)]"
                          onClick={open}
                      >
                          <span>{getLabel(advSetting, settingOptions)}</span>
                          <Iconify icon="mdi:chevron-down" className="text-[24px]" />
                      </button>
                  )}
              />
            </div>}

            {/* 提交按钮 */}
            {isLoggedIn ? <div className="mb-[10px] flex justify-between gap-[12px]">
              <Button
                type="primary"
                size="large"
                onClick={() => handleSubmit("BUY")}
                block
                shape="round"
                className="h-[50px] text-[16px] font-[500] text-[#FFF] w-[144px]"
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
                className="h-[50px] text-[16px] font-[500] text-[#FFF] w-[144px]"
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
            </div>:
            <button
              className="w-full h-[50px] rounded-[32px] bg-[var(--theme-color)] flex items-center justify-center text-[16px] font-medium text-[#fff]"
              type="button"
              onClick={() => {
                navigate('/login')
              }}
            >
              {t("spot:spot.modal.login")}
            </button>
            }

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
            {isLoggedIn && <div className="flex items-center justify-between  font-[400] text-[14px] text-[var(--text-color6)]">
              <div className="flex gap-[4px]">
                <span>{t("tradingPanel.cost")}</span>
                <span className="text-[var(--text-color5)]">{formatNumber(calculateCost("BUY"), symbolPricePrecision || 4)} {t("contract:tradingSettings.units.sheet")}</span>
              </div>
              <div className="flex gap-[4px]">
                <span>{t("tradingPanel.cost")}</span>
                <span className="text-[var(--text-color5)]">{formatNumber(calculateCost("SELL"), symbolPricePrecision || 4)} {t("contract:tradingSettings.units.sheet")}</span>
              </div>
            </div>}
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
          contractBalance={contractAssets}
          onClose={() => setShowFundTransferModal(false)}
          onConfirm={handleFundTransferConfirm}
        />
        {/* 风险确认书模态框 */}
        <RiskDisclosureModal
            open={showRiskDisclosure}
            onCancel={handleRiskDisclosureCancel}
            onConfirm={handleRiskDisclosureConfirm}
        />
        {/* 提示 */}
        <TipModal
          open={tipVisible}
          title={tipData.title}
          content={tipData.content}
          onCancel={() => setTipVisible(false)}
        />
    </div>
  );
});

export default SpotTradePage;
