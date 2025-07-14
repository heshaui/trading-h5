import React, { useState, useMemo } from 'react';
import { Button, Popover, Popup, Image, Tabs, SearchBar } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { supportedLanguages, languageNames } from '@/utils/languageLoader';
import iconDown from '@/assets/icons/public/icon_earth_line.png';
import iconDownDark from '@/assets/icons/public/icon_earth_dark.png';
import styles from '../styles/accountPop.module.scss';
import { Action } from 'antd-mobile/es/components/popover'
import { DownOutline, CloseOutline } from 'antd-mobile-icons';
import appStore from '@/store';
import { useThemeMode } from '@/hooks/useThemeMode';
import { CustomTab } from '@/components/CustomCom';
import { NoData } from '@/components/noData';
import { useNavigate } from 'react-router-dom';
import { CustomTable } from "@/components/CustomCom";
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import { DataType } from "@/type/assets/assetsAccount/assets";
import { add, roundDown, cut, nul } from "@/utils";
import { getRate, getCoinRate, getCoinRound } from "@/utils/getUseRate";

type Props = {
  open?: boolean;
  title?: string;
  onClose?: () => void;
  dataList?: DataType;
}
const LanguageToggle: React.FC<Props> = ({ open = false, title, onClose, dataList }) => {
  const { t } = useLanguage('assets');
  const { isDayMode } = useThemeMode();
  const navigate = useNavigate();
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, ""); // 汇率key
  const coinList = appStore.getCoinList(); // 获取币种信息


  const columns: ColumnType<DataType>[] = [

    {
      title: t("assetsAccount.balance"), //"持仓",
      dataIndex: "balance",
      key: "balance",
      align: "center",
      // width: 128,
      render: (_text, record) => {
        const coin = coinList.find(
          (item: any) => item.coinName === record.coinName
        ); // 获取币种信息
        const text = add(record.balance || 0, record.releaseBalance || 0);
        const text2 = add(text, record.frozenBalance || 0);
        // 添加默认值和检查
        const rateKeyName = rateKey.split("-")[0].trim();

        // 确保 rateKeyName 有值
        const { ratetext } = getRate(record.coinName, text2, rateKeyName);

        return (
          <p className="flex-y align-end">
            <span>{text2 ? roundDown(text2, coin?.unitScale) : "0"}</span>
            <span className="ltr-text">{record.coinName ? ratetext : ""}</span>
          </p>
        );
      },
      sorter: (a, b) => {
        const totalA = add(
          add(a.balance || 0, a.releaseBalance || 0),
          a.frozenBalance || 0
        );
        const totalB = add(
          add(b.balance || 0, b.releaseBalance || 0),
          b.frozenBalance || 0
        );
        return totalA - totalB;
      },
    },
    {
      title: t("assetsAccount.available"), //"可用",
      dataIndex: "balance",
      key: "balance",
      align: "center",
      // width: 158,
      render: (_text, record) => {
        const coin = coinList.find(
          (item: any) => item.coinName === record.coinName
        );
        return <span>{_text ? roundDown(_text, coin?.unitScale) : "0"}</span>;
      },
      sorter: (a, b) => a.balance - b.balance,
    },
    {
      title: t("assetsAccount.frozen"), //"冻结",
      key: "releaseBalance",
      dataIndex: "releaseBalance",
      width: 128,
      align: "center",
      render: (_text, record) => {
        const coin = coinList.find(
          (item: any) => item.coinName === record.coinName
        );
        return <span>{_text ? roundDown(_text, coin?.unitScale) : "0"}</span>;
      },
      sorter: (a, b) => a.releaseBalance - b.releaseBalance,
    },
    {
      title: t("assetsAccount.order"), //"下单锁定",
      key: "frozenBalance",
      dataIndex: "frozenBalance",
      width: 128,
      align: "center",
      render: (_text, record) => {
        const coin = coinList.find(
          (item: any) => item.coinName === record.coinName
        );
        return <span>{_text ? roundDown(_text, coin?.unitScale) : "0"}</span>;
      },
      sorter: (a, b) => a.frozenBalance - b.frozenBalance,
    },

  ];
  return (
    <Popup
      visible={open}
      onClose={() => {
        onClose?.();
      }}
      // destroyOnClose
      closeOnMaskClick
      bodyStyle={{ minHeight: '80vh' }}
      bodyClassName={styles.popContainer}
    >
      <div className={`${styles.title_color} flex-y justify-between h-full ${styles.pop_box}`}>
        <div className={`${styles.pop_header} flex-x algin-center justify-end`}>
          <span className={`${styles.title_color} flex-1`}>{title || '--'}</span>
          <button onClick={() => {
            onClose?.();
          }}
            className={styles.title_color}
          >
            <CloseOutline fontSize={20} />
          </button>
        </div>
        <div className={`${styles.pop_main} flex-1 px-4`}>
          <CustomTable
            columns={columns}
            dataSource={dataList ? [dataList] : []}
            className={`table-box`}
            pagination={false}
            locale={{ emptyText: <NoData /> }}
            p1cardBorder={'none'}
          />
        </div>
        <div className={`${styles.pop_footer} flex-row w-full px-4 `}>
          <button
            className={`default_btn ${styles.btn_style} mr-4 flex-1`}
            onClick={() => navigate('/assets/deposit')}
          >
            {/* 充值 */}
            {t("assetsAccount.button.deposit")}
          </button>
          <button
            className={`cancel_btn6 ${styles.btn_style} mr-4 flex-1`}
            onClick={() => navigate('/assets/withdraw')}
          >
            {/* 提现 */}
            {t("assetsAccount.button.withdraw")}
          </button>
          <button
            className={`cancel_btn6 ${styles.btn_style} flex-1`}
            onClick={() => navigate('/assets/bill')}
          >
            {/* 交易 */}
            {t("assetsAccount.button.trade")}
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default LanguageToggle; 