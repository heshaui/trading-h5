import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
// import styles from './index.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import { AssetsLayout } from '@/components/MenuItems';
import styles from '../styles/toUp.module.scss'
import { Image } from 'antd-mobile'
import nosmPic from '@/assets/images/assets/icon_nosm_2.png'

const Deposit: React.FC = observer(() => {
  const { t } = useLanguage('assets');

  return (
    <div className={``}>
      <div className={`${styles.card_box}`}>
        <div className={`${styles.card_bgc2} w-full mb-10 flex-x justify-between align-center`}>
          <div className={`flex-y align-center ${styles.card_content}`}>
            <Image src={nosmPic}
              alt="logo" width={80} height={74} className={`${styles.icon_sm} mr-6`} />
            <p className='flex-y'>
              <span className={` font-w-500 font-18`}>
                {/* 充值功能暂不可用 */}
                {t('assetsAccount.button.topuptip1')}
              </span>
              <span className={`${styles.tip_color} font-w-400 font-14 mt-1`}>
                {/* 交易所充值功能暂不可用，如有问题请与客服联系！ */}
                {t('assetsAccount.button.tip4')}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default AssetsLayout(Deposit);

