import React, {useState, useEffect, useMemo} from 'react';
import {Popup} from 'antd-mobile';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks';
import { Modal, Button, message } from 'antd';
import styles from './styles.module.css';
import { marginModelEdit } from '@/services/contract';
import appStore from '@/store';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentMode: 1 | 2;
  onModeChange: (mode: 1 | 2) => void;
  symbol?: string;
};

const MarginModePopup:React.FC<Props> = ({
  visible,
  onClose,
  currentMode,
  onModeChange,
  symbol = 'BTCUSDT'
}) => {
	const {t} = useLanguage('contract');

	const [selectedMode, setSelectedMode] = React.useState<1 | 2>(2); // 默认选择逐仓
  const { currentContractInfo } = appStore;
  const handleConfirm = async () => {

    onClose();
    const res = await marginModelEdit({
      marginModel: selectedMode,
      contractId: currentContractInfo.id,
    });
    console.log(res);
    if (res.code === '0') {
      onModeChange(selectedMode);
      onClose();
      message.success(t('marginMode.settingSuccess'));
    } else {
      message.error(res.msg);
    }
  };

	const PopupContent = () => {
		return (
			<div>
				<div className={styles.modeSelector}>
          <div className={`${styles.slideIndicator} ${selectedMode === 2 ? styles.slideRight : styles.slideLeft}`}></div>
          <div
            className={`${styles.modeTab} ${selectedMode === 1 ? styles.activeTab : ''}`}
            onClick={() => setSelectedMode(1)}
          >
            {t('crossMargin')}
          </div>
          <div
            className={`${styles.modeTab} ${selectedMode === 2 ? styles.activeTab : ''}`}
            onClick={() => setSelectedMode(2)}
          >
            {t('isolatedMargin')}
          </div>
        </div>

        {selectedMode === 2 && (
          <div className={styles.modeDescription}>
            {t('marginMode.isolatedDescription')}
          </div>
        )}
        {
          selectedMode === 1 && (
            <div className={styles.modeDescription}>
              {t('marginMode.crossDescription')}
            </div>
          )
        }

        <div className={styles.confirmButton}>
          <Button
            type='primary'
            size='large'
            shape='round'
            onClick={handleConfirm}
            className={styles.confirmBtn}
          >
            {t('marginMode.setTo', { mode: selectedMode === 1 ? t('crossMargin') : t('isolatedMargin') })}
          </Button>
        </div>
			</div>
		)
	}

	return (
		<Popup
			visible={visible}
			onClose={onClose}
			closeOnMaskClick
			destroyOnClose
			position="bottom"
			bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
			bodyClassName={`!h-auto !bg-[var(--background17)] !text-[var(--text-color5)]`}
		>
			<p className="flex justify-between items-center h-[50px] text-[16px] font-medium px-4 border-b border-[var(--border-color6)]">
				<span>{symbol}{t('marginMode.title')}</span>
				<Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onClose} />
			</p>
			<PopupContent />
		</Popup>
	)
}

export default MarginModePopup;