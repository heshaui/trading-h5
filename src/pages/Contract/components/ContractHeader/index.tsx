import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks';
import { observer } from 'mobx-react-lite';

const ContractHeader: React.FC = observer(() => {
	const { t } = useLanguage('contract');
	return (
		<></>
	)
});

export default ContractHeader;