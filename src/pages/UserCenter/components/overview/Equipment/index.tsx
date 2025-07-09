import React from 'react';
import styles from '@/pages/UserCenter/overview/index.module.scss';
import { Iconify } from "@/components/icon"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import dayjs from 'dayjs';
import { getUserDeviceNoList } from '@/services/safeCenter';
import {  LoginLogListType } from '@/type/userCenter/overview'

const EquipmentPage: React.FC = () => {
    const [userDeviceNoList, setUserDeviceNoList] = useState<LoginLogListType[]>([] as LoginLogListType[]);
    const { t, currentLanguage } = useLanguage('userCenter');
    const navigate = useNavigate();

    const getUserDeviceNoListData = async () => {
        try {
            const params = {
                pageNo: 1,
                pageSize: 5,
            }
            const res = await getUserDeviceNoList(params);
            if (res.code === '0') {
                setUserDeviceNoList(res.data.list)
            }
        } catch (error) {
            Toast.show({
				icon: 'fail',
				content: String(error),
			})
        }
    }




    useEffect(() => {
        getUserDeviceNoListData()
        // setUserDeviceNoList([
        //     {
        //         deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
        //         id: 0,
        //         userId: 0,
        //         platformType: 0,
        //         ip: '192.198.109.09',
        //         address: '中国香港',
        //         token: '',
        //         tokenTime: '',
        //         createTime: Date.now(),
        //         updateTime: 0,
        //         tenantId: ''
        //     },
        //     {
        //         deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
        //         id: 0,
        //         userId: 0,
        //         platformType: 0,
        //         ip: '192.198.109.09',
        //         address: '中国香港',
        //         token: '',
        //         tokenTime: '',
        //         createTime: Date.now(),
        //         updateTime: 0,
        //         tenantId: ''
        //     },
        // ])
    }, [currentLanguage]);



    return (< >
        {/* 授权设备 */}
        <div className="mt-6">
            <div className={`flex-row justify-between font-18 font-w-500`} >
                {/* 授权设备 */}
                {t('overview.authorizedDevices.title')}
                <Iconify icon="mingcute:arrow-right-line" className="text-[20px]"
                    onClick={() => navigate('/userCenter/security/safeEquipment')}
                />
            </div>
            <div className={`flex-1`} >
                <ul>
                    {userDeviceNoList && userDeviceNoList.map((item: any) => (
                        <li className='mt-5 border-b border-[var(--border-color4)] last:border-b-0 pb-[16px] last:pb-0' key={item.id}>
                            <p className='font-14 font-w-500 flex-col line-20 mb-[10px]'>
                                <span className='mb-[2px]'>
                                    {/* Chrome 12 125.0.0.0(Mac OS X) */}
                                    {/* {`${item.deviceNo || '--'}(${item.platformType || '--'})`} */}
                                    {`${item.deviceNo || '--'}`}
                                </span>
                                <span className="text-[12px] font-normal text-[#a4a5ac] leading-[17px]">
                                    {/* 2020-02-20 12:12:01 中国香港 */}
                                    {/* {item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'} */}
                                    {item.createTime ? `${dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')} ${item.address || '--'}` : '--'}
                                </span>
                            </p>
                            <p className='font-14 font-w-500 flex-col'>
                                <span className="font-w-500 theme_color pointer line-20 mb-[2px]"
                                    onClick={() => navigate(`/userCenter/security/safeEquipment?deviceId=${item.id}`)}
                                >
                                    {/* 管理 */}
                                    {t('overview.authorizedDevices.manage')}
                                </span>
                                <span className="text-[12px] font-normal text-[#a4a5ac] leading-[17px]">
                                    {/* 223.168.123.111 */}
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
export default EquipmentPage;