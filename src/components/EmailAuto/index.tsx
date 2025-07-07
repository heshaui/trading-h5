import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { Form, Input } from 'antd-mobile';
import { Iconify } from "@/components/icon/index";
import { emailSuffixes } from "@/utils/enum";
import { useLanguage } from '@/hooks/useLanguage';
import { NoData } from "../noData";
import styles from './styles/emailAuto.module.scss';

interface EmailAutoProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  showHistory?: boolean; // 是否显示历史输入，默认为true
  maxHistoryCount?: number; // 最大历史记录数量，默认5条
  disabled?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

interface SuggestionItem {
  label: string;
  value: string;
  type: 'history' | 'suffix';
}

const EmailAutoComplete = forwardRef<any, EmailAutoProps>(({
  className,
  value = '',
  onChange,
  placeholder = 'Please enter email',
  showHistory = true,
  maxHistoryCount = 5,
  disabled = false,
  onBlur,
  onFocus
}, ref) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [historyEmails, setHistoryEmails] = useState<string[]>([]);
  const { t } = useLanguage();

  useImperativeHandle(ref, () => ({
    focus: () => {
      setIsFocused(true);
      setShowSuggestions(true);
    },
    blur: () => {
      setIsFocused(false);
      setShowSuggestions(false);
    },
    getValue: () => inputValue,
    setValue: (val: string) => {
      setInputValue(val);
      onChange?.(val);
    }
  }));

  // 当外部value变化时，更新内部状态
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // 初始化历史邮箱记录
  useEffect(() => {
    if (showHistory) {
      const storedEmails = localStorage.getItem('emailHistory');
      if (storedEmails) {
        try {
          const parsed = JSON.parse(storedEmails);
          setHistoryEmails(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error('Failed to parse email history:', error);
          setHistoryEmails([]);
        }
      }
    }
  }, [showHistory]);

  // 保存邮箱到历史记录
  const saveEmailToHistory = (email: string) => {
    if (!showHistory || !email || !email.includes('@')) return;
    
    const newHistory = [email, ...historyEmails.filter(item => item !== email)]
      .slice(0, maxHistoryCount);
    
    setHistoryEmails(newHistory);
    localStorage.setItem('emailHistory', JSON.stringify(newHistory));
  };

  // 生成建议列表
  const suggestions = useMemo((): SuggestionItem[] => {
    const result: SuggestionItem[] = [];

    // 如果输入为空且聚焦，显示历史记录
    if (!inputValue.trim() && isFocused && showHistory) {
      historyEmails.forEach(email => {
        result.push({
          label: email,
          value: email,
          type: 'history'
        });
      });
      return result;
    }

    // 如果输入不包含@，生成邮箱后缀建议
    if (inputValue && !inputValue.includes('@')) {
      emailSuffixes.forEach(suffix => {
        const suggestion = `${inputValue}@${suffix}`;
        result.push({
          label: suggestion,
          value: suggestion,
          type: 'suffix'
        });
      });
    }

    // 如果输入包含@但不完整，继续提供后缀建议
    if (inputValue && inputValue.includes('@')) {
      const [localPart, domainPart = ''] = inputValue.split('@');
      if (localPart && domainPart !== '') {
        const matchingSuffixes = emailSuffixes.filter(suffix => 
          suffix.toLowerCase().includes(domainPart.toLowerCase())
        );
        
        matchingSuffixes.forEach(suffix => {
          const suggestion = `${localPart}@${suffix}`;
          result.push({
            label: suggestion,
            value: suggestion,
            type: 'suffix'
          });
        });
      }
    }

    // 添加匹配的历史记录
    if (inputValue && showHistory) {
      const matchingHistory = historyEmails.filter(email =>
        email.toLowerCase().includes(inputValue.toLowerCase())
      );
      
      matchingHistory.forEach(email => {
        if (!result.some(item => item.value === email)) {
          result.push({
            label: email,
            value: email,
            type: 'history'
          });
        }
      });
    }

    return result //.slice(0, 8); // 最多显示8个建议
  }, [inputValue, historyEmails, isFocused, showHistory]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange?.(val);
    
    // 如果有输入内容或者聚焦时，显示建议
    if (val || isFocused) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    onFocus?.();
  };

  const handleInputBlur = () => {
    // 延迟隐藏建议，允许点击建议项
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      onBlur?.();
    }, 200);
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    setInputValue(suggestion.value);
    onChange?.(suggestion.value);
    setShowSuggestions(false);
    
    // 如果选择的是邮箱后缀建议，保存到历史
    if (suggestion.type === 'suffix') {
      saveEmailToHistory(suggestion.value);
    }
  };

  const handleInputComplete = () => {
    // 当输入完成时（失去焦点或回车），保存到历史
    if (inputValue && inputValue.includes('@')) {
      saveEmailToHistory(inputValue);
    }
  };

  const getSuggestionIcon = (type: 'history' | 'suffix') => {
    return type === 'history' 
      ? <Iconify icon="eva:clock-outline" size={16} className={styles.suggestionIcon} />
      : <Iconify icon="eva:email-outline" size={16} className={styles.suggestionIcon} />;
  };

  return (
    <div className={`${styles.emailAutoContainer} ${className || ''}`}>
      <div className={styles.inputWrapper}>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onEnterPress={handleInputComplete}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.emailInput}
          clearable
        />
        
        {/* 建议下拉框 */}
        {showSuggestions && suggestions.length > 0 && (
          <div className={styles.suggestionsDropdown}>
            <div className={styles.suggestionsContainer}>
              {!inputValue && showHistory && historyEmails.length > 0 && (
                <div className={styles.suggestionHeader}>
                  <Iconify icon="eva:clock-outline" size={14} />
                  <span className={styles.headerText}>历史输入</span>
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  className={`${styles.suggestionItem} ${suggestion.type === 'history' ? styles.historyItem : styles.suffixItem}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {/* {getSuggestionIcon(suggestion.type)} */}
                  <span className={styles.suggestionText}>{suggestion.label}</span>
                  {suggestion.type === 'history' && (
                    <span className={styles.suggestionTag}>历史</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

EmailAutoComplete.displayName = 'EmailAutoComplete';

// 包装组件以支持Form.Item
const EmailAutoWrapper: React.FC<{
  className?: string;
  placeholder?: string;
  showHistory?: boolean;
  maxHistoryCount?: number;
  disabled?: boolean;
}> = ({ className, placeholder, showHistory, maxHistoryCount, disabled }) => {
  return (
    <Form.Item name="email" noStyle>
      <EmailAutoComplete
        className={className}
        placeholder={placeholder}
        showHistory={showHistory}
        maxHistoryCount={maxHistoryCount}
        disabled={disabled}
      />
    </Form.Item>
  );
};

export default EmailAutoWrapper;
export { EmailAutoComplete };
