import React from 'react';
import styles from '@/pages/UserCenter/overview/index.module.scss';
import { Iconify } from "@/components/icon"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import dayjs from 'dayjs';
import { getUserLoginLogList } from '@/services/safeCenter';
import { LoginLogListType} from '@/type/userCenter/overview'


const SafeLogPage: React.FC = () => {
    const [loginLogList, setLoginLogList] = useState<LoginLogListType[]>([] as LoginLogListType[]);
    const { t, currentLanguage } = useLanguage('userCenter');
	const navigate = useNavigate();
    const getLoginLogListData = async () => {
        try {
            const params = {
                pageNo: 1,
                pageSize: 5,
            }
            const res = await getUserLoginLogList(params);
            if (res.code === '0') {
                setLoginLogList(res.data.list)
            }

        } catch (error) {
            Toast.show({
				icon: 'fail',
				content: String(error),
			})
        }
    }
    



    useEffect(() => {
        setLoginLogList([
        {
            deviceNo: 'WEB',
            id: 0,
            userId: 0,
            platformType: 0,
            ip: '192.150.0.9',
            address: '中国',
            token: '',
            tokenTime: '',
            createTime: Date.now(),
            updateTime: 0,
            tenantId: ''
        },
        {
            deviceNo: 'WEB',
            id: 0,
            userId: 0,
            platformType: 0,
            ip: '192.150.0.9',
            address: '中国',
            token: '',
            tokenTime: '',
            createTime: Date.now(),
            updateTime: 0,
            tenantId: ''
        }
    ])
        // getLoginLogListData()
    }, [currentLanguage]);


    return (<>
        {/* 最近登录 */}
        <div className={`${styles.mt30}`}>
            <div className={`${styles.assetTit}`} >
                {/* 最近登录 */}
                {t('overview.recentLogin.title')}
                <Iconify icon="mingcute:arrow-right-line" className={styles.assetIcon}
                    onClick={() => navigate('/userCenter/safeCenter/safe_log')}
                />
            </div>
            <div className={`flex-1`} >
                <ul className="pl-0">
                    {loginLogList && loginLogList.map((item: any) => (
                        <li className='flex-row justify-between mt-5' key={item.id}>
                            <p className='font-14 font-w-500 flex-col'>
                                <span className='font-w-500 line-20 mb-[2px]'>
                                    {/* WEB */}
                                    {/* {`${item.deviceNo || '--'}(${item.platformType || '--'})`} */}
                                    {`${item.deviceNo || '--'}`}
                                </span>
                                <span className="text-[12px] font-normal text-[#a4a5ac] leading-[17px]">
                                    {/* 中国香港 */}
                                    {item.address || '--'}
                                </span>
                            </p>
                            <p className='font-14 font-w-500 flex-col align-end'>
                                <span className='font-w-500 line-20 mb-[2px]'>
                                    {/* 2024-01-01 12:00:00 */}
                                    {item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}
                                </span>
                                <span className="text-[12px] font-normal text-[#a4a5ac] leading-[17px]">
                                    {/* 5.180.44.127 */}
                                    {item.ip || '--'}
                                </span>
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    </>);
};
export default SafeLogPage;