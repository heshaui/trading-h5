import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { Iconify } from "@/components/icon"
import { useLanguage } from '@/hooks/useLanguage';
import { Image, Toast } from 'antd-mobile';

import success_part_day from '@/assets/images/spot/spotOrder/success_part_day.svg'
import success_part_dark from '@/assets/images/spot/spotOrder/success_part_dark.svg'
import success_all_dark from '@/assets/images/spot/spotOrder/success_all_dark.svg'
import success_all_day from '@/assets/images/spot/spotOrder/success_all_day.svg'
import fail_day from '@/assets/images/spot/spotOrder/fail_day.svg'
import fail_dark from '@/assets/images/spot/spotOrder/fail_dark.svg'
import error_day from '@/assets/images/spot/spotOrder/error_day.svg'
import error_dark from '@/assets/images/spot/spotOrder/error_dark.svg'

const OrderDetail = () => {
	const {t} = useLanguage('contract');
	const 

	return (
		<>
			<h3 className="pl-4 text-[16px] h-[44px] flex items-center font-medium" onClick={() => navigate(-1)}>
				<Iconify icon="icon-park-outline:left" className="text-[24px]"/>
				<span className="ml-1">{ t('futureAccount.fundFlow') }</span>
			</h3>
		</>
	)
}


export const meta = {
  requireAuth: true,
  layout: 'header-only'
}
export default OrderDetail;