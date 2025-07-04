import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './index.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import Experience from './components/experience_1/experience';

const Home:React.FC = observer(() => {
  const { t } = useLanguage();

  return (
    <>
      <Experience />
    </>
  )
})

export default Home;