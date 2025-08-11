import React from 'react';
import styles from '../styles/now.module.scss'
import { Checkbox, ConfigProvider, Table, Select, Form, DatePicker } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { NoData } from '@/components/noData'
import { getOrderList, getExchangeCoinList, getOrderInfo } from '@/services/spot'
import { Toast } from 'antd-mobile'
import { division, nul, roundDown } from '@/utils';
import { getRound } from '@/utils/getUseRate'
import appStore from '@/store';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';
import { observer } from 'mobx-react-lite';
import type { DataType, DataLogsType, symbolSelectType, SelectParamType } from '@/type/spot/table';
import { CustomTable } from '@/components/CustomCom'
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import SelectPop from '@/components/SelectPop'
import DateTimePop from '@/components/DateTimePop'

interface CustomContentItem {
  key: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}
interface Props {
  pageType?: string;
}
const { RangePicker } = DatePicker;
const SpotMainPage = observer(({ pageType }: Props) => {
  const { t } = useLanguage(['spot']);
  const [form] = Form.useForm();
  // 是否是现货交易引入
  const isExchange = pageType === 'exchange';
  
  // 获取币种列表
  // const {coinList} = useCoinList();
  const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
  const userInfo = appStore.getUserInfo()
  const [tableData, setTableData] = useState<DataType[]>([]);
  const router = useNavigate();
  const [paramInfo, sePparamInfo] = useState({
    type: '',
    selsect: ''
  });
  const [total, setTotal] = useState(0);
  // const [pageParam, setPageParam] = useState({
  //   page: 1,
  //   pageSize: 10,
  // })
  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
  });
  const selectParam = useRef<SelectParamType>({
    startTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
    endTime: dayjs().endOf('day').valueOf(),
    direction: '',
    type: '',
    symbol: '',
    notStatus: ''
  })
  const [initTableData, setInitTableData] = useState<DataType[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [childDeviceNoData, setChildDeviceNoData] = useState<DataLogsType[]>([]);
  const [loading, setLoading] = useState(false);
  const [symbolSelect, setSymbolSelect] = useState<symbolSelectType[]>([]);

  const [datePopVisible, setDatePopVisible] = useState(false);
  const columns: ColumnType<DataType>[] = [
    {
      title: (_value, record) => {
        let directionText
        if (record.direction === 0) {
          directionText = t('spot.trade.buy')
        } else if (record.direction === 1) {
          directionText = t('spot.trade.sell')
        } else {
          directionText = '--'
        }
        let typeText
        if (record.type === 0) {
          typeText = t('spot.select.market')
        } else if (record.type === 1) {
          typeText = t('spot.select.limit')
        } else {
          typeText = '--'
        }
        return <div className='font-12'>
          <div>
            <span className={`mr-2_5 font-16 ${styles.title_color}`}>{_value}</span>
          </div>
          <div className={`${record.direction === 0 ? styles.success_icon :
            record.direction === 1 ? styles.error_icon : styles.title_color}`}>
            <span className={``}>{typeText}</span>/
            <span className={`mr-2_5 `}>
              {directionText}
            </span>

          </div>
        </div>
      },// t('spot.columns.symbol'), //"交易对",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      width: 148,
      render: (_text, record) => {
        // const amount = nul(division(record.tradedAmount, record.amount), 100)
        // const { baseScaleResult } = getRound(record.symbol, amount)

        return <button
          type='button'
          onClick={() => {
            router(`/spotOrder/detail`, {
              state: {
                recordData: record,
                orderId: record.orderId,
                symbol: record.symbol,
                fromTab: 'history' // 标识来源是历史委托tab
              }
            });
          }}
          className={`flex-x-cc font-14 ${styles.tip_color}`}
        >
          <span>{record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') :
            record.updateTime ? dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
          <div 
          // onClick={() => {
          //   handleExpand(true, record)
          // }}
          >
            <Iconify icon="mingcute:right-line" className={`${styles.tip_color} ml-1`} size={16} />
          </div>

        </button >
      },
    },

    {
      title: t('spot.columns.quantity'), //"数量",
      key: "amount",
      dataIndex: "amount",
      width: 128,
      align: "center",
      render: (_status: any, record: DataType) => {
        const { scaleResult: amountScaleResult } = getRound(record.symbol, _status);
        // const res = getRound(record.symbol, record.tradedAmount);
        const { scaleResult: tradedAmountScaleResult } = getRound(record.symbol, record.tradedAmount);


        let amountText
        if (record.type === 0 && record.direction === 0) {
          if (record.status === 1 || record.status === 5) {
            amountText = tradedAmountScaleResult
          } else {
            amountText = '--'
          }
        } else {
          amountText = amountScaleResult
        }
        const tradedAmountText = tradedAmountScaleResult ? tradedAmountScaleResult : '0'
        //   if(!Number(record.turnover) && record.type === 0){
        //     return <span>--</span>;
        //   }else{
        //   return <span>{_status ? scaleResult : '0'}</span>;
        // }
        return <span>{tradedAmountText}/{amountText}</span>;
      },
    },
    // {
    //   title: t('spot.columns.count'), //"成交数量",
    //   key: "tradedAmount",
    //   dataIndex: "tradedAmount",
    //   width: 128,
    //   align: "center",
    //   render: (_status: any, record: DataType) => {
    //     const { scaleResult } = getRound(record.symbol, _status);
    //     return <span>{_status ? scaleResult : '0'}</span>;
    //   },
    // },
        // {
    //   title: t('spot.columns.averagePrice'), //"成交均价",
    //   dataIndex: "tokenTime",
    //   key: "tokenTime",
    //   align: "center",
    //   width: 158,
    //   render: (_status, record) => {
    //     const averagePrice = record.tradedAmount ? division(record.turnover || 0, record.tradedAmount) : 0
    //     if (record.status === 0 || record.status === 1 || record.status === 5) {
    //       const { baseScaleResult } = getRound(record.symbol, averagePrice);
    //       return <span>{averagePrice ? baseScaleResult : '--'}</span>;
    //     } else if (record.type === 0) {
    //       return <span>{t('spot.select.market')}</span>;
    //     } else {
    //       return <span>--</span>;
    //     }
    //   },
    // },
    {
      title: t('spot.columns.price'), //"价格",
      key: "price",
      dataIndex: "price",
      width: 128,
      align: "center",
      render: (_status: any, record: DataType) => {
                const averagePrice = record.tradedAmount ? division(record.turnover || 0, record.tradedAmount) : 0
            let averagePriceText
        if (record.status === 0 || record.status === 1 || record.status === 5) {
          const { baseScaleResult } = getRound(record.symbol, averagePrice);
          averagePriceText=averagePrice ? baseScaleResult : '--'
        } else if (record.type === 0) {
          averagePriceText=t('spot.select.market')
        } else {
          averagePriceText='--'
        }
        let priceText
        if (record.type === 0) {
          priceText=t('spot.select.market')
        } else if (record.type === 1) {
          const { baseScaleResult } = getRound(record.symbol, _status);
          priceText=_status ? baseScaleResult : '0'
        } else {
          priceText='--'
        }
        return <span>{averagePriceText}/{priceText}</span>;
      },
    },

    // {
    //   title: t('spot.columns.amount2'), //"成交金额",
    //   key: "turnover",
    //   dataIndex: "turnover",
    //   width: 128,
    //   align: "center",
    //   render: (_status: any, record: DataType) => {
    //     const { baseScaleResult } = getRound(record.symbol, _status);
    //     return <span>{_status ? baseScaleResult : '0'}</span>;
    //   },
    // },
    {
      title: t('spot.columns.status'), //"状态",
      key: "status",
      dataIndex: "status",
      width: 128,
      align: "center",
      render: (_status) => {
        if (_status === 0) {
          return <span >{t('spot.select.trading') || '--'}</span>;
        } else if (_status === 1) {
          return <span >{t('spot.select.completed') || '--'}</span>;
        } else if (_status === 2) {
          return <span >{t('spot.select.failed') || '--'}</span>;
        } else if (_status === 3 || _status === 6) {
          return <span >{t('spot.select.canceled') || '--'}</span>;
        } else if (_status === 4) {
          return <span >{t('spot.select.created') || '--'}</span>;
        } else if (_status === 5) {
          return <span >{t('spot.select.partial') || '--'}</span>;
        }
        // else if (_status === 6) {
        //   return <span >{t('spot.select.canceled2') || '--'}</span>;
        // }
        else {
          return <span >{_status}</span>;
        }
      },
    },


  ];



  const directionSelect: { label: string, value: string | number }[] = [
    {
      label: t('spot.select.all'),
      value: ''
    },
    {
      label: t('spot.modal.buy'),
      value: 0
    },
    {
      label: t('spot.modal.sell'),
      value: 1
    }
  ]
  const typeSelect: { label: string, value: string | number }[] = [
    {
      label: t('spot.select.all'),
      value: ''
    },
    {
      label: t('spot.select.market'),
      value: 0
    },
    {
      label: t('spot.select.limit'),
      value: 1
    }
  ]
  const statusSelect: { label: string, value: string | number }[] = [
    {
      label: t('spot.select.all'),
      value: ''
    },
    {
      label: t('spot.select.completed'),
      value: 1
    },
    {
      label: t('spot.select.failed'),
      value: 2
    },
    {
      label: t('spot.select.canceled'),
      value: 3
    },
    {
      label: t('spot.select.partial'),
      value: 5
    }
  ]
  // 状态值
  const statusArr = [0, 1, 2, 3, 4, 5, 6]

  const pageChange = async (page: number, pageSize: number) => {
    // const pageData = {
    //   page: page,
    //   pageSize: pageSize
    // }
    // setPageParam(pageData)
    paramdataRef.current.page = page
    paramdataRef.current.pageSize = pageSize
    await getOrderListData()
  }
  // 处理展开/折叠行的函数 - 展开时清除URL中的deviceId
  const handleExpand = async (expanded: boolean, record: DataType) => {
    if (expanded) {
      setLoading(true);
      try {
        // 请求数据
        const params = {
          page: 1,
          pageSize: 1000,
          orderId: record.orderId,
          // symbol: `${record.symbol.split('/').join('_')}_${record.groupStatus}`
          symbol: `${record.symbol.split('/').join('_')}`
        };
        const res = await getOrderInfo(params);
        if (res.code === '0') {
          // 更新当前行的 userLoginLogs
          setTableData(prev =>
            prev.map(item =>
              item.orderId === record.orderId
                ? { ...item, userLoginLogs: res.data?.records || [] }
                : item
            )
          );
          setExpandedRowKeys([record.orderId]);
        } else {
          Toast.show({
            content: res.message,
            icon: 'fail',
          });
        }
      } catch (error) {
        Toast.show({
          content: String(error),
          icon: 'fail',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setExpandedRowKeys([]);
      setChildDeviceNoData([]);
    }
  };
  // 时间选择
  const dateChange = async (value: any) => {
    let startTime
    let endTime

    if (value) {
      // 开始时间保持不变，转为时间戳
      startTime = dayjs(value[0]).valueOf();

      // 结束时间先格式化为YYYY-MM-DD，然后加上23:59:59
      const endDate = dayjs(value[1]).format('YYYY-MM-DD');
      endTime = dayjs(`${endDate} 23:59:59`).valueOf();
      // endTime = dayjs(value[1]).endOf(value[1]).valueOf();
    }

    selectParam.current.startTime = startTime || ''
    selectParam.current.endTime = endTime || ''
    await getOrderListData()
  }

  // 现货交易时使用context
  const exchangeContext = isExchange ? useExchange() : null;
  const updateHistoryOrderCount = (count: number) => {
    if (isExchange && exchangeContext) {
      exchangeContext.setHistoryOrderCount(count);
    }
  };

  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 1,
      notStatus: selectParam.current.notStatus,
      coinSymbol: selectParam.current.symbol ? `${selectParam.current.symbol.split('/')[0]}` : null,
      baseSymbol: selectParam.current.symbol ? `${selectParam.current.symbol.split('/')[1]}` : null,
      startTime: selectParam.current.startTime ? dayjs(selectParam.current.startTime).valueOf() : null,
      endTime: selectParam.current.endTime ? dayjs(selectParam.current.endTime).valueOf() : null,
      direction: selectParam.current.direction || selectParam.current.direction?.toString() === '0' ? selectParam.current.direction : null,
      // type: selectParam.current.type || selectParam.current.type?.toString() === '0' ? selectParam.current.type : null,
    }
    setLoading(true)
    try {
      const res = await getOrderList(params)
      if (res.code === '0') {
        const newData = res.data.list.map((item: any) => ({
          ...item,
          userLoginLogs: []
        }));
        setInitTableData(newData);
        setTableData(newData);
        setTotal(res.data.count);
        const hasDirection = params.direction !== undefined && params.direction !== null;
        //const hasType = params.type !== undefined && params.type !== null;
        if (hasDirection || params.coinSymbol || params.baseSymbol || params.notStatus) {
          updateHistoryOrderCount(res.data.count);
        } else {
          updateHistoryOrderCount(0);
        }
      } else {
        Toast.show({
          content: res.message,
          icon: 'fail',
        });
      }

    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail',
      });
    } finally {
      setLoading(false)
    }
  }
  const getCoinList = async () => {
    const res = await getExchangeCoinList();
    if (res.code === '0') {
      const selectData = res.data.map((item: any) => {
        return {
          label: `${item.coinSymbol}/${item.baseSymbol}`,
          value: `${item.coinSymbol}/${item.baseSymbol}`,
          baseSymbol: item.baseSymbol,
          coinSymbol: item.coinSymbol,
          tenantId: item.tenantId
        }
      })
      setSymbolSelect(
        [
          {
            label: t('spot.select.all'),
            value: ''
          },
          ...selectData
        ])
    }

  }
  const getOrderInfoData = async (symbol: string, orderId: string, groupStatus: string) => {
    try {
      const params = {
        // baseCoinScale:symbol.split('/')[1],
        // coinScale:symbol.split('/')[0],
        page: 1,
        pageSize: 10,
        // baseCoinScale:'USDT',
        // coinScale:'BTC',
        // symbol:'base_quote_group'
        orderId: orderId,
        symbol: `${symbol.split('/').join('_')}_${groupStatus}`
      }
      const res = await getOrderInfo(params)
      if (res.code === '0') {
      }
    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail',
      });
    }
  }

  useEffect(() => {
    getCoinList()
    getOrderListData()
  }, [])
  return (<>
      {/* 充值 */}
      <div className={`${styles.table_box} w-full `}>
        <div className={`${styles.table_header} w-full flex align-center pl-1 pr-4`}>
          <div className='flex-x-cc'>
            <SelectPop
              options={directionSelect}
              placeholder={t('spot.columns.direction')}
              title={t('spot.columns.direction')}
              onChange={(value) => {
                selectParam.current.direction = value as string
                getOrderListData()
              }}
            // showSearch={false}
            />
            <SelectPop
              options={symbolSelect}
              placeholder={isExchange ? t('spot.columns.coin') : t('spot.columns.symbol')}
              title={isExchange ? t('spot.columns.coin') : t('spot.columns.symbol')}
              onChange={(value) => {
                selectParam.current.symbol = value as string
                getOrderListData()
              }}
            // showSearch={false}
            />
            {/* <SelectPop
              options={typeSelect}
              placeholder={t('spot.columns.type')}
              title={t('spot.columns.type')}
              onChange={(value) => {
                selectParam.current.type = value as string || ''
                getOrderListData()
              }}
            /> */}
            <SelectPop
              options={statusSelect}
              placeholder={t('spot.columns.status')}
              title={t('spot.columns.status')}
              onChange={(value) => {
                selectParam.current.notStatus = value !== '' ? statusArr.filter((item:number) => item !== value).join(',') : ''
                getOrderListData()
              }}
            />
          </div>

          <div className='flex-1 flex-x align-center justify-end'>
            <button
              onClick={() => setDatePopVisible(true)}
            >
              {/* {t('spot.columns.cancel')} */}
              <Iconify icon="mingcute:filter-line" className={`${styles.tip_color} ml-1`} size={20} />
            </button>
            <DateTimePop
            popupVisible={datePopVisible}
            onOpen={() => setDatePopVisible(true)}
            handlePopupClose={() => setDatePopVisible(false)}
            title={t('spot.select.filter')}
            onChange={(value)=>{
              selectParam.current.startTime = value[0]?.startOf('day').valueOf() || ''
              selectParam.current.endTime = value[1]?.endOf('day').valueOf() || ''
              getOrderListData()
            }}
            defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
            customHeader={
              <div className={`${styles.myCheckbox}`}>
              <Checkbox
                defaultChecked={false}
                onChange={(e) => {
                  selectParam.current.notStatus = e.target.checked ? '3' : ''
                  getOrderListData()
                }}
                className={`${styles.checkbox} custom-checkbox`}
              >
                <span className={`${styles.title_color} font-14`}>
                  {t('spot.select.hideAllCancel')}
                </span>
              </Checkbox>
              </div>
            }
            minDate={dayjs().subtract(6, 'month')}
            maxDate={dayjs()}
            placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
            />
          </div>
          {/* <Form
            form={form}
            layout="inline"
            initialValues={{
              type: '',
              direction: '',
              symbol: ''
            }}
          >
            <Form.Item name="time" >
              <RangePicker
                allowClear={true}
                className={`${styles.rangePicker_box} custom-range-picker mt-6`}
                suffixIcon={<Iconify icon="cuida:calendar-outline"
                  className={`${styles.title_color}`} size={20} />}
                placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
                onChange={dateChange}
                minDate={dayjs().subtract(6, 'month')}
                maxDate={dayjs().endOf('day')}
                defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
              />
            </Form.Item>

            <Form.Item name="type" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={typeSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.type')}</span>}
                onChange={(value) => {
                  selectParam.current.type = value
                  getOrderListData()
                }}
              />
            </Form.Item>
            <Form.Item name="direction" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.direction')}</span>}
                onChange={(value) => {
                  selectParam.current.direction = value
                  getOrderListData()
                }}
              />
            </Form.Item>
            <Form.Item name="symbol" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={symbolSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.symbol')}</span>}
                onChange={(value) => {
                  selectParam.current.symbol = value
                  getOrderListData()
                }}
              />
            </Form.Item>
            <Form.Item name="hideAllCancel" >
              <Checkbox
                defaultChecked={false}
                className={` mt-8`}
                onChange={(e) => {
                  console.log(e.target.checked, 123456789, 'value');
                  selectParam.current.notStatus = e.target.checked ? '3' : ''
                  getOrderListData()
                }}
              >
                <span className={`${styles.title_color} font-14`}>
                  {t('spot.select.hideAllCancel')}
                </span>
              </Checkbox>
            </Form.Item>
          </Form> */}
        </div>
        <div className={`${styles.table_content} w-full `}>

          <CustomTable
            columns={columns}
            dataSource={tableData}
            className={`spot-table-box`}
            bodyClassName={`${styles.tables_content} ${styles.history_content}`}
            headerClassName={styles.tables_header}
            loading={loading}
            // scroll={{ x: "max-content" }}
            pagination={{
              // position: ["bottomRight"],
              // showSizeChanger: false,
              total: total,
              current: paramdataRef.current.page,
              pageSize: paramdataRef.current.pageSize,
              hideOnSinglePage: true,
              onChange: (page, pageSize) => pageChange(page, pageSize),
            }}
            // pagination={false}
            locale={{ emptyText: <NoData textColor='#A4A5AC' height='45vh' position='top'/> }}
            // expandable={{
            //   expandedRowRender: (record) => {
            //     const isCurrentExpanded = expandedRowKeys.includes(record.orderId);
            //     return (
            //       <div key={record.orderId}>
            //         {isCurrentExpanded && record.userLoginLogs && record.userLoginLogs.length > 0 ? (
            //           <CustomTable
            //             columns={columns2}
            //             dataSource={record.userLoginLogs}
            //             // size="large"
            //             // scroll={{ x: "max-content" }}
            //             pagination={false}
            //             className={`spot-table-box2 ${styles.rowExpanded_table_box}`}
            //             rowKey="orderId"
            //             locale={{ emptyText: <NoData textColor='#A4A5AC' height='45vh' position='top' /> }}
            //           />
            //         ) : (
            //           <NoData textColor='#A4A5AC' />
            //         )}
            //       </div>
            //     );
            //   },
            //   // fixed: 'right',
            //   // expandRowByClick: true,
            //   // showExpandColumn: false,
            //   // onExpand: handleExpand,
            //   // expandedRowKeys: expandedRowKeys
            // }}
            rowKey="orderId"
          />


        </div>
      </div>
  </>
  );
});

export default SpotMainPage;