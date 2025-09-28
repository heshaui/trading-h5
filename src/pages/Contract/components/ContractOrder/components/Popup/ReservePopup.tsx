import React, {useState, useEffect} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import appStore from "@/store";
import { Side, SideMap, PositionTypeMap } from '../../configs/columns';
import { Position as PositionType } from "../../hooks";
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

import { ReactComponent as UpIcon } from '@/assets/images/order_book/up.svg';
import { ReactComponent as DownIcon } from '@/assets/images/order_book/down.svg';

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentData: PositionType;
};

const ReservePopup:React.FC<Props> = ({open, onCancel, onConfirm, currentData}) => {
	const {t} = useLanguage('contract');
  // 获取当前合约信息
  const currentContractInfo = appStore.getCurrentContractInfo();
  const currentSymbol = currentContractInfo?.symbol || "";
  const symbolPricePrecision = currentContractInfo?.coinResultVo?.symbolPricePrecision;
  const [checked, setChecked] = useState(false);

  const PopupContent = () => {
		return (
			<div className="px-[20px] pt-[16px] pb-[20px]">
          {/* titile */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-[2px]">
              <div className="text-[14px] text-[var(--text-color5)] font-[500]">
                {currentData?.symbol}
              </div>
              <div className="text-[12px] font-[400] flex gap-[4px]">
                <span className="h-[20px] px-[6px] text-[12px] font-medium bg-[var(--background14)] rounded-[4px] flex items-center mr-1">
                  {currentData ? t(PositionTypeMap[currentData?.positionType]) : ''}
                </span>
                <span
                  className={`h-[20px] px-[3px] flex items-center text-[14px] font-medium mr-2 rounded-[4px]
                    ${currentData?.orderSide === Side.BUY_CLOSE || currentData?.orderSide === Side.BUY_OPEN ? 'success_icon success_bg' : 'error_icon error_bg'}
                  `}
                >
                  {currentData ? t(SideMap[currentData?.orderSide]) : ''}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-[2px] text-[14px] font-[400]">
              <div className="text-[var(--text-color6)]">{t('reserveModal.lastPrice')}</div>
              <div className="text-[var(--text-color5)] text-right">{currentData ? new BigNumber(currentData?.indexPrice).toFormat(symbolPricePrecision) : '0'}</div>
            </div>
          </div>
          {/* top-box */}
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[16px_10px] mt-[18px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[14px] flex items-center">
                <div className="w-[2px] h-[10px] bg-[#00C788]"></div>
                <div className="font-[500] ml-[2px] mr-[4px]">{t('reserveModal.marketPriceAverage')}</div>
                <div className="font-[400] p-[1px_4px] bg-[#00C788] bg-opacity-20 rounded-[3px] text-[#00C788]">
                  {t('more')} {currentData?.leverageLevel}x
                </div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">{t('reserveModal.closeAmount')}</div>
                <div className="text-[var(--text-color5)]">595.27 USDT</div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">{t('price')}</div>
                <div className="text-[var(--text-color5)]">{t('marketOrder')}</div>
              </div>
            </div>
          </div>
          {/* transfer */}
          <div className="py-[7px] flex items-center">
            <div className="border-b border-dashed input-border flex-1"></div>
            <button
              className="shrink-0 m-w-[88px] h-[26px] px-[6px] mx-auto border border-solid input-border rounded-[4px] tip-color text-[14px] flex justify-center items-center"
            >
              <span className="mr-1">{t('reserveModal.reserveEmpty')}</span>
              <DownIcon />
            </button>
            <div className="border-b border-dashed input-border flex-1"></div>
          </div>
          {/* bottom-box */}
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[16px_10px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[14px] flex items-center">
                <div className="w-[2px] h-[10px] bg-[#FF4D4F]"></div>
                <div className="font-[500] ml-[2px] mr-[4px]">{t('reserveModal.marketPriceEmpty')}</div>
                <div className="font-[400] p-[1px_4px] bg-[#FF4D4F] bg-opacity-20 rounded-[3px] text-[#FF4D4F]">
                  {t('empty')} {currentData?.leverageLevel}x
                </div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">{t('reserveModal.marketPriceEmpty')}</div>
                <div className="text-[var(--text-color5)]">595.27 USDT</div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">{t('price')}</div>
                <div className="text-[var(--text-color5)]">{t('marketOrder')}</div>
              </div>
            </div>
          </div>
          {/* tips */}
          <div className="text-[12px] text-[var(--text-color4)] font-[400] mt-[10px]">
            <p className="leading-[17px]">
              *{t('reserveModal.tip1')}
            </p>
            <p className="leading-[17px]">{t('reserveModal.tip2')}</p>
            <p className="leading-[17px]">
              {t('reserveModal.tip3')}
            </p>
          </div>
          {/* checkbox */}
          <div className="mt-[20px]">
            <Checkbox className="custom-checkbox" checked={checked} onChange={() => setChecked(!checked)}>
              <div className="text-[14px] text-[var(--text-color5)] font-[400]">
                {t('reserveModal.tip4')}
              </div>
            </Checkbox>
          </div>
          <button
            type="button"
            className={`h-[50px] w-full flex justify-center items-center text-[14px] font-medium mt-[30px] rounded-[25px]
              bg-[var(--theme-color)] text-[var(--text-color5)]
            `}
          >{t('tradingSettings.confirm')}</button>
        </div>
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
				<span>{t('reverseOpen')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default ReservePopup;