// import { Button, Form, Input,Tabs } from "antd";
// import { type CSSProperties, useState, useRef } from "react";
import styles from "../../styles/invite.module.css"
import { Iconify } from "@/components/icon/index";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { encryptString } from "@/utils/encrypt";
import { useThemeMode } from '@/hooks/useThemeMode';
import { getRecordList } from "@/services/invite";
import { useLanguage } from '@/hooks/useLanguage';
import { getRate, getCoinRate } from '@/utils/getUseRate';
import appStore from '@/store';
import { CustomTable } from '@/components/CustomCom';
import type { ColumnType } from '@/components/CustomCom/CustomTable';
import { NoData } from "@/components/noData";

interface DataType {
    id: number,
    userId: number,
    invitedUserId: number,
    rebateAmount: number,
    actualRebateAmount: number,
    actualCoinName: string,
    actualCoinId: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
    account?: string,
}

type InviteProps = {
    onReturn: () => void;
}

function InvitationReward({ onReturn }: InviteProps) {
    const navigate = useNavigate();
    const { t } = useLanguage('invite')
    const [loading, setLoading] = useState(false);
    const { isDayMode } = useThemeMode(); // 使用 hook
    const rateKey = appStore.getRateKey()?.replace(/\s+/g, ''); // 汇率key
    const pageParam = useRef({
        page: 1,
        pageSize: 10,
        total: 0
    })

    const columns: ColumnType<DataType>[] = [
        {
            title: t('invite.inviteRewards.time'), //"发放时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "left",
            width: 160,
            render: (_text: any) => {
                return <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>;
            },
        },
        {
            title: t('invite.inviteRewards.account'), //"注册账号",
            dataIndex: "account",
            key: "account",
            align: "center",
            width: 160,
            render: (_text: any) => <span>{_text ? encryptString(_text) : '--'}</span>,
        },
        {
            title: t('invite.inviteRewards.reward'), //"返佣金额",
            key: "actualRebateAmount",
            dataIndex: "actualRebateAmount",
            align: "center",
            width: 160,
            render: (_text: any, record: DataType) => {
                // actualCoinName
                return <span>{_text ? `${_text} ${record.actualCoinName}` : '--'}</span>;
            },
        },
        {
            title: t('invite.inviteRewards.usdt'), //"USDT估值",
            key: "actualRebateAmount",
            dataIndex: "actualRebateAmount",
            align: "right",
            width: 160,
            render: (_text: any, record: DataType) => {
                const { coinRate } = getCoinRate(record.actualCoinName, _text);
                return <span>{_text ? `${coinRate}` : '0'}</span>;
            },
        },
    ];

    const [recordList, setRecordList] = useState<DataType[]>([]);
    
    const getRewardData = async () => {
        setLoading(true)
        const param = {
            pageNo: pageParam.current.page,
            pageSize: pageParam.current.pageSize,
        }
        try {
            const res = await getRecordList(param);
            if (res.code === '0') {
                setRecordList(res.data.list)
                pageParam.current.total = res.data.count
            } else {
                Toast.show(res.message)
            }
        } catch (error) {
            Toast.show(String(error))
        } finally {
            setLoading(false)
        }
    }
    
    const pageChange = async (page: number, pageSize: number) => {
        pageParam.current.page = page
        pageParam.current.pageSize = pageSize
        await getRewardData()
    }
    
    useEffect(() => {
        getRewardData()
    }, [])
    
    return (
        <div className={``}>
            <CustomTable<DataType>
                columns={columns}
                dataSource={recordList}
                loading={loading}
                type="p1" // 列模式
                rowKey="id"
                pagination={{
                    current: pageParam.current.page,
                    pageSize: pageParam.current.pageSize,
                    total: pageParam.current.total,
                    onChange: pageChange,
                    hideOnSinglePage: true,
                }}
                locale={{
                    emptyText: (
                        <div className='flex-y-cc'>
                            <NoData />
                            <button 
                                type='submit' 
                                className={`default_btn flex-x-cc  mt-10 ${styles.invite_btn2}`} 
                                onClick={onReturn}
                            >
                                {/* {t('invite.inviteRewards.inviteBtn')} */}
                                {/* 立即邀请 */}
                                {t('invite.inviteBtn')}
                            </button>
                        </div>
                    )
                }}
                className={styles.custom_table}
            />
        </div>
    );
}

export default InvitationReward;
