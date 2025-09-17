import React, {useState, useEffect, useMemo} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import {
  Button,
  ConfigProvider,
  InputNumber,
  Modal,
  Segmented,
  Slider,
} from "antd";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const PopupContent:React.FC = () => {
		const {t} = useLanguage('contract');
    const [checked, setChecked] = useState(false);
    const [amount, setAmount] = useState('');

    const isValid = useMemo(() => {
      return amount === null || amount === undefined || amount === '' ? false : true
    }, [amount])

		return (
			<ConfigProvider
				theme={{
					components: {
						Segmented: {
              trackBg: 'var(--btnbgcolor4)',
              trackPadding: 4,
							fontSize: 14,
							borderRadius: 50, // 分段器圆角
							borderRadiusSM: 50, // 分段器圆角
							itemHoverBg: "transparent",
							itemActiveBg: "transparent",
							itemColor: "var(--text-color6)",
							itemHoverColor: "var(--text-color6)",
							itemSelectedBg: "var(--background17)",
							itemSelectedColor: "var(--text-color5)",
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
				<div className="px-[20px] pt-[16px] pb-[20px]">
          {/* 切换模式 */}
          <Segmented
            block
            shape="round"
            options={[
              {
                label: (
                  <div className="h-[36px] w-[100%] font-medium flex items-center justify-center">
                    {t('adjustModal.add')}
                  </div>
                ),
                value: 1,
              },
              {
                label: (
                  <div className="h-[36px] w-[100%] font-medium flex items-center justify-center">
                    {t('adjustModal.reduce')}
                  </div>
                ),
                value: 2,
              },
            ]}
            className="h-[44px] mb-[20px] w-[215px]"
            onChange={(value) => setChecked(value === 1)}
          />
          {/* 输入框 */}
          <InputNumber
            value={amount}
            placeholder={t('adjustModal.placeholder')}
            className="spot_number_input mb-[11px]"
            suffix="USDT"
            controls={false}
            onChange={(value:any) => setAmount(value)}
          />
          {/* 滑动条 */}
          <Slider
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
              autoAdjustOverflow: false,
            }}
            className="spotSlider"
          />
          {/* 可用资产 */}
          <div className="flex gap-[4px] text-[14px] h-[20px] items-center font-[400] mb-[16px] mt-[-12px]">
            <span className="text-[var(--text-color6)]">{t('availableBalance')}:</span>
            <span className="text-[var(--text-color5)]">63.19 USDT</span>
          </div>
          {/* 信息 */}
          <div className="w-full font-[400] text-[14px] p-[20px_10px] border border-[var(--border-color4)] rounded-[8px]">
            {/* table-header */}
            <div className="mb-[10px]">
              <div className="flex justify-between text-[var(--text-color6)]">
                <div className="flex-1"></div>
                <div className="flex-1 text-right">{t('adjustModal.current')}</div>
                <div className="flex-1 text-right">{t('adjustModal.afterChange')}</div>
              </div>
            </div>
            {/* table-body */}
            <div className="flex flex-col gap-[12px]">
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">{t('order.position')}</div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  5955.29 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  5955.29 USDT
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">
                  {t('adjustModal.holdAmount')}
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  11.62 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  11.62 USDT
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">
                  {t('adjustModal.holdAmount')}
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  51.2x
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  51.2x
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">{t('adjustModal.liquidationPrice')}</div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  106,601.2 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  106,601.2 USDT
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mt-[30px] rounded-[25px]
              ${isValid ? 'bg-[var(--theme-color)] text-[var(--text-color5)]' : 'bg-[var(--btncolor10)] text-[var(--text-color10)]'}
            `}
          >{t('adjustModal.placeholder')}</button>
        </div>
			</ConfigProvider>
		)
	}

const AdjustPopup:React.FC<Props> = ({open, onCancel, onConfirm}) => {
	const {t} = useLanguage('contract');

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
				<span>{t('adjustModal.title', {positionType: t('tradingPanel.isolatedMargin')})}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default AdjustPopup;