import React, {useState, useEffect} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import appStore from "@/store";
import { Side, SideMap, PositionTypeMap } from '../../configs/columns';
import { usePosition, Position as PositionType } from "../../hooks";
import BigNumber from "bignumber.js";
import {
  Button,
  ConfigProvider,
  InputNumber,
  Modal,
  Segmented,
  Slider,
  Checkbox,
} from "antd";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentData: PositionType;
};

const ClosePopup:React.FC<Props> = ({open, onCancel, onConfirm, currentData}) => {
    const {t} = useLanguage('contract');
    // 获取当前合约信息
    const currentContractInfo = appStore.getCurrentContractInfo();
    const currentSymbol = currentContractInfo?.symbol || "";
    const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;
    const [type, setType] = useState<'limit'|'market'>('limit');
    const [price, setPrice] = useState<number>();
    const [amount, setAmount] = useState<number>();

    // 仓位
    const {
        quickClose
    } = usePosition();

    // 订单类型标签
    const orderTypeTabs: {key:  'limit'|'market', label: string}[] = [
        { key: 'limit', label: t("tradingPanel.limitOrder") },
        { key: 'market', label: t("tradingPanel.marketOrder") },
    ];

    const max = currentData?.canCloseVolume || 0

    const marks = {
        0: "",
        [Math.floor(max * 0.25)]: '',
        [Math.floor(max * 0.5)]: '',
        [Math.floor(max * 0.75)]: '',
        [max]: '',
    }

    // 显示合约类型
    const getContractShowType = () => {
        const type = currentSymbol.contractShowType?.toLowerCase();
        return t(`contractInfo.${type ?? 'demo'}`)
    }

    const handleConfirm = () => {
        if (!price || !amount) return
        quickClose(currentData, {type, price: price, volume: amount})
        onConfirm()
    }

  const PopupContent = () => {
        return (
        <ConfigProvider
            theme={{
                components: {
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
            <div className="px-[20px] pt-[16px] pb-[20px]">
                {/* titile */}
                <div className="flex flex-col gap-[6px] mb-[20px]">
                    <div className="flex items-center text-[14px] text-[var(--text-color5)] font-[500]">
                        <span>{currentData?.symbol}</span>
                        <span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center ml-1">{getContractShowType()}</span>
                    </div>
                    <div className="text-[12px] font-[400] flex gap-[4px]">
                        <span
                            className={`h-[20px] px-[3px] flex items-center text-[14px] font-medium mr-2 rounded-[4px]
                            ${currentData?.orderSide === Side.BUY_CLOSE || currentData?.orderSide === Side.BUY_OPEN ? 'success_icon success_bg' : 'error_icon error_bg'}
                            `}
                        >
                            {t(SideMap[currentData?.orderSide])} 
                        </span>
                        <span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center mr-1">
                            {t(PositionTypeMap[currentData?.positionType])} {currentData?.leverageLevel ?? 1}x
                        </span>
                    </div>
                </div>
                {/* 订单类型标签 */}
                <div className="flex gap-[10px] mb-[10px]">
                {
                    orderTypeTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setType(tab.key)
                        }}
                        className={`text-[14px] font-[400] ${type === tab.key
                        ? "text-[var(--text-color5)] font-[500]"
                        : "text-[var(--text-color6)]"
                        }`}
                    >
                        {tab.label}
                    </button>
                    ))
                }
                </div>
                {type === 'limit' && <><div className="flex items-center justify-between text-[14px] h-[20px] mb-[10px]">
                    <span className="tip-color">{t('closeModal.price')}</span>
                    <div>
                        <span className="tip-color">{t('symbolSelector.lastPrice')}</span>
                        <span className="ml-1">{currentData.indexPrice}</span>
                    </div>
                </div>
                <InputNumber
                    value={price}
                    min={0}
                    placeholder={t('closeModal.price')}
                    className="spot_number_input mb-[10px]"
                    suffix="USDT"
                    controls={false}
                    onBlur={(e) => {
                        const value = e.target.value;
                        setPrice(Number(value))
                    }}
                /></>}
                {/* <div className="flex gap-x-[11px] mb-[20px]">
                    <button 
                        className="flex-1 flex h-[28px] items-center justify-center bg-[var(--background14)] rounded-[4px] text-[14px] tip-color"
                    >
                        {t('marketOrder')}
                    </button>
                    <button 
                        className="flex-1 flex h-[28px] items-center justify-center bg-[var(--background14)] rounded-[4px] text-[14px] tip-color"
                    >
                        {t('closeModal.ourBest')}
                    </button>
                    <button 
                        className="flex-1 flex h-[28px] items-center justify-center bg-[var(--background14)] rounded-[4px] text-[14px] tip-color"
                    >
                        {t('closeModal.otherBest')}
                    </button>
                </div> */}
                <div className="flex items-center justify-between text-[14px] h-[20px] mb-[10px]">
                    <span className="tip-color">{t('size')}</span>
                </div>
                <InputNumber
                    value={amount}
                    min={0}
                    placeholder={t('size')}
                    className="spot_number_input mb-[12px]"
                    suffix="USDT"
                    controls={false}
                    onBlur={(e) => {
                        const value = e.target.value ? Number(e.target.value) : 0;
                        if (value && value >= 0 && value <= max) { 
                            setAmount(value)
                        } else if (Number(value) > Number(max)) {
                            setAmount(max as any)
                        }
                    }}
                />
                <Slider
                    value={amount}
                    min={0}
                    max={max}
                    marks={marks}
                    tooltip={{
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
                    onChange={(value:any) => setAmount(value)}
                />
                <div className="flex items-center justify-between text-[14px] h-[20px] mb-[10px] mt-[10px]">
                    <span className="tip-color">{t('closeModal.canCloseVolume')}</span>
                    <span>{currentData.canCloseVolume} USDT</span>
                </div>
                {/* <div className="flex items-center justify-between text-[14px] h-[20px]">
                    <span className="tip-color w-fit border-b border-dashed border-[var(--text-color6)]">{t('closeModal.estimatedReturn')}</span>
                    <span className="success_icon">+0.06 USDT</span>
                </div> */}
                <button
                    type="button"
                    className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mt-[30px] rounded-[25px]
                        ${price && amount ? 'bg-[var(--theme-color)] text-[var(--text-color5)]' : 'bg-[var(--btncolor10)] text-[var(--text-color10)]'}
                    `}
                    onClick={handleConfirm}
                >{t('closeModal.confirm')}</button>
            </div>
        </ConfigProvider>
        )
    }

    return (
        <Popup
            visible={open}
            onClose={onCancel}
            closeOnMaskClick
            destroyOnClose
            position="bottom"
            bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
            bodyClassName={`!h-auto !bg-[var(--background17)] !text-[var(--text-color5)]`}
        >
            <p className="flex justify-between items-center h-[50px] text-[16px] font-medium px-4 border-b border-[var(--border-color6)]">
                <span>{t('close')}</span>
                <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
            </p>
            <PopupContent />
        </Popup>
    )
}

export default ClosePopup;