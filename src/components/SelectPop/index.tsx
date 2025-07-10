import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { Iconify } from "@/components/icon/index";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/pop.module.scss";
import { NoData } from "../noData";
import { Form, Input, Picker, Button, Popup, SearchBar } from 'antd-mobile'

interface OptionItem {
  label: React.ReactNode;
  value: string | number;
  [key: string]: any; // 允许其他自定义属性
}

interface SelectPopProps {
  className?: string;
  value?: string | number;
  showValue?: boolean;
  onChange?: (value: string | number, option: OptionItem) => void;
  options: OptionItem[]; // 传入的选项列表
  placeholder?: string; // 占位符文字
  title?: string; // 弹窗标题
  showSearch?: boolean; // 是否显示搜索框
  searchPlaceholder?: string; // 搜索框占位符
  searchKeys?: string[]; // 搜索的字段名，默认为 ['label', 'value']
  disabled?: boolean; // 是否禁用
  renderOption?: (option: OptionItem) => React.ReactNode; // 自定义选项渲染
  renderValue?: (option: OptionItem | null) => React.ReactNode; // 自定义值显示
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
  renderOption,
  renderValue
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
