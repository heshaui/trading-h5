import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks';
import { observer } from 'mobx-react-lite';

import { ReactComponent as SettingIcon } from '@/assets/images/exchange/icon_settings.svg';
import { ReactComponent as StarHoverIcon } from '@/assets/images/exchange/icon_star_hover.svg';

const ContractHeader: React.FC = observer(() => {
	const { t } = useLanguage('contract');
	return (
		<>
			<div>
				
			</div>
		</>
	)
});

export default ContractHeader;