import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useCallback } from "react";
import { Iconify } from "@/components/icon/index";
import { getCountryCode } from "@/services/open";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/phoneCode.module.scss";
import { NoData } from "@/components/noData";
import { Form as MobileForm, Input, Picker, Button, Popup, SearchBar } from 'antd-mobile'
import { ReactComponent as CloseSvg } from '@/assets/icons/public/icon_close.svg';

interface OptionItem {
  label: React.ReactNode;
  value: string | number;
  countryName?: string;
  areaCode?: string;
}

interface CountryCodeItem {
  sort: string;
  areaCode: string;
  countryName: string;
  countryCode: string;
  id: number;
  status: number;
  areaName: string;
}

interface PhoneCodeSelectProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoSelectFirst?: boolean; // 是否自动选中第一项，默认为true
}

const PhoneCodeSelect = forwardRef<any, PhoneCodeSelectProps>(({ className, value, onChange, autoSelectFirst = true }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [countryCodeList, setCountryCodeList] = useState<CountryCodeItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(value || "");
  const { t } = useLanguage();

  useImperativeHandle(ref, () => ({
    focus: () => handlePopupOpen(),
    blur: () => handlePopupClose(),
  }));

  // 当外部value变化时，更新内部状态
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // 国家选项列表
  const groupedOptions = useMemo(() => {
    if (!countryCodeList.length) return [];

    // 按国家名称排序
    const sortedList = [...countryCodeList].sort(
      (a, b) =>
        // a.countryName.localeCompare(b.countryName)
        Number(a.sort) - Number(b.sort)
    )

    // 转换为选项格式
    return sortedList.map((item) => ({
      label: `${item.countryName} ${item.areaCode}`,
      value: item.areaCode,
      countryName: item.countryName,
      areaCode: item.areaCode,
      countryCode: item.countryCode,
      areaName: item.areaName,
    }));
  }, [countryCodeList]);

  // 过滤选项
  const filteredOptions = useMemo(() => {
    if (!searchValue) return groupedOptions;

    return groupedOptions.filter(
      (option) =>
        option.countryName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.areaCode?.includes(searchValue)
    );
  }, [groupedOptions, searchValue]);

  // 使用useCallback包装onChange，避免重复触发
  const handleValueChange = useCallback((newValue: string) => {
    onChange?.(newValue);
  }, [onChange]);

  // 自动选中第一项（当数据加载完成且没有选中值时）
  useEffect(() => {
    if (autoSelectFirst && filteredOptions.length > 0 && !selectedValue && !searchValue) {
      const firstOption = filteredOptions[0];
      const defaultValue = firstOption.value;
      setSelectedValue(defaultValue);
      handleValueChange(defaultValue);
    }
  }, [filteredOptions, selectedValue, searchValue, autoSelectFirst, handleValueChange]);

  const handleFocus = () => {
    setIsFocused(true);
    if (countryCodeList.length === 0) {
      getCountryCodeList();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getCountryCodeList = async () => {
    try {
      const res = await getCountryCode();
      if (res.code === "0") {
        const data = res.data.map((item: any) => {
          return {
            areaCode: "+" + item.areaCode,
            sort: item.areaCode,
            countryName: item.countryName,
            countryCode: item.countryCode,
            areaName: item.areaName,
            id: item.id,
            status: item.status,
          };
        }).filter((item: any) => item.status === 1);
        setCountryCodeList(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCountryCodeList();
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handlePopupOpen = () => {
    setPopupVisible(true);
    handleFocus();
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    setSearchValue(""); // 关闭时清空搜索
    handleBlur();
  };

  const handleOptionSelect = (option: any) => {
    const newValue = option.value;
    setSelectedValue(newValue);
    handleValueChange(newValue);
    handlePopupClose();
  };

  // 获取显示的标签
  const getDisplayLabel = (value: string) => {
    if (!value) return t('titleText.selectCountry');
    const option = groupedOptions.find(opt => opt.value === value);
    return option ? option.value : value;
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button
        className={`${styles.customSelect}`}
        onClick={handlePopupOpen}
      >
        <div className={`flex-x-cc ${styles.valueSelect}`}>
          <p className={`flex-1 text-left`}
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              minWidth: 0
            }}>{getDisplayLabel(selectedValue)}</p>
          <Iconify icon="eva:arrow-down-fill" size={16} />
        </div>

      </Button>

      <Popup
        visible={popupVisible}
        onMaskClick={handlePopupClose}
        position="bottom"
        bodyStyle={{
          minHeight: '60vh',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}
      >
        <div style={{ padding: '16px', }} className="title_color">
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              {/* 选择国家/地区 */}
              {t('titleText.selectCountry')}
            </h3>
            <Button
              size="small"
              onClick={handlePopupClose}
              style={{ background: 'transparent', border: 'none' }}
            >
              <CloseSvg fontSize={24} className={`w-[14px] h-[14px] ${styles.title_color}`} />

            </Button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <SearchBar
              placeholder={t("search")}
              value={searchValue}
              onChange={handleSearch}
              style={{ '--border-radius': '8px' }}
              className={`${styles.search_bar} popup_search_bar`}
            />
          </div>

          <div className={`${styles.popup_scroll_box}`}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex justify-between items-center py-3 px-2 cursor-pointer"
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    borderBottom: '1px solid var(--border-color4)',
                    backgroundColor: selectedValue === option.value ? 'var(--background-menu-item)' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{`${option.countryName}(${option.areaName})`}</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>{option.areaCode}</span>
                </div>
              ))
            ) : (
              <NoData />
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
});

// antd-mobile 表单包装组件
const PhoneCodeSelectMobileWrapper: React.FC<{
  className?: string;
  autoSelectFirst?: boolean;
}> = ({ className, autoSelectFirst = true }) => {
  return (
    <MobileForm.Item name="areaCode" noStyle>
      <PhoneCodeSelect className={className} autoSelectFirst={autoSelectFirst} />
    </MobileForm.Item>
  );
};

// antd 表单包装组件（懒加载导入）
const PhoneCodeSelectAntdWrapper: React.FC<{
  className?: string;
  autoSelectFirst?: boolean;
}> = ({ className, autoSelectFirst = true }) => {
  // 动态导入 antd 的 Form 组件
  const [AntdForm, setAntdForm] = useState<any>(null);

  useEffect(() => {
    const loadAntdForm = async () => {
      try {
        const { Form } = await import('antd');
        setAntdForm(Form);
      } catch (error) {
        console.warn('Failed to load antd Form component:', error);
      }
    };

    loadAntdForm();
  }, []);

  if (!AntdForm) {
    // 如果 antd 未加载，直接返回基础组件
    return <PhoneCodeSelect className={className} autoSelectFirst={autoSelectFirst} />;
  }

  return (
    <AntdForm.Item name="areaCode" noStyle>
      <PhoneCodeSelect className={className} autoSelectFirst={autoSelectFirst} />
    </AntdForm.Item>
  );
};

// 通用包装组件，自动检测环境
const PhoneCodeSelectWrapper: React.FC<{
  className?: string;
  autoSelectFirst?: boolean;
  formType?: 'mobile' | 'antd' | 'auto'; // 新增 formType 属性
}> = ({ className, autoSelectFirst = true, formType = 'auto' }) => {
  const [detectedFormType, setDetectedFormType] = useState<'mobile' | 'antd' | null>(null);

  useEffect(() => {
    if (formType !== 'auto') {
      setDetectedFormType(formType);
      return;
    }

    // 自动检测当前环境中可用的表单库
    const detectFormLibrary = async () => {
      try {
        // 检测是否有 antd-mobile
        await import('antd-mobile');

        // 检测是否有 antd
        try {
          await import('antd');
          // 如果两个都有，优先使用 mobile（因为这是移动端项目）
          setDetectedFormType('mobile');
        } catch {
          setDetectedFormType('mobile');
        }
      } catch {
        try {
          await import('antd');
          setDetectedFormType('antd');
        } catch {
          setDetectedFormType('mobile'); // 默认使用 mobile
        }
      }
    };

    detectFormLibrary();
  }, [formType]);

  // 根据检测结果或指定类型渲染对应的包装组件
  if (detectedFormType === 'antd') {
    return <PhoneCodeSelectAntdWrapper className={className} autoSelectFirst={autoSelectFirst} />;
  } else {
    return <PhoneCodeSelectMobileWrapper className={className} autoSelectFirst={autoSelectFirst} />;
  }
};

// 导出各种版本供不同场景使用
export { PhoneCodeSelect }; // 基础组件，不包含任何表单包装
export { PhoneCodeSelectMobileWrapper }; // antd-mobile 表单包装版本
export { PhoneCodeSelectAntdWrapper }; // antd 表单包装版本
export { PhoneCodeSelectWrapper }; // 通用包装组件，支持自动检测

// 默认导出通用包装组件
export default PhoneCodeSelectWrapper;

// 添加此导出函数以支持服务端翻译加载
// export const getStaticProps: GetStaticProps = async ({ locale }) => {
// 	return {
// 		props: {
// 			...(await serverSideTranslations(locale || 'en', ['common'])),
// 		},
// 	};
// };
