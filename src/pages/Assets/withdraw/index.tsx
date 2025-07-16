import React from 'react';
import styles from '../styles/spotAccount.module.scss'
import { Input, ConfigProvider, Tooltip, Select, Form, Button } from 'antd';
import { Iconify } from "@/components/icon"
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
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
    const [filteredAddressOptions, setFilteredAddressOptions] = useState(addressSelect);

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
    const coinChange = async (value: string, option: any) => {
        const coinId = form.getFieldValue('tenantId')
        
        if (coinId.toString() !== coinIdHistory.toString()) {
            form.resetFields(['protocolId']);
        }
        
        if (!value && !coinId) {
            form.resetFields(['protocolId']);
            return;
        }

        const selectedCoin = coinSelect.find(coin => coin.coinId.toString() === value.toString());
        if (!selectedCoin) return;

        // 更新历史记录
        const newHistoryItem = {
            ...selectedCoin,
            value: value,
            label: selectedCoin.label,
            iconUrl: selectedCoin.iconUrl,
        };
        setSearchHistory(prev => {
            const filtered = prev.filter(item => item.value !== value).map(item => ({
                ...item,
                label: item.label,
                iconUrl: item.iconUrl
            }));
            const newHistory = [newHistoryItem, ...filtered].slice(0, 4);
            localStorage.setItem('coinSearchHistory', JSON.stringify(newHistory));
            return newHistory;
        });

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

    // 历史币种快捷键
    const setFormCoin = async (coinId: string | number) => {
        if (userInfo?.merchantWithdrawalStatus !== 1 || !userInfo?.googleCode || userInfo.withdrawalStatus === 0) {
            return Toast.show({
                content: t('withdrawMoney.function'),
                icon: 'fail'
            });
        }

        const currentCoinId = form.getFieldValue('tenantId');
        if (currentCoinId === coinId) {
            return;
        }

        let currentCoinList = coinSelect;
        if (coinSelect.length === 0) {
            const res = await getWithdrawCoinAll();
            if (res.code === '0') {
                const coinList = res.data
                    .filter((item: any) => item.status === 1)
                    .map((item: any) => ({
                        ...item,
                        label: `${item.coinName}(${item.nameDefault})`,
                        value: item.coinId,
                    })).sort((a: any, b: any) => a.sort - b.sort)
                setCoinSelect(coinList);
                currentCoinList = coinList;
            } else {
                throw new Error(res.message);
            }
        }

        const selectedCoin = currentCoinList.find(coin => coin.coinId.toString() === coinId.toString());
        if (!selectedCoin) {
            return Toast.show({
                content: t('withdrawMoney.setCoinError'),
                icon: 'fail'
            });
        }

        if (coinId.toString() !== coinIdHistory.toString()) {
            form.resetFields(['protocolId']);
        }

        try {
            form.setFieldValue('tenantId', coinId);
            
            // 获取余额和网络信息
            const balance = await getUserBalanceData()
            setConinInfo(Object.assign(balance, selectedCoin))
            await getCoinExt(Number(coinId))
            
            setCoinIdHistory(Number(coinId));
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
        }
    }

    // 获取币种网络列表
    const getCoinExt = async (coinId: number) => {
        if (!coinId) return
        setCoinExtLoading(true)
        try {
            const res = await getcoinExtList(coinId)
            if (res.code === '0') {
                const coinExtList = res.data.map((item: any) => ({
                    ...item,
                    label: `${item.protocolName}(${item.protocol})`,
                    value: item.id
                }))
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
                setFilteredAddressOptions(addressList)
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

    // 地址变化处理
    const addressChange = (value: string, option: any) => {
        console.log('Address changed:', value, option);
        // 处理地址选择逻辑
    }

    // 网络变化处理
    const protocolChange = (value: string, option: any) => {
        const selectedProtocol = coinExtSelect.find(item => item.id.toString() === value.toString());
        if (selectedProtocol) {
            setShowMemo(selectedProtocol.memoTag === 1);
        }
    }

    // 删除历史记录
    const delHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('coinSearchHistory');
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
        // 地址验证逻辑
        return Promise.resolve();
    }

    // 验证协议
    const validateProtocol = async (rule: any, value: any) => {
        // 协议验证逻辑
        return Promise.resolve();
    }

    // 提交表单
    const onFinish = (values: any) => {
        console.log('Form values:', values);
                  // 处理提交逻辑
      }

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
              <div className='px-4'>
                <ConfigProvider
                    theme={{
                        components: {
                            Select: {
                                colorBorder: "var(--border-color2)",
                                colorPrimary: "var(--theme-color)",
                                controlHeight: 50,
                                fontSize: 16,
                                clearBg: "#ffffff",
                                selectorBg: 'transparent',
                                singleItemHeightLG: 50,
                                paddingXXS: 10,
                                optionHeight: 40,
                                optionLineHeight: 2,
                            },
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
                        disabled={(userInfo?.merchantWithdrawalStatus !== 1 || !userInfo?.googleCode || userInfo.withdrawalStatus === 0)}
                        id="withdrawForm"
                    >
                        {/* 币种选择 */}
                        <Form.Item 
                            label={<span className={styles.tip_title}>{t('withdrawMoney.withdrawCoin')}</span>}
                            name='tenantId' 
                            rules={[{ required: true, message: t('withdrawMoney.select') }]}
                        >
                            <Select
                                allowClear={false}
                                placeholder={t('withdrawMoney.select')}
                                options={coinSelect || []}
                                className={`${styles.select_box} custom-select`}
                                optionRender={(option) => {
                                    if (!option?.data) return null;
                                    return (
                                        <div className='flex-x align-center justify-between'>
                                            <div className="flex-x align-center font-14 font-w-400">
                                                <Image 
                                                    src={option.data.iconUrl} 
                                                    alt={option.data.coinName} 
                                                    width={20} 
                                                    height={20} 
                                                    className={styles.coninIcon} 
                                                    style={{ marginRight: 8 }}
                                                />
                                                <span>{option.data.coinName}</span>
                                                <span className={styles.tip_color} style={{ marginLeft: 4 }}>
                                                    {option.data.nameDefault}
                                                </span>
                                            </div>
                                            <div className='flex-y align-end font-14 font-w-500'>
                                                <span>{option.data.balance}</span>
                                                <span className={`${styles.tip_color} font-w-400 font-12`}>
                                                    {`≈${getWithdrawFee(option.data.balance, option.data.coinName).text}`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }}
                                dropdownRender={(menu) => (
                                    <>
                                        {coinSelect.length > 0 && (
                                            <div className={`font-14 font-w-400 mb-2_5`}>
                                                <div className={`${styles.tip_color2} w-full flex-x justify-between`}>
                                                    <span>{t('withdrawMoney.searchHistory')}</span>
                                                    <button
                                                        type='button'
                                                        onClick={() => delHistory()}
                                                    >
                                                        <Iconify 
                                                            icon="mingcute:delete-2-line" 
                                                            size={20} 
                                                            className={`${styles.title_color}`} 
                                                        />
                                                    </button>
                                                </div>
                                                {searchHistory.length > 0 ? (
                                                    <div className='mt-2 mb-2_5 flex-x'>
                                                        {searchHistory.map((item) => (
                                                            <button
                                                                type='button'
                                                                key={item.value}
                                                                className={`${styles.selsect_btn} cancel_btn5 mr-2 flex-x align-center justify-between font-14`}
                                                                onClick={() => setFormCoin(item.value)}
                                                            >
                                                                <Image
                                                                    src={item.iconUrl}
                                                                    alt={item.coinName}
                                                                    width={12}
                                                                    height={12}
                                                                    style={{ 
                                                                        borderRadius: '50%', 
                                                                        marginRight: 8 
                                                                    }}
                                                                />
                                                                {item.coinName}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className='mt-2 mb-2_5'>
                                                        {t('withdrawMoney.noRecord')}
                                                    </p>
                                                )}
                                                <p className={`${styles.tip_color2}`}>
                                                    {t('withdrawMoney.coinList')}
                                                </p>
                                            </div>
                                        )}
                                        {menu}
                                    </>
                                )}
                                notFoundContent={<NoData title={t('withdrawMoney.noRecord')} />}
                                onFocus={getCoinAllList}
                                onChange={coinChange}
                                loading={coinLoading}
                            />
                        </Form.Item>

                        {/* 历史快捷选择 */}
                        {searchHistory.length > 0 && (
                            <div className='mb-4'>
                                {searchHistory.map((item) => (
                                    <button
                                        type='button'
                                        key={item.value}
                                        className={`cancel_btn5 ${styles.selsect_btn} mr-2`}
                                        onClick={() => setFormCoin(item.value)}
                                    >
                                        {item.coinName}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 提现地址 */}
                        <Form.Item 
                            label={<span className={styles.tip_title}>{t('withdrawMoney.withdrawAddress')}</span>}
                            name='addressId'
                            rules={[{ validator: validateAddress }]}
                        >
                            <div className="relative">
                                <Input
                                    type="text"
                                    className={`${styles.input_box3} modal-input`}
                                    placeholder={t('withdrawMoney.inputAddress')}
                                    allowClear
                                    value={addressInput}
                                    onChange={(e) => setAddressInput(e.target.value)}
                                    onFocus={() => {
                                        getUserAddressData();
                                    }}
                                    suffix={
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDropdownOpen(!dropdownOpen);
                                                if(!dropdownOpen) {
                                                    getUserAddressData();
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Iconify 
                                                icon="mdi:map-outline" 
                                                size={24} 
                                                className={`${styles.title_color}`} 
                                            />
                                        </div>
                                    }
                                />
                                {dropdownOpen && (
                                    <div className={`${styles.dropdown_menu} absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto`}>
                                        {addressSelect.map(item => {
                                            const isProtocolSupported = coinExtSelect.some(
                                                coinExt => coinExt.protocolName === item.protocolName ||
                                                coinExt.protocol === item.protocolName ||
                                                coinExt.protocolId === item.protocolId
                                            );
                                            
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${!isProtocolSupported ? 'opacity-50' : ''}`}
                                                    onClick={() => {
                                                        if (isProtocolSupported) {
                                                            setAddressInput(item.addressName);
                                                            setDropdownOpen(false);
                                                            addressChange(item.addressName, item);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex-y">
                                                        <p className={`${styles.title_color} font-14 font-w-400 mb-1`}>{item.addressTitle}</p>
                                                        <p className={`${styles.tip_color2} font-12 font-w-400 mb-1`}>
                                                            {`${t('withdrawMoney.address')}：${item.addressName}`}
                                                        </p>
                                                        <p className={`${styles.tip_color2} font-12 font-w-400`}>
                                                            {`${t('withdrawMoney.network')}：${item.protocolName || '--'}`}
                                                            {!isProtocolSupported && (
                                                                <span className="ml-2 text-red-500 font-12">
                                                                    ({t('withdrawMoney.selectNetwork3Error')})
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {addressSelect.length === 0 && (
                                            <div className="text-center py-4">
                                                <NoAddress />
                                            </div>
                                        )}
                                        <div className="p-3 border-t border-gray-100">
                                            <button
                                                type='button'
                                                className={`default_btn font-16 font-w-500 w-full ${styles.btn_style2}`}
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    navigate('/assets/addAddress');
                                                }}
                                            >
                                                {t('withdrawMoney.addAddress')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Form.Item>

                        {/* 选择网络 */}
                        <Form.Item 
                            label={<span className={styles.tip_title}>{t('withdrawMoney.selectNetwork')}</span>}
                            name='protocolId'
                            rules={[{ validator: validateProtocol }]}
                        >
                            <Select 
                                allowClear
                                placeholder={t('withdrawMoney.selectNetwork2')}
                                options={coinExtSelect}
                                className={`${styles.select_box} custom-select`}
                                loading={coinExtLoading}
                                onChange={protocolChange}
                                optionRender={(option) => {
                                    return (
                                        <div className="flex-x justify-between align-center py-1 font-14 font-w-400">
                                            <span>{option.data?.protocolName}</span>
                                            <span className={styles.tip_color}>{option.data?.protocol}</span>
                                        </div>
                                    );
                                }}
                            />
                        </Form.Item>

                        {/* 提现数量 */}
                        <Form.Item 
                            label={<span className={styles.tip_title}>{t('withdrawMoney.withdrawAmount')}</span>}
                            name='amount'
                            rules={[{ required: true, message: t('withdrawMoney.inputAmount') }]}
                        >
                            <Input
                                type="number"
                                className={`${styles.input_box} modal-input`}
                                placeholder={t('withdrawMoney.inputAmount')}
                                allowClear
                            />
                        </Form.Item>

                        {/* MEMO标签 */}
                        {showMemo && (
                            <Form.Item 
                                label={<span className={styles.tip_title}>MEMO</span>}
                                name='memo'
                                rules={[{ required: true, message: t('withdrawMoney.inputMemo') }]}
                            >
                                <Input
                                    className={`${styles.input_box} modal-input`}
                                    placeholder={t('withdrawMoney.inputMemo')}
                                    allowClear
                                />
                            </Form.Item>
                        )}
                    </Form>
                </ConfigProvider>

                </div>
            </ContentLayout>
  )
});

export default WithdrawMoneyPage;
