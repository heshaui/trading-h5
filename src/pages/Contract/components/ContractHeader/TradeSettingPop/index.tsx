import React, { useState, useEffect } from 'react';
import { Popup, Switch } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';

import { ReactComponent as UncheckIcon } from '@/assets/images/exchange/icon_uncheck.svg';
import { ReactComponent as CheckIcon } from '@/assets/images/exchange/icon_check.svg';

type Props = {
  open: boolean;
  onCancel: () => void;
};

const TradeSettingPop:React.FC<Props> = ({ 
  open,
  onCancel
}) => {
  const {t, currentLanguage} = useLanguage('contract');
   const [positionMode, setPositionMode] = useState<'single' | 'hedge'>('hedge');
  const [contractUnit, setContractUnit] = useState<'张' | 'BTC' | 'USDT'>('张');
  const [orderValidity, setOrderValidity] = useState<'24H' | '7天' | '14天' | '长期有效'>('14天');
  const [preOrderConfirm, setPreOrderConfirm] = useState(true);
  const [reverseConfirm, setReverseConfirm] = useState(true);
  const [isShow, setIsShow] = useState(false);

  // 组件装载时从 localStorage 读取设置
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('tradingSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setPositionMode(settings.positionMode || 'hedge');
        setContractUnit(settings.contractUnit || '张');
        setOrderValidity(settings.orderValidity || '14天');
        setPreOrderConfirm(settings.preOrderConfirm !== false); // 默认为true
        setReverseConfirm(settings.reverseConfirm !== false); // 默认为true
      }
    } catch (error) {
      console.error('读取交易设置失败:', error);
    }
  }, [currentLanguage]);

  const handleConfirm = () => {
    try {
      // 保存设置到 localStorage
      const settings = {
        positionMode,
        contractUnit,
        orderValidity,
        preOrderConfirm,
        reverseConfirm,
        updatedAt: Date.now()
      };
      localStorage.setItem('tradingSettings', JSON.stringify(settings));
      
      // 同步更新旧的 localStorage 键（保持向后兼容）
      localStorage.setItem('dontShowOrderConfirm', (!preOrderConfirm).toString());
      
      console.log('Settings saved:', settings);
      onCancel();
    } catch (error) {
      console.error('保存交易设置失败:', error);
    }
  };
  
  // 实时同步下单前确认设置
  const handlePreOrderConfirmChange = (checked: boolean) => {
    setPreOrderConfirm(checked);
    // 立即同步到 localStorage 以便下单时能实时获取
    try {
      localStorage.setItem('dontShowOrderConfirm', (!checked).toString());
    } catch (error) {
      console.error('同步下单确认设置失败:', error);
    }
  };

  // 获取合约单位显示文本
  const getContractUnitText = (unit: string) => {
    switch (unit) {
      case '张':
        return t('tradingSettings.units.sheet');
      case 'BTC':
        return t('tradingSettings.units.btc');
      case 'USDT':
        return t('tradingSettings.units.usdt');
      default:
        return unit;
    }
  };

  // 获取有效期显示文本
  const getValidityText = (period: string) => {
    switch (period) {
      case '24H':
        return t('tradingSettings.validity.24h');
      case '7天':
        return t('tradingSettings.validity.7days');
      case '14天':
        return t('tradingSettings.validity.14days');
      case '长期有效':
        return t('tradingSettings.validity.longTerm');
      default:
        return period;
    }
  };

  return (
    <Popup
        visible={open}
        onClose={onCancel}
        position='right'
        closeOnMaskClick
        bodyStyle={{ width: '86.666vw', height: '100vh' }}
        bodyClassName="!bg-[var(--background17)] !text-[var(--text-color5)]"
    >
      <div className="flex h-[60px] px-4 text-[16px] font-medium justify-between items-center border-b border-color">
        <span>{t('tradingSettings.title')}</span>
        <Iconify icon="eva:close-outline" className="text-[24px] tip-color" onClick={onCancel} />
      </div>
      <div className="h-[calc(100%-60px)] hideScrollBar px-[16px] py-[20px]">
        {/* 持仓类型 */}
        <p className="flex mb-5">
          <span className="shrink-0 text-[16px] font-medium leading-[22px]">{t('tradingSettings.positionType')}：</span>
          <span className="text-[12px] mt-[2.5px] leading-[17px] tip-color">{t('tradingSettings.positionTypeNote')}</span>
        </p>
        {/* 单向持仓 */}
        <div className="flex gap-x-[8px] p-[12px] bg-[var(--cancel-btn2)] rounded-[4px] mb-5" onClick={() => setPositionMode('single')}>
          <div className="flex h-[22px] items-center">{positionMode === 'single' ? <CheckIcon className="!w-[20px] !h-[20px] theme-color" /> : <UncheckIcon className="!w-[20px] !h-[20px]"/>}</div>
          <div className="font-medium tip-color">
            <p className="text-[16px] leading-[22px] mb-[8px]">{t('tradingSettings.singlePosition')}</p>
            <p className="text-[12px] leading-[17px]">{t('tradingSettings.singlePositionDesc')}</p>
          </div>
        </div>
        {/* 双向持仓 */}
        <div className="flex gap-x-[8px] p-[12px] bg-[var(--cancel-btn2)] rounded-[4px] mb-10" onClick={() => setPositionMode('hedge')}>
          <div className="flex h-[22px] items-center">{positionMode === 'hedge' ? <CheckIcon className="!w-[20px] !h-[20px] theme-color" /> : <UncheckIcon className="!w-[20px] !h-[20px]"/>}</div>
          <div className="font-medium tip-color">
            <p className="text-[16px] leading-[22px] mb-[8px]">{t('tradingSettings.hedgePosition')}</p>
            <p className="text-[12px] leading-[17px]">{t('tradingSettings.hedgePositionDesc')}</p>
          </div>
        </div>

        {/* 合约单位 */}
        <div className="text-[16px] font-medium leading-[22px] mb-[13px]">
          {t('tradingSettings.contractUnit')}： 
        </div>
        <div className="flex gap-x-[40px] mb-10">
          {['张', 'BTC', 'USDT'].map(unit => (
            <div
              key={unit}
              className="flex items-center h-[22px] gap-x-[4px]"
              onClick={() => setContractUnit(unit as any)}
            >
              {contractUnit === unit ? <CheckIcon className="!w-[20px] !h-[20px] theme-color" /> : <UncheckIcon className="!w-[20px] !h-[20px]"/>}
              <span className="text-[16px] font-medium">{getContractUnitText(unit)}</span>
            </div>
          ))}
        </div>

        {/* 条件单/止盈止损有效期 */}
        <div className="text-[16px] font-medium leading-[22px] mb-[12px]">
          {t('tradingSettings.orderValidity')}：
        </div>
        <div className="grid grid-cols-2 [grid-template-columns:repeat(2,max-content)] gap-x-[40px] gap-y-[10px] mb-10">
          {['24H', '7天', '14天', '长期有效'].map(period => (
            <div
              key={period}
              className="inline-flex items-center h-[22px] gap-x-[4px]"
              onClick={() => setOrderValidity(period as any)}
            >
              {orderValidity === period ? <CheckIcon className="!w-[20px] !h-[20px] theme-color" /> : <UncheckIcon className="!w-[20px] !h-[20px]"/>}
              <span className="text-[16px] font-medium">{getValidityText(period)}</span>
            </div>
          ))}
        </div>

        {/* 下单前弹窗确认 */}
        <div className="text-[16px] font-medium leading-[22px] mb-[19px]">
          {t('tradingSettings.preOrderConfirm')}：
        </div>
        <div className="flex justify-between items-center text-[16px] font-medium h-[22px] mb-[23px]">
            <span>{t('tradingSettings.preOrderConfirm')} </span>
            <Switch
              checked={preOrderConfirm}
              onChange={handlePreOrderConfirmChange}
              style={{
                  '--checked-color': 'var(--theme-color)',
                  '--height': '16px',
                  '--width': '28px',
              }}
            />
        </div>
        <div className="flex justify-between items-center text-[16px] font-medium h-[22px]">
            <span>{t('tradingSettings.reverseConfirm')} </span>
            <Switch
              checked={reverseConfirm}
              onChange={setReverseConfirm}
              style={{
                  '--checked-color': 'var(--theme-color)',
                  '--height': '16px',
                  '--width': '28px',
              }}
            />
        </div>

        <button type="button"
          className="h-[50px] w-full bg-[var(--theme-color)] rounded-[25px] flex items-center justify-center text-[#fff] mt-[100px]"
          onClick={handleConfirm}
        >
          {t('tradingSettings.confirm')}
        </button>
      </div>
    </Popup>
  )
}

export default TradeSettingPop;