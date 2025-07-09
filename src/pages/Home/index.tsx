import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './index.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import Experience from './components/experience_1/experience';
import Deal from './components/deal_2/deal';
import Try from './components/try_3/try';
import Assistant from './components/assistant_4/assistant';
import ComeUp from './components/comeUp_5/comeUp';
import Questions from './components/questions_6/questions';
const Home:React.FC = observer(() => {
  const { t } = useLanguage();

  return (
    <>
      <Experience />
      <Deal />
      <Try />
      <Assistant />
      <ComeUp />
      <Questions />
    </>
  )
})

export default Home;

export const meta = {
	requireAuth: false
}