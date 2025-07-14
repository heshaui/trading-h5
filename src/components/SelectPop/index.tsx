import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { Iconify } from "@/components/icon/index";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/pop.module.scss";
import { NoData } from "../noData";
import { Form, Input, Picker, Button, Popup, SearchBar } from 'antd-mobile'
import { render } from "@testing-library/react";

interface OptionItem {
  label: React.ReactNode;
  value: string | number;
  [key: string]: any; // 允许其他自定义属性
}

interface SelectPopProps {
  className?: string;
  value?: string | number;
  defaultValue?: string | number; // 新增：默认值
  showValue?: boolean;
  onChange?: (value: string | number, option: OptionItem) => void;
  options: OptionItem[]; // 传入的选项列表
  placeholder?: string; // 占位符文字
  title?: string; // 弹窗标题
  showSearch?: boolean; // 是否显示搜索框
  searchPlaceholder?: string; // 搜索框占位符
  searchKeys?: string[]; // 搜索的字段名，默认为 ['label', 'value']
  disabled?: boolean; // 是否禁用
  showAll?: boolean; // 是否回显全部
  renderOption?: (option: OptionItem) => React.ReactNode; // 自定义选项渲染
  renderValue?: (option: OptionItem | null) => React.ReactNode; // 自定义值显示
  renderBtn?: (open: () => void) => React.ReactNode; // 自定义触发按钮
}

const SelectPop = forwardRef<any, SelectPopProps>(({
  className,
  value,
  showValue = false,
  onChange,
  options = [],
  placeholder = "Please select",
  title = "Select Option",
  showSearch = true,
  searchPlaceholder = "Search",
  searchKeys = ['label', 'value'],
  disabled = false,
  showAll = false,
  renderOption,
  renderValue,
  renderBtn,
}, ref) => {
  const [searchValue, setSearchValue] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number | undefined>(value);
  const { t } = useLanguage();

  useImperativeHandle(ref, () => ({
    focus: () => handlePopupOpen(),
    blur: () => handlePopupClose(),
    open: () => handlePopupOpen(),
    close: () => handlePopupClose(),
  }));

  // 当外部value变化时，更新内部状态
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // 过滤选项
  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchValue) return options;

    return options.filter((option) => {
      return searchKeys.some(key => {
        const fieldValue = option[key];
        if (fieldValue === null || fieldValue === undefined) return false;
        return String(fieldValue).toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  }, [options, searchValue, showSearch, searchKeys]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handlePopupOpen = () => {
    if (disabled) return;
    setPopupVisible(true);
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    setSearchValue(""); // 关闭时清空搜索
  };

  const handleOptionSelect = (option: OptionItem) => {
    const newValue = option.value;
    setSelectedValue(newValue);
    onChange?.(newValue, option);
    handlePopupClose();
  };

  // 获取当前选中的选项
  const getSelectedOption = () => {
    return options.find(opt => opt.value === selectedValue) || null;
  };

  // 获取显示的标签
  const getDisplayLabel = () => {
    const selectedOption = getSelectedOption();
    
    if (renderValue) {
      return renderValue(selectedOption);
    }
    
    // 处理空值或'all'值的情况（注意：0是有效值，不应该被当作空值）
    if (selectedValue === null || selectedValue === undefined || selectedValue === '' || selectedValue === 'all') {
      if (showAll) {
        return t('common.all') || placeholder; // 显示"全部"标签
      } else {
        return placeholder; // 显示placeholder
      }
    }
    
    if (!selectedOption) return placeholder;
    return selectedOption.label;
  };

  // 默认选项渲染
  const defaultRenderOption = (option: OptionItem) => (
    <div className={showValue?"flex justify-between items-center":"flex-x-cc"}>
      <span className="font-14">{option.label}</span>
      {showValue && <span className="font-14 text-color6">{option.value}</span>}
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {
      renderBtn ? renderBtn(handlePopupOpen) : 
      <Button
        className={`${styles.customSelect} ${disabled ? styles.disabled : ''}`}
        onClick={handlePopupOpen}
        disabled={disabled}
      >
        <div className={`flex-x-cc ${styles.valueSelect}`}>
          {/* placeholder */}
          <p className={`mr-1 text-left ${!getSelectedOption() ? styles.title_color : styles.title_color}`}>
            {getDisplayLabel()}
          </p>
          <Iconify icon="eva:arrow-down-fill" size={14} />
        </div>
      </Button>
      }
      
      <Popup
        visible={popupVisible}
        onMaskClick={handlePopupClose}
        position="bottom"
        bodyClassName={styles.popContainer}
        bodyStyle={{
          height: '60vh',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}
      >
        <div  className="py-4">
          <div className={`${styles.popHeader} flex-x justify-between align-center mb-4 px-4 pb-2`}>
            <h3 style={{ margin: 0 }} className={styles.title_color}>{title}</h3>
            <Button 
              size="small" 
              onClick={handlePopupClose}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Iconify icon="eva:close-fill" size={20} className={styles.tip_color} />
            </Button>
          </div>
          
          {showSearch && (
            <div style={{ marginBottom: '16px' }} className="px-4">
              <SearchBar
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearch}
                clearable
                style={{ '--border-radius': '8px' }}
                className={styles.search_bar}
              />
            </div>
          )}
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="px-4">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  className={`${styles.selectItem} px-4 cursor-pointer ${styles.title_color} 
                  ${selectedValue === option.value ? styles.active_select : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {renderOption ? renderOption(option) : defaultRenderOption(option)}
                </div>
              ))
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <NoData />
              </div>
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
});

// 包装组件以支持Form.Item
const SelectPopWrapper: React.FC<SelectPopProps & { name?: string }> = ({ 
  name = "selectValue", 
  ...props 
}) => {
  return (
    <Form.Item name={name} noStyle>
      <SelectPop {...props} />
    </Form.Item>
  );
};

// 设置显示名称
SelectPop.displayName = 'SelectPop';
SelectPopWrapper.displayName = 'SelectPopWrapper';

export default SelectPop;
export { SelectPopWrapper };
export type { OptionItem, SelectPopProps };

/**
 * 使用示例：
 * 
 * // 1. 基本用法
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={[
 *     { label: '选项1', value: 'option1' },
 *     { label: '选项2', value: 'option2' },
 *   ]}
 *   placeholder="请选择"
 * />
 * 
 * // 2. 显示"全部"标签（当value为null/undefined/''/'all'时）
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={[
 *     { label: '全部', value: 'all' },
 *     { label: '选项1', value: 'option1' },
 *     { label: '选项2', value: 'option2' },
 *   ]}
 *   placeholder="请选择"
 *   showAll={true} // 当value为空或'all'时显示"全部"
 * />
 * 
 * // 3. 数字类型的value（包括0）
 * <SelectPop
 *   value={0} // 数字0是有效值，不会被当作空值处理
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={[
 *     { label: '全部', value: 'all' },
 *     { label: '第一项', value: 0 }, // 数字0
 *     { label: '第二项', value: 1 },
 *   ]}
 *   placeholder="请选择"
 *   showAll={false}
 * />
 * // 当value=0时，会正确显示"第一项"而不是placeholder
 * 
 * // 4. 不显示"全部"标签（当value为null/undefined/''/'all'时显示placeholder）
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={[
 *     { label: '全部', value: 'all' },
 *     { label: '选项1', value: 'option1' },
 *     { label: '选项2', value: 'option2' },
 *   ]}
 *   placeholder="请选择"
 *   showAll={false} // 当value为空或'all'时显示placeholder
 * />
 */
