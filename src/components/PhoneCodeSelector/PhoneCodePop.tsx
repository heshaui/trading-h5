import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
// import { AutoComplete, Flex, Input, Form, ConfigProvider, Select } from "antd";
import { Iconify } from "@/components/icon/index";
import { getCountryCode } from "@/services/open";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/phoneCode.module.scss";
import { NoData } from "../noData";
import { Form, Input, Picker, Button, Popup, SearchBar } from 'antd-mobile'

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
}

const PhoneCodeSelect = forwardRef<any, PhoneCodeSelectProps>(({ className, value, onChange }, ref) => {
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
    onChange?.(newValue);
    handlePopupClose();
  };

  // 获取显示的标签
  const getDisplayLabel = (value: string) => {
    if (!value) return "Please select";
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
          <p className={`flex-1 text-left`}>{getDisplayLabel(selectedValue)}</p>
          <Iconify icon="eva:arrow-down-fill" size={16} />
        </div>
        
      </Button>
      
      <Popup
        visible={popupVisible}
        onMaskClick={handlePopupClose}
        position="bottom"
        bodyStyle={{
          height: '60vh',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}
      >
        <div style={{ padding: '16px',}}>
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
              <Iconify icon="eva:close-fill" size={20} />
            </Button>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <SearchBar
              placeholder={t("search")}
              value={searchValue}
              onChange={handleSearch}
              style={{ '--border-radius': '8px' }}
            />
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex justify-between items-center py-3 px-2 cursor-pointer"
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: selectedValue === option.value ? '#f0f8ff' : 'transparent',
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

// 包装组件以支持Form.Item
const PhoneCodeSelectWrapper: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Form.Item name="areaCode" noStyle>
      <PhoneCodeSelect className={className} />
    </Form.Item>
  );
};

// 添加此导出函数以支持服务端翻译加载
// export const getStaticProps: GetStaticProps = async ({ locale }) => {
// 	return {
// 		props: {
// 			...(await serverSideTranslations(locale || 'en', ['common'])),
// 		},
// 	};
// };
export default PhoneCodeSelectWrapper;
