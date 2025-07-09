import React from 'react';
import UserHeader from '../components/UserHeader';
import UserInfo from '../components/overview/UserInfo';
import Assets from '../components/overview/Assets'
import SafeLogPage from '../components/overview/SafeLogin';
import EquipmentPage from '../components/overview/Equipment';
import InvitePage from '../components/overview/Invite';
import './index.scss'
import { useLanguage } from '@/hooks/useLanguage';
import IdentifyStatus from '../components/overview/UserInfo/IdentifyStatus';

const Identity: React.FC = () => {
	const { t } = useLanguage('userCenter');
	return (
		<div>
			<UserHeader title={t('safeCenter.security')} />
			<div className="py-6 px-4 bg-[var(--btnbgcolor3)]">
				<h3 className="leading-7 text-[20px] font-medium mb-4">{ t('safeCenter.identity') }</h3>
				
                 <div className=''>
                    <div>标准身份认证  未认证</div>
                    <div className="text-[var(--text-color6)]">仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险</div>
                    <div>身份认证需要提供一下信息：</div>

                 </div>

                 <ul className=''>
                    <li>
                        <p>
                           <span>服务</span> 
                           <span>加密货币提现</span>
                        </p>
                        <p>
                           <span>尚未认证</span> 
                           <span> x </span>
                        </p>
                        <p>
                           <span>完成标准身份认证后</span> 
                           <span>50K USDT每日</span>
                        </p>
                        
                    </li>
                    <li>
                        <p>
                           <span>服务</span> 
                           <span>加密货币提现</span>
                        </p>
                        <p>
                           <span>尚未认证</span> 
                           <span> x </span>
                        </p>
                        <p>
                           <span>完成标准身份认证后</span> 
                           <span>50K USDT每日</span>
                        </p>
                        
                    </li>
                    <li>
                        <p>
                           <span>服务</span> 
                           <span>加密货币提现</span>
                        </p>
                        <p>
                           <span>尚未认证</span> 
                           <span> x </span>
                        </p>
                        <p>
                           <span>完成标准身份认证后</span> 
                           <span>50K USDT每日</span>
                        </p>
                        
                    </li>
                 </ul> 


			</div>
		</div>
	);
};

export default Identity;