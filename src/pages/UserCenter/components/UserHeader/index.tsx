import React, { useState } from 'react';
import './index.scss';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon'
import MenuPopup from './MenuPopup';
import { ReactComponent as AssetsSvg } from '@/assets/icons/userCenter/wallet.svg';
import { ReactComponent as IdentitySvg } from '@/assets/icons/userCenter/idcard-line.svg';
import { ReactComponent as InviteSvg } from '@/assets/icons/userCenter/invite.svg';
import { ReactComponent as OrderSvg} from '@/assets/icons/userCenter/order.svg';

interface UserHeaderProps {
  title: string;
}
type IconType = string | React.ReactNode;

const UserHeader: React.FC<UserHeaderProps> = ({ title }) => {
  const { t } = useLanguage(['userCenter', 'common']);
  const [ menuVisible, setMenuVisible ] = useState(false);
  const iconMap: Record<string, IconType> = {
    [t('safeCenter.overView')]: 'pixelarticons:dashboard',
    [t('header.notice.assets')]: <AssetsSvg className="w-[24px] h-[24px] mr-[18px]" />,
    [t('trade.orders')]: <OrderSvg className="w-[24px] h-[24px] mr-[18px]" />,
    [t('safeCenter.security')]: 'mingcute:safety-certificate-line',
    [t('safeCenter.identity')]: <IdentitySvg className="w-[24px] h-[24px] mr-[18px]" />,
    [t('router.inviteFriend')]: <InviteSvg className="w-[24px] h-[24px] mr-[18px]" />,
    [t('safeCenter.account')]: 'icon-park-outline:setting-two',
  };

  return (
    <div className="user-header" onClick={() => setMenuVisible(true)}>
      <div className="user-header-left">
        {typeof iconMap[title] === 'string' && iconMap[title]  ? (
          <Iconify icon={iconMap[title] as string} className="left-icon" />
        ) : (
          iconMap[title]
        )}
        <span>{ title }</span>
      </div>
      <Iconify icon="icon-park-outline:down" className="right-icon"/>
      <MenuPopup visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </div>
  );
};

export default UserHeader;
