import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { Iconify } from "@/components/icon/index";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/pop.module.scss";
import { NoData } from "../noData";
import { Form, Button, Popup, Checkbox, DatePickerView } from 'antd-mobile'
import dayjs, { Dayjs } from "dayjs";
import { Toast } from 'antd-mobile';

interface CustomContentItem {
  key: string;
  label?: string; // 可选，如果传入了component就不需要label
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  component?: React.ReactNode; // 新增：支持传入任意React组件
}

interface DateTimePopProps {
  popupVisible: boolean;
  handlePopupClose: () => void;
  onOpen?: () => void; // 添加打开弹窗的回调
  title: string;
  value?: [Dayjs | null, Dayjs | null];
  defaultValue?: [Dayjs | null, Dayjs | null]; // 初始时间范围
  onChange?: (dates: [Dayjs | null, Dayjs | null]) => void;
  customContent?: CustomContentItem[]; // 自定义内容，支持任意React组件
  customHeader?: React.ReactNode; // 新增：完全自定义的header内容
  minDate?: Dayjs; //范围限制-开始时间
  maxDate?: Dayjs; //范围限制-结束时间
  placeholder?: [string, string];
  disabled?: boolean;
  className?: string;
  disabledDate?: (currentDate: Dayjs, info?: { from?: Dayjs; type?: string }) => boolean; // 新增：禁用日期函数
}

const DateTimePop = forwardRef<any, DateTimePopProps>(({
  popupVisible,
  handlePopupClose,
  onOpen,
  title,
  value,
  defaultValue,
  onChange,
  customContent = [],
  customHeader,
  minDate,
  maxDate,
  placeholder = ['startDate', 'endDate'],
  disabled = false,
  className = '',
  disabledDate,
}, ref) => {
  const { t } = useLanguage(['common']);
  
  // 内部状态管理 - 优先使用value，其次使用defaultValue
  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (value?.[0]) return value[0].toDate();
    if (defaultValue?.[0]) return defaultValue[0].toDate();
    return null;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (value?.[1]) return value[1].toDate();
    if (defaultValue?.[1]) return defaultValue[1].toDate();
    return null;
  });
  
  // 当前选择的是开始时间还是结束时间
  const [selectingType, setSelectingType] = useState<'start' | 'end'>('start');
  
  // 自定义内容状态
  const [customStates, setCustomStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    customContent.forEach(item => {
      states[item.key] = item.checked || false;
    });
    return states;
  });

  // 监听value变化，支持受控模式
  useEffect(() => {
    if (value) {
      setStartDate(value[0] ? value[0].toDate() : null);
      setEndDate(value[1] ? value[1].toDate() : null);
    }
  }, [value]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    reset: () => {
      // 重置到defaultValue，如果没有defaultValue则重置为null
      setStartDate(defaultValue?.[0] ? defaultValue[0].toDate() : null);
      setEndDate(defaultValue?.[1] ? defaultValue[1].toDate() : null);
      // 重置自定义内容状态
      const resetStates: Record<string, boolean> = {};
      customContent.forEach(item => {
        resetStates[item.key] = false;
      });
      setCustomStates(resetStates);
    },
    getValue: () => [
      startDate ? dayjs(startDate) : null,
      endDate ? dayjs(endDate) : null
    ],
    getCustomStates: () => customStates
  }));

  // 格式化显示的日期范围
  const formatDisplayValue = () => {
    if (startDate && endDate) {
      return `${dayjs(startDate).format('YYYY-MM-DD')} ${t('btnText.to')} ${dayjs(endDate).format('YYYY-MM-DD')}`;
    } else if (startDate) {
      return `${dayjs(startDate).format('YYYY-MM-DD')} ${t('btnText.to')} ${placeholder[1]}`;
    } else if (endDate) {
      return `${placeholder[0]} ${t('btnText.to')} ${dayjs(endDate).format('YYYY-MM-DD')}`;
    }
    return `${placeholder[0]} ${t('btnText.to')} ${placeholder[1]}`;
  };

  // 处理日期选择
  const handleDateChange = (date: Date) => {
    const selectedDate = dayjs(date);
    
    // 检查是否被禁用
    if (disabledDate) {
      const info = {
        from: selectingType === 'start' ? (endDate ? dayjs(endDate) : undefined) : (startDate ? dayjs(startDate) : undefined),
        type: 'day'
      };
      if (disabledDate(selectedDate, info)) {
        // 如果日期被禁用，显示提示并不执行选择
        Toast.show(t('btnText.dateRangeExceeded') || 'error');
        return;
      }
    }
    
    if (selectingType === 'start') {
      setStartDate(date);
      // 如果选择的开始时间大于结束时间，清空结束时间
      if (endDate && selectedDate.isAfter(dayjs(endDate))) {
        setEndDate(null);
      }
    } else {
      // 如果选择的结束时间小于开始时间，清空开始时间
      if (startDate && selectedDate.isBefore(dayjs(startDate))) {
        setStartDate(null);
      }
      setEndDate(date);
    }
  };

  // 处理自定义内容变化
  const handleCustomContentChange = (key: string, checked: boolean) => {
    setCustomStates(prev => ({
      ...prev,
      [key]: checked
    }));
    
    // 调用对应的onChange回调
    const item = customContent.find(item => item.key === key);
    if (item?.onChange) {
      item.onChange(checked);
    }
  };

  // 确认选择
  const handleConfirm = () => {
    const result: [Dayjs | null, Dayjs | null] = [
      startDate ? dayjs(startDate) : null,
      endDate ? dayjs(endDate) : null
    ];
    
    if (onChange) {
      onChange(result);
    }
    
    handlePopupClose();
  };

  // 重置选择
  const handleReset = () => {
    // 重置到defaultValue，如果没有defaultValue则重置为null
    setStartDate(defaultValue?.[0] ? defaultValue[0].toDate() : null);
    setEndDate(defaultValue?.[1] ? defaultValue[1].toDate() : null);
    
    // 重置自定义内容状态
    const resetStates: Record<string, boolean> = {};
    customContent.forEach(item => {
      resetStates[item.key] = false;
      if (item.onChange) {
        item.onChange(false);
      }
    });
    setCustomStates(resetStates);
  };

  // 计算最小和最大日期
  const minDateValue = useMemo(() => {
    if (selectingType === 'end' && startDate) {
      // 选择结束时间时，最小日期为开始时间
      let minDate = startDate;
      
      // 如果有disabledDate函数，需要考虑禁用日期的限制
      if (disabledDate) {
        // 这里可以根据disabledDate的逻辑来调整最小日期
        // 例如：如果有7天限制，可以设置为startDate
        minDate = startDate;
      }
      
      return minDate;
    }
    return minDate ? minDate.toDate() : undefined;
  }, [selectingType, startDate, minDate, disabledDate]);

  const maxDateValue = useMemo(() => {
    if (selectingType === 'start' && endDate) {
      // 选择开始时间时，最大日期为结束时间
      let maxDate = endDate;
      
      // 如果有disabledDate函数，需要考虑禁用日期的限制
      if (disabledDate) {
        // 这里可以根据disabledDate的逻辑来调整最大日期
        maxDate = endDate;
      }
      
      return maxDate;
    }
    return maxDate ? maxDate.toDate() : undefined;
  }, [selectingType, endDate, maxDate, disabledDate]);

  return (
    <div style={{ position: 'relative' }} className={`${className}`}>
      {/* 触发按钮 */}
      {/* <Button
        fill="none"
        disabled={disabled}
        onClick={() => {
          if (!disabled && !popupVisible) {
            // 这里应该是打开弹窗的逻辑，但是popupVisible是由父组件控制的
            // 所以这里可能需要一个onOpen回调
            if (onOpen) {
              onOpen();
            }
          }
        }}
        className={`${styles.customSelect} ${disabled ? styles.disabled : ''} ${className}`}
      >
        <div className={`flex-x-cc ${styles.valueSelect}`}>
          <p className={`flex-1 text-left ${!startDate && !endDate ? styles.placeholder : ''} ${styles.title_color}`}>
            {formatDisplayValue()}
          </p>
          <Iconify icon="eva:arrow-down-fill" size={14} />
        </div>
      </Button> */}

      {/* 弹窗 */}
      <Popup
        visible={popupVisible}
        onMaskClick={handlePopupClose}
        position="bottom"
        bodyClassName={styles.popContainer}
        bodyStyle={{
          minHeight: '60vh',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden'
        }}
      >
        <div className="py-4">
          {/* 头部 */}
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

          {/* 自定义内容区域 */}
          {(customHeader || customContent.length > 0) && (
            <div className={`${styles.customContent} px-4 mb-4`}>
              {/* 完全自定义的header */}
              {customHeader && (
                <div className="mb-3">
                  {customHeader}
                </div>
              )}
              
              {/* 自定义内容项 */}
              {customContent.map((item) => (
                <div key={item.key} className="mb-3">
                  {item.component ? (
                    item.component
                  ) : (
                    <Checkbox
                      checked={customStates[item.key]}
                      onChange={(checked) => handleCustomContentChange(item.key, checked)}
                      style={{
                        '--icon-size': '18px',
                        '--font-size': '14px',
                        '--gap': '8px'
                      }}
                    >
                      <span className={`${styles.title_color} font-14`}>
                        {item.label}
                      </span>
                    </Checkbox>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 日期选择区域 */}
          <div className="px-4 mb-4">
            {/* 显示当前选择的日期范围 - 可点击切换选择模式 */}
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--background5)' }}>
              <div className="flex justify-between items-center">
                <button
                  className={`flex-x-cc flex-1 text-left p-2 rounded ${selectingType === 'start' ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelectingType('start')}
                  style={{
                    backgroundColor: selectingType === 'start' ? 'var(--theme-color)' : 'transparent',
                    color: selectingType === 'start' ? '#fff' : 'var(--text-color5)',
                    border: 'none',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className={`font-14`}>
                    {startDate ? dayjs(startDate).format('YYYY-MM-DD') : placeholder[0]}
                  </span>
                </button>
                <span className={`font-12 ${styles.tip_color} px-2`}>
                  {t('btnText.to')}
                </span>
                <button
                  className={`flex-x-cc flex-1 text-right p-2 rounded ${selectingType === 'end' ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelectingType('end')}
                  style={{
                    backgroundColor: selectingType === 'end' ? 'var(--theme-color)' : 'transparent',
                    color: selectingType === 'end' ? '#fff' : 'var(--text-color5)',
                    border: 'none',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className={`font-14`}>
                    {endDate ? dayjs(endDate).format('YYYY-MM-DD') : placeholder[1]}
                  </span>
                </button>
              </div>
            </div>

            {/* 日期选择器 */}
            <div  className={`${styles.datePickerViewBox}`}>
              <DatePickerView
                value={selectingType === 'start' ? (startDate || undefined) : (endDate || undefined)}
                onChange={handleDateChange}
                min={minDateValue}
                max={maxDateValue}
                precision="day"
                style={{
                  '--height': '200px',
                  '--item-height': '40px',
                  '--item-font-size': '16px',
                  '--color': 'var(--text-color6)',
                  '--selected-color': 'var(--text-color5)',
                  '--background': 'var(--background12)',
                  '--mask-background': 'var(--background12)',
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex px-4 pt-2" style={{ gap: '12px' }}>
            <Button
              block
              fill="outline"
              onClick={handleReset}
              style={{
                '--border-color': 'var(--border-color4)',
                '--text-color': 'var(--text-color6)',
                backgroundColor: 'var(--background15)'
              }}
              className={`${styles.radius_36}`}
            >
              {/* 重置 */}
              {t('btnText.reset')}
            </Button>
            <Button
              block
              color="primary"
              onClick={handleConfirm}
              style={{
                '--background-color': 'var(--theme-color)',
                '--border-color': 'var(--theme-color)'
              }}
              className={`${styles.radius_36}`}
            >
              {/* 确定 */}
              {t('btnText.confirm')}
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
});

// 包装组件以支持Form.Item
const DateTimePopWrapper: React.FC<DateTimePopProps & { name?: string }> = ({ 
  name = "dateRange", 
  ...props 
}) => {
  return (
    <Form.Item name={name} noStyle>
      <DateTimePop {...props} />
    </Form.Item>
  );
};

// 设置显示名称
DateTimePop.displayName = 'DateTimePop';
DateTimePopWrapper.displayName = 'DateTimePopWrapper';

export default DateTimePop;
export { DateTimePopWrapper };
export type { DateTimePopProps, CustomContentItem };

/**
 * 使用示例：
 * 
 * // 1. 基本用法
 * <DateTimePopWrapper
 *   popupVisible={visible}
 *   handlePopupClose={() => setVisible(false)}
 *   title="选择时间范围"
 *   value={dateRange}
 *   onChange={setDateRange}
 * />
 * 
 * // 2. 带自定义header的用法
 * <DateTimePopWrapper
 *   popupVisible={visible}
 *   handlePopupClose={() => setVisible(false)}
 *   title="选择时间范围"
 *   value={dateRange}
 *   onChange={setDateRange}
 *   customHeader={
 *     <div className="flex items-center justify-between">
 *       <span>自定义标题</span>
 *       <Button size="small">操作按钮</Button>
 *     </div>
 *   }
 * />
 * 
 * // 3. 带禁用日期的用法（限制7天跨度）
 * <DateTimePopWrapper
 *   popupVisible={visible}
 *   handlePopupClose={() => setVisible(false)}
 *   title="选择时间范围"
 *   value={dateRange}
 *   onChange={setDateRange}
 *   minDate={dayjs().subtract(6, 'month')}
 *   maxDate={dayjs()}
 *   disabledDate={(current, info) => {
 *     const { from } = info || {};
 *     if (from) {
 *       // 限制日期跨度不超过7天
 *       return Math.abs(current.diff(from, 'days')) > 7;
 *     }
 *     // 限制在6个月范围内
 *     return current.isBefore(dayjs().subtract(6, 'month')) || current.isAfter(dayjs());
 *   }}
 * />
 * 
 * // 4. 带自定义内容的用法
 * <DateTimePopWrapper
 *   popupVisible={visible}
 *   handlePopupClose={() => setVisible(false)}
 *   title="选择时间范围"
 *   value={dateRange}
 *   onChange={setDateRange}
 *   customContent={[
 *     // 使用默认的Checkbox
 *     {
 *       key: 'hideCancel',
 *       label: '隐藏所有已撤销',
 *       checked: hideCancel,
 *       onChange: setHideCancel
 *     },
 *     // 使用自定义组件
 *     {
 *       key: 'customSwitch',
 *       component: (
 *         <Switch
 *           checked={switchValue}
 *           onChange={setSwitchValue}
 *         >
 *           自定义开关
 *         </Switch>
 *       )
 *     },
 *     // 使用任意React组件
 *     {
 *       key: 'customButton',
 *       component: (
 *         <Button 
 *           size="small" 
 *           onClick={() => console.log('点击了自定义按钮')}
 *         >
 *           自定义按钮
 *         </Button>
 *       )
 *     }
 *   ]}
 * />
 */
