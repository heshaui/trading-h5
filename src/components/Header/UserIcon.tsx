import React, { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles/Popup.module.scss';
import { useThemeMode } from '@/hooks/useThemeMode';
import userDay from '@/assets/icons/public/icon_user_day.png';
import userDark from '@/assets/icons/public/icon_user_dark.png';
import { Image, Popup } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { CloseOutline } from 'antd-mobile-icons';
import { NoData } from '@/components/noData';
import userInfoDay from '@/assets/images/public/icon_userInfo_day.png';
import userInfoDark from '@/assets/images/public/icon_userInfo_dark.png';
import appStore from '@/store';
import { encryptString } from '@/utils/encrypt';
import { useLocation, useNavigate } from 'react-router-dom';
import { Iconify } from '../icon';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
// import { ReactComponent as DownSvg } from '@/assets/icons/public/icon_down.svg';
import { ReactComponent as CloseSvg } from '@/assets/icons/public/icon_close.svg';

interface ChildrenItem {
    key: string;
    title: string;
    value: string;
    onClick?: () => void;
}
interface ListItem {
    key: string;
    title: string;
    value: string;
    children?: ChildrenItem [];
    onClick?: () => void;
}

const UserIcon: React.FC = observer(() => {
    const { t } = useLanguage(['common', 'assets', 'spot', 'contract']);
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const { isDayMode } = useThemeMode();
    const userInfo = appStore.getUserInfo() || appStore.userInfo;
    const kvConfig = appStore.getKvConfigAll();
    const location = useLocation();
    const currentPath = location.pathname;
    const token = appStore.getToken();
    const { copyFn } = useCopyToClipboard();
    const handleUserClick = () => {
        // 处理用户图标点击事件
        setVisible(true)
    };
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    
    // 切换展开状态
    const toggleExpand = (key: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };
    const UserCenterList = [
        {
            key: '/overView',
            title: t('common.router.overview'),//'总览',
            value: '/userCenter', // 跳转路径
            
        },
        {
            title: t('header.notice.assets'),
            key: '/assets',
            value: '/assets',
            isShow: false,
            children: [
                {
                    title: t('assets:assets.assetsAccount'), // 现货账单
                    key: '/assets',
                    value: '/assets',
                },
                {
                    key: '/contractAssets', 
                    value: '/contractAssets', 
                    title: t('assets:assets.futureAccount'), //'合约账户',
                }
            ]
        },
        {
            title: t('trade.orders'),
            key: '/spotOrder',
            value: '/spotOrder',
            isShow: false,
            children: [
                {
                    title: t('spot:spot.spotOrder'), // 现货账单
                    key: '/spotOrder',
                    value: '/spotOrder',
                },
                {
                    key: '/contractOrder', //'/spot/assets',
                    value: '/contractOrder',
                    title: t('contract:order.title'), //'合约订单',
                },
                {
                    title: t('assets:assets.billDetails'), // 账户明细
                    key: '/assets/bill',
                    value: '/assets/bill',
                },
            ]
        },
        {
            key: '/security',
            title: t('common.router.security'),//'安全认证',
            value: '/userCenter/security', // 跳转路径
           
        },
        {
            key: '/identity',
            title: t('common.router.identity'),//'身份认证',
            value: '/userCenter/identity', // 跳转路径
            
        },
        {
            key: '/invite',
            title: t('common.router.inviteFriend'),//'邀请好友',
            value: '/invite', // 跳转路径
           
        },
        {
            key: '/setting',
            title: t('common.router.setting'),//'设置',
            value: '/userCenter/setting', // 跳转路径
            
        },
    ]
    const userCenterList = useMemo(() => {
        return UserCenterList.filter(item => {
            if ((kvConfig?.account_configuration && kvConfig?.account_configuration === '0')||!token) {
                return item.key !== '/invite'
            }
            return true
        });
    }, [kvConfig?.account_configuration, currentPath,token]);

    useEffect(() => {
        UserCenterList.forEach(item => {
            if (item.children?.some(child => child.value === currentPath)) {
            setExpandedItems(prev => ({ ...prev, [item.key]: true }));
            }
        });
    }, [currentPath]);
    const ListComponent = (list: ListItem[], currentValue?: string) => {
        if (list.length === 0) {
            return <NoData className={`mt-5`} />
        }

        return list.map((item) => {
            // 简化活跃状态判断：只进行直接比较
            let isActive = currentValue === item.value;
            const isShow = expandedItems[item.key];
            return (
                <li key={item.value || item.key}
                    className="">
                    {
                        item.children ? <div className="flex pl-[12px] h-[44px] items-center text-[16px] text-[var(--text-color5)] justify-between" onClick={() => toggleExpand(item.key)}>
                            <span>{item.title}</span>
                            <Iconify icon={isShow ? 'icon-park-outline:up' : 'icon-park-outline:down'} className="text-[24px] text-[var(--text-color5)]"/>
                        </div> :
                        <button
                            className={`flex h-[44px] pl-[12px] items-center text-[16px] text-[var(--text-color5)] ${isActive ? styles.active : ''} ${styles.title_color} ${isActive ? 'font-w-500' : 'font-w-400'} w-full`}
                            onClick={()=>{
                                item?.onClick&&item?.onClick?.()
                                navigate(item.value)
                                setVisible(false)
                            }} >

                            {item.title}
                        </button>
                    }
                    {
                        item.children && isShow && <ul className="pl-[14px]">
                            {
                                item.children.map(child => {
                                    const isChildActive = currentValue === child.value
                                    return (
                                        <li className={`tip-color h-[44px] pl-[12px] text-[14px] flex items-center ${isChildActive ? styles.active : ''}`}
                                        onClick={() => {
                                            navigate(child.value)
                                            setVisible(false)
                                        }}
                                        >{child.title}</li>
                                    )
                                })
                            }
                        </ul>
                    }
                </li>
            )
        })
    }
    const loginOut = () => {
        // setVisible(false)
        appStore.clearUserInfo()
        appStore.clearToken()
        navigate('/login')
        setVisible(false)
    }
    return (<>
        <button
            className={styles.iconButton}
            onClick={handleUserClick}
            aria-label="user"
        >
            <Image
                src={isDayMode ? userDay : userDark}
                alt="user"
                className="!w-[20px] !h-[20px]"
            />
            {/* <UserOutline fontSize={24} color="#FFFFFF" /> */}
        </button>
        <Popup
            visible={visible}
            onClose={() => setVisible(false)}
            // destroyOnClose
            closeOnMaskClick
            position='left'
            bodyStyle={{ width: '100vw' }}
            bodyClassName={`${styles.userCenterPopContainer} safe-py`}
        >
            <div >
                <div className={`flex-x algin-center justify-end w-full`}>
                    <button onClick={() => {
                        setVisible(false);
                    }}
                        className={styles.tip_color}
                    >
                         <CloseSvg fontSize={24} className={`w-[14px] h-[14px] ${styles.title_color}`} />
                    </button>
                </div>
                {token?<div className='pt-4'>
                    <div className={`${styles.userInfoHeader} flex-x algin-center`}>
                        <div className='flex-x-cc'>
                            <Image src={userInfo?.avatarUrl ? userInfo?.avatarUrl :
                                isDayMode ? userInfoDay : userInfoDark} alt="user" width={32} height={32}
                                style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        </div>

                        <div className='flex-y ml-2_5'>
                            <span className={`${styles.title_color} font-16 font-w-500`}>
                                {userInfo?.email ? encryptString(userInfo?.email) :
                                    userInfo?.phone ? encryptString(userInfo?.phone) :
                                        userInfo?.registerAccount ? encryptString(userInfo?.registerAccount) :'--'}
                            </span>
                            <div className={`${styles.tip_color} font-14 font-w-400 flex-x algin-center justify-start`}>
                                UID：{userInfo?.userId || '--'}
                                <button onClick={()=>{
                                    copyFn(userInfo?.userId)
                                }}>
                                    <Iconify icon="icon-park-solid:copy" className={`ml-2 ${styles.copy_icon}`} size={14} /> 
                                </button>
                               
                                </div>
                        </div>
                    </div>
                    <ul className='mt-4'>
                        {ListComponent(userCenterList, currentPath)}
                        <li className={`${styles.listItem} ${styles.logoutItem}`}>
                            <button
                                className={`${styles.listButton} ${styles.title_color} font-16  w-full text-left`}
                                onClick={loginOut} >

                                {t('btnText.logout')}
                            </button>
                        </li>
                        {/* <li className={`${styles.listItem} ${styles.logoutItem}`}>
                            <button
                                className={`${styles.listButton} ${styles.title_color} font-16  w-full text-left`}
                                onClick={()=>{
                                    navigate('/login')
                                }} >

                                {t('btnText.login')}
                            </button>
                        </li> */}
                    </ul>
                    
                </div>:<div className='pt-4 flex-x-cc h-max'>
                            <button
                                className={`${styles.loginBtn} cancel_btn2 font-16 mr-3 flex-1 flex-x-cc`}
                                onClick={()=>{
                                    navigate('/register')
                                    setVisible(false)
                                }} >

                                {t('btnText.register')}
                            </button>
                            <button
                                className={`${styles.loginBtn} btn-color font-16  flex-1 flex-x-cc`}
                                onClick={()=>{
                                    navigate('/login')
                                    setVisible(false)
                                }} >

                                {t('btnText.login')}
                            </button>
                </div>
                }
            </div>
        </Popup>
    </>
    )
})

export default UserIcon;