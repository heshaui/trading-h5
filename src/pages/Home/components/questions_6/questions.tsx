import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/questions.module.scss';
// import { Collapse } from "antd";
// import type { CollapseProps } from 'antd';
// import type { CSSProperties } from 'react';
// import { useTranslation } from 'next-i18next';
// import { Iconify } from '@/components/icon';
import { Image, Collapse } from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';
import { autoConvertLangCode } from '@/utils/stringMap';
import { Iconify } from '@/components/icon';

export default function Questions() {
    const { t } = useLanguage();
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // 切换面板展开状态
    const togglePanel = (key: string) => {
        if (activeKeys.includes(key)) {
            setActiveKeys(activeKeys.filter(k => k !== key));
        } else {
            setActiveKeys([...activeKeys, key]);
        }
    };

    // 获取内容高度
    const getContentHeight = (key: string) => {
        const element = contentRefs.current[key];
        if (element) {
            return element.scrollHeight;
        }
        return 0;
    };

    // const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    const getItems = [
        {
            key: '1',
            label: t('questionsTip1', { ns: 'home' }), //'IMBIT都提供哪些产品'
            children: <p>{t('text1', { ns: 'home' })}</p>,
            // style: panelStyle,
            showArrow: false, //隐藏组件的箭头图标
            extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />
        },
        {
            key: '2',
            label: t('questionsTip2', { ns: 'home' }),//'如何通过IMBIT平台购买比特币？',
            children: <p>{t('text2', { ns: 'home' })}</p>,
            // style: panelStyle,
            showArrow: false,
            extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />
        },
        {
            key: '3',
            label: t('questionsTip3', { ns: 'home' }),//'美国公民可以使用IMBIT吗？',
            children: <p>{t('text3', { ns: 'home' })}</p>,
            // style: panelStyle,
            showArrow: false,
            extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />

        },
        {
            key: '4',
            label: t('questionsTip4', { ns: 'home' }),//'什么是数字货币？',
            children: <p>{t('text4', { ns: 'home' })}</p>,
            // style: panelStyle,
            showArrow: false,
            extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />

        },
    ];

    return (
        <div className={`${styles.questions_page}`}>
            <div className={`${styles.questions_main} flex-column flex-ai-center flex-jc-center`}>
                <h2 className={`${styles.questions_main_title1}`}>{t('questionsTitle', { ns: 'home' })}</h2>
                <div className={`${styles.main_questions_box}`}>
                    {getItems.map((item) => {
                        const isActive = activeKeys.includes(item.key);
                        const contentHeight = isActive ? getContentHeight(item.key) : 0;
                        
                        return (
                            <div key={item.key} className={`${styles.collapse_item} ${isActive ? styles.active : ''}`}>
                                <div 
                                    className={`${styles.collapse_header}`}
                                    onClick={() => togglePanel(item.key)}
                                >
                                    <span className={`${styles.collapse_title}`}>{item.label}</span>
                                    <div className={`${styles.collapse_icon} `}>
                                    {/* ${isActive ? styles.rotate : ''} */}
                                        <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />
                                    </div>
                                </div>
                                <div 
                                    className={`${styles.collapse_content} ${isActive ? styles.expanded : ''}`}
                                    style={{ maxHeight: isActive ? `${contentHeight}px` : '0px' }}
                                >
                                    <div 
                                        className={`${styles.collapse_content_inner}`}
                                        ref={(el) => {
                                            contentRefs.current[item.key] = el;
                                        }}
                                    >
                                        {item.children}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
