import React from 'react';
import styles from '../styles/withdraw.module.scss'
import { Input, ConfigProvider, Tooltip, Select, Form, Button } from 'antd';
import { Iconify } from "@/components/icon"
import dayjs from 'dayjs';
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import WithdrawMoneyCheck from '../components/withDrawPop/WithdrawCheck';


export const layout = 'header-only';
// 通过meta对象配置（推荐方式）

const WithdrawMoneyPage = observer(() => {
  const { t } = useLanguage('assets');
  const [checkOpen, setCheckOpen] = useState(false);
  const userInfo = appStore.getUserInfo();
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, '')
  const token = appStore.getToken();
  const allConfig = appStore.getKvConfigAll();
  const navigate = useNavigate();

  // 商户支持的币种协议(网络)
  const [protocolTypeList, setProtocolTypeList] = useState<coinExtAllListType[]>([])
  // 币种
  const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
  const [coinLoading, setCoinLoading] = useState(false)
  const [coinIdHistory, setCoinIdHistory] = useState(0)
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


  // 添加状态来跟踪是否显示 MEMO
  const [showMemo, setShowMemo] = useState(false);

  const [allowWithdraw, setAllowWithdraw] = useState(false)
  const [addressInput, setAddressInput] = useState('');

  // 控制地址下拉菜单的显示状态
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // SelectPop ref，用于控制地址选择器的状态
  const addressSelectRef = useRef<any>(null);

  const [userAllLimit, setUserAllLimit] = useState<limitType>({} as limitType)

  // 获取用户24小时限额
  const getUserALlLimitData = async () => {
    try {
      const res = await getUserALlLimit()
      if (res.code === '0') {
        setUserAllLimit(res.data)
      }
    } catch (error) {
      Toast.show({
        content: String(error),
        icon: 'fail'
      })
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

    // 检查是否是币种更改（与历史记录比较）
    const isCoinChanged = coinIdHistory !== 0 && Number(value) !== coinIdHistory;

    // 币种更改时清空相关表单字段和状态
    if (isCoinChanged) {
      // 清空表单相关字段
      form.resetFields(['protocolId', 'addressId', 'amount', 'momo']);

      // 清空相关状态
      setAmountNum(null);
      setAddressInput('');
      setShowMemo(false);
      setAllowWithdraw(false);
      setCoinExtSelect([]);
      setConinInfo({} as coinInfoType);
    }

    // 更新币种历史ID
    setCoinIdHistory(Number(value));

    if (!value) {
      return;
    }

    // 设置MEMO显示状态（基于新选中的币种）
    setShowMemo(option.memoTag === 1);

    // 获取币种余额
    const balance = await getUserBalanceData();
    setConinInfo(Object.assign(balance, option));

    // 币种选中后自动请求网络列表
    await getCoinExt(Number(value));
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
      const coinInfo=coinSelect.find(coinItem=>coinItem.value===form.getFieldValue('tenantId'))
      const isProtocolSupported = coinExtSelect.some(
        (coinExt) =>
          (coinExt.protocolName === item.protocolName ||
            coinExt.protocol === item.protocolName ||
            coinExt.protocolId === item.protocolId)
          && (coinInfo?.coinId === item.coinId || coinInfo?.coinName === item.coinName)
      );
      return {
        ...item,
        disabled: !isProtocolSupported
      }
    })
  }, [addressSelect, coinExtSelect, form])
  const addressInputChange = useCallback((value: string) => {
    // 更新地址输入框的值
    setAddressInput(value)
    // 更新表单字段
    form.setFieldValue('addressId', value)

    // 当用户手动输入地址时，清空SelectPop的选中状态
    // 这样可以避免SelectPop显示已选中某个地址，但实际输入框是手动输入的内容
    // 注意：这里只清空选中状态，不清空提现网络的内容
    if (addressSelectRef.current) {
      addressSelectRef.current.clearSelection?.()
    }
  }, [form])

  // 地址变化处理（从SelectPop选择时触发）
  const addressChange = (value: any, option: any) => {
    // console.log('Address changed:', value, option);
    // if (!allowWithdraw)  return
    if (!value || value === '') return
    // form.setFieldValue('addressId', value)
    // 直接使用传入的option，在coinExtSelect中查找匹配的协议
    if (option && coinExtSelect.length > 0) {
      const matchingProtocol = coinExtSelect.find(coinExt =>
        coinExt.protocolName === option.protocolName ||
        coinExt.protocol === option.protocolName ||
        coinExt.protocolId === option.protocolId
      );

      if (matchingProtocol) {
        // 自动设置匹配的网络协议
        form.setFieldValue('protocolId', matchingProtocol.value);
        // 更新币种信息
        setConinInfo(Object.assign(coninInfo, matchingProtocol));
        // 设置最小提现金额
        // form.setFieldValue('amount', coninInfo.minWithdrawAmount);
        form.setFieldValue('amount', getMinWithdraw('min'));
        setAmountNum(getMinWithdraw('min'))
        // 检查是否允许提现
        checkAllowWithdraw(getMinWithdraw('min'))

        Toast.show(
          t('withdrawMoney.networkAutoSelected', {
            network: matchingProtocol.protocolName || matchingProtocol.protocol
          })
        );
      } else {
        // 如果没有匹配的协议，清空相关字段
        form.setFieldValue('protocolId', null);
        form.setFieldValue('amount', null);
        setAmountNum(null)
        setShowMemo(false);
        // 检查是否允许提现
        checkAllowWithdraw(null as any)
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
    // 更新币种信息
    setConinInfo(Object.assign(coninInfo, option));
    // 设置最小提现金额
    form.setFieldValue('amount', getMinWithdraw('min'));
    // 设置金额
    setAmountNum(getMinWithdraw('min'))
    // 检查是否允许提现
    checkAllowWithdraw(getMinWithdraw('min'))
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


  // 24h限额换算
  const getCoinRateData = (coinName: string, number: number | string) => {
    const { coinRate, price } = getCoinRate(coinName, Number(number), 'USDT', 1)
    return coinRate || 0
  }




  // 新增 checkAllowWithdraw 函数来统一处理提现权限检查
  const checkAllowWithdraw = (amount: number | string) => {
    // 小于最小提币量，大于最大提币量，大于现货余额
    // if (Number(amount) < coninInfo.minWithdraw ||
    //   Number(amount) > coninInfo.maxWithdraw ||
    //   Number(amount) > getCoinRateData(coninInfo.coinName, userAllLimit.max)) {
    //   setAllowWithdraw(false);
    // } else {
    //   setAllowWithdraw(true);
    // }
    // console.log('amount', amount,getMinWithdraw('max') ,getMinWithdraw('min'));

    if (Number(amount) > getMinWithdraw('max') ||
      Number(amount) < getMinWithdraw('min') || !amount) {
      setAllowWithdraw(false);
    } else {
      setAllowWithdraw(true);
    }
  }
  // 金额
  const amountChange = (e: any) => {
    const { value } = e.target;
    if (value) {
      setAmountNum(value)
      // form.setFieldValue('amount', value);
      // 检查是否允许提现
      checkAllowWithdraw(value);
    } else {
      setAmountNum(null)
      form.setFieldValue('amount', null)
      setAllowWithdraw(false)
    }

  }

  // 提现最小值获取，提现最大值获取
  const getMinWithdraw = (type: 'min' | 'max') => {
    // const max = getCoinRateData(coninInfo.coinName, userAllLimit.max||0)
    // const min = getCoinRateData(coninInfo.coinName, userAllLimit.mix||0)
    // const limit_24h = cut(max, min) //24h限额
    // 获取24h限额相关数据
    const dailyMaxUsdt = getCoinRateData(coninInfo.coinName, userAllLimit.max || 0) // 24h最大限额（USDT值转换为当前币种）
    const dailyUsedUsdt = getCoinRateData(coninInfo.coinName, userAllLimit.mix || 0) // 24h已使用额度（USDT值转换为当前币种）
    const dailyRemainingLimit = Number(cut(dailyMaxUsdt, dailyUsedUsdt)) // 24h剩余额度

    // 获取基础数据
    const balance = Number(coninInfo.balance || 0) // 用户余额
    const protocolMinWithdraw = Number(coninInfo.minWithdraw || 0) // 协议最小提现
    const protocolMaxWithdraw = Number(coninInfo.maxWithdraw || 0) // 协议最大提现

    if (type === 'min') {
      // const minLimit=Math.max(Number(coninInfo.minWithdraw||0), Number(limit_24h||0))
      // const minAmont=Math.min(balance,minLimit)
      // return minLimit 
      // 最小提现金额：必须满足协议最小值要求
      const actualMin = Math.max(protocolMinWithdraw, 0)

      // 检查是否有足够的余额和限额来满足最小提现要求
      const availableAmount = Math.min(balance, dailyRemainingLimit)

      // 如果可用金额小于协议最小值，返回0表示无法提现
      return availableAmount >= actualMin ? actualMin : 0
    } else {
      //  const maxLimit=Math.min(Number(coninInfo.maxWithdraw||0), Number(limit_24h||0)，balance) 
      // return maxLimit //余额不够限额，以限额为准
      // 最大提现金额：取所有限制条件中的最小值
      const actualMax = Math.min(
        balance, // 不能超过余额
        protocolMaxWithdraw, // 不能超过协议最大值
        dailyRemainingLimit // 不能超过24h剩余限额
      )

      // 确保最大值不为负数，并且不小于协议最小值（如果有余额的话）
      const minRequirement = Math.max(protocolMinWithdraw, 0)
      return Math.max(actualMax, 0)
    }
  }
  // 最大值检查
  const checkMaxWithdraw = useMemo(() => {
    if ((allowWithdraw && amountNum && amountNum < getMinWithdraw('max'))) {
      return true
    } else {
      return false
    }
  }, [amountNum, allowWithdraw])
  const maxWithdrawAmountBtn = useCallback(() => {
    if (allowWithdraw||checkMaxWithdraw) {
      form.setFieldValue('amount', getMinWithdraw('max'))
      setAmountNum(getMinWithdraw('max'))
    }
  }, [allowWithdraw,checkMaxWithdraw])

  // 提交表单
  const onFinish = (values: any) => {
    if (!allowWithdraw) return
    form.validateFields()
      .then((values) => {
        const coinExtInfo = coinExtSelect.find(item => item.value === values.protocolId)
        const params = {
          coinId: values.tenantId,
          toAddress: values.addressId,
          protocolId: values.protocolId,
          momo: values.momo || null,
          amount: values.amount,
          minWithdrawAmount: coninInfo.minWithdrawAmount,
          minWithdrawFee: coninInfo.minWithdrawFee,
          withdrawFee: coninInfo.withdrawFee,
          maxWithdrawAmount: coninInfo.maxWithdrawAmount,
          minWithdraw: coninInfo.minWithdraw,
          maxWithdraw: coninInfo.maxWithdraw,
          minRecharge: coninInfo.minRecharge,

          amountAfter: countNum(amountNum || 0, coninInfo?.withdrawFee, coninInfo?.minWithdrawFee) || 0,
          protocolName: coinExtInfo?.protocolName,
          protocol: coinExtInfo?.protocol,
          coinName: coninInfo.coinName,
          // countWithdrawFee: nul(amountNum, coninInfo.withdrawFee) > coninInfo.minWithdrawFee ? nul(amountNum, coninInfo.withdrawFee) : coninInfo.minWithdrawFee,
          countWithdrawFee: withdrawFee(amountNum || 0, coninInfo?.withdrawFee, coninInfo?.minWithdrawFee) || 0,

        }
        setWithdrawInfo(params)
        setCheckOpen(true)
      })
      .catch((error) => {
        console.log('Form validation error:', error);
      });
  }
  const checkOK = () => {
    // resetState
    form.resetFields()
    setAmountNum(null)
    setCheckOpen(false)
    // 获取24小时限额
    getUserALlLimitData()

  }
  useEffect(() => {
    // 检查身份认证和安全设置
    const verified10 = userInfo?.verifiedWithdrawalStatus === 1 && userInfo?.realnessStatus !== 1 //已认证且未实名-判断unverifiedWithdrawalStatus
    const unverifie11 = userInfo?.unverifiedWithdrawalStatus === 1 && userInfo?.realnessStatus === 1 //未认证且实名-判断verifiedWithdrawalStatus

    const needsKyc = verified10&&userInfo?.unverifiedWithdrawalStatus !== 1
    const needsGoogleAuth = !userInfo?.isGoogleAuth||!userInfo?.googleCode
    const needsWithdraw = userInfo?.withdrawalStatus !== 1||(userInfo?.verifiedWithdrawalStatus !== 1&&userInfo?.unverifiedWithdrawalStatus !== 1)||
    (unverifie11&&userInfo?.verifiedWithdrawalStatus !== 1)
    if (!token || needsWithdraw|| needsKyc || needsGoogleAuth) {
      navigate('/assets')
      Toast.show({
        content: t('assetsAccount.button.withdrawError'),
        icon: 'fail'
      })
    }
  }, [userInfo,token])
  useEffect(() => {
    getCoinAllData()
    getAllProtocolTypeList()
    getUserALlLimitData()
  }, [])

  return (<ContentLayout
    title={t('assets.withdraw')}
    footer={
      // <Button
      //   type="primary"
      //   htmlType="submit"
      //   size="large"
      //   className={`w-full ${styles.submit_btn}`}
      //   disabled={btnSumbitError}
      //   form="withdrawForm"
      // >
      //   {t('withdrawMoney.submit')}
      // </Button>
      <div className={`${styles.card_bgc3}  font-12 font-w-400`}>
        <div className='flex-x justify-between align-center'>
          <div>
            <p className={`${styles.tip_color} mb-1`}>{t('withdrawMoney.estimatedArrival')}</p>
            <p className={`${styles.title_color} mb-1 font-18 font-w-500`}>
              {countNum(amountNum || 0, coninInfo?.withdrawFee || 0, coninInfo?.minWithdrawFee || 0) || 0}
              {coninInfo.coinName || ''}

            </p>
            <p className={`${styles.tip_color} mb-1`}>{t('withdrawMoney.fee')} <span className={`${styles.title_color}`}>
              {withdrawFee(amountNum || 0, coninInfo?.withdrawFee || 0, coninInfo?.minWithdrawFee || 0) || 0}
              {coninInfo.coinName || ''}
            </span></p>
          </div>
          <button type='submit' className={`${styles.withdraw_btn} mr-2 ${allowWithdraw ? 'default_btn' : 'disabled_btn2 cursor-not-allowed'}`}
            onClick={onFinish}>
            {t('withdrawMoney.wthdraw')}
          </button>
        </div>
      </div>

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
            rules={[{
              required: true,
              message: t('withdrawMoney.select'),
              validator: (_, value) => {
                if (!value || value === '' || value === null) {
                  return Promise.reject(new Error(t('withdrawMoney.select')));
                }
                return Promise.resolve();
              }
            }]}
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
                // 不再需要手动触发验证，空字符串会自动触发
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
                onChange={(e) => addressInputChange(e.target.value)}
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
                    ref={addressSelectRef}
                    options={filteredAddressOptions}
                    placeholder={t('withdrawMoney.selectAddress')}
                    bodyStyle={{
                      height: '80vh',
                    }}
                    showSearch={false}
                    activeType='icon'
                    onChange={(value, option) => {
                      // 当从SelectPop选择地址时，同步更新输入框和处理逻辑
                      if (option && !option.disabled) {
                        setAddressInput(option.addressName);
                        form.setFieldValue('addressId', option.addressName);
                        addressChange(option.addressName, option);
                      }
                    }}
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
                      const coinInfo = coinSelect.find(item => item.value === form.getFieldValue('tenantId'))
                      // 检查当前地址的protocolName是否在coinExtSelect中存在,且与当前币种的coinId或coinName一致
                      const isProtocolSupported = coinExtSelect.some(
                        (coinExt) =>
                          (coinExt.protocolName === option.protocolName ||
                            coinExt.protocol === option.protocolName ||
                            coinExt.protocolId === option.protocolId)
                          && (coinInfo?.coinId === option.coinId || coinInfo?.coinName === option.coinName)
                      );
                      return (
                        //   <div
                        //   key={option.id}
                        //   className={`px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 `}
                        //   onClick={() => {
                        //     if (isProtocolSupported) {
                        //       setAddressInput(option.addressName);
                        //       // setDropdownOpen(false);
                        //       addressChange(option.addressName, option);
                        //     }
                        //   }}
                        // >
                        <div className="flex-y">
                          <p className={`${styles.title_color} font-14 font-w-400 mb-1`}>{option.addressTitle}</p>
                          <p className={`${styles.tip_color} font-12 font-w-400 mb-1`}>
                            {`${t('withdrawMoney.address')}：${option.addressName}`}
                          </p>
                          <p className={`${styles.tip_color} font-12 font-w-400`}>
                            {`${t('withdrawMoney.network')}：${option.protocolName || '--'}`}
                            {!isProtocolSupported && (
                              <span className="ml-2 text-red-500 font-12">
                                ({t('withdrawMoney.selectNetwork3Error')})
                              </span>
                            )}
                          </p>
                        </div>
                      )
                    }}
                  // contentFooter={
                  //   <button
                  //     type='button'
                  //     className={`default_btn font-16 font-w-500 mt-6  ${styles.btn_style2} flex-x-cc`}
                  //     onClick={() => navigate('/assets/addAddress')}
                  //   >
                  //     {t('withdrawMoney.addAddress')}
                  //   </button>
                  // }
                  // onChange={(value, option) => addressChange(value, option)}

                  />
                }
              />

            </div>
          </Form.Item>

          {/* 选择网络 */}
          <Form.Item
            label={<span className={styles.tip_title}>{t('withdrawMoney.selectNetwork')}</span>}
            name='protocolId'
            rules={[{
              validator: (_, value) => {
                if (!value || value === '' || value === null) {
                  return Promise.reject(new Error(t('withdrawMoney.selectNetwork2')));
                }
                return Promise.resolve();
              }
            }]}
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
                // 不再需要手动触发验证，空字符串会自动触发
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
                    {t('withdrawMoneyCheck.withdrawFee')} {option.minWithdrawFee || 0}
                  </li>
                </ul>);
              }}
              contentFooter={
                <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5`}>
                  <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                  <span>
                    {/* 请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。 */}
                    {t('withdrawMoney.networkWarning2', { platformName: allConfig?.tenant_cache_name || '--' })}
                  </span>
                </p>
              }
            />
          </Form.Item>

          {/* MEMO标签 - 移到Form.Item外面 */}
          {showMemo && (
            <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2 `}>
              <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
              <span>
                {/* 提币至其他交易所时需要填写标签，否则提币将失败 */}
                {t('withdrawMoney.memoWarning')}
              </span>
            </p>
          )}

          {showMemo && (
            <Form.Item name='momo' >
              <Input className={`${styles.input_box} `}
                placeholder={t('withdrawMoney.memoPlaceholder')}
                allowClear
              />
              <Tooltip title={<p className='font-12 mt-4'>{t('withdrawMoney.tipText')}</p>} placement="bottom">
                <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb1 mt-2_5`}>
                  <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                  <span>
                    {/* 请确认收币地址是否要求填写MEMO */}
                    {t('withdrawMoney.memoConfirm')}
                  </span>
                </p>
              </Tooltip>
            </Form.Item>
          )}
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
              onChange={amountChange}
              // value={amountNum || ''}
              suffix={<div className='flex-x align-center  font-14 font-w-400'>
                <p className={`${styles.tip_color2} pr-2`}>
                  {/* USDT */}
                  {coninInfo.coinName || '--'}
                </p><span className={`${styles.tip_color2}`}>|</span>
                <button type='button' className={`${checkMaxWithdraw ? 'theme_color' : styles.tip_color2} pl-2`}
                  onClick={() => { maxWithdrawAmountBtn() }}
                // disabled={allowWithdrawBtn()}
                >{t('withdrawMoney.max')}</button>
              </div>}
            />
          </Form.Item>

          <ul className={`${styles.tip_color} ${styles.icon_btn_bottom} w-full mb-5`}>
            <li className={`flex-x justify-between mb-5`}>
              <p>{t('withdrawMoney.spotAvailable')}</p>
              <p className={`${styles.title_color}`}>
                {/* 50.13USDT */}
                {coninInfo.balance || '0'}&nbsp;
                {coninInfo.coinName || ''}
              </p>
            </li>
            <li className={`flex-x justify-between mb-5`}>
              <p>{t('withdrawMoney.singleLimit')}</p>
              <p className={`${styles.title_color}`}>
                {/* 10-10,000USDT */}
                {/* {coninInfo.minWithdraw||'0'}-{coninInfo.maxWithdraw||'0'}{coninInfo.coinName||'--'} */}
                {coninInfo.minWithdraw || '0'}-{coninInfo.maxWithdraw || '0'}&nbsp;{coninInfo.coinName || ''}
              </p>
            </li>
            <li className={`flex-x justify-between mb-5`}>
              <p>{t('withdrawMoney.dayLimit')}</p>
              {/* 24h限额 */}
              <p><span className={`${styles.title_color}`}>{userAllLimit.mix ? getCoinRateData(coninInfo.coinName, userAllLimit.mix) : '0'}</span>
                / {userAllLimit.max ? getCoinRateData(coninInfo.coinName, userAllLimit.max) : '0'}&nbsp;{coninInfo.coinName || ''}</p>
            </li>
          </ul>

        </Form>
        <WithdrawMoneyCheck open={checkOpen}
          withdrawInfo={withdrawInfo}
          onCancel={() => setCheckOpen(false)}
          onOk={checkOK}
        />
      </ConfigProvider>

    </div>
  </ContentLayout >
  )
});

export default WithdrawMoneyPage;
