import React from 'react';
import styles from '../styles/billDetails.module.scss'
import { Input, ConfigProvider } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
// import { getRecordList } from '@/services/invite';
import { Toast } from 'antd-mobile';
import { NoData } from '@/components/noData'
import { getCoinRate } from '@/utils/getUseRate';
import { roundDown } from '@/utils/math'
import appStore from '@/store';
import { getWithdrawDepositList } from '@/services/assets'
import { RechargeDataType } from "@/type/assets/billDetails/table"
import { CustomTable } from '@/components/CustomCom'
import { getCoinAll, getOrderList } from "@/services/assets";
import SelectPop from '@/components/SelectPop'
import DateTimePop from '@/components/DateTimePop'

type PropsType = {
  // tableData: RechargeDataType[]
  // loading:boolean
  coinSelect: any[]
}

export default function InviteTable({coinSelect}: PropsType) {
  const { t } = useLanguage(['assets']);
  const [tableData, setTableData] = useState<RechargeDataType[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const coninList = appStore.getCoinList()
  const [datePopVisible, setDatePopVisible] = useState(false);

  const pageParam = useRef({
    page: 1,
    pageSize: 10,
    total: 0,
    symbol: ''
  })
  const getStatus = (status: number) => {
    const statusText = Number(status)
    if (!statusText && statusText !== 0) {
      return '--'
    }
    switch (statusText) {
      case 1:
        return t('select.pending') //'待发放';
      default:
        return t('select.done') //'已完成'
    }
  }
  const columns: ColumnType<RechargeDataType>[] = [
    {
      title: (_value, record) => {
        return <div className='flex-y'>
          <span className={`font-14 font-w-500 ${styles.title_color}`} >{record?.symbol || '--'}</span>
          <span className={`font-12 font-w-400 ${styles.tip_color}`} >{_value ? dayjs(_value).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
        </div>
      },
      dataIndex: "timestamp",
      key: "timestamp",
      // width: 158,
      align: "left",
      render: (_value, record) => {
        const coin = coninList.find((item: any) => item.coinName === record.symbol || item.coinId === record.symbol)
        const text = roundDown(record.amount, coin?.unitScale || 0)
      return <div className='flex-x-cc'>
        <div className='mr-1'>
          <div className={`font-14 font-w-500 ${styles.title_color}`} >{text || '0'}</div>
        <div className={`font-12 font-w-400 ${styles.tip_color}`}>{getStatus(Number(record.status)) || '--'}</div>
        </div>
      </div>},
    },
  ];



  const pageChange = async (page: number, pageSize: number) => {
    pageParam.current.page = page;
    pageParam.current.pageSize = pageSize;
    getRecordData();
  }

  const getRecordData = async () => {
    setLoading(true)
    try {
      const res = await getOrderList({
        pageNo: pageParam.current.page,
        pageSize: pageParam.current.pageSize,
        symbol: pageParam.current.symbol || null,
        billType: 'REBATE',
      });
      if (res.code === '0') {
        setTableData(res.data.list)
        pageParam.current.total = res.data.count
      } else {
        Toast.show({
          content: res.message,
          icon: 'fail'
        })
      }
    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRecordData()
  }, [])

  return (<>
      {/* 邀请奖励 */}
      <div className={`${styles.table_box} w-full `}>
      <div className={`${styles.table_header} w-full  flex align-center pl-1 pr-4`}>
        <SelectPop
          options={coinSelect}
          placeholder={t('assetsAccount.currency')}
          title={t("billDetails.selectCoin")}
          onChange={(value) => {
            pageParam.current.page=1
            pageParam.current.symbol = value as string || ''
            getRecordData();
          }}
          value={pageParam.current.symbol}
          displayMode="value"
          optionRender={(option) => (
            <div className="flex-x align-center justify-between">
              <div className="flex items-center py-1">
                <img
                  src={option.iconUrl}
                  alt={option.label as string}
                  width={20}
                  height={20}
                  className="mr-2"
                  style={{
                    borderRadius: "50%",
                    height: "20px",
                    width: "20px",
                  }}
                />
                <span className="text-text-color7">
                  {`${option.coinName}(${option.nameDefault})`}
                </span>
              </div>
            </div>
          )}
          // defaultValue={symbolSelect[0]?.value}
        />
        <div className='flex-1 flex-x align-center justify-end'>
          <button
            // onClick={() => setDatePopVisible(true)}
          >
            {/* {t('spot.columns.cancel')} */}
            <Iconify icon="mingcute:filter-line" className={`${styles.tip_color} ml-1`} size={20} />
          </button>
          {/* <DateTimePop
            popupVisible={datePopVisible}
            onOpen={() => setDatePopVisible(true)}
            handlePopupClose={() => setDatePopVisible(false)}
            title={t('spot.select.filter')}
            onChange={(value) => {
              pageParam.current.startTime = value[0]?.startOf('day').valueOf() || ''
              pageParam.current.endTime = value[1]?.endOf('day').valueOf() || ''
              getRecordData()
            }}
            defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
            minDate={dayjs().subtract(6, 'month')}
            maxDate={dayjs().endOf('day')}
            placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
          /> */}
        </div>
      </div>
        <div className={`${styles.table_content} w-full px-4 py-4`}>
          <CustomTable
            columns={columns}
            dataSource={tableData}
            className={`table-box`}
            pagination={{
              current: pageParam.current.page,
              pageSize: pageParam.current.pageSize,
              total: pageParam.current.total,
              hideOnSinglePage: true,
              onChange: (page, pageSize) => pageChange(page, pageSize),
            }}
            loading={loading}
            locale={{ emptyText: <NoData textColor='#A4A5AC'  /> }}
            p1cardBorder='none'
          />
        </div>
      </div>
  </>
  );
};