import React from 'react';
import styles from '../styles/withdraw.module.scss'
import { Input, ConfigProvider, Tooltip, Select, Form, Button } from 'antd';
import { Iconify } from "@/components/icon"
import dayjs from 'dayjs';
import { useState, useEffect, useMemo, useRef } from "react";
import { useThemeMode } from '@/hooks/useThemeMode';
import { useNavigate } from 'react-router-dom';
import { NoData, NoAddress } from '@/components/noData';
// import WithdrawMoneyCheck from '@/components/assetsModal/withdrawMoneyCheck'
import { getuserAddressList, getWithdrawCoinAll, getcoinExtList, getUserBalance, getProtocolTypeAll, getUserALlLimit, getUserBalanceAll } from '@/services/assets'
import { Toast } from 'antd-mobile';
import { cut, nul, division, countNum, withdrawFee } from '@/utils'
import { useLanguage } from '@/hooks/useLanguage';
import { getLoginUserInfo } from "@/services/userCenter"
import { ResetStateProvider, useResetStateContext } from '@/context/reset-providers/ResetStateProvider';
import appStore from '@/store';
import { observer } from 'mobx-react-lite';
import { getRate, getCoinRate } from '@/utils/getUseRate';
import { coinSelectType, coinExtAllListType, coinExtSelectType, addressSelectType, SearchHistoryItem, coinInfoType, limitType } from '@/type/assets/assetsAccount/withdraw';
// import WithdrawSteps from '../compontents/withDrawSteps'
import ContentLayout from '@/components/ContentHeader';
import { Image } from 'antd-mobile';
import { SelectPopAntdWrapper } from '@/components/SelectPop';
import SelectPop from '@/components/SelectPop';


export const layout = 'header-only';
// 通过meta对象配置（推荐方式）

const WithdrawMoneyPage = observer(() => {
  const { t } = useLanguage('assets');
  const allConfig = appStore.getKvConfigAll();
  const { isDayMode } = useThemeMode();
  const [checkOpen, setCheckOpen] = useState(false);
  const rateData = appStore.getRateData() || [];
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, '')
  const navigate = useNavigate();

  // 商户支持的币种协议(网络)
  const [protocolTypeList, setProtocolTypeList] = useState<coinExtAllListType[]>([])
  // 币种
  const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
  const [coinLoading, setCoinLoading] = useState(false)
  const [coinIdHistory, setCoinIdHistory] = useState(0)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  // 币种余额信息
  const [coninInfo, setConinInfo] = useState<coinInfoType>({} as coinInfoType)

  // 币种协议(网络)
  const [coinExtLoading, setCoinExtLoading] = useState(false)
  const [coinExtSelect, setCoinExtSelect] = useState<coinExtSelectType[]>([])

  // 提现地址
  const [addressSelect, setAddressSelect] = useState<addressSelectType[]>([])
  const [addressLoading, setAddressLoading] = useState(false)

  const [amountNum, setAmountNum] = useState<number | null>(null)
  // 提现信息
  const [withdrawInfo, setWithdrawInfo] = useState<any>(null)

  const [form] = Form.useForm();

  // 添加状态来存储用户信息
  const [userInfo, setUserInfo] = useState<any>(null);

  // 添加状态来跟踪是否显示 MEMO
  const [showMemo, setShowMemo] = useState(false);

  const [allowWithdraw, setAllowWithdraw] = useState(false)
  const { resetState } = useResetStateContext();
  const [addressInput, setAddressInput] = useState('');

  // 控制地址下拉菜单的显示状态
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [userAllLimit, setUserAllLimit] = useState<limitType>({} as limitType)
  const [btnSumbitError, setBtnSumbitError] = useState(false);

  // 在 useEffect 中获取用户信息
  useEffect(() => {
    getUserData()
    // 从localStorage恢复搜索历史
    const savedHistory = localStorage.getItem('coinSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const getUserData = async () => {
    try {
      const res = await getLoginUserInfo()
      if (res.code === "0") {
        setUserInfo(res.data)
      } else {
        Toast.show({
          content: res.message,
          icon: 'fail'
        })
      }
    } catch (error) {
      console.error(t('safeModal.getUserInfoError'), error);
    }
  }

  // 币种
  const getCoinAllList = async () => {
    if (coinSelect.length > 0 || coinLoading) return
    await getCoinAllData()
  }

  const getCoinAllData = async () => {
    setCoinLoading(true)
    try {
      const res = await getWithdrawCoinAll()
      if (res.code === '0') {
        const coinList = res.data
          .filter((item: any) => item.status === 1 && item.canWithdraw === 1)
          .map((item: any) => ({
            ...item,
            label: `${item.coinName}(${item.nameDefault})`,
            value: item.coinId,
          }));
        const balanceAll = await getUserBalanceAllData()
        const coinListAll = coinList.map((item: any) => {
          const balance = balanceAll.find((balance: any) => balance.coinName === item.coinName)
          return {
            ...item,
            ...balance
          }
        })
        setCoinSelect(coinListAll)
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
      setCoinLoading(false)
    }
  }

  // 币种选中更改
  const coinChange = async (value: string | number | undefined, option: any) => {
    // 如果value是undefined，直接返回
    if (value === undefined) return;

    const coinId = form.getFieldValue('tenantId')

    if (coinId.toString() !== coinIdHistory.toString()) {
      form.resetFields(['protocolId']);
    }

    if (!value && !coinId) {
      form.resetFields(['protocolId']);
      return;
    }
    setShowMemo(option.memoTag === 1)
    // const selectedCoin = coinSelect.find(coin => coin.coinId.toString() === value.toString());
    // if (!selectedCoin) return;

    // 更新历史记录
    // const newHistoryItem = {
    //   ...selectedCoin,
    //   value: value.toString(), // 确保value是string类型
    //   label: selectedCoin.label,
    //   iconUrl: selectedCoin.iconUrl,
    // };
    // setSearchHistory(prev => {
    //   const filtered = prev.filter(item => item.value !== value.toString()).map(item => ({
    //     ...item,
    //     label: item.label,
    //     iconUrl: item.iconUrl
    //   }));
    //   const newHistory = [newHistoryItem, ...filtered].slice(0, 4);
    //   localStorage.setItem('coinSearchHistory', JSON.stringify(newHistory));
    //   return newHistory;
    // });

    // 获取币种余额
    const balance = await getUserBalanceData()
    setConinInfo(Object.assign(balance, option))

    // 币种选中后自动请求网络列表
    await getCoinExt(Number(value))
  }

  // 币种余额
  const getUserBalanceData = async () => {
    const tenantId = form.getFieldValue('tenantId')
    if (!tenantId) {
      return Toast.show({
        content: t('assetsAccount.selectCoin'),
        icon: 'fail'
      })
    }
    try {
      const res = await getUserBalance(tenantId)
      if (res.code === '0') {
        return res.data
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
    }
  }

  const getUserBalanceAllData = async () => {
    try {
      const res = await getUserBalanceAll()
      if (res.code === '0') {
        return res.data
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
    }
  }


  // 商户支持的币种协议(网络)-所有
  const getAllProtocolTypeList = async () => {
    try {
      const res = await getProtocolTypeAll()
      if (res.code === '0') {
        const protocolList = res.data.map((item: any) => ({
          ...item,
          label: `${item?.protocol}(${item?.protocolName})`,
          value: item.id,
        }))
        setProtocolTypeList(protocolList)
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
    }

  }
  // 币种对应的协议（网络）-通过币种协议获取网络id进行匹配
  const getCoinExt = async (coinId: number) => {
    if (!coinId) return
    setCoinExtLoading(true)
    try {
      const res = await getcoinExtList(coinId)
      if (res.code === '0') {
        const coinExtList = res.data.map((item: any) => {
          const protocol = protocolTypeList.find(protocol => protocol.id === item.protocolId)
          return {
            ...item,
            ...protocol,
            label: `${protocol?.protocol || '--'}(${protocol?.protocolName || '--'})`,
            value: item.protocolId,
          }
        })

        setCoinExtSelect(coinExtList)
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
      setCoinExtLoading(false)
    }
  }

  // 获取用户地址列表
  const getUserAddressData = async () => {
    if (addressLoading) return
    setAddressLoading(true)
    const pageParam = {
      pageNo: 1,
      pageSize: 100,
    }
    try {
      const res = await getuserAddressList(pageParam)
      if (res.code === '0') {
        const addressList = res.data.list.map((item: any) => ({
          ...item,
          label: item.addressTitle,
          value: item.id
        }))
        setAddressSelect(addressList)
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
      setAddressLoading(false)
    }
  }
  const filteredAddressOptions = useMemo(() => {
    return addressSelect.map((item: any) => {
      const isProtocolSupported = coinExtSelect.some(
        coinExt => coinExt.protocolName === item.protocolName ||
          coinExt.protocol === item.protocolName ||
          coinExt.protocolId === item.protocolId
      );
      return {
        ...item,
        disabled: !isProtocolSupported
      }
    })
  }, [addressSelect, coinExtSelect, form])
  // 地址变化处理
  const addressChange = (value: any, option: any) => {
    // console.log('Address changed:', value, option);

    // 直接使用传入的option，在coinExtSelect中查找匹配的协议
    if (option && coinExtSelect.length > 0) {
      const matchingProtocol = coinExtSelect.find(coinExt =>
        coinExt.protocolName === option.protocolName ||
        coinExt.protocol === option.protocolName ||
        coinExt.protocolId === option.protocolId
      );

      if (matchingProtocol) {
        // 设置表单中的protocolId
        form.setFieldValue('protocolId', matchingProtocol.value);

        // 更新MEMO显示状态
        // setShowMemo(matchingProtocol.memoTag === 1);
        // 更新币种信息
        setConinInfo(Object.assign(coninInfo, matchingProtocol));
        // 设置最小提现金额
        form.setFieldValue('amount', coninInfo.minWithdrawAmount);
        Toast.show(
          t('withdrawMoney.networkAutoSelected', {
            network: matchingProtocol.protocolName || matchingProtocol.protocol
          })
        );
      } else {
        // console.warn('No matching protocol found for address:', option);
        // 如果没有匹配的协议，清空protocolId
        form.setFieldValue('protocolId', undefined);
        setShowMemo(false);
        Toast.show(
          t('withdrawMoney.networkNotFound')
        );
      }
    }
  }

  // 网络变化处理
  const protocolChange = (value: any, option: any) => {
    // 如果value是undefined，直接返回
    if (value === undefined) return;
    // const selectedProtocol = coinExtSelect.find(item => item.id.toString() === value.toString());
    // if (selectedProtocol) {
    //   setShowMemo(selectedProtocol.memoTag === 1);
    // }
  }




  // 获取提现手续费显示
  const getWithdrawFee = (number: number, baseCoinName?: string) => {
    let coinName = ''
    if (baseCoinName) {
      coinName = baseCoinName || ''
    } else {
      coinName = coninInfo.coinName ||
        coinSelect.find((item: any) => item.coinId === form.getFieldValue('tenantId'))?.coinName || ''
    }
    const rateKeyName = rateKey.split('-')[0]; // 获取汇率key
    const { shortName, rate, symbol } = getRate(coinName, number, rateKeyName);
    return {
      coinName: coinName || '--',
      shortName,
      rate,
      symbol,
      text: `${rate} ${shortName}`
    }

  }

  // 验证地址
  const validateAddress = async (rule: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error(t('withdrawMoney.inputAddress')));
    }
    // 地址验证逻辑
    return Promise.resolve();
  }

  // 验证协议
  const validateProtocol = async (rule: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error(t('withdrawMoney.selectNetwork2')));
    }
    // 协议验证逻辑
    return Promise.resolve();
  }

  // 提交表单
  const onFinish = (values: any) => {
    console.log('Form values:', values);
    // 处理提交逻辑
  }
  useEffect(() => {
    getCoinAllData()
    getAllProtocolTypeList()
  }, [])

  return (<ContentLayout
    title={t('assets.withdraw')}
    footer={
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        className={`w-full ${styles.submit_btn}`}
        disabled={btnSumbitError}
        form="withdrawForm"
      >
        {t('withdrawMoney.submit')}
      </Button>
    }
  >
    <div className='px-4 mt-5'>
      <ConfigProvider
        theme={{
          components: {
            Form: {
              itemMarginBottom: 20
            },
            Input: {
              activeBorderColor: 'var(--theme-color)',
              hoverBorderColor: 'var(--theme-color)',
              controlHeightLG: 50,
              activeBg: 'transparent',
              hoverBg: 'transparent',
            },
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          // disabled={(userInfo?.merchantWithdrawalStatus !== 1 || !userInfo?.googleCode || userInfo.withdrawalStatus === 0)}
          id="withdrawForm"
        >
          {/* 币种选择 */}
          <Form.Item
            label={<span className={styles.tip_title}>{t('withdrawMoney.withdrawCoin')}</span>}
            name='tenantId'
            rules={[{ required: true, message: t('withdrawMoney.select') }]}
            required={false}
          >
            <SelectPopAntdWrapper
              allowClear={false}
              placeholder={t('withdrawMoney.select')}
              options={coinSelect}
              className={`${styles.select_box}`}
              renderBtn='selectInput'
              bodyStyle={{
                height: '80vh',
              }}
              optionRender={(option) => {
                return (
                  <div className='flex-x align-center justify-between'>
                    <div className="flex-x align-center font-14 font-w-400">
                      <Image
                        src={option.iconUrl || ''}
                        alt={option.coinName}
                        width={20}
                        height={20}
                        className={styles.coninIcon}
                        style={{ marginRight: 8 }}
                      />
                      <span>{option.coinName}</span>
                      <span className={styles.tip_color} style={{ marginLeft: 4 }}>
                        {option.nameDefault}
                      </span>
                    </div>
                    <div className='flex-y align-end font-14 font-w-500'>
                      <span>{option.balance}</span>
                      <span className={`${styles.tip_color} font-w-400 font-12`}>
                        {`≈${getWithdrawFee(option.balance, option.coinName).text}`}
                      </span>
                    </div>
                  </div>
                );
              }}
              notFoundContent={<NoData title={t('withdrawMoney.noRecord')} />}
              onFocus={getCoinAllList}
              onChange={(value, option) => {
                coinChange(value, option);
                // 手动触发表单验证，特别是当值为undefined时
                setTimeout(() => {
                  form.validateFields(['tenantId']);
                }, 0);
              }}
              loading={coinLoading}
            />
          </Form.Item>

          {/* 提现地址 */}
          <Form.Item
            label={<span className={styles.tip_title}>{t('withdrawMoneyCheck.withdrawAddress')}</span>}
            name='addressId'
            rules={[{ validator: validateAddress }]}
          >
            <div className="relative">
              <Input
                type="text"
                className={`${styles.input_box} modal-input`}
                placeholder={t('withdrawMoney.inputAddress')}
                allowClear
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onFocus={() => {
                  getUserAddressData();
                }}
                suffix={
                  // <div
                  //   onClick={(e) => {
                  //     e.stopPropagation();
                  //     setDropdownOpen(!dropdownOpen);
                  //     if (!dropdownOpen) {
                  //       getUserAddressData();
                  //     }
                  //   }}
                  //   style={{ cursor: 'pointer' }}
                  // >
                  //   <Iconify
                  //     icon="mdi:map-outline"
                  //     size={24}
                  //     className={`${styles.title_color}`}
                  //   />
                  // </div>
                  <SelectPop
                    options={filteredAddressOptions}
                    placeholder={t('withdrawMoney.selectAddress')}
                    bodyStyle={{
                      height: '80vh',
                    }}
                    showSearch={false}
                    activeType='icon'
                    renderBtn={(open: () => void) => {
                      return (
                        <div onClick={(e) => {
                          e.stopPropagation();
                          open();
                          // setDropdownOpen(!dropdownOpen);
                          if (!dropdownOpen) {
                            getUserAddressData();
                          }
                        }}>
                          <Iconify icon="mdi:map-outline" size={24} className={`${styles.title_color}`} />
                        </div>
                      )
                    }}
                    emptyRender={<NoAddress />}
                    optionRender={(option) => {
                      const isProtocolSupported = coinExtSelect.some(
                        coinExt => coinExt.protocolName === option.protocolName ||
                          coinExt.protocol === option.protocolName ||
                          coinExt.protocolId === option.protocolId
                      );
                      return (
                        <div
                          key={option.id}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 `}
                          onClick={() => {
                            if (isProtocolSupported) {
                              setAddressInput(option.addressName);
                              // setDropdownOpen(false);
                              addressChange(option.addressName, option);
                            }
                          }}
                        >
                          <div className="flex-y">
                            <p className={`${styles.title_color} font-14 font-w-400 mb-1`}>{option.addressTitle}</p>
                            <p className={`${styles.tip_color2} font-12 font-w-400 mb-1`}>
                              {`${t('withdrawMoney.address')}：${option.addressName}`}
                            </p>
                            <p className={`${styles.tip_color2} font-12 font-w-400`}>
                              {`${t('withdrawMoney.network')}：${option.protocolName || '--'}`}
                              {!isProtocolSupported && (
                                <span className="ml-2 text-red-500 font-12">
                                  ({t('withdrawMoney.selectNetwork3Error')})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    }}
                  // onChange={(value, option) => addressChange(value, option)}
                  />
                }
              />

            </div>
          </Form.Item>
          <Form.Item>
            {/* 选择网络 */}
            <Form.Item
              label={<span className={styles.tip_title}>{t('withdrawMoney.selectNetwork')}</span>}
              name='protocolId'
              rules={[{ validator: validateProtocol }]}
              required={false}
            >
              <SelectPopAntdWrapper
                allowClear
                placeholder={t('withdrawMoney.selectNetwork2')}
                options={coinExtSelect}
                className={`${styles.select_box} custom-select`}
                loading={coinExtLoading}
                onChange={(value, option) => {
                  protocolChange(value, option);
                  // 手动触发表单验证，特别是当值为undefined时
                  setTimeout(() => {
                    form.validateFields(['protocolId']);
                  }, 0);
                }}
                renderBtn='selectInput'
                showSearch={false}
                bodyStyle={{
                  minHeight: '45vh',
                  maxHeight: '90vh',
                }}
                activeType='icon'
                optionRender={(option) => {
                  const { rate, symbol } = getRate(option.coinName, option.minWithdraw);
                  return (<ul className={`${styles.select_option}  py-1 font-14 font-w-400`}>
                    <li className={`${styles.title_color} font-w-500`}>{option?.label}</li>
                    <li className={`${styles.tip_color} font-12 mt-1`}>
                      {/* 最小提现金额： */}
                      {t('withdrawMoneyCheck.minWithdraw')}
                      {option.minWithdraw || 0} {option.coinName}
                      {`(≈${symbol}${rate})`}
                    </li>
                    <li className={`${styles.tip_color} font-12 mt-1`}>
                      {/* 手续费： */}
                      {t('withdrawMoneyCheck.withdrawFee')} {option.withdrawFee || 0}%
                    </li>
                  </ul>);
                }}
              />


            </Form.Item>
            {/* MEMO标签 */}
            {showMemo ?
              <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-1 mt-2_5`}>
                <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                <span>
                  {/* 提币至其他交易所时需要填写标签，否则提币将失败 */}
                  {t('withdrawMoney.memoWarning')}
                </span>
              </p> : null}
          </Form.Item>
          {showMemo ? <Form.Item>
            <Form.Item name='momo' noStyle>
              <Input className={`${styles.input_box} `}
                placeholder={t('withdrawMoney.memoPlaceholder')}
                allowClear
              />

            </Form.Item>
            <Tooltip title={<p className='font-12'>{t('withdrawMoney.tipText')}</p>} placement="bottom">
              <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb1 mt-2_5`}>
                <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                <span>
                  {/* 请确认收币地址是否要求填写MEMO */}
                  {t('withdrawMoney.memoConfirm')}
                </span>
              </p>
            </Tooltip>
          </Form.Item> : null}
          {/* 提现数量 */}
          <Form.Item
            label={<span className={styles.tip_title}>{t('withdrawMoney.withdrawAmount')}</span>}
            name='amount'
            rules={[{ required: true, message: t('withdrawMoney.inputAmount') }]}
            required={false}
          >
            <Input
              type="number"
              className={`${styles.input_box} modal-input`}
              placeholder={t('withdrawMoney.inputAmount')}
              allowClear
            />
          </Form.Item>


        </Form>
      </ConfigProvider>

    </div>
  </ContentLayout >
  )
});

export default WithdrawMoneyPage;
