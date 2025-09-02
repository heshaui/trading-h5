import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Slider, Tabs, Select, ConfigProvider } from 'antd';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import styles from './calculator.module.css';

interface CalculatorModeProps {
  isShow: boolean;
  close: () => void;
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

const CalculatorMode = observer(({ isShow, close, dataInfo }: CalculatorModeProps) => {
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
    if (isShow) {
      setIsClosing(false);
      initForm();
      setLeverage(1);
    }
  }, [isShow]);

  // 当语言变化时，更新表单数据的标题
  useEffect(() => {
    setFormData({
      formData_1: { ...formData.formData_1, title: t('calculator.openPrice') },
      formData_2: { ...formData.formData_2, title: t('calculator.closePrice') },
      formData_3: { ...formData.formData_3, title: t('calculator.quantity') },
    });
  }, [t]);

  if (!isShow) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      close();
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
    <ConfigProvider
      theme={{
        components: {
          Select: {
            borderRadius: 8,
            controlHeight: 48,
            fontSize: 14,
            colorBorder: '#d9d9d9',
            optionSelectedBg: '#e6f4ff',
            controlPaddingHorizontal: 16,
            boxShadow: 'none',
            boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    >
      <div className={styles.calculatorMode}>
        <div className={`${styles.calculatorOverlay} ${isClosing ? styles.fadeOut : ''}`} onClick={handleClose} />
        <div className={`${styles.calculatorModeBox} ${isClosing ? styles.slideOut : ''}`}>
          {/* 标题栏 */}
          <div className={styles.calculatorHeader}>
            <h4 className={styles.calculatorTitle}>{t('calculator.title')}</h4>
            <Iconify icon="eva:close-outline" className="text-[24px] tip-color" onClick={handleClose} />
          </div>

          {/* 收益/平仓价格/强平价格 切换 - 使用 Ant Design Tabs */}
          <div className={styles.tabBox}>
            <Tabs
              activeKey={categoryType}
              onChange={handleTabChange}
              items={tabItems}
             
            />
          </div>

          {/* 强平价格保证金模式选择 */}
          {categoryType === '3' && (
            <div style={{ marginBottom: '20px' }}>
              <Select
                value={marginMode}
                onChange={(value) => setMarginMode(value)}
                style={{ width: '100px', height: '44px', marginLeft: '20px' }}
                options={[
                  { value: 1, label: t('calculator.crossMargin') },
                  { value: 2, label: t('calculator.isolatedMargin') }
                ]}
                placeholder={t('calculator.selectMarginMode')}
              />
            </div>
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
          <div className={styles.leverageSection}>
            <Slider
              min={1}
              max={125}
              value={leverage}
              onChange={(value) => setLeverage(value)}
              marks={leverageMarks}
            />
            {/* <div className={styles.maxPosition}>
              {t('calculator.maxPosition')} <span className={styles.maxNumber}>0 {coUnit}</span>
            </div> */}
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
                  <Input
                    suffix={priceUnit}
                    placeholder={t('calculator.openPrice')}
                    className={styles.calculatorInput}
                  />
                </Form.Item>
                <Form.Item name="returnRate">
                  <Input
                    suffix="%"
                    placeholder={t('calculator.targetReturnRate')}
                    className={styles.calculatorInput}
                    value={targetReturnRate}
                    onChange={(e) => setTargetReturnRate(e.target.value)}
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
                  <Input
                    suffix={priceUnit}
                    placeholder={t('calculator.openPrice')}
                    className={styles.calculatorInput}
                  />
                </Form.Item>
                <Form.Item name="positionSize">
                  <Input
                    suffix={coUnit}
                    placeholder={t('calculator.positionSize')}
                    className={styles.calculatorInput}
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                  />
                </Form.Item>
                {marginMode === 1 && (
                  <Form.Item name="availableBalance">
                    <Input
                      suffix={contractInfo?.marginCoin}
                      placeholder={t('calculator.availableBalance')}
                      className={styles.calculatorInput}
                      value={availableBalance}
                      onChange={(e) => setAvailableBalance(e.target.value)}
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
                    <Input
                      suffix={formData[key].units}
                      placeholder={formData[key].title}
                      className={styles.calculatorInput}
                    />
                  </Form.Item>
                ) : null
              )
            )}
          </Form>

          {/* 计算按钮 */}
          <Button
            type="primary"
            shape="round"
            disabled={!formVerify()}
            onClick={submit}
            className={styles.calculateBtn}
            style={{
              marginBottom:'20px'
            }}
          >
            {t('calculator.calculate')}
          </Button>

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
      </div>
    </ConfigProvider>
  );
});

export default CalculatorMode;