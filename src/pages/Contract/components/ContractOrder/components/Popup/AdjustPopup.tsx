import React, {useState, useEffect} from 'react';
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
		return (
			<ConfigProvider
				theme={{
					components: {
						Segmented: {
							fontSize: 14,
							borderRadius: 50, // 分段器圆角
							borderRadiusSM: 50, // 分段器圆角
							itemHoverBg: "transparent",
							itemActiveBg: "transparent",
							itemColor: "var(--text-color6)",
							itemHoverColor: "var(--text-color6)",
							itemSelectedBg: "var(--segmented-item-active-bg)",
							itemSelectedColor: "var(--text-color5)",
						},
					},
				}}
			>
				<div className="px-[20px] pt-[16px]">
          {/* 切换模式 */}
          <Segmented
            block
            shape="round"
            options={[
              {
                label: (
                  <div className="h-[36px] w-[100%] flex items-center justify-center">
                    增加保证金
                  </div>
                ),
                value: 1,
              },
              {
                label: (
                  <div className="h-[36px] w-[100%] flex items-center justify-center">
                    减少保证金
                  </div>
                ),
                value: 2,
              },
            ]}
            className="h-[44px] w-[215px] mb-[16px] bg-[var(--btncolor3)] p-[3px]"
            onChange={(value) => setChecked(value === 1)}
          />
          {/* 输入框 */}
          <InputNumber
            placeholder="增加保证金数量"
            className="w-[100%] h-[50px] leading-[50px]"
            suffix="USDT"
          />
          {/* 滑动条 */}
          <Slider
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
          />
          {/* 可用资产 */}
          <div className="flex gap-[4px] text-[14px] font-[400] mb-[16px]">
            <div className="text-[var(--text-color6)]">可用:</div>
            <div className="text-[var(--text-color5)]">63.19 USDT</div>
          </div>
          {/* 信息 */}
          <div className="w-full font-[400] text-[14px] p-[20px_10px] border border-[var(--border-color4)] rounded-[8px]">
            {/* table-header */}
            <div className="mb-[10px]">
              <div className="flex justify-between text-[var(--text-color6)]">
                <div className="flex-1"></div>
                <div className="flex-1 text-right">当前</div>
                <div className="flex-1 text-right">变更后</div>
              </div>
            </div>
            {/* table-body */}
            <div className="flex flex-col gap-[12px]">
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">仓位</div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  5955.29 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  5955.29 USDT
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">
                  仓位保证金
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
                  仓位保证金
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  51.2x
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  51.2x
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">强平价</div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  106,601.2 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  106,601.2 USDT
                </div>
              </div>
            </div>
          </div>
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
			<p className="flex justify-between items-center h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
				<span>{t('spot.preferences.orderConfirm')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default AdjustPopup;