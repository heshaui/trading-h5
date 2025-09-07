import React, { useState, useEffect, useRef } from 'react';
import { Form, InputNumber, Slider, ConfigProvider } from 'antd';
import { Popup } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { observer } from 'mobx-react-lite';
import { getLabel } from '@/utils'
import appStore from '@/store';
import styles from './calculator.module.scss';
import SelectPop from '@/components/SelectPop';

import CustomTab from '@/components/CustomCom/CustomTab';

interface CalculatorModeProps {
  open: boolean;
  onCancel: () => void;
  dataInfo?: any;
}
interface FormDataItem {
  title: string;
  units: string;
  fix: number;
  errorText: string | null;
  value: string | null;
  isShow: boolean;
}

interface FormData {
  formData_1: FormDataItem;
  formData_2: FormDataItem;
  formData_3: FormDataItem;
}

const CalculatorMode = observer(({ open, onCancel, dataInfo }: CalculatorModeProps) => {
  const [form] = Form.useForm();
  const { t } = useLanguage(['contract']);

  // MobX store access
  const futureStore = appStore.getCurrentContractInfo();

  // 使用传入的 dataInfo 或者从 store 获取数据
  const contractInfo = dataInfo || futureStore;
  const contractId = contractInfo?.id || '';
  const coUnitType = contractInfo?.coUnitType || 1;
  const coUnit = contractInfo?.coUnit || 'BTC';
  const volfix = contractInfo?.volfix || 4;
  const priceUnit = contractInfo?.priceUnit || 'USDT';
  const multiplier = contractInfo?.multiplier || 1;
  const pricefix = contractInfo?.pricefix || 2;
  const publicMarkertInfo = contractInfo?.publicMarkertInfo || {};

  // State definitions
  const [categoryType, setCategoryType] = useState('1');
  const [sideType, setSideType] = useState(1);
  const [leverage, setLeverage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [openMargin, setOpenMargin] = useState<string>('0 USDT');
  const [revenue, setRevenue] = useState<string>('0 USDT');
  const [returnRate, setReturnRate] = useState<string>('0%');
  const [targetReturnRate, setTargetReturnRate] = useState<string>(''); // 目标回报率输入
  const [calculatedClosePrice, setCalculatedClosePrice] = useState<string>('0 USDT'); // 计算出的平仓价格
  const [positionSize, setPositionSize] = useState<string>(''); // 仓位数量
  const [availableBalance, setAvailableBalance] = useState<string>(''); // 可用余额
  const [marginMode, setMarginMode] = useState<1 | 2>(1); // 保证金模式：1全仓，2逐仓
  const [liquidationPrice, setLiquidationPrice] = useState<string>('0 USDT'); // 计算出的强平价格
  const [formData, setFormData] = useState<FormData>({
    formData_1: { title: t('calculator.openPrice'), units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_2: { title: t('calculator.closePrice'), units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_3: { title: t('calculator.quantity'), units: coUnit, fix: volfix, errorText: null, value: null, isShow: true },
  });

  // 杠杆标记点
  const leverageMarks = {
    1: '1x',
    25: '25x',
    50: '50x',
    75: '75x',
    100: '100x',
    125: '125x'
  };

  // modeOptions强平价格保证金模式: 平仓、逐仓
  const modeOptions = [
    { value: 1, label: t('calculator.crossMargin') },
    { value: 2, label: t('calculator.isolatedMargin') }
  ]

  // Tabs 配置
  const tabItems = [
    {
      key: '1',
      label: t('calculator.profitTab'),
    },
    {
      key: '2',
      label: t('calculator.closePriceTab'),
    },
    {
      key: '3',
      label: t('calculator.liquidationTab'),
    },
  ];

  const initForm = () => {
    setOpenMargin('0 USDT');
    setRevenue('0 USDT');
    setReturnRate('0%');
    setTargetReturnRate('');
    setCalculatedClosePrice('0 USDT');
    setPositionSize('');
    setAvailableBalance('');
    setLiquidationPrice('0 USDT');
    setFormData({
      formData_1: { ...formData.formData_1, value: null, errorText: null },
      formData_2: { ...formData.formData_2, value: null, errorText: null },
      formData_3: { ...formData.formData_3, value: null, errorText: null },
    });
    form.resetFields();
  };

  useEffect(() => {
    if (open) {
      setIsClosing(false);
      initForm();
      setLeverage(1);
    }
  }, [open]);

  // 当语言变化时，更新表单数据的标题
  useEffect(() => {
    setFormData({
      formData_1: { ...formData.formData_1, title: t('calculator.openPrice') },
      formData_2: { ...formData.formData_2, title: t('calculator.closePrice') },
      formData_3: { ...formData.formData_3, title: t('calculator.quantity') },
    });
  }, [t]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const switchType = (type: string, id: number) => {
    if (type === 'sideType') setSideType(id);
    initForm();
  };

  const handleTabChange = (key: string) => {
    setCategoryType(key);
    initForm();
  };

  const changeInput = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, errorText: value && Number(value) ? null : prev[key].errorText },
    }));
  };

  const formVerify = () => {
    const values = form.getFieldsValue();
    if (categoryType === '2') {
      // 平仓价格计算只需要开仓价格和目标回报率
      return values.formData_1 && targetReturnRate;
    }
    if (categoryType === '3') {
      // 强平价格计算需要开仓价格和仓位数量，全仓还需要可用余额
      const hasBasicFields = values.formData_1 && positionSize;
      if (marginMode === 1) {
        // 全仓模式还需要可用余额
        return hasBasicFields && availableBalance;
      }
      // 逐仓模式只需要基本字段
      return hasBasicFields;
    }
    // 其他计算需要开仓价格和平仓价格
    if (!values.formData_1 || !values.formData_2) return false;
    if (categoryType !== '2' && !values.formData_3) return false;
    return true;
  };

  const submit = () => {
    if (!formVerify()) return;
    const values = form.getFieldsValue();
    const openPrice = Number(values.formData_1);

    if (categoryType === '1') {
      // 收益计算
      const closePrice = Number(values.formData_2);
      const volume = coUnitType === 2 ? Number(values.formData_3) * multiplier : Number(values.formData_3);

      // 计算开仓保证金
      const v1 = contractInfo.contractSide === 1 ? volume * openPrice : volume / openPrice;
      const openMarginValue = v1 / leverage / contractInfo.marginRate;
      setOpenMargin(`${openMarginValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4)} ${contractInfo?.marginCoin || 'USDT'}`);

      // 计算收益额
      const n2 = contractInfo.contractSide === 1 ? closePrice - openPrice : (1 / closePrice) - (1 / openPrice);
      const n3 = (n2 * volume) / contractInfo.marginRate;
      const revenueValue = sideType === 1 ? n3 : -n3;
      setRevenue(`${revenueValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4)} ${contractInfo?.marginCoin || 'USDT'}`);

      // 计算回报率
      const returnRateValue = openMarginValue > 0 ? (revenueValue / openMarginValue) * 100 : 0;
      setReturnRate(`${returnRateValue.toFixed(2)}%`);
    } else if (categoryType === '2') {
      // 平仓价格计算
      const targetRate = Number(targetReturnRate) / 100;

      if (openPrice > 0 && targetRate !== 0) {
        let closePriceValue = 0;

        if (contractInfo.contractSide === 1) {
          // 正向合约
          if (sideType === 1) {
            // 做多：平仓价格 = 开仓价格 * (1 + 目标回报率 * 杠杆)
            closePriceValue = openPrice * (1 + targetRate * leverage);
          } else {
            // 做空：平仓价格 = 开仓价格 * (1 - 目标回报率 * 杠杆)
            closePriceValue = openPrice * (1 - targetRate * leverage);
          }
        } else {
          // 反向合约
          if (sideType === 1) {
            // 做多：1/平仓价格 = 1/开仓价格 - (目标回报率 * 杠杆) / 开仓价格
            closePriceValue = 1 / (1 / openPrice - (targetRate * leverage) / openPrice);
          } else {
            // 做空：1/平仓价格 = 1/开仓价格 + (目标回报率 * 杠杆) / 开仓价格
            closePriceValue = 1 / (1 / openPrice + (targetRate * leverage) / openPrice);
          }
        }

        setCalculatedClosePrice(`${closePriceValue.toFixed(pricefix)} ${priceUnit}`);
      }
    } else if (categoryType === '3') {
      // 强平价格计算
      const position = Number(positionSize);
      const balance = marginMode === 1 ? Number(availableBalance) : 0;

      if (openPrice > 0 && position > 0) {
        let liquidationPriceValue = 0;

        // 维持保证金率（通常为0.5%）
        const maintenanceMarginRate = 0.005;

        if (contractInfo.contractSide === 1) {
          // 正向合约
          if (sideType === 1) {
            // 做多强平价格
            if (marginMode === 1) {
              // 全仓：强平价格 = 开仓价格 * (1 - (可用余额 + 仓位保证金 * (1 - 维持保证金率)) / (仓位数量 * 面值))
              const positionMargin = (position * multiplier * openPrice) / leverage;
              const numerator = balance + positionMargin * (1 - maintenanceMarginRate);
              liquidationPriceValue = openPrice * (1 - numerator / (position * multiplier));
            } else {
              // 逐仓：强平价格 = 开仓价格 * (1 - (1 - 维持保证金率) / 杠杆)
              liquidationPriceValue = openPrice * (1 - (1 - maintenanceMarginRate) / leverage);
            }
          } else {
            // 做空强平价格
            if (marginMode === 1) {
              // 全仓做空计算
              const positionMargin = (position * multiplier * openPrice) / leverage;
              const numerator = balance + positionMargin * (1 - maintenanceMarginRate);
              liquidationPriceValue = openPrice * (1 + numerator / (position * multiplier));
            } else {
              // 逐仓：强平价格 = 开仓价格 * (1 + (1 - 维持保证金率) / 杠杆)
              liquidationPriceValue = openPrice * (1 + (1 - maintenanceMarginRate) / leverage);
            }
          }
        } else {
          // 反向合约强平价格计算
          if (sideType === 1) {
            // 做多
            if (marginMode === 1) {
              const positionValue = position / openPrice;
              const positionMargin = positionValue / leverage;
              liquidationPriceValue = 1 / ((1 / openPrice) + (balance + positionMargin * (1 - maintenanceMarginRate)) / position);
            } else {
              liquidationPriceValue = 1 / ((1 / openPrice) + (1 - maintenanceMarginRate) / (leverage * openPrice));
            }
          } else {
            // 做空
            if (marginMode === 1) {
              const positionValue = position / openPrice;
              const positionMargin = positionValue / leverage;
              liquidationPriceValue = 1 / ((1 / openPrice) - (balance + positionMargin * (1 - maintenanceMarginRate)) / position);
            } else {
              liquidationPriceValue = 1 / ((1 / openPrice) - (1 - maintenanceMarginRate) / (leverage * openPrice));
            }
          }
        }

        setLiquidationPrice(`${liquidationPriceValue.toFixed(pricefix)} ${priceUnit}`);
      }
    }
  };

  return (
    <Popup
        visible={open}
        onClose={onCancel}
        position='right'
        closeOnMaskClick
        bodyStyle={{ width: '86.666vw', height: '100dvh' }}
        bodyClassName="!bg-[var(--background17)] !text-[var(--text-color5)]"
    >   
      <div className="flex h-[60px] px-4 text-[16px] font-medium justify-between items-center border-b border-color">
        <span>{t('calculator.title')}</span>
        <Iconify icon="eva:close-outline" className="text-[24px] tip-color" onClick={onCancel} />
      </div>
      {/* 收益/平仓价格/强平价格 切换 Tabs */}
      <CustomTab
        tabsItems={ tabItems }
        activeKey={categoryType}
        onChange={handleTabChange}
        stretch={false}
        activeLineMode='fixed'
        className="calculatorTabs safeTabs"
      />
      {/* 内容区域 */}
      <ConfigProvider
        theme={{
          components: {
            Form: {
              itemMarginBottom: 16,
            },
            InputNumber: {
              controlHeightLG: 50,
              activeBorderColor: "var(--theme-color)",
              hoverBorderColor: "var(--theme-color)",
              activeBg: "var(--background7)",
              hoverBg: "var(--background7)",
              handleBg: "transparent", //操作按钮背景色
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
        <div className="p-4 pb-[30px] h-[calc(100%-112px)] hideScrollBar">
          {/* 强平价格保证金模式选择 */}
          {categoryType === '3' && (
            <SelectPop 
              value={marginMode}
              onChange={(value:any) => setMarginMode(value)}
              options={modeOptions}
              title={t('calculator.selectMarginMode')}
              activeType="icon"
              showSearch={false}
              renderBtn={(open) => (
                <button 
                  className="border border-solid input-border rounded-lg w-[177px] h-[44px] px-[10px] text-[14px] flex justify-between items-center mb-[16px]"
                  onClick={open}
                >
                  <span>{getLabel(marginMode, modeOptions)}</span>
                  <Iconify icon="icon-park-outline:down" className="text-[24px] text-[#373949]"/>
                </button>
              )}
            />
            // <div style={{ marginBottom: '20px' }}>
            //   <Select
            //     value={marginMode}
            //     onChange={(value) => setMarginMode(value)}
            //     style={{ width: '100px', height: '44px', marginLeft: '20px' }}
            //     options={[
            //       { value: 1, label: t('calculator.crossMargin') },
            //       { value: 2, label: t('calculator.isolatedMargin') }
            //     ]}
            //     placeholder={t('calculator.selectMarginMode')}
            //   />
            // </div>
          )}

          {/* 买入/卖出切换 */}
          <div className={styles.categorySelectBox}
            style={{ borderColor: sideType === 1 ? '#00C788' : '#FF4D4F' }}
          >
            <em
              className={styles.tabActiveBg}
              style={{
                left: sideType === 1 ? '4px' : 'calc(50% + 2px)',
                backgroundColor: sideType === 1 ? '#00C788' : '#FF4D4F'
              }}
            />
            <span
              className={styles.tab}
              style={{
                color: sideType === 1 ? '#ffffff' : '#6b7280'
              }}
              onClick={() => switchType('sideType', 1)}
            >
              {t('calculator.buyLong')}
            </span>
            <span
              className={styles.tab}
              style={{
                color: sideType === 2 ? '#ffffff' : '#6b7280'
              }}
              onClick={() => switchType('sideType', 2)}
            >
              {t('calculator.sellShort')}
            </span>
          </div>

          {/* 杠杆滑块 */}
          <div className="mb-[32px]">
            <Slider
              min={1}
              max={125}
              value={leverage}
              onChange={(value) => setLeverage(value)}
              marks={leverageMarks}
              tooltip={{
                open: true,
                zIndex: 1000,
                placement: "top",
                arrow: false,
                className: "sliderTooltip",
                destroyOnHidden: true,
                getPopupContainer: (trigger) => trigger.parentNode as HTMLElement,
                color: "var(--theme-color)", // 设置悬浮框背景颜色为橙色
                autoAdjustOverflow: false,
              }}
              className="spotSlider"
            />
          </div>

          <div className={styles.maxPosition}>
            {t('calculator.maxPosition')} <span className={styles.maxNumber}>0 {coUnit}</span>
          </div>

          {/* 表单输入 */}
          <Form
            form={form}
            layout="vertical"
            onValuesChange={(changedValues) => {
              Object.keys(changedValues).forEach((key) => changeInput(key as keyof FormData, changedValues[key]));
            }}
          >
            {categoryType === '2' ? (
              // 平仓价格计算表单
              <>
                <Form.Item
                  name="formData_1"
                  validateStatus={formData.formData_1.errorText ? 'error' : ''}
                  help={formData.formData_1.errorText}
                >
                  <InputNumber
                    suffix={priceUnit}
                    placeholder={t('calculator.openPrice')}
                    className="spot_number_input"
                    controls={false}
                  />
                </Form.Item>
                <Form.Item name="returnRate">
                  <InputNumber
                    suffix="%"
                    placeholder={t('calculator.targetReturnRate')}
                    className="spot_number_input"
                    value={targetReturnRate}
                    controls={false}
                    onChange={(value: any) => setTargetReturnRate(value)}
                  />
                </Form.Item>
              </>
            ) : categoryType === '3' ? (
              // 强平价格计算表单
              <>
                <Form.Item
                  name="formData_1"
                  validateStatus={formData.formData_1.errorText ? 'error' : ''}
                  help={formData.formData_1.errorText}
                >
                  <InputNumber
                    suffix={priceUnit}
                    placeholder={t('calculator.openPrice')}
                    className="spot_number_input"
                  />
                </Form.Item>
                <Form.Item name="positionSize">
                  <InputNumber
                    suffix={coUnit}
                    placeholder={t('calculator.positionSize')}
                    className="spot_number_input"
                    value={positionSize}
                    controls={false}
                    onChange={(value:any) => setPositionSize(value)}
                  />
                </Form.Item>
                {marginMode === 1 && (
                  <Form.Item name="availableBalance">
                    <InputNumber
                      suffix={contractInfo?.marginCoin}
                      placeholder={t('calculator.availableBalance')}
                      className="spot_number_input"
                      value={availableBalance}
                      controls={false}
                      onChange={(value: any) => setAvailableBalance(value)}
                    />
                  </Form.Item>
                )}
              </>
            ) : (
              // 其他计算的原始表单
              (Object.keys(formData) as Array<keyof FormData>).map((key) =>
                formData[key].isShow ? (
                  <Form.Item
                    key={key}
                    name={key}
                    validateStatus={formData[key].errorText ? 'error' : ''}
                    help={formData[key].errorText}
                  >
                    <InputNumber
                      suffix={formData[key].units}
                      placeholder={formData[key].title}
                      className="spot_number_input"
                      controls={false}
                    />
                  </Form.Item>
                ) : null
              )
            )}
          </Form>

          {/* 计算按钮 */}
          <button 
            type="button"
            className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mb-[40px] mt-[30px] rounded-[25px]
              ${formVerify() ? 'bg-[var(--theme-color)] text-[var(--text-color5)]' : 'bg-[var(--btncolor10)] text-[var(--text-color10)]'}
            `}
            onClick={submit}
          >
            {t('calculator.calculate')}
          </button>

          {/* 计算结果 */}
          <div className={styles.resultSection}>
            <div className={styles.resultTitle}>{t('calculator.result')}</div>
            {categoryType === '1' && (
              // 收益计算结果
              <>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.openMargin')}</span>
                  <span className={styles.resultValue}>{openMargin}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.profit')}</span>
                  <span className={styles.resultValue}>{revenue}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.returnRate')}</span>
                  <span className={styles.resultValue}>{returnRate}</span>
                </div>
              </>
            )}
            {categoryType === '2' && (
              // 平仓价格计算结果
              <>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.closePrice')}</span>
                  <span className={styles.resultValue}>{calculatedClosePrice}</span>
                </div>
              </>
            )}
            {categoryType === '3' && (
              // 强平价格计算结果
              <>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.liquidationPrice')}</span>
                  <span className={styles.resultValue}>{liquidationPrice}</span>
                </div>
              </>
            )}
            <p className={styles.disclaimer}>
              {t('calculator.disclaimer')}
            </p>
          </div>
        </div>
      </ConfigProvider>
    </Popup>
  );
});

export default CalculatorMode;