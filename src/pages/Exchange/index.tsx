import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
// import styles from './index.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import {AssetsLayout} from '@/components/MenuItems';


const Deposit:React.FC = observer(() => {
  const { t } = useLanguage();

  return (
    <div className={``}>
      deposit
    </div>
  )
})

export default AssetsLayout(Deposit);

