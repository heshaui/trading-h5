import React, { useState, useMemo } from 'react';
import { Popup, Toast } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import styles from '../styles/accountPop.module.scss';
import { CloseOutline } from 'antd-mobile-icons';
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
import {
  getCoinById,
} from "@/services/assets";
import  {useWithdraw} from "@/hooks/useWithdraw";



type Props = {
  open?: boolean;
  onClose?: () => void;
  recordData: DataType;
}
// 操作类型枚举
enum ActionType {
  WITHDRAW = '1',
  DEPOSIT = '2',
  TRADE = '3'
}

// 操作配置类型
type ActionConfig = {
  permission: 'canWithdraw' | 'canRecharge';
  errorKey: string;
  route?: string;
};

// 操作类型配置
const actionConfig: Record<ActionType.WITHDRAW | ActionType.DEPOSIT, ActionConfig> = {
  [ActionType.WITHDRAW]: {
    permission: 'canWithdraw',
    errorKey: 'assetsAccount.button.withdrawError2',
    route: '/assets/withdraw'
  },
  [ActionType.DEPOSIT]: {
    permission: 'canRecharge',
    errorKey: 'assetsAccount.button.depositError2',
    route: '/assets/toUp'
  }
};
const LanguageToggle: React.FC<Props> = ({ open = false, onClose, recordData }) => {
  const { t } = useLanguage('assets');
  const { isDayMode } = useThemeMode();
  const navigate = useNavigate();
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, ""); // 汇率key
  const coinList = appStore.getCoinList(); // 获取币种信息
  const coinPair = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
  const { goWithdraw, WithdrawStatusPopComponent } = useWithdraw();


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
    },

  ];


  const getCoinAuth = async (type: string, coinId: string | number) => {
    try {
      // 处理交易类型
      if (type === ActionType.TRADE) {
        const coinPairData = coinPair.find(
          (item: any) =>
            item.baseSymbol === recordData.coinName ||
            item.coinSymbol === recordData.coinName ||
            recordData.coinId === item.baseSymbol ||
            recordData.coinId === item.coinSymbol
        );

        if (coinPairData) {
          navigate('/exchange');
          // console.log('交易');
        } else {
          Toast.show({
            content: t("assetsAccount.button.tradeError2"),
            icon: 'fail'
          });
        }
        return;
      }

      // 处理充值和提现类型
      const config = actionConfig[type as ActionType.WITHDRAW | ActionType.DEPOSIT];
      if (!config) return;

      const res = await getCoinById(coinId);
      const { data, code } = res;

      if (code?.toString() !== "0") {
        Toast.show({
          content: res.message,
          icon: 'fail'
        });
        return;
      }

      // 检查权限并执行相应操作
      if (data?.[config.permission] === 1) {
        // 权限通过，执行跳转
        if(type === ActionType.WITHDRAW){
          goWithdraw();
        }else{
          navigate(config.route || '/');
        }
        // navigate(config.route || '/');
        // console.log('提现充值执行跳转');
      } else {
        // 权限不足，显示错误信息
        Toast.show({
          content: t(config.errorKey),
          icon: 'fail'
        });
      }

    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail'
      });
    }
  };




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
        <div className={`${styles.pop_header} flex-x algin-center justify-between`}>
          <span className={`${styles.title_color} flex-1`}>{recordData.coinName || '--'}</span>
          <button onClick={() => {
            onClose?.();
          }}
            className={styles.title_color}
          >
            <CloseOutline fontSize={20} />
          </button>
        </div>
        <div className={`${styles.pop_main} flex-1 px-2`}>
          <CustomTable
            columns={columns}
            dataSource={recordData ? [recordData] : []}
            className={`table-box`}
            pagination={false}
            locale={{ emptyText: <NoData /> }}
            p1cardBorder='none'
          />
        </div>
        <div className={`${styles.pop_footer} flex-row w-full px-4 `}>
          <button
            className={`default_btn ${styles.btn_style} mr-4 flex-1`}
            onClick={() => {
              // navigate('/assets/deposit')
              getCoinAuth("2", recordData.coinId)
            }}
          >
            {/* 充值 */}
            {t("assetsAccount.button.deposit")}
          </button>
          <button
            className={`cancel_btn6 ${styles.btn_style} mr-4 flex-1`}
            onClick={() => {
              getCoinAuth("1", recordData.coinId)
            }}
          >
            {/* 提现 */}
            {t("assetsAccount.button.withdraw")}
          </button>
          <button
            className={`cancel_btn6 ${styles.btn_style} flex-1`}
            onClick={() => {
              // navigate('/assets/bill')
              getCoinAuth("3", recordData.coinId)
            }}
          >
            {/* 交易 */}
            {t("assetsAccount.button.trade")}
          </button>
        </div>
        <WithdrawStatusPopComponent />
      </div>
    </Popup>
  );
};

export default LanguageToggle; 