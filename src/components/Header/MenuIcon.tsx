import React, { useState,useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles/Popup.module.scss';
import { useThemeMode } from '@/hooks/useThemeMode';
import menuDay from '@/assets/icons/public/icon_menu_day.png';
import menuDark from '@/assets/icons/public/icon_menu_dark.png';
import userDay from '@/assets/icons/public/icon_user_day.png';
import { Image, Popup } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { ExpandableMenu, MenuItemType } from '@/components/MenuItems';
import { useTranslation } from "react-i18next";
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '@/components/LanguageToggle';
import appStore from '@/store';

const MenuIcon: React.FC = observer(() => {
	// const { t } = useTranslation("common");
    const { t ,currentLanguage} = useLanguage();
    const navigate = useNavigate();

    const { isDayMode } = useThemeMode();
    const [visible, setVisible] = useState(false);
    const [languageVisible, setLanguageVisible] = useState(false);
    const [languageTitle, setLanguageTitle] = useState<string>('');
    
    const handleMenuClick = () => {
        // 处理菜单图标点击事件
        setVisible(true);
    };

    // 处理语言变化的回调函数
    const handleLanguageChange = (language: string, rateKey: string) => {
        // 这里可以根据需要格式化显示的标题
        // 例如：显示语言名称和汇率信息
        const langList = appStore.getLangList() || appStore.languageList;
        const rateList = appStore.getRateData() || appStore.rateData;
        
        const langInfo = langList.find(item => item.shortKey === language || item.langEncode === language);
        const rateInfo = rateList.find(item => item.key === rateKey);
        
        const langName = langInfo?.span || language;
        const rateName = rateInfo?.name || rateKey;
        
        setLanguageTitle(`${langName} / ${rateName}`);
    };

    // 初始化语言标题
    useEffect(() => {
        handleLanguageChange(currentLanguage, appStore.getRateKey());
    }, [currentLanguage]);

    // 菜单数据
    const menuItems: MenuItemType[] = [
        {
            key: 'market',
            title: t('common.router.market'), // 市场 t('assets.assetsAccount',{ns:'assets'}),//
        },
        {
            key: 'trading',
            title: t('common.router.transaction'), //'交易',
            // icon: menuDay,
            children: [
                {
                    key: 'spot',
                    title: t('common.router.spot'), //'现货',
                    onClick: () => {
                        console.log('现货交易点击');
                        setVisible(false);
                        // 手动延时跳转，优化体验
                        setTimeout(() => {
                            navigate('/exchange');
                        }, 300)
                        
                    }
                },
                {
                    key: 'flash',
                    title: t('common.router.flash'),//'闪兑',
                    onClick: () => {
                        console.log('期货交易点击');
                        // setVisible(false);
                    }
                },
                {
                    key: 'futures',
                    title: t('common.router.futures'),//'合约',
                    onClick: () => {
                        console.log('期货交易点击');
                        // setVisible(false);
                    }
                }
            ]
        },

        {
            key: 'finance',
            title: t('common.router.finance'),//'理财',
            // icon: userDay,
        },
        {
            key: 'theme',
            title: t('common.router.theme'),//'主题模式',
            type: 'theme',
            // icon: userDay,
        },
        {
            key: 'language',
            title: languageTitle || t('common.router.language'),// '语言',
            type: 'lang',
            // icon: userDay,
            onClick: () => {
                setLanguageVisible(true);
            }
        }
    ];
    const filterMenuItems =useMemo(()=>{
            return menuItems;
    },[menuItems,currentLanguage]);

    // 处理菜单项点击
    const handleMenuItemClick = (item: MenuItemType) => {
        console.log('菜单项点击:', item);
        // 这里可以添加路由跳转或其他逻辑
    };
    return (<>
        <button
            className={styles.iconButton}
            onClick={handleMenuClick}
            aria-label="menu"
        >
            <Image
                src={isDayMode ? menuDay : menuDark}
                alt="menu"
                className="!w-[20px] !h-[20px]"
            />
        </button>
        <Popup
            visible={visible}
            onClose={() => setVisible(false)}
            // destroyOnClose
            closeOnMaskClick
            position='left'
            bodyStyle={{ width: '100vw' }}
            bodyClassName={`${styles.popContainer} safe-py`}
        >
            <div >
                <div className={`${styles.pop_header} flex-x algin-center justify-end w-full`}>
                <button onClick={()=>{
                    setVisible(false);
                }}
                className={styles.tip_color}
                >
                    <CloseOutline fontSize={24} />
                </button>
                </div>
                <div className='pt-4'>
                    <ExpandableMenu 
                        menuItems={filterMenuItems}
                        onItemClick={handleMenuItemClick}
                    />
                </div>
                <LanguageToggle 
                isMenu={true}
                open={languageVisible} 
                onClose={() => setLanguageVisible(false)}
                onLanguageChange={handleLanguageChange} />
            </div>
        </Popup>
    </>
    )
})

export default MenuIcon;