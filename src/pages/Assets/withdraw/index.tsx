import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
// import styles from './index.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import {AssetsLayout} from '@/components/MenuItems';


const Withdraw:React.FC = observer(() => {
  const { t } = useLanguage();

  return (
    <div className={``}>
      withdraw
    </div>
  )
})

export default AssetsLayout(Withdraw);

