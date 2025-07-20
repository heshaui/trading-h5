import React, { useState, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles/content.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import {AssetsLayout} from '@/components/MenuItems';
import { Iconify } from "@/components/icon"
import { useNavigate } from 'react-router-dom';

interface ContentLayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  rightAction?: {
    icon?: string;
    text?: string;
    onClick: () => void;
  };
  footer?: ReactNode;
  showBackButton?: boolean;
  className?: string;
  titleClassName?: string;
  footerClassName?: string;
}

const ContentLayout: React.FC<ContentLayoutProps> = observer(({
  children,
  title,
  onBack,
  rightAction,
  footer,
  showBackButton = true,
  className = '',
  titleClassName = '',
  footerClassName 
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`${styles.layout_wrapper} ${className}`}>
      {/* Header */}
      <div className={styles.user_header}>
        {/* 返回按钮 */}
        {showBackButton && (
          <button onClick={handleGoBack} className={styles.back_button}>
            <Iconify icon="teenyicons:left-outline" className={`${styles.left_icon} left-icon ${titleClassName}`} />
          </button>
        )}
        
        {/* 标题容器 */}
        <div className={`flex-1 flex-x-cc ${showBackButton ? 'pr-3' : ''}`}>
          <span className={`${showBackButton ? 'ml-4' : ''} ${styles.header_title}`}>
            {title || t('assets.withdrawDetail')}
          </span>
        </div>

        {/* 右侧操作按钮 */}
        
          <div className={styles.right_action}>
          {rightAction && ( <button 
              className={styles.action_button}
              onClick={rightAction.onClick}
            >
              {rightAction.icon && (
                <Iconify 
                  icon={rightAction.icon} 
                  size={20} 
                  className={styles.action_icon}
                />
              )}
              {rightAction.text && (
                <span className={styles.action_text}>{rightAction.text}</span>
              )}
            </button>)}
          </div>
        
      </div>

      {/* 内容区域 */}
      <div className={styles.content_box}>
        {children}
      </div>

      {/* Footer - 只有在有内容时才显示 */}
      {footer && (
        <div className={`${styles.content_footer} ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  )
})

export default ContentLayout;

