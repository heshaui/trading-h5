import React, { useState ,useEffect} from 'react';
import { observer } from 'mobx-react-lite';
import styles from '../styles/bill.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import {UserCenterLayout} from '@/components/MenuItems';
import { CustomTab } from '@/components/CustomCom';
import { getCoinAll } from "@/services/assets";
import RechargeTable from '../components/billTable/rechargeTable';
import WithdrawTable from '../components/billTable/withdrawtTable';
import InvitationRewardTable from '../components/billTable/inviteTable';
import GiftTable from '../components/billTable/giftTable';
import { useLocation } from 'react-router-dom';

const Deposit:React.FC = observer(() => {
  const { t } = useLanguage('assets');
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('RECHARGE');
  const [coinSelect, setCoinSelect] = useState<any[]>([]);
	const items = [
		{
			key: 'RECHARGE',
			label: t("billDetails.recharge"), //'充值',
      children: <RechargeTable 
        coinSelect={coinSelect}
      />,
		},
		{
			key: 'WITHDRAW',
			label:  t("billDetails.withdraw"), //'提现',
      children: <WithdrawTable 
        coinSelect={coinSelect}
      />,
		},
		{
			key: 'REBATE',
			label:  t("billDetails.rebate"), //'返佣',
      children: <InvitationRewardTable 
        coinSelect={coinSelect}
      />,
		},
    {
			key: 'GIFT',
			label: t("billDetails.gift"), //'赠币',
      children: <GiftTable 
        coinSelect={coinSelect}
      />,
		},
	];

  // 处理tab切换
	const handleTabChange = (key: string) => {
		setActiveTab(key);
	};

  // 处理从detail页面返回时的tab切换
  useEffect(() => {
    // 检查是否从detail页面返回
    if (location.state?.fromDetail && location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // 清理state，避免重复触发
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.state]);

  const getCoinAllData = async () => {
    try {
      const res = await getCoinAll();
      if (res.code === "0") {
        const coinList = res.data
          .map((item: any) => ({
            label:`${item.coinName}`,
            value: item.coinName,
            coinId: item.coinId,
            coinName: item.coinName,
            nameDefault: item.nameDefault,
            iconUrl: item.iconUrl,
            sort: item.sort,
          }))
          .sort((a: any, b: any) => {
            return a.sort - b.sort;
          });

        setCoinSelect(coinList);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getCoinAllData();
  }, []);


  return (
    <div className={``}>
      <CustomTab
				tabsItems={items}
				className={`${styles.customTabs} `}
				direction='ltr'
				stretch={false}
				activeLineMode='fixed'
        activeKey={activeTab}
				onChange={handleTabChange}
        style={{
          '--content-padding': '20px',
          '--fixed-active-line-width':'14px'
        }}
			/>
    </div>
  )
})

export default UserCenterLayout(Deposit);

