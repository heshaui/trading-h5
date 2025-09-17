import React, {useState, useEffect} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import { CustomTab } from "@/components/CustomCom";
import {
  Button,
  ConfigProvider,
  InputNumber,
  Checkbox,
  Tabs,
  Modal,
  Segmented,
  Slider,
  Form,
  Flex
} from "antd";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const PopupContent:React.FC = () => {
		const {t} = useLanguage('contract');
		const [checked, setChecked] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const items = [
      {
        key: "1",
        title: t("marketOrder"), //'市价',
      },
      {
        key: "2",
        title: t("limitOrder"), //"限价",
      },
    ];
		return (
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
				<div className="px-[20px] pt-[16px] pb-[20px] max-h-[calc(90dvh-50px)] hideScrollBar">
          {/* 头部 */}
          <div className="h-[90px] bg-[var(--background14)] rounded-[8px] p-[20px_10px] flex justify-between items-center">
            {/* 合约 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px] font-[400]">
              <div className="text-[var(--text-color5)] ">BTCUSDT</div>
              <div className="text-[#00C788]">多 50x</div>
            </div>
            {/* 成本价 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px]">
              <div className="text-[var(--text-color6)]">成本价</div>
              <div className="text-[var(--text-color5)]">108,232.0</div>
            </div>
            {/* 最新价格 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px] font-[400]">
              <div className="text-[var(--text-color6)]">最新价格</div>
              <div className="text-[var(--text-color5)]">0</div>
            </div>
            {/* 强平价格 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px] font-[400]">
              <div className="text-[var(--text-color6)]">强平价格</div>
              <div className="text-[var(--text-color5)]">106,601.2</div>
            </div>
          </div>
          {/* 选择止盈止损 */}
          <div className="mt-[22px] mb-[14px]">
            <Checkbox.Group
              className="custom-checkbox"
              options={[
                { label: "止盈", value: "profit" },
                { label: "止损", value: "loss" },
              ]}
              onChange={() => {}}
            />
          </div>
          {/* 市价/限价 */}
          <div>
            <div className="mb-[10px]">
              <CustomTab
                tabsItems={items}
                activeKey={activeTab}
                stretch={false}
                activeLineMode="fixed"
                className="tradeTabs"
                onChange={key => setActiveTab(key)}
              />
            </div>
              {activeTab === '1' && 
              <Form>
                <Flex vertical gap={10}>
                  {/* 止盈触发价 */}
                  <Form.Item name="profitTriggerPrice" noStyle>
                    <InputNumber
                      placeholder="请输入止盈触发价"
                      className="spot_number_input"
                      suffix="USDT"
                      controls={false}
                    />
                    <div className="text-[12px] font-medium leading-[17px] text-[#9e9e9e]">
                      <p>当市场价格到达108300，系统将为你提交一个市价平仓单: </p>
                      <p>446.49USDT @市价，</p>
                      <p>成交后 <span className="success_icon">预计盈利: 0.27USDT</span>.</p>
                    </div>
                  </Form.Item>
                  {/* 止盈触发价 */}
                  <Form.Item name="lossTriggerPrice" noStyle>
                    <InputNumber
                      placeholder="请输入止损触发价"
                      className="spot_number_input"
                      suffix="USDT"
                      controls={false}
                    />
                    <div className="text-[12px] font-medium leading-[17px] text-[#9e9e9e]">
                      <p>当市场价格到达108300，系统将为你提交一个市价平仓单: </p>
                      <p>446.49USDT @市价，</p>
                      <p>成交后 <span className="error_icon">预计亏损: -0.54USDT</span>.</p>
                    </div>
                  </Form.Item>
                  {/* 委托数量 */}
                  <Form.Item name="size" noStyle>
                    <InputNumber
                      placeholder="请输入委托数量"
                      className="spot_number_input"
                      suffix="USDT"
                      controls={false}
                    />
                  </Form.Item>
                </Flex>
            </Form>}
            {activeTab === '2' &&
            <Form>
              <Flex vertical gap={10}>
                {/* 止盈触发价 */}
                <Form.Item name="profitTriggerPrice" noStyle>
                  <InputNumber
                    placeholder="请输入止盈触发价"
                    className="spot_number_input"
                    suffix="USDT"
                    controls={false}
                  />
                </Form.Item>
                {/* 止盈触发价 */}
                <Form.Item name="lossTriggerPrice" noStyle>
                  <InputNumber
                    placeholder="请输入止损触发价"
                    className="spot_number_input"
                    suffix="USDT"
                    controls={false}
                  />
                </Form.Item>
                {/* 止损触发价 */}
                <Form.Item name="lossTriggerPrice" noStyle>
                  <InputNumber
                    placeholder="请输入止损触发价"
                    className="spot_number_input"
                    suffix="USDT"
                    controls={false}
                  />
                </Form.Item>
                {/* 止损委托价 */}
                <Form.Item name="lossTriggerPrice" noStyle>
                  <InputNumber
                    placeholder="请输入止损委托价"
                    className="spot_number_input"
                    suffix="USDT"
                    controls={false}
                  />
                </Form.Item>
                {/* 委托数量 */}
                <Form.Item name="size" noStyle>
                  <InputNumber
                    placeholder="请输入委托数量"
                    className="spot_number_input"
                    suffix="USDT"
                    controls={false}
                  />
                </Form.Item>
              </Flex>
            </Form>}
            <div className="mt-[12px]">
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
            </div>
            {/* 可平仓位 */}
            <div className="text-[14px] text-[var(--text-color6)] mt-[-12px]">
              可平仓位：63.19 USDT
            </div>
          </div>
          <button
            type="button"
            className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mt-[30px] rounded-[25px]
              bg-[var(--theme-color)] text-[var(--text-color5)]
            `}
          >{t('tradingSettings.confirm')}</button>
        </div>
			</ConfigProvider>
		)
	}

const TakeProfitPopup:React.FC<Props> = ({open, onCancel, onConfirm}) => {
	const {t} = useLanguage('contract');

	return (
		<Popup
			visible={open}
			onClose={onCancel}
			closeOnMaskClick
			destroyOnClose
			position="bottom"
			bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
			bodyClassName={`!h-auto max-h-[90dvh] !bg-[var(--background17)] !text-[var(--text-color5)]`}
		>
			<p className="flex justify-between items-center h-[50px] text-[16px] font-medium px-4 border-b border-[var(--border-color6)]">
				<span>{t('tpsl')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default TakeProfitPopup;