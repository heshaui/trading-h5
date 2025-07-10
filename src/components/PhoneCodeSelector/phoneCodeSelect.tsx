import React, { useState, useEffect, useMemo } from "react";
import { AutoComplete, Flex, Input, Form, ConfigProvider, Select } from "antd";
import { Iconify } from "@/components/icon/index";
import { getCountryCode } from "@/services/open";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/phoneCode.module.scss";
import { NoData } from "../noData";

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

const PhoneCodeSelect: React.FC<{ className?: string }> = ({ className }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [countryCodeList, setCountryCodeList] = useState<CountryCodeItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const { t } = useLanguage(["common"]);
  // 国家选项列表
  const groupedOptions = useMemo(() => {
    if (!countryCodeList.length) return [];

    // 按国家名称排序
    const sortedList = [...countryCodeList].sort(
      (a, b) =>
        // a.countryName.localeCompare(b.countryName)
        Number(a.sort) - Number(b.sort)
    )

    // 转换为Select需要的格式
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

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            controlHeightLG: 50,
            activeBorderColor: "var(--theme-color)",
            hoverBorderColor: "var(--theme-color)",
            activeBg: "transparent",
            hoverBg: "transparent",
          },
          Select: {
            optionSelectedColor: "var(--text-color5)",
            activeBorderColor: "var(--border-color4)",
            optionActiveBg: "transparent",
            selectorBg: "transparent", //选框背景色
            optionHeight: 40,
          },
        },
        token: {
          // colorBgContainerDisabled: '#fff',
        },
      }}
    >
      <Form.Item name="areaCode" noStyle>
        <Select
          allowClear={false}
          placeholder="Please select"
          className={`custom-select`}
          style={{
            height: "50px",
            maxWidth: "115px",
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          options={filteredOptions}
          optionLabelProp="value"
          dropdownStyle={{ width: "320px" }} // 设置下拉框宽度
          optionRender={(option) => (
            <div className="flex justify-between items-center py-1">
              <span>{`${option.data.countryName}(${option.data.areaName})`}</span>
              <span className="text-text-color7">{option.data.areaCode}</span>
            </div>
          )}
          dropdownRender={(menu) => (
            <>
              <div className="font-14 font-w-400 mb-2_5 px-2 mt-2_5">
                <Input
                  autoComplete="off"
                  styles={{ input: { color: "var(--text-color5)" } }}
                  allowClear
                  placeholder={t("search")}
                  className={`${styles.mail_input} modal-input2`}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<Iconify icon="eva:search-fill" size={16} />}
                />
              </div>
              <div className="custom-select-dropdown">{menu}</div>
            </>
          )}
          listHeight={320}
          virtual={true}
          notFoundContent={<NoData />}
        />
      </Form.Item>
    </ConfigProvider>
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
export default PhoneCodeSelect;
