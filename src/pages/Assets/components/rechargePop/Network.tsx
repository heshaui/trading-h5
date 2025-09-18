import React from "react";
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from "../styles/spotAccount.module.scss";
import { QRCode, Button } from "antd";
import { Iconify } from "@/components/icon";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState, useEffect, useRef, useMemo, } from "react";
import { useThemeMode } from "@/hooks/useThemeMode";
import { Image } from 'antd-mobile';
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useLanguage } from '@/hooks/useLanguage';
import { NoData, NoAddress } from "@/components/noData";
import {
    getWithdrawCoinAll,
    getProtocolTypeAll,//所有网络列表
    getWalletAddress, //查询钱包地址
    createWalletAddress,//创建钱包地址
    getcoinExtList,
    getcoinExtList2
} from "@/services/assets";
// import { toast } from 'sonner'
import { Toast } from 'antd-mobile';
import {
    coinSelectType,
    SearchHistoryItem,
    coinExtSelectType
} from "@/type/assets/assetsAccount/topUp";
import appStore from "@/store";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
// import { DownOutlined } from "@ant-design/icons";
// import NoUseCom from "../components/noSM";
import QRcodeDark from "@/assets/images/assets/noQRcode_dark.png";
import QRcodeDay from "@/assets/images/assets/noQRcode_day.png";
import SelectPop from '@/components/SelectPop';
import { getRate, getCoinRate } from '@/utils/getUseRate';
import { roundDown } from '@/utils';
import { ReactComponent as ChangeSvg } from '@/assets/icons/assets/icon_change.svg';
import { ReactComponent as CopySvg } from '@/assets/icons/public/icon_copy.svg';

interface NetworkStepsProps {
    coinInfo: any,
    goSteps: (option: any) => void
}
const NetworkSteps = ({ coinInfo,goSteps }: NetworkStepsProps) => {
    const { t } = useLanguage("assets");
    const navigate = useNavigate();
    const [coinExtSelect, setCoinExtSelect] = useState<any>([]);
    const [coinExtLoading, setCoinExtLoading] = useState(false);
    const [walletAddress, setWalletAddress] = useState<any>({});
    const [addAddressLoading, setAddAddressLoading] = useState(false);
    const [selectedProtocolInfo, setSelectedProtocolInfo] = useState<any>(null);
    const allConfig = appStore.getKvConfigAll()
    const { isDayMode } = useThemeMode()

    // 4.2币种对应的协议（网络）-通过币种协议获取网络id进行匹配
    const getCoinExt = async (id?: number | string) => {
        if (!coinInfo?.coinId && !id) return;
        setCoinExtSelect([]); //初始化
        setCoinExtLoading(true);

        try {
            const res = await getcoinExtList2(coinInfo?.coinId as number | string);
            if (res.code === "0") {
                const coinExtList = res.data.map((item: any) => {
                    return {
                        ...item,
                        label: `${item?.protocolName || "--"}(${item?.protocol || "--"})`,
                        value: item?.symbol || null,
                        confirmCount: item.confirms && item.confirms > 0 ? item.confirms : 1,
                        coinId: coinInfo?.coinId,
                    };
                }).filter((item: any) => item.value !== null)
                setCoinExtSelect(coinExtList);
            } else {
                Toast.show({
                    content: res.message,
                    icon: 'fail'
                });
            }
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
        } finally {
            setCoinExtLoading(false);
        }
    };
    // 7.没有钱包地址时创建钱包地址
    const fetchWalletAddress = async (value: any) => {
        try {
            const params = {
                blockchain: value.symbol || selectedProtocolInfo.symbol,
                label: value.coinId
            }
            const res = await createWalletAddress(params)
            if (res.code === '0') {
                setWalletAddress(res.data)
            } else {
                Toast.show({
                    content: res.message,
                    icon: 'fail'
                });
            }
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
        }

    }
    // 6.查询钱包地址
    const getWalletAddressData = async (value: any, option: any) => {
        setAddAddressLoading(true);
        setWalletAddress({})
        try {
            const chainType = option.symbol || selectedProtocolInfo.symbol || value
            const res = await getWalletAddress(chainType)
            if (res.code === '0') {
                setWalletAddress(res.data)
            } else if (res.code === '10161') {
                fetchWalletAddress(option)
            } else {

                Toast.show({
                    content: res.message,
                    icon: 'fail'
                });
            }
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: 'fail'
            });

        } finally {
            setAddAddressLoading(false);
        }
    }

    useEffect(() => {
        getCoinExt()
    }, [coinInfo?.coinId])
    // 添加 useEffect 来加载历史记录


    return (<>
        <div className={` page-h w-full bg-[var(--page-background)] flex-y align-center `}>
            <div className={`${styles.card_box} w-full flex align-center justify-center`}>
                {walletAddress?.address ? <QRCode value={walletAddress.address}
                    className="w-[100px] h-[100px] mb-[16px]"
                    bgColor={isDayMode ? "#fff" : "#000"}
                    color={isDayMode ? "#000" : "#fff"}
                /> :
                    <>
                        <Image src={isDayMode ? QRcodeDay : QRcodeDark}
                            width={100}
                            height={100}
                        />
                    </>
                }
            </div>
            <ul className="border border-[var(--border-color4)] w-full text-[14px] rounded-[8px] px-[16px] py-[12px]">
                <li>
                    <p className="text-[var(--text-color6)] font-[500] ">
                        {t("toUpSteps.network")}
                    </p>
                    {/* 选择网络 */}
                    <div className="flex align-center justify-between mt-[6px]">
                        <div className="text-[var(--text-color6)]  font-[400] ">
                            {selectedProtocolInfo ? <>
                                <div
                                    className="text-[var(--text-color5)] font-[500] break-all"
                                > {selectedProtocolInfo.label}

                                </div>
                                <div className=" font-[400] break-all">
                                    {t("toUpSteps.contractAddress")}{selectedProtocolInfo.walletContractAddress || '--'}
                                </div>
                            </> :
                                t("toUpSteps.placeholder")}
                        </div>
                        <SelectPop
                            allowClear={false}
                            placeholder={t('withdrawMoney.selectNetwork2')}
                            options={coinExtSelect}
                            className={`${styles.select_box} custom-select`}
                            //   loading={coinExtLoading}
                            onChange={(value, option) => {
                                setSelectedProtocolInfo(option);
                                getWalletAddressData(value, option);
                                goSteps(option);
                            }}
                            bodyStyle={{
                                minHeight: '50vh',
                                maxHeight: '90vh',
                            }}
                            renderBtn={(open: () => void) => {
                                return <div>
                                    <Button type="text" onClick={(e) => {
                                        if(coinExtSelect.length === 0){
                                            getCoinExt()
                                        }
                                        open();
                                    }} style={{ padding: 0 }}
                                        icon={<ChangeSvg className="w-[24px] h-[24px]" />} />
                                </div>
                            }}

                            showSearch={false}
                            optionRender={(option) => {
                                return (<div
                                    key={option.value}
                                    className="flex align-center justify-between px-3 py-2 cursor-pointer"
                                // onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleProtocolSelect(option.value, option.data); }}
                                >
                                    <div className="min-w-0">
                                        <p>{option.symbol || '--'}</p>
                                        <p className="text-[var(--text-color6)]">{option.protocolName || '--'}（{option.protocol || '--'}）</p>
                                    </div>
                                    <div className="shrink-0">{option.confirmCount ?? 1}
                                        {t("toUpSteps.confirmCountTip")}</div>
                                </div>);
                            }}
                            contentHeader={
                                <p
                                    className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 mx-[20px]`}
                                >
                                    <Iconify
                                        icon="ep:warning-filled"
                                        className="warning_color mr-1"
                                        size={16}
                                    />
                                    <span>
                                        {/* 请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。 */}
                                        {t("withdrawMoney.networkWarning2", {
                                            platformName:
                                                allConfig?.tenant_cache_name || "--",
                                        })}
                                    </span>
                                </p>
                            }
                        />
                    </div>
                </li>


            </ul>
            {/* 钱包地址 */}
            {walletAddress?.address && <>
                <ul className="border border-[var(--border-color4)] w-full rounded-[8px] text-[14px] px-[16px] py-[12px] mt-[16px]">
                    <li>
                        <p className="text-[var(--text-color6)]  font-[500] ">
                            {t("toUpSteps.rechargeAddress")}
                        </p>
                        <div className="flex align-end justify-between">
                            <span className="text-[var(--text-color5)]  font-[500] min-w-0 break-all mt-[6px] mr-[24px]">
                                {walletAddress?.address || '--'}
                            </span>
                            <Button type="text" style={{ padding: 0 }} icon={<CopySvg className="w-[24px] h-[24px]" />} />
                        </div>

                    </li>
                    {/* {walletAddress?.memo && <>
                        <li className="text-[#FF4D4F] my-[10px] border-b-[1px] border-[var(--border-color12)] pb-[10px]">*请务必填写Momo，否则将无法到账</li>
                        <li>
                            <p className="text-[var(--text-color6)] text-[14px] font-[500] ">
                                Memo
                            </p>
                            <div className="flex align-center justify-between">
                                <span className="text-[var(--text-color5)] text-[14px] font-[500] min-w-0 break-all mt-[6px] mr-[24px]">
                                    {walletAddress?.address || '--'}
                                </span>
                                <Button type="text" style={{ padding: 0 }} icon={<CopySvg className="w-[24px] h-[24px]" />} />
                            </div>
                        </li>
                    </>} */}
                </ul>
                <ul className={`text-[var(--text-color6)]  text-[14px] font-[500] mt-5 w-full`} >
                    <li className="flex-x algin-center   justify-between">
                        {/* 将资金充入 */}
                        {t("toUpSteps.rechargeTo")}
                        <span className={`${styles.title_color}`}>
                            {/* 现货账户 */}
                            {t("toUpSteps.rechargeTo2")}
                        </span>
                    </li>
                    <li className="flex-x algin-center mt-5 mb-5 justify-between">
                        {/* 最小充值 */}
                        {t("toUpSteps.minRecharge")}
                        <span className={`${styles.title_color}`}>
                            {/* 0.001USDT */}
                            {selectedProtocolInfo?.minRecharge || 0}{selectedProtocolInfo?.coinName||coinInfo?.coinName || '--'}
                        </span>
                    </li>
                    <li className="flex-x algin-center  justify-between">
                        {/* 区块确认次数 */}
                        {t("toUpSteps.confirmCount")}
                        <span className={`${styles.title_color}`}>{coinInfo?.confirmCount || 1}{t("toUpSteps.confirmCountTip3")}</span>
                    </li>
                </ul>
            </>}
        </div>

    </>
    );
};

export default NetworkSteps;
