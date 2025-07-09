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
import { getInviteList } from "@/services/invite";
import { NoData } from "@/components/noData";
import { useLanguage } from '@/hooks/useLanguage';
import { CustomTable } from '@/components/CustomCom';
import type { ColumnType } from '@/components/CustomCom/CustomTable';

interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: string,
    tokenTime: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
    account?: string,
    status?: number,
    regeistTime?: string,
}

type InviteProps = {
    onReturn: () => void;
}

function InvitationDetails({ onReturn }: InviteProps) {
    const navigate = useNavigate();
    const { t } = useLanguage('invite');
    const [inviteData, setInviteData] = useState<DataType[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const paramdataRef = useRef(pageParam);
    const { isDayMode } = useThemeMode(); // 使用 hook

    const columns: ColumnType<DataType>[] = [
        {
            title: t('invite.inviteDetail.userId'), //"好友ID",
            dataIndex: "userId",
            key: "userId",
            align: "left",
            width: 160,
            render: (text: any, record: DataType) => <span>{`${text}`}</span>,
        },
        {
            title: t('invite.inviteDetail.account'), //"注册账号",
            dataIndex: "account",
            key: "account",
            align: "center",
            width: 160,
            render: (_text: any) => <span>{_text ? encryptString(_text) : '--'}</span>,
        },
        {
            title: t('invite.inviteDetail.status'), //"邀请状态",
            key: "status",
            dataIndex: "status",
            align: "center",
            width: 160,
            render: (_text: any) => {
                return <span>{_text?.toString() === '1' ? t('invite.inviteDetail.success') : t('invite.inviteDetail.fail')}</span>;
            },
        },
        {
            title: t('invite.inviteDetail.regeistTime'), //"注册日期",
            key: "regeistTime",
            dataIndex: "regeistTime",
            align: "right",
            width: 160,
            // sorter: true,
            render: (_text: any) => {
                return <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>;
            },
        },
    ];

    const getInviteData = async () => {
        setLoading(true)
        const param = {
            pageNo: paramdataRef.current.page,
            pageSize: paramdataRef.current.pageSize,
        }
        try {
            const res = await getInviteList(param);
            if (res.code === '0') {
                setInviteData(res.data.list)
                setTotal(res.data.count)
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
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        await getInviteData()
    }
    
    useEffect(() => {
        getInviteData()
    }, [])
    
    return (
        <div className={`${styles.table_box}`}>
            <CustomTable<DataType>
                columns={columns}
                dataSource={inviteData}
                loading={loading}
                type="p1" // 列模式
                rowKey="id"
                pagination={{
                    current: pageParam.page,
                    pageSize: pageParam.pageSize,
                    total: total,
                    onChange: pageChange,
                    hideOnSinglePage: true,
                }}
                locale={{
                    emptyText: (
                        <div className='flex-y-cc'>
                            <NoData />
                            <button 
                                type='submit' 
                                className={`default_btn flex-x-cc  mt-10 ${styles.invite_btn}`}
                                onClick={onReturn}
                            >
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

export default InvitationDetails;
