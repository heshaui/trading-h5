import { ConfigProvider } from "antd";
import { Toast, Popup, Button } from 'antd-mobile';
import styles from "../styles/withdrawmoney.module.scss";
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter'
import { useState } from "react";
import dayjs from "dayjs";
import { creatWithdraw } from '@/services/assets'
import { encryptData } from '@/utils/encrypt';
import { getLoginUserInfo } from "@/services/userCenter"
import { useLanguage } from '@/hooks/useLanguage';
import { useResetStateContext, ResetStateEnum } from '@/context/reset-providers/ResetStateProvider';
import WithdrawMoneySafe from "./WithdrawMoneySafe";
interface paramsType {
    coinId: number;
    protocolId: number;
    amount: string;
    toAddress: string;
    smsCode: string;
    emailCode: string;
    googleCode: string;
}

interface withdrawType {
    coinId: number,
    toAddress: string,
    protocolId: number,
    momo: string,
    amount: string,
    minWithdrawAmount: number,
    minWithdrawFee: number,
    withdrawFee: number,
    maxWithdrawAmount: number,
    minWithdraw: number,
    maxWithdraw: number,
    minRecharge: number,
    coinName: string,
    countWithdrawFee: number,
    protocolName: string,
    protocol: string,
    amountAfter: number,
}

type Props = {
    open: boolean;
    withdrawInfo?: withdrawType;
    onOk?: () => void;
    onCancel: () => void;
};

function WithdrawMoneyCheck({ open, onCancel, withdrawInfo, onOk }: Props) {
    const { t } = useLanguage('assets');
    const [safeModalOpen, setSafeModalOpen] = useState(false)
    // const [userInfo, setUserInfo] = useState({})
    const [totastOpen, setTotastOpen] = useState(false)
    const [totastMessage, setTotastMessage] = useState('')
    const [totastType, setTotastType] = useState('')
    const { setResetState } = useResetStateContext();
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        // try {
        //     const res = await getLoginUserInfo()
        //     if (res.code === "0") {
        //         setUserInfo(res.data)
        //     }
        // } catch (error) {
        //     console.error('Failed to get user info:', error);
        // }
        setSafeModalOpen(true)
    };

    const safeModalOk = async (event: any) => {
        const params = {
            coinId: withdrawInfo?.coinId,
            protocolId: withdrawInfo?.protocolId,
            amount: withdrawInfo?.amount,
            toAddress: withdrawInfo?.toAddress,
            smsCode: event.phoneCode || '',
            emailCode: event.emailCode || '',
            googleCode: event.googleCode || '',
        }

        try {
            const encryptResult = await encryptData(params)
            const res = await creatWithdraw(encryptResult)

            if (res.code === '0') {
                // setTotastOpen(true)
                // setTotastMessage(`${withdrawInfo?.amount} ${withdrawInfo?.coinName}`)
                // setTotastType('loading')
                onOk?.()
                Toast.show({
                    content: t('withdrawTable.withdrawSuccess'),
                    icon: 'success'
                });
            } else if (res.code === '1') {
                setTotastOpen(true)
                setTotastType('loading')
                // handCancel()
            } else {
                // setTotastOpen(true)
                // setTotastMessage(res.message || t('withdrawMoneyCheck.operationFailed'))
                // setTotastType('error')
                Toast.show({
                    content: res.message || t('withdrawMoneyCheck.operationFailed'),
                    icon: 'fail'
                });
            }
        } catch (error) {
            // setTotastOpen(true)
            // setTotastMessage(String(error) || t('withdrawMoneyCheck.operationFailed'))
            // setTotastType('error')
            Toast.show({
                content: String(error) || t('withdrawMoneyCheck.operationFailed'),
                icon: 'fail'
            });
        }
    }

    return (
        <Popup
            visible={open}
            onMaskClick={handCancel}
            onClose={handCancel}
            position="bottom"
            // bodyStyle={{
            //     borderTopLeftRadius: '16px',
            //     borderTopRightRadius: '16px',
            //     minHeight: '60vh',
            //     backgroundColor: 'var(--background5)',
            // }}
            bodyClassName={styles.popContainer}
        >
            <div className={`${styles.title_color} flex-y justify-between h-full safe-pb`}>
                {/* 标题栏 */}
                <div className={`${styles.pop_header} flex-x algin-center justify-between`}>
                    <span className={`${styles.title_color} flex-1`}>{t('withdrawMoney.tipText2')}</span>
                    <button onClick={() => {
                        handCancel?.();
                    }}
                        className={styles.title_color}
                    >
                        <Iconify icon="eva:close-fill" size={20} className={styles.tip_color} />
                    </button>
                </div>
                {/* 内容区域 */}
                <div className={`flex-col flex-ai-center font-14 font-w-400 ${styles.pop_content} flex-1 px-4 mt-4  w-full`} >
                    <p className={`${styles.title_color} font-24 font-w-500 mb-2`}>
                        {withdrawInfo?.amount} {withdrawInfo?.coinName}
                    </p>
                    <p className={`${styles.tip_color} mb-4`}>
                        {t('withdrawMoneyCheck.withdrawAmount')}
                    </p>

                    {/* 详情列表 */}
                    <div className={`${styles.card_bgc3} w-full px-4 py-4 rounded-lg mb-4 font-14 font-w-400 `}>
                        <div className={`${styles.title_color} flex-x align-center justify-between mb-4`}>
                            <p className={`${styles.tip_color}`}>
                                {t('withdrawMoneyCheck.withdrawAddress')}
                            </p>
                            <p className="text-right flex-1 ml-4" style={{ wordBreak: 'break-all' }}>
                                {withdrawInfo?.toAddress}
                            </p>
                        </div>

                        <div className={`${styles.title_color}  flex-x align-center justify-between mb-4`}>
                            <p className={`${styles.tip_color}`}>
                                {t('withdrawMoneyCheck.network')}
                            </p>
                            <p>{` ${withdrawInfo?.protocol}(${withdrawInfo?.protocolName})`}</p>
                        </div>

                        <div className={`${styles.title_color}  flex-x align-start justify-between mb-4`}>
                            <p className={`${styles.tip_color}`}>
                                {t('withdrawMoneyCheck.amountAfter')}
                            </p>
                            <div className="flex-y align-end text-right">
                                <span className="mb-1">
                                    {t('withdrawMoneyCheck.toAccount')}
                                    {withdrawInfo?.amountAfter}
                                    {withdrawInfo?.coinName}
                                </span>
                                <span>
                                    {t('withdrawMoneyCheck.withdrawFee')}
                                    {withdrawInfo?.countWithdrawFee}
                                    {withdrawInfo?.coinName}
                                </span>
                            </div>
                        </div>

                        <div className={`${styles.title_color} font-14 font-w-400 flex-x align-center justify-between`}>
                            <p className={`${styles.tip_color}`}>
                                {t('withdrawMoneyCheck.withdrawAccount')}
                            </p>
                            <p>
                                {t('withdrawMoneyCheck.spotAccount')}
                            </p>
                        </div>
                    </div>

                    {/* 警告信息 */}
                    <div className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-6 p-3 rounded-lg`}>
                        <Iconify icon="ep:warning-filled" className="warning_color mr-2 mt-1" size={16} />
                        <span>
                            {t('withdrawMoneyCheck.warning')}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className={`${styles.modal_footerBtn} flex-x-cc default_btn fonot-w-500`}
                        onClick={handOk}
                    >
                        {t('modal.confirm2')}
                    </button>
                </div>
            </div>

            <WithdrawMoneySafe open={safeModalOpen}
                onCancel={() => setSafeModalOpen(false)}
                // acountInfo={userInfo}
                onOk={safeModalOk} />
            {/* <TotastModal open={totastOpen} message={totastMessage} type={totastType} onCancel={() => setTotastOpen(false)}/> */}
        </Popup>
    );
}

export default WithdrawMoneyCheck;
