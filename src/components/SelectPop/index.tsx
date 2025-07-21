import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { Iconify } from "@/components/icon/index";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/pop.module.scss";
import { NoData } from "../noData";
import { Form, Input, Picker, Button, Popup, SearchBar, Toast } from 'antd-mobile'
import { render } from "@testing-library/react";

interface OptionItem {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  [key: string]: any; // 允许其他自定义属性
}

interface SelectPopProps {
  className?: string;
  value?: string | number;
  defaultValue?: string | number; // 新增：默认值
  showValue?: boolean;
  onChange?: (value: string | number | undefined, option: OptionItem) => void; // 支持 undefined
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
  optionRender?: (option: OptionItem) => React.ReactNode; // 新增：自定义选项渲染（与antd保持一致的命名）
  displayMode?: 'label' | 'value'; // 新增：选择显示回填内容是label还是value，默认label
  bodyClassName?: string; // 新增：弹窗body的className
  renderBtn?: ((open: () => void) => React.ReactNode) | 'buttom' | 'selectInput' // 自定义触发按钮
  bodyStyle?: React.CSSProperties; // 弹窗body的样式
  activeType?: 'background' | 'icon' // 选中样式
  emptyRender?:React.ReactNode; // 自定义空状态渲染
  allowClear?: boolean; // 是否允许清空
}

const SelectPop = forwardRef<any, SelectPopProps>(({
  className,
  value,
  showValue = false,
  onChange,
  options = [],
  placeholder = "Please select",
  title,
  showSearch = true,
  searchPlaceholder,
  searchKeys = ['label', 'value'],
  disabled = false,
  showAll = false,
  renderOption,
  renderValue,
  optionRender, // 新增参数
  displayMode = 'label', // 新增参数，默认显示label
  bodyClassName,
  renderBtn = 'buttom',
  bodyStyle={
    height: '60vh',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  activeType = 'background',
  emptyRender,
  allowClear = true,
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
    clearSelection: (change:boolean=false) => {
      // 清空选中状态，但不触发onChange回调
      setSelectedValue(undefined);
      if (change) {
        onChange?.('' as any, {label: '', value: ''}); // 传递空字符串
      }
    },
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
    // 如果选项被禁用，显示提示并返回
    if (option.disabled) {
      // 可以显示 Toast 提示或其他提示方式
      console.warn('This option is disabled');
      return;
    }
    
    const newValue = option.value;
    
    // 如果点击的是已选中的选项，根据allowClear决定是否取消选择
    if (selectedValue === newValue) {
      if (allowClear) {
        setSelectedValue(''); // 使用空字符串替代undefined
        onChange?.('' as any, option); // 传递空字符串
      } else {
        // allowClear为false时，不允许清空，直接关闭弹窗
        handlePopupClose();
        return;
      }
    } else {
      setSelectedValue(newValue);
      onChange?.(newValue, option);
    }
    
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
    // 当取消选择时 selectedValue 为 undefined，显示 placeholder
    if (selectedValue === null || selectedValue === undefined || selectedValue === '' || selectedValue === 'all') {
      if (showAll && (selectedValue === 'all' || selectedValue === '')) {
        return t('common.all') || <span className={`${styles.placeholder} placeholder`}>{placeholder}</span>; // 显示"全部"标签
      } else {
        return <span className={`${styles.placeholder} placeholder`}>{placeholder}</span>; // 显示placeholder，包括取消选择的情况
      }
    }

    if (!selectedOption) return placeholder;

    // 根据displayMode选择显示内容
    return displayMode === 'value' ? selectedOption.value : selectedOption.label;
  };

  // 默认选项渲染
  const defaultRenderOption = (option: OptionItem) => (
    <div className={showValue ? "flex justify-between items-center" : "flex-x-cc"}>
      <span className="font-14">{option.label}</span>
      {showValue && <span className="font-14 text-color6">{option.value}</span>}
    </div>
  );

  // 选择渲染函数，优先级：optionRender > renderOption > defaultRenderOption
  const getOptionRenderer = () => {
    if (optionRender) return optionRender;
    if (renderOption) return renderOption;
    return defaultRenderOption;
  };

  return (
    <div style={{ position: 'relative' }} className={`selectPopBox`}>
      {
        renderBtn === 'buttom' ?
          <Button
            className={`${styles.customSelect} selectButton-box ${disabled ? styles.disabled : ''}`}
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
          </Button> :
          renderBtn === 'selectInput' ?
            <div onClick={handlePopupOpen}
              className={`${styles.selectInput_box} selectInput-box flex-x align-center justify-between`}
            >
              <p className={`mr-1 text-left ${!getSelectedOption() ? styles.title_color : styles.title_color}`}>
                {getDisplayLabel()}
              </p>
              <Iconify icon="icon-park:down" size={24} />
            </div> :
            typeof renderBtn === 'function' ? renderBtn(handlePopupOpen) : null
      }

      <Popup
        visible={popupVisible}
        onMaskClick={handlePopupClose}
        position="bottom"
        bodyClassName={`${styles.popContainer} ${bodyClassName}`}
        bodyStyle={{ ...bodyStyle}}
      >
        <div className="pb-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
            <h3 style={{ margin: 0 }} className={styles.title_color}>{title || placeholder || ''}</h3>
            <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={handlePopupClose} />
          </div>

          {showSearch && (
            <div style={{ marginBottom: '16px' }} className="px-4">
              <SearchBar
                placeholder={searchPlaceholder || t('btnText.search')}
                value={searchValue}
                onChange={handleSearch}
                clearable
                style={{ '--border-radius': '8px' }}
                className={styles.search_bar}
              />
            </div>
          )}
          <div 
          style={{ maxHeight: `calc(${bodyStyle?.height} - 54px - ${showSearch?'60px':'0px'})`, overflowY: 'auto' }} 
          // style={{ maxHeight: '480px', overflowY: 'auto' }} 
          className="selectPop-options pb-5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  className={`${styles.selectItem} px-4 py-2 cursor-pointer  ${styles.title_color} 
                  ${selectedValue === option.value && activeType === 'background' ? styles.active_select : ''} relative selectPop-options-item 
                  ${option.disabled ? styles.disabled_option : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    opacity: option.disabled ? 0.5 : 1,
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    pointerEvents: option.disabled ? 'none' : 'auto'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      {getOptionRenderer()(option)}
                    </div>
                    {option.disabled && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#999', 
                        marginLeft: '8px',
                        fontStyle: 'italic'
                      }}>
                        <Iconify icon="lsicon:disable-outline" size={24} />
                      </span>
                    )}
                  </div>
                  {selectedValue === option.value && activeType === 'icon' && !option.disabled && (
                    <div className={`${styles.active_icon} selectPop-active-icon`}>
                      <Iconify icon='ep:success-filled' size={20} className="theme-color" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                {emptyRender ? emptyRender: <NoData />}
              </div>
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
});

// 包装组件以支持Form.Item（antd-mobile）
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

// 新增：支持 Antd 表单的包装器
const SelectPopAntdWrapper = React.forwardRef<any, SelectPopProps & {
  allowClear?: boolean;
  loading?: boolean;
  notFoundContent?: React.ReactNode;
  onFocus?: () => void;
}>((props, ref) => {
  const { 
    allowClear = true, // 确保有默认值
    loading, 
    notFoundContent, 
    onFocus, 
    onChange,
    value,
    ...restProps 
  } = props;

  const selectRef = React.useRef<any>(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => selectRef.current?.focus(),
    blur: () => selectRef.current?.blur(),
  }));

  // 处理onChange，确保包括undefined值也能触发表单验证
  const handleChange = (newValue: string | number | undefined, option: OptionItem) => {
    // 将undefined转换为空字符串，更好地与Antd表单集成
    const formValue = newValue === undefined ? '' : newValue;
    
    // 调用原始onChange（如果存在），传递转换后的值
    if (onChange) {
      onChange(formValue, option);
    }
    
    // 手动触发表单验证，特别是当值变为undefined时
    setTimeout(() => {
      // 触发自定义事件来通知表单值已变化
      if (selectRef.current) {
        const event = new CustomEvent('change', {
          detail: { value: formValue }
        });
        selectRef.current.dispatchEvent?.(event);
      }
    }, 0);
  };

  return (
    <SelectPop 
      ref={selectRef}
      {...restProps}
      value={value}
      onChange={handleChange}
      allowClear={allowClear} // 确保传递 allowClear 属性
    />
  );
});

// 设置显示名称
SelectPop.displayName = 'SelectPop';
SelectPopWrapper.displayName = 'SelectPopWrapper';
SelectPopAntdWrapper.displayName = 'SelectPopAntdWrapper';

export default SelectPop;
export { SelectPopWrapper, SelectPopAntdWrapper };
export type { OptionItem, SelectPopProps };

/**
 * 使用示例：
 * 
 * // 1. 基本用法（支持点击已选中选项取消选择）
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => {
 *     // value 可能为 undefined（当用户取消选择时）
 *     setSelectedValue(value);
 *   }}
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
 * 
 * // 5. 取消选择功能
 * // 用户点击已选中的选项时，会触发取消选择
 * // onChange 会被调用，value 参数为 undefined
 * // 此时组件会显示 placeholder 内容
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={options}
 *   placeholder="请选择"
 *   allowClear={true} // 默认为true，允许清空
 * />
 * 
 * // 5.1 禁止取消选择功能
 * // 当allowClear为false时，用户点击已选中的选项不会取消选择
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={options}
 *   placeholder="请选择"
 *   allowClear={false} // 不允许清空，再次点击已选项不会取消选择
 * />
 * 
 * // 6. 自定义选项渲染（新增功能）
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={[
 *     { 
 *       label: 'BTC(Bitcoin)', 
 *       value: 'BTC',
 *       coinName: 'BTC',
 *       nameDefault: 'Bitcoin',
 *       iconUrl: '/images/btc.png'
 *     },
 *     { 
 *       label: 'ETH(Ethereum)', 
 *       value: 'ETH',
 *       coinName: 'ETH',
 *       nameDefault: 'Ethereum',
 *       iconUrl: '/images/eth.png'
 *     },
 *   ]}
 *   placeholder="请选择币种"
 *   optionRender={(option) => (
 *     <div className="flex-x align-center justify-between">
 *       <div className="flex items-center py-1">
 *         <Image
 *           src={option.iconUrl}
 *           alt={option.label}
 *           width={20}
 *           height={20}
 *           className="mr-2"
 *           style={{
 *             borderRadius: "50%",
 *             height: "20px",
 *             width: "20px",
 *           }}
 *         />
 *         <span className="text-text-color7">
 *           {`${option.coinName}(${option.nameDefault})`}
 *         </span>
 *       </div>
 *     </div>
 *   )}
 * />
 * 
 * // 7. 显示回填内容选择（新增功能）
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={[
 *     { label: 'BTC(Bitcoin)', value: 'BTC' },
 *     { label: 'ETH(Ethereum)', value: 'ETH' },
 *   ]}
 *   placeholder="请选择"
 *   displayMode="value" // 显示value而不是label
 * />
 * // 当选择了BTC时，显示框会显示"BTC"而不是"BTC(Bitcoin)"
 *
 * // 8. 选项禁用功能（新增功能）
 * <SelectPop
 *   value={selectedValue}
 *   onChange={(value, option) => setSelectedValue(value)}
 *   options={[
 *     { label: 'BTC', value: 'btc', disabled: false },
 *     { label: 'ETH', value: 'eth', disabled: true }, // 禁用选项
 *     { label: 'USDT', value: 'usdt', disabled: false },
 *   ]}
 *   placeholder="请选择"
 * />
 * // 禁用的选项会显示为灰色，不能点击，并显示"已禁用"提示
 *
 * // 9. Antd 表单集成（新增功能）
 * // import { Form } from 'antd'; // 注意：这里是antd，不是antd-mobile
 * // import { SelectPopAntdWrapper } from '@/components/SelectPop';
 * // 
 * // <Form>
 * //   <Form.Item
 * //     name="currency"
 * //     label="选择币种"
 * //     rules={[{ required: true, message: '请选择币种' }]}
 * //   >
 * //     <SelectPopAntdWrapper
 * //       options={[
 * //         { label: 'BTC', value: 'btc' },
 * //         { label: 'ETH', value: 'eth' },
 * //       ]}
 * //       placeholder="请选择币种"
 * //     />
 * //   </Form.Item>
 * // </Form>
 * //
 * // 10. antd-mobile 表单集成（现有功能）
 * // import { Form } from 'antd-mobile';
 * // import { SelectPopWrapper } from '@/components/SelectPop';
 * //
 * // <Form>
 * //   <SelectPopWrapper
 * //     name="currency"
 * //     options={options}
 * //     placeholder="请选择"
 * //   />
 * // </Form>
 */
