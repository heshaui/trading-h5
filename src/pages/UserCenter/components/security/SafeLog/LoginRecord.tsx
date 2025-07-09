
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import { getUserLoginLogList } from "@/services/safeCenter";
import { Toast, InfiniteScroll, Skeleton } from 'antd-mobile';
import dayjs from 'dayjs';
import { useLanguage } from '@/hooks/useLanguage';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { NoData } from "@/components/noData";
import appStore from "@/store";
interface DataType {
    id: number,
    userId: number,
    platformType: string,
    deviceNo: string,
    ip: string,
    address: string,
    token: string,
    tokenTime: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
    status: string,
}
function LoginRecord() {
    const { t } = useLanguage('userCenter');
    const navigate = useNavigate();
    const { userId } = useParams();
    const [loginData, setLoginData] = useState<DataType[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const langKey = appStore.getLang();
    const [pageNo, setPageNo] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const getStatus = (_status: string) => {
        return _status ? _status == '1' ? t('security.loginRecord.loginSuccess') : t('security.loginRecord.loginFailed') : '--'
    }

    const getLoginData = async () => {
        const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
        const isuserId = userId ? userId?.toString() : ''
        setLoading(true)
        try {

            const res = await getUserLoginLogList({
                pageNo,
                pageSize: 10,
                userId: userInfo?.userId || isuserId || ''
            });
            if (res.code === '0') {
                setLoginData(res.data.list)
                setTotal(res.data.count)
            }else{
                Toast.show({
                    icon: 'fail',
                    content: res.message,
                })
            }

        } catch (error) {
            Toast.show({
                icon: 'fail',
                content: String(error),
            })
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async () => {
        setPageNo(prev => prev + 1);
        loginData.length < total ? await getLoginData() : setHasMore(false)
    }

    useEffect(() => {
        getLoginData()
    }, [langKey])

    return loading ? 
    (
        <div className="p-4">
            <Skeleton.Title />
            <Skeleton.Paragraph lineCount={15} animated />
        </div>
    )
    :
    (
        loginData && loginData.length ?
        <>
            <ul>
                {
                    loginData.map((item: DataType) => {
                        return (
                            <li className="border border-[var(--border-color4)] rounded-md mb-4 last:mb-0 px-[10px] py-[14px]">
                                <h4 className="text-[14px] leading-[20px] font-medium mb-[11px]">{ item.platformType }</h4>
                                <p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
                                    <span className="tip-color font-normal text-[12px]">{ t('security.loginRecord.time') }</span>
                                    <span>{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
                                </p>
                                <p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
                                    <span className="tip-color font-normal text-[12px]">{ t('security.loginRecord.status') }</span>
                                    <span>{getStatus(item.status)}</span>
                                </p>
                                <p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
                                    <span className="tip-color font-normal text-[12px]">{ t('security.safeSet.ipAddress') }</span>
                                    <span>{ item.ip || '--' }</span>
                                </p>
                                <p className="text-[14px] font-medium leading-5 flex justify-between items-center">
                                    <span className="tip-color font-normal text-[12px]">{ t('security.loginRecord.address') }</span>
                                    <span>{ item.address || '--' }</span>
                                </p>
                            </li>
                        )
                    })
                }
            </ul>
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
        </>
        :
        <NoData />
    );
}

export default LoginRecord;
