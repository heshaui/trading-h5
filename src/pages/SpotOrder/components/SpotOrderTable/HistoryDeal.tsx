import React from 'react';
import styles from '../styles/now.module.scss'
import { Checkbox, ConfigProvider, Table, Select, Form, DatePicker } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from 'dayjs';
import type { DatePickerProps } from 'antd';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { NoData } from '@/components/noData'
import { add, cut, division, nul, roundDown } from '@/utils'
import { getRound } from '@/utils/getUseRate'
import { getOrderList, getExchangeCoinList, getOrderInfo } from '@/services/spot'
import { Toast } from 'antd-mobile'
import appStore from '@/store';
import { useExchange } from '@/context/exchange-providers/ExchangeProvider';
import { observer } from 'mobx-react-lite';
import { CustomTable } from '@/components/CustomCom'
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import SelectPop from '@/components/SelectPop'
import DateTimePop from '@/components/DateTimePop'
const { RangePicker } = DatePicker;
interface DataType {
  id: number,
  tenantId: string,
  buyOrderId: number,
  sellOrderId: number,
  buyerUserId: number,
  sellerUserId: number,
  buyPrice: number,
  sellPrice: number,
  tradePrice: number,
  quantity: number,
  takerSide: number,
  buyFee: number,
  sellFee: number,
  ctime: string,
  mtime: string,
  symbol: string
}
interface symbolSelectType {
  label: string,
  value: string,
  baseSymbol: string,
  coinSymbol: string
}

interface SelectParamType {
  startTime: number | string;
  endTime: number | string;
  direction?: string;
  type?: string;
  symbol: string;
  notStatus: string | number;
}
interface Props {
  pageType?: string
}

const SpotMainPage = observer(({ pageType }: Props) => {
  const { t } = useLanguage(['spot']);
  const [form] = Form.useForm();
  // 是否从现货交易引入
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
  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
  });
  const selectParam = useRef<SelectParamType>({
    startTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
    endTime: dayjs().endOf('day').valueOf(),
    // direction: '',
    // type: '',
    symbol: '',
    notStatus: ''
  });
  const [loading, setLoading] = useState(false);
  const [symbolSelect, setSymbolSelect] = useState<symbolSelectType[]>([]);
  const [datePopVisible, setDatePopVisible] = useState(false);

  const columns: ColumnType<DataType>[] = [
    // {
    //   title: t('spot.columns.date'), //"日期",
    //   dataIndex: "ctime",
    //   key: "ctime",
    //   width: 200,
    //   align: "left",
    //   render: (text) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`} </div>,
    // },
    // {
    //   title: t('spot.columns.symbol'), //"交易对",
    //   dataIndex: "symbol",
    //   key: "symbol",
    //   align: "center",
    //   width: 158,
    //   render: (_text, record) => {
    //     const flag =orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
    //     return <button type='button' className={`${flag === 1 ? styles.error_hover : flag === 0 ? styles.success_hover : ''}`}
    //     onClick={() => {
    //       router(`/spot?symbol=${record.symbol}`)
    //     }}
    //   >
    //     {_text ? `${_text.split('_').join('/')}` : '--'}
    //     <Iconify icon="mingcute:right-line" className={`${flag === 1 ? styles.error_hover : flag === 0 ? styles.success_hover : ''} mx-1`} size={20} />
    //   </button >},
    //   //   render: (_text, record) => <button type='button' className={`${record.status === 2 ? styles.error_icon : ''}`}
    //   //   onClick={() => {
    //   //     router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
    //   //   }}
    //   // >
    //   //   {_text?`${_text.split('_').join('/')}` : '--'}
    //   //   <Iconify icon="mingcute:right-line" className={`${record.status === 2 ? styles.error_icon : ''} mx-1`} size={20} />
    //   // </button >,

    // },
    {
      title: (_value, record) => {
        const flag = orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
        let directionText
        if (flag === 0) {
          directionText = t('spot.trade.buy')
        } else if (flag === 1) {
          directionText = t('spot.trade.sell')
        } else {
          directionText = '--'
        }
        return <div className='font-12'>
          <div>
            <span className={`mr-2_5 font-16 ${styles.title_color}`}>{_value}</span>
          </div>
          <div className={`${flag === 0 ? styles.success_icon :
            flag === 1 ? styles.error_icon : styles.title_color}`}>
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
        return <div
          className={`flex-x-cc font-14 ${styles.tip_color}`}
        >
          <span>{record.ctime ? dayjs(record.ctime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
          {/* <button type='button'
            // onClick={() => {
            //   handleExpand(true, record)
            // }}
            >
              <Iconify icon="mingcute:right-line" className={`${styles.tip_color} ml-1`} size={16} />
            </button> */}

        </div >
      },
    },
    // {
    //   title: t('spot.columns.type'), //"类型",
    //   key: "type",
    //   dataIndex: "type",
    //   width: 108,
    //   align: "center",
    //   render: (_text) => {
    //     if (_text === 0) {
    //       return <span >{t('spot.columns.market')}</span>;
    //     } else if (_text === 1) {
    //       return <span  >{t('spot.columns.limit')}</span>;
    //     } else {
    //       return <span >--</span>;
    //     }
    //   },
    // },
    // {
    //   title: t('spot.columns.direction'), //"方向",
    //   dataIndex: "takerSide",
    //   key: "takerSide",
    //   align: "center",
    //   width: 108,
    //   render: (_status, record) => {
    //     const flag = orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
    //     let text
    //     if (flag === 0) {
    //       text = t('spot.trade.buy')
    //       return <span className={`${styles.success_icon}`} >{text || '--'}</span>;
    //     } else if (flag === 1) {
    //       text = t('spot.trade.sell')
    //       return <span className={`${styles.error_icon}`} >{text || '--'}</span>;
    //     } else {
    //       return '--'
    //     }
    //   },
    // },
    {
      title: t('spot.columns.tradePrice'), //"成交价",
      dataIndex: "tradePrice",
      key: "tradePrice",
      align: "center",
      width: 158,
      render: (_status, record) => {
        // const amount = division(_status, record.quantity)
        // const { baseScaleResult } = getRound(record.symbol, amount)
        const { baseScaleResult } = getRound(record.symbol, _status)
        return <span >{_status ? baseScaleResult : '0'}</span>;

      },
    },

    {
      title: t('spot.columns.count'),  //"成交数量",
      key: "quantity",
      dataIndex: "quantity",
      width: 108,
      align: "center",
      render: (_status, record) => {
        const { scaleResult } = getRound(record.symbol, _status)
        return <span >{_status ? scaleResult : '0'}</span>;
      },
    },

    {
      title: t('spot.columns.role'), //"角色",
      key: "takerSide",
      dataIndex: "takerSide",
      width: 128,
      align: "center",
      render: (_status, record) => {
        return maskName(_status, record.buyerUserId, record.sellerUserId)
      },
    },

    {
      title: t('spot.columns.fee'), //"手续费",
      key: "buyFee",
      dataIndex: "buyFee",
      // width: 158,
      align: "center",
      render: (_status, record) => {
        // const coin = coinList.find((item: any) => item.symbol === record.symbol);
        const buyRes = getRound(record.symbol, record.buyFee || 0)
        const sellRes = getRound(record.symbol, record.sellFee || 0)
        const flag = orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
        if (flag === 0) {
          return <span >{`${buyRes.baseScaleResult} ${buyRes.coinSymbol || '--'}`}</span>;
        } else if (flag === 1) {
          return <span >{`${sellRes.baseScaleResult} ${sellRes.baseSymbol || '--'}`}</span>;
        } else {
          return <span >{'--'}</span>;
        }
      },
    },
    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "tradePrice",
      dataIndex: "tradePrice",
      width: 128,
      align: "center",
      render: (_status, record) => {
        // const coin = coinList.find((item: any) => item.coinName === record.symbol.split('/')[1]);
        // const coin = coinList.find((item: any) => item.symbol === record.symbol);
        const amount = nul(_status, record.quantity)
        const { baseScaleResult } = getRound(record.symbol, amount)
        return <span >{_status ? baseScaleResult : '0'}</span>;
      },
    },


  ];
  const orderDirection = (takerSide: number, buyerUserId: number, sellerUserId: number) => {
    const userId = userInfo.userId
    if (sellerUserId === userId && buyerUserId === userId) {
      return takerSide
    } else if (sellerUserId === userId) {
      return 1
    } else if (buyerUserId === userId) {
      return 0
    } else {
      return '--'
    }
  }
  const maskName = (takerSide: number, buyerUserId: number, sellerUserId: number) => {
    const userId = userInfo.userId
    if (takerSide === 0) {
      if (userId === buyerUserId) {
        return 'Taker'
      } else {
        return 'Maker'
      }
    } else if (takerSide === 1) {
      if (userId === sellerUserId) {
        return 'Taker'
      } else {
        return 'Maker'
      }
    } else {
      return '--'
    }
  }
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

  const pageChange = async (page: number, pageSize: number) => {
    paramdataRef.current.page = page;
    paramdataRef.current.pageSize = pageSize;
    await getOrderListData();
  }
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
  const updateHistoryDealCount = (count: number) => {
    if (isExchange && exchangeContext) {
      exchangeContext.setHistoryDealCount(count);
    }
  };

  const getOrderListData = async () => {
    setLoading(true);
    // const symbol = form.getFieldValue('symbol');
    const symbol = selectParam.current.symbol
    try {
      // 请求数据
      const params = {
        page: paramdataRef.current.page,
        pageSize: paramdataRef.current.pageSize,
        symbol: `${symbol.split('/').join('_')}`,
        startTime: dayjs(selectParam.current.startTime).valueOf(),
        endTime: dayjs(selectParam.current.endTime).valueOf(),
        // sellUserId:  selectParam.current.direction?.toString() === '0' ? userInfo.userId : null,
        // buyUserId:  selectParam.current.direction?.toString() === '1' ? userInfo.userId : null,
      };
      const res = await getOrderInfo(params);
      if (res.code === '0') {
        const newData = res.data.records?.map((item: any) => ({
          ...item,
          symbol: `${item.symbol.split('_').join('/')}`,
        }));
        setTableData(newData);
        setTotal(res.data?.total);
        if (params.symbol) {
          updateHistoryDealCount(res.data?.total ?? 0);
        } else {
          updateHistoryDealCount(0);
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
      setLoading(false);
    }

  }
  const getCoinList = async () => {
    try {
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

        setSymbolSelect([
          {
            label: t('spot.select.all'),
            value: ''
          },
          ...selectData
        ])
        // 设置默认值
        // form.setFieldsValue({
        //   symbol: selectData[0].value
        // })
        // selectParam.current.symbol = selectData[0].value;
      }
    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail',
      });
    }
  }
  const disabled7DaysDate = (current: Dayjs, info?: { from?: Dayjs; type?: string }) => {
    const { from, type } = info || {};
    
    if (from) {
      // 如果已经选择了一个日期，限制另一个日期的选择范围为7天内
      const minDate = from.subtract(7, 'days');
      const maxDate = from.add(7, 'days');
      
      switch (type) {
        case 'year':
          return current.year() < minDate.year() || current.year() > maxDate.year();
        case 'month':
          const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();
          return (
            getYearMonth(current) < getYearMonth(minDate) ||
            getYearMonth(current) > getYearMonth(maxDate)
          );
        default:
          return Math.abs(current.diff(from, 'days')) > 7;
      }
    }
    
    // 如果没有选择起始日期，则限制在6个月范围内
    const sixMonthsAgo = dayjs().subtract(6, 'month');
    const today = dayjs();
    
    return current.isBefore(sixMonthsAgo) || current.isAfter(today);
  };
  const initData = async () => {
    try {
      await getCoinList(); // 等待 getCoinList 完成
      await getOrderListData(); // 然后执行 getOrderListData
    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail',
      });
    }
  };

  useEffect(() => {
    initData()
  }, [])
  return (<>
    {/* 充值 */}
    <div className={`${styles.table_box} w-full `}>
      <div className={`${styles.table_header} w-full  flex align-center pl-1 pr-4`}>
        <SelectPop
          options={symbolSelect}
          placeholder={isExchange ? t('spot.columns.coin') : t('spot.columns.symbol')}
          title={isExchange ? t('spot.columns.coin') : t('spot.columns.symbol')}
          onChange={(value) => {
            selectParam.current.symbol = value as string
            getOrderListData();
          }}
          value={selectParam.current.symbol}
          // defaultValue={symbolSelect[0]?.value}
        />
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
            onChange={(value) => {
              selectParam.current.startTime = value[0]?.startOf('day').valueOf() || ''
              selectParam.current.endTime = value[1]?.endOf('day').valueOf() || ''
              getOrderListData()
            }}
            defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
            minDate={dayjs().subtract(6, 'month')}
            maxDate={dayjs().endOf('day')}
            placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
            disabledDate={disabled7DaysDate}
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
              allowClear={false}
              className={`${styles.rangePicker_box} custom-range-picker mt-6`}
              
              suffixIcon={<Iconify icon="cuida:calendar-outline"
                className={`${styles.title_color}`} size={20} />}
              placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
              onChange={dateChange}
              minDate={dayjs().subtract(6, 'month')}
              maxDate={dayjs().endOf('day')}
              defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
              disabledDate={disabled7DaysDate}
            />
          </Form.Item>
          <Form.Item name="symbol" >
            <Select allowClear={false}
              placeholder={t('spot.select.all')}
              options={symbolSelect}
              className={`${styles.select_box} select-text-right mt-6`}
              prefix={<span className={`${styles.title_color}`}>{t('spot.columns.symbol')}</span>}
              onChange={(value) => {
                selectParam.current.symbol = value;
                getOrderListData();
              }}
            />
          </Form.Item>
        </Form> */}
      </div>
      <div className={`${styles.table_content} w-full `}>

        <CustomTable
          columns={columns}
          dataSource={tableData}
          // size="large"
          // scroll={{ x: "max-content", y: 300 }}
          // scroll={{ x: "max-content" }}
          className={`spot-table-box`}
          bodyClassName={`${styles.tables_content} ${styles.history_content}`}
          headerClassName={styles.tables_header}
          pagination={{
            current: paramdataRef.current.page,
            pageSize: paramdataRef.current.pageSize,
            total: total,
            hideOnSinglePage: true,
            onChange: (page, pageSize) => pageChange(page, pageSize),
          }}
          loading={loading}
          locale={{ emptyText: <NoData textColor='#A4A5AC' height='45vh' position='top' /> }}
        />

      </div>
    </div>
  </>
  );
});

export default SpotMainPage;