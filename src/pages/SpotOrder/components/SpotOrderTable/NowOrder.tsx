import React from 'react';
import styles from '../styles/now.module.scss'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tooltip, notification } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useLanguage } from '@/hooks/useLanguage';
import { NoData } from '@/components/noData'
import { Toast, ProgressBar } from 'antd-mobile'
import { getOrderList, getExchangeCoinList, revocationOrder, updateOrder } from '@/services/spot'
import { add, cut, division, lastD, nul, roundDown, roundUp } from '@/utils'
// import ToastModal from '@/components/spotModal/Toast_modal';
// import DelectModal from '@/components/spotModal/Delect_modal';
import { encryptData } from '@/utils/encrypt'
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { getRound } from '@/utils/getUseRate'
import { CustomTable } from '@/components/CustomCom'
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import SelectPop from '@/components/SelectPop'
import DelectModal from '../TipPop/Delect_modal'
interface DataType {
  id: number,
  orderId: string,
  amount: number,
  baseSymbol: string,
  canceledTime: number,
  coinSymbol: string,
  completedTime: number,
  direction: number,
  userId: number,
  price: number,
  status: number,
  symbol: string,
  createTime: number,
  updateTime: number,
  tradedAmount: number,
  turnover: number,
  type: number,
  useDiscount: number,
  orderResource: number,
  tenantId: string,
  fee: number,
  baseSymbolCount: number
}
interface symbolSelectType {
  label: string,
  value: string,
  baseSymbol: string,
  coinSymbol: string
}
interface Props {
  pageType?: string
}

const SpotMainPage = observer(({ pageType }: Props) => {
  const { t } = useLanguage(['spot']);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // 是否从现货交易引入
  const isExchange = pageType === 'exchange';
  // 获取币种列表
  // const {coinList} = useCoinList();
  const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表

  const [tableData, setTableData] = useState<DataType[]>([]);
  const [paramInfo, sePparamInfo] = useState({
    type: '',
    selsect: ''
  });
  const [total, setTotal] = useState(0);

  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
    direction: '',
    symbol: ''
  });

  const [loading, setLoading] = useState(false);
  const [symbolSelect, setSymbolSelect] = useState<symbolSelectType[]>([]);
  const [toastModal, setToastModal] = useState<boolean>(false);
  const [delectIdAll, setDelectIdAll] = useState<string[]>([]);
  const [delectModal, setDelectModal] = useState<boolean>(false);
  const [toastData, setToastData] = useState<any>({})
  const toastDataRef = useRef<any>({})
  const [delectType, setDelectType] = useState<number>(0);

  const columns: ColumnType<DataType>[] = [
    // {
    //   title: t('spot.columns.uploadTime'), //"更新时间",
    //   dataIndex: "updateTime",
    //   key: "updateTime",
    //   width: 128,
    //   align: "left",
    //   render: (text, record) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}`} </div>,
    // },
    {
      title: (_value, record) => {
        let directionText
        if (record.direction === 0) {
          directionText = t('spot.trade.buy')
          //  <span className={`${styles.success_icon}`} >{directionText || '--'}</span>;
        } else if (record.direction === 1) {
          directionText = t('spot.trade.sell')
          //  <span className={`${styles.error_icon}`} >{directionText || '--'}</span>;
        } else {
          directionText = '--'
        }
        let typeText
        if (record.type === 0) {
          typeText = t('spot.columns.market')
        } else if (record.type === 1) {
          typeText = t('spot.columns.limit')
        } else {
          typeText = '--'
        }
        return <div className='font-12'>
          <div>
            <span className={`mr-2_5 font-16 ${styles.title_color}`}>{_value}</span>
            <span className={`${styles.typeText}`}>{typeText}</span>
          </div>
          <div>
            <span className={`mr-2_5 ${record.direction === 0 ? styles.success_icon :
              record.direction === 1 ? styles.error_icon : styles.title_color}`}>
              {directionText}
            </span>
            <span>{record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') :
              record.updateTime ? dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
          </div>
        </div>
      },// t('spot.columns.symbol'), //"交易对",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      width: 148,
      render: (_text, record) => {
        const amount = nul(division(record.tradedAmount, record.amount), 100)
        const { baseScaleResult } = getRound(record.symbol, amount)

        return <div
          // className={`${record.direction === 1 ? styles.error_hover : record.direction?.toString() === '0' ? styles.success_hover : ''}`}
          // onClick={() => {
          //   navigate(`/spotOrder?symbol=${record.symbol}`)
          // }}
          className='flex-x-cc'
        >
          <div className={`mr-1 flex-y-cc ${styles.tip_color}`}>
            <span>  {record.tradedAmount && record.tradedAmount.toString() !== '0' ? `${roundDown(baseScaleResult, 2)}%` : '0%'}</span>
            <div className={`${styles.progress_bar} mt-1`}>
              <ProgressBar percent={amount}
                style={{
                  '--fill-color': 'var(--theme-color)',
                  '--track-width': '5px',
                }} />
            </div>

          </div>

          <button type='button'
            className={`${styles.cancel_btn} cancel_btn2 font-12 `}
            onClick={() => {
              setDelectIdAll([record.orderId])
              setDelectType(1)
              setDelectModal(true)
            }}
          >
            {t('spot.select.cancelOrder')}
          </button>
        </div >
      },
    },
    // {
    //   title: t('spot.columns.type'), //"类型",
    //   key: "type",
    //   dataIndex: "type",
    //   width: 128,
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
    //   title: t('spot.columns.direction'),//"方向",
    //   key: "direction",
    //   dataIndex: "direction",
    //   width: 128,
    //   align: "center",
    //   render: (_status) => {
    //     let text
    //     if (_status === 0) {
    //       text = t('spot.trade.buy')
    //       return <span className={`${styles.success_icon}`} >{text || '--'}</span>;
    //     } else if (_status === 1) {
    //       text = t('spot.trade.sell')
    //       return <span className={`${styles.error_icon}`} >{text || '--'}</span>;
    //     } else {
    //       return '--'
    //     }
    //   }
    // },
    {
      title: t('spot.columns.price'), //"价格",
      key: "price",
      dataIndex: "price",
      width: 128,
      align: "center",
      render: (_status, record) => {
        // const coin = coinList.find((item: any) => item.symbol === record.symbol);
        const { baseScaleResult } = getRound(record.symbol, _status)
        return <>{record.type === 1 ? <div className=''>
          <p className='text-right '> {baseScaleResult}</p>
          {/* <Tooltip title={t('spot.modal.edit')}>
            <button
              onClick={() => {
                Toast.show('接口：暂不做')
              }}
            >
              <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
            </button>
          </Tooltip> */}
        </div> : <p className='text-right'> {t('spot.select.market')}</p>}</>

      },
    },
    {
      title: t('spot.columns.quantity'), //"数量",
      key: "amount",
      dataIndex: "amount",
      width: 128,
      align: "center",
      render: (_status, record) => {
        // const {scaleResult} = getRound(record.symbol, _status)
        // return <>
        // {scaleResult}
        // </>
        const { scaleResult } = getRound(record.symbol, _status);
        const res = getRound(record.symbol, record.tradedAmount);
        if (record.type === 0 && record.direction === 0) {
          if (record.status === 1 || record.status === 5) {
            return <span>{res.scaleResult}</span>;
          } else {
            return <span>--</span>;
          }
        } else {
          return <span>{scaleResult}</span>;
        }
      },
    },
    // {
    //   title: t('spot.columns.completion'), //"完成度",
    //   key: "amount",
    //   dataIndex: "amount",
    //   width: 128,
    //   align: "center",
    //   render: (_amount, record) => {
    //     // amount/tradedAmount
    //     // const coin = coinList.find((item: any) => item.symbol === record.symbol);
    //     const amount = nul(division(record.tradedAmount, _amount), 100)
    //     const { baseScaleResult } = getRound(record.symbol, amount)
    //     return < >
    //       {_amount ?
    //         <span className={`${styles.tip_color2}`}>
    //           {/* {record.tradedAmount && record.tradedAmount.toString() !== '0' ?  `${roundDown(nul(division(record.tradedAmount, _amount),100),coin?.baseCoinScale)}%` : '0%'} */}
    //           {record.tradedAmount && record.tradedAmount.toString() !== '0' ? `${roundDown(baseScaleResult, 2)}%` : '0%'}
    //         </span> : '0'
    //       }
    //     </ >


    //   },
    // },
    {
      title: t('spot.columns.amount'), //成交额,
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_turnover, record) => {
        // const totalAmount = record.amount && record.price ? roundDown(nul(record.amount, record.price),2) : '0'
        // const coin = coinList.find((item: any) => item.symbol === record.symbol);
        const { baseScaleResult } = getRound(record.symbol, _turnover)

        return <span >{_turnover ? `${baseScaleResult}` : '0'}</span>;
      },
    },
    // {
    //   title: <button className={`error_icon`}
    //     onClick={() => {
    //       setDelectIdAllAll(tableData.map((item) => item.orderId))
    //       setDelectModal(true)
    //     }}
    //   >{t('spot.columns.cancel')}</button>, //"全撤",
    //   key: "operation",
    //   width: 128,
    //   align: "center",
    //   render: (_status, record) => {
    //     return <Tooltip title={t('spot.modal.cancel')} placement="left">
    //       <button
    //         onClick={() => {

    //           // setDelectIdAll([record.orderId])
    //           // setDelectOneSuccess(true)
    //           setToastData({
    //             coinSymbol: record.coinSymbol,
    //             symbol: record.symbol,
    //             baseSymbol: record.baseSymbol,
    //             price: record.price,
    //             amount: record.amount,
    //           })
    //           toastDataRef.current = {
    //             coinSymbol: record.coinSymbol,
    //             symbol: record.symbol,
    //             baseSymbol: record.baseSymbol,
    //             price: record.price,
    //             amount: record.amount,
    //           }
    //           // setToastModal(true)
    //           delectOne([record.orderId])
    //         }}
    //       >
    //         <Iconify icon="mingcute:delete-2-line" className='error_icon' size={24} />
    //       </button>
    //     </Tooltip>;
    //   },
    // },


  ];
  const handleDelectOk = (orderId: string[]) => {
    delectOrder(orderId)
  }
  const delectOrder = async (orderId: string[]) => {
    try {
      const paeam = {
        orderId: orderId,
      }
      const encrypt = await encryptData(paeam)
      const res = await revocationOrder(encrypt)
      if (res.code === '0') {
        Toast.show({
          content: t('spot.toastModal.canceled'),
          icon: 'success',
        })
        getOrderListData()
      } else {
        Toast.show({
          content: res.message,
          icon: 'fail',
        })
      }
    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail',
      })
    }

  };

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

  const pageChange = async (page: number, pageSize: number) => {
    const pageData = {
      page: page,
      pageSize: pageSize
    }
    paramdataRef.current.page = page
    paramdataRef.current.pageSize = pageSize
    getOrderListData()
  }
  const directionChange = async (value: any, options: any) => {
    if (value || value?.toString() === '0') {
      paramdataRef.current.direction = value
    } else {
      paramdataRef.current.direction = ''
    }
    await getOrderListData()
  }
  const symbolChange = async (value: any, options: any) => {
    if (value || value?.toString() === '0') {
      paramdataRef.current.symbol = value
    } else {
      paramdataRef.current.symbol = ''
    }
    await getOrderListData()
  }
 
  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 0,
      direction: (paramdataRef.current.direction || paramdataRef.current.direction.toString() === '0') ? paramdataRef.current.direction : null,
      // symbol: paramdataRef.current.symbol,
      coinSymbol: paramdataRef.current.symbol ? paramdataRef.current.symbol.split('/')[0] : null,
      baseSymbol: paramdataRef.current.symbol ? paramdataRef.current.symbol.split('/')[1] : null,
    }
    setLoading(true)
    try {
      const res = await getOrderList(params)
      if (res.code === '0') {
        const newData = res.data.list.map((item: any) => ({
          ...item
        }));
        setTableData(newData);
        setTotal(res.data.count);
      } else {
        Toast.show(res.message);
      }

    } catch (error) {
      Toast.show(String(error))
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
        ]
      )
    }

  }

  useEffect(() => {
    getCoinList()
    getOrderListData()
  }, [])



  return (<>
    <ConfigProvider
      theme={{
        components: {
          Table: {
            // bodySortBg: "pink",
            headerBg: "transparent",
            headerColor: "var(--text-color6)",
            headerSplitColor: "transparent", // 表头分割线颜色
            rowExpandedBg: "var(--background10)", // 表格行展开背景色
            borderColor: "transparent",
            // stickyScrollBarBg:"transparent",
            headerBorderRadius: 0, // 表头圆角
          },
          Pagination: {
            itemActiveBg: "transparent",
            itemBg: "transparent",
          },

          Select: {
            activeBorderColor: "var(--border-color4)",
            optionActiveBg: "transparent",
            selectorBg: "transparent", //选框背景色
          }
        },
      }}
    >
      <div className={`${styles.table_box} w-full `}>
        <div className={`${styles.table_header} w-full flex align-center pl-1 pr-4`}>
          <div className='flex-x-cc'>
            <SelectPop
              options={directionSelect}
              placeholder={t('spot.columns.direction')}
              title={t('spot.columns.direction')}
              onChange={directionChange}
            // showSearch={false}
            />
            <SelectPop
              options={symbolSelect}
              placeholder={isExchange ? t('spot.columns.coin') : t('spot.columns.symbol')}
              title={isExchange ? t('spot.columns.coin') : t('spot.columns.symbol')}
              onChange={symbolChange}
            // showSearch={false}
            />
          </div>

          <div className='flex-1 flex-x align-center justify-end'>
            <button
              onClick={() => {
                setDelectIdAll(tableData.map((item) => item.orderId))
                setDelectType(0)
                setDelectModal(true)
              }}
              className={`${styles.cancel_btn} cancel_btn2 font-12 `}
            >
              {t('spot.columns.cancel')}
            </button>
          </div>
          {/* <Form
            form={form}
            layout="inline"
            initialValues={{
              direction: '',
              symbol: ''
            }}
          >
            <Form.Item name="direction" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.direction')}</span>}
                onChange={directionChange}
              />
            </Form.Item>
            <Form.Item name="symbol" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={symbolSelect}
                className={`${styles.select_box} select-text-right`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.symbol')}</span>}
                onChange={symbolChange}
              />
            </Form.Item>
          </Form> */}
        </div>
        <div className={`${styles.tableBox_content} w-full `}>

          <CustomTable
            columns={columns}
            dataSource={tableData}
            className={`spot-table-box spot-pagination`}
            bodyClassName={styles.tables_content}
            headerClassName={styles.tables_header}
            pagination={{
              // showSizeChanger: true,
              current: paramdataRef.current.page,
              pageSize: paramdataRef.current.pageSize,
              total: total,
              hideOnSinglePage: true,
              onChange: (page, pageSize) => pageChange(page, pageSize),
            }}
            // loading={loading}
            locale={{ emptyText: <NoData textColor='#A4A5AC' height='45vh' position='top' /> }}
          />

        </div>
        <DelectModal open={delectModal}
          orderId={delectIdAll}
          type={delectType}
          onCancel={() => setDelectModal(false)}
          onOk={handleDelectOk} />
        {/* <ToastModal
          type='0'
          open={toastModal}
          toastData={toastData}
          onCancel={() => setToastModal(false)}
        /> */}
      </div>
    </ConfigProvider>
  </>
  );
});

export default SpotMainPage;