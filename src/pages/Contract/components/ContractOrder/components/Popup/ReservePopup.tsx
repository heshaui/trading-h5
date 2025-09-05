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
  Checkbox,
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
			<div className="px-[20px] pt-[16px]">
          {/* titile */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-[2px]">
              <div className="text-[14px] text-[var(--text-color5)] font-[500]">
                BTCUSDT
              </div>
              <div className="text-[12px] font-[400] flex gap-[4px]">
                <span className="p-[1px_4px] text-[var(--text-color5)] bg-[var(--background14)] rounded-[3px]">
                  逐仓
                </span>
                <span className="p-[1px_4px] bg-[#FF4D4F] bg-opacity-20 text-[#FF4D4F] rounded-[3px]">
                  多反空
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-[2px] text-[14px] font-[400]">
              <div className="text-[var(--text-color6)]">最新价格</div>
              <div className="text-[var(--text-color5)] text-right">0</div>
            </div>
          </div>
          {/* top-box */}
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[16px_10px] mt-[18px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[14px] flex items-center">
                <div className="w-[2px] h-[10px] bg-[#00C788]"></div>
                <div className="font-[500] ml-[2px] mr-[4px]">市价平多</div>
                <div className="font-[400] p-[1px_4px] bg-[#00C788] bg-opacity-20 rounded-[3px] text-[#00C788]">
                  多 50x
                </div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">平仓数量</div>
                <div className="text-[var(--text-color5)]">595.27 USDT</div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">委托价格</div>
                <div className="text-[var(--text-color5)]">市价</div>
              </div>
            </div>
          </div>
          {/* transfer */}
          <div className="py-[7px]">
            <Button className="flex gap-[4px] mx-auto">
              <div> 反向开空</div>
            </Button>
          </div>
          {/* bottom-box */}
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[16px_10px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[14px] flex items-center">
                <div className="w-[2px] h-[10px] bg-[#FF4D4F]"></div>
                <div className="font-[500] ml-[2px] mr-[4px]">市价开空</div>
                <div className="font-[400] p-[1px_4px] bg-[#FF4D4F] bg-opacity-20 rounded-[3px] text-[#FF4D4F]">
                  多 50x
                </div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">开仓数量</div>
                <div className="text-[var(--text-color5)]">595.27 USDT</div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">委托价格</div>
                <div className="text-[var(--text-color5)]">市价</div>
              </div>
            </div>
          </div>
          {/* tips */}
          <div className="text-[12px] text-[var(--text-color4)] font-[400] mt-[10px]">
            <div>
              *如果账户余额不足以开立相同规模的反向仓位，则以可用保证金开设方向相反的仓位。
            </div>
            <div>反向仓位的规模上限为每个合约的市价最大下单数量。</div>
            <div>
              请注意，反向开仓受市场状况、保证金要求和风险管理等多种因素影响，因此我们无法保证此操作100%成功。
            </div>
          </div>
          {/* checkbox */}
          <div className="mt-[10px]">
            <Checkbox checked={checked} onChange={() => setChecked(!checked)}>
              <div className="text-[14px] text-[var(--text-color5)] font-[400]">
                不再提醒。可在交易设置中，开启或关闭提示。
              </div>
            </Checkbox>
          </div>
        </div>
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