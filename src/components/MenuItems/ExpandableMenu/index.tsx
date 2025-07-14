import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DownOutline } from 'antd-mobile-icons';
import { Image } from 'antd-mobile';
import styles from '../styles/ExpandableMenu.module.scss';
import ThemeToggle from '@/components/ThemeToggle';

// 定义菜单项的类型
export interface MenuItemType {
    title: string;
    icon?: string;
    children?: MenuItemType[];
    key: string;
    type?: string;
    onClick?: () => void;
}

interface ExpandableMenuProps {
    menuItems: MenuItemType[];
    onItemClick?: (item: MenuItemType) => void;
}

const ExpandableMenu: React.FC<ExpandableMenuProps> = observer(({ menuItems, onItemClick }) => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    // 切换展开状态
    const toggleExpand = (key: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // 处理菜单项点击
    const handleItemClick = (item: MenuItemType) => {
        if (item.children && item.children.length > 0) {
            // 如果有子项，切换展开状态
            toggleExpand(item.key);
        } else {
            // 如果没有子项，执行点击事件
            if (item.onClick) {
                item.onClick();
            }
            if (onItemClick) {
                onItemClick(item);
            }
        }
    };

    // 渲染菜单项
    const renderMenuItem = (item: MenuItemType, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems[item.key];

        return (<div key={item.key} className={`${styles.menuItem} ${level > 0 ? styles.childItem : ''}`}>
            {item.type === 'theme' ? <button className={`flex-x algin-center justify-between px-4 py-2 w-full`} >
                <span className={`${styles.menuTitle} ${styles.title_color} flex-x algin-center justify-between`}>
                    {item.title}
                </span>
                <ThemeToggle />
            </button> :
                item.type === 'lang' ? <button className={`flex-x algin-center justify-between px-4 py-2 w-full`}
                onClick={() => handleItemClick(item)}>
                    <span className={`${styles.menuTitle} ${styles.title_color} flex-x algin-center flex-1`}>
                        {item.title}
                    </span>
                    {/* <LanguageToggle /> */}
                </button> : <>
                    <button
                        className={`${styles.menuButton} flex-x algin-center justify-between ${level > 0 ? styles.childButton : ''}`}
                        onClick={() => handleItemClick(item)}
                    >
                        <div className={`${styles.menuContent} ${level > 0 ? styles.childContent : ''}`}>
                            {item.icon && (
                                <div className={styles.iconWrapper}>
                                    <Image
                                        src={item.icon}
                                        alt={item.title}
                                        width={20}
                                        height={20}
                                    />
                                </div>
                            )}
                            <span className={`${styles.menuTitle} ${level > 0 ? styles.childTitle : ''}`}>
                                {item.title}
                            </span>
                            {hasChildren && (
                                <div className={styles.arrowWrapper}>
                                    <DownOutline
                                        color="var(--text-color5)"
                                        style={{
                                            transition: 'transform 0.3s ease',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </button>

                    {hasChildren && (
                        <div
                            className={`${styles.childrenContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}
                        >
                            <div className={styles.childrenWrapper}>
                                {item.children!.map((childItem) => renderMenuItem(childItem, level + 1))}
                            </div>
                        </div>
                    )}
                </>}
        </div>
        );
    };

    return (
        <div className={styles.expandableMenu}>
            {menuItems.map((item) => renderMenuItem(item))}
        </div>
    );
});

export default ExpandableMenu; 