import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon'
import { Skeleton, Empty } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Toast } from 'antd-mobile';
import { getUserDeviceNoList, delectUserDeviceNo } from "@/services/safeCenter";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";

interface DataLogsType {
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
    fingerprinting: string,
    isCurrent: boolean,
}
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
    fingerprinting: string,
    isCurrent: boolean,
    userLoginLogs: DataLogsType[]
}

const SafeEquipment: React.FC = () => {
	const { t } = useLanguage('userCenter');
	const navigate = useNavigate();
	const { userId, deviceId } = useParams();
	const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
	const [activeId, setActiveId] = useState<number | null>(null);
	const [deviceNoData, setDeviceNoData] = useState<DataType[]>([]);
	const [deviceNo, setDeviceNo] = useState<string>('');
	
	const delectDeviceNo = (id: number | string) => {
        setDeviceNo(id.toString())
        setOpen(true)
    }
    const handleOk = async () => {
        try {
            const res = await delectUserDeviceNo({
                id: deviceNo || ''
            });
            if (res.code === '0') {
                Toast.show({
					icon: 'success',
					content: res.message,
				})
                await getDeviceNoData()
            } else {
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
        }
    }

	// 展开切换
	const toggleItem = (id: number) => {
		setActiveId(prev => (prev === id ? null : id));
	};

	const getDeviceNoData = async () => {
        const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
        const isuserId = userId ? userId?.toString() : ''
        setLoading(true)
        try {
        const res = await getUserDeviceNoList({
            userId: userInfo?.userId || isuserId || ''
        });
        if (res.code === '0') {
			let data = res.data.list
			if (deviceId) data = res.data.list.find((item: DataType) => item.id === Number(deviceId));
            setDeviceNoData(data)
			setActiveId(data[0].id)
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

	// 初始加载数据
    useEffect(() => {
        getDeviceNoData();
		setDeviceNoData([
			{
				id: 0,
				userId: 0,
				platformType: 0,
				deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
				ip: '192.10.1.1',
				address: '中国香港',
				token: '',
				tokenTime: '',
				createTime: Date.now(),
				updateTime: 0,
				tenantId: '',
				fingerprinting: '',
				isCurrent: true,
				userLoginLogs: [
					{
						id: 0,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
					{
						id: 1,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
					{
						id: 2,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
				]
			},
			{
				id: 1,
				userId: 0,
				platformType: 0,
				deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
				ip: '192.10.1.1',
				address: '中国香港',
				token: '',
				tokenTime: '',
				createTime: Date.now(),
				updateTime: 0,
				tenantId: '',
				fingerprinting: '',
				isCurrent: false,
				userLoginLogs: [
					{
						id: 0,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
					{
						id: 1,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
					{
						id: 2,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
				]
			},
			{
				id: 2,
				userId: 0,
				platformType: 0,
				deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
				ip: '192.10.1.1',
				address: '中国香港',
				token: '',
				tokenTime: '',
				createTime: Date.now(),
				updateTime: 0,
				tenantId: '',
				fingerprinting: '',
				isCurrent: false,
				userLoginLogs: [
					{
						id: 0,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
					{
						id: 1,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
					{
						id: 2,
						userId: 0,
						platformType: 0,
						deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
						ip: '192.109.109.09',
						address: '中国香港',
						token: '',
						tokenTime: '',
						createTime: 0,
						updateTime: 0,
						tenantId: '',
						fingerprinting: '',
						isCurrent: false
					},
				]
			},
			{
				id: 3,
				userId: 0,
				platformType: 0,
				deviceNo: 'Chrome 12 125.0.0.0(Mac OS X)',
				ip: '192.10.1.1',
				address: '中国香港',
				token: '',
				tokenTime: '',
				createTime: Date.now(),
				updateTime: 0,
				tenantId: '',
				fingerprinting: '',
				isCurrent: false,
				userLoginLogs: []
			}
		])
    }, []);

	return loading ? 
	(
		<div className="p-4">
			<Skeleton.Title />
			<Skeleton.Paragraph lineCount={15} />
		</div>
	)
	:
	(
		<div className="p-4">
			<div className="">
				<h3 className="text-[20px] leading-[28px] font-medium" onClick={() => navigate(-1)}>
					<Iconify icon="icon-park-outline:left" className="text-[24px]"/>
					<span className="ml-1">{ t('security.securityDevice') }</span>
				</h3>
				<p className="text-[14px] leading-[20px] font-normal tip-color mt-2">{ t('security.safeSet.deviceManageDesc') }</p>
			</div>
			{
				deviceNoData && deviceNoData.length ?
				<ul>
					{
						deviceNoData.map((item: DataType) => {
							const childData = item.userLoginLogs;
							const showToggleIcon = !!(childData && childData.length);
							return (
								<li className="mt-5">
									<div className="h-[24px] flex justify-between items-center font-medium text-[14px] mb-[16px]">
										<div className="flex-1 min-w-0 truncate mr-[10px]">{ item.deviceNo || '--' }</div>
										<div className="shrink-0 flex">
											{
												item.isCurrent && <div className="min-w-[68px] h-[24px] border border-[var(--theme-color)] text-[var(--theme-color)] flex items-center bg-[var(--theme-03)] mr-[11px] px-[6px] rounded-[4px]">
													{/* 当前设备 */}
													{t('security.safeSet.currentDevice')}
												</div>
											}
											{
												showToggleIcon && <Iconify 
													icon={activeId === item.id ? "icon-park-solid:up-one" : "icon-park-solid:down-one"}
													className='text-[20px] text-[var(--theme-color)] mr-4'
													onClick={() => toggleItem(item.id)}
												/>
											}	
											<button className="text-[var(--theme-color)]" onClick={() => delectDeviceNo(item.id)}>{ t('security.delect.btn') }</button>
										</div>
									</div>
									<p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
										<span className="tip-color font-normal text-[12px]">{ t('security.safeSet.loginTime') }</span>
										<span>{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
									</p>
									<p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
										<span className="tip-color font-normal text-[12px]">{ t('security.safeSet.ipAddress') }</span>
										<span>{ item.ip || '--' }</span>
									</p>
									<p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
										<span className="tip-color font-normal text-[12px]">{ t('security.safeSet.loginLocation') }</span>
										<span>{ item.address || '--' }</span>
									</p>
									<AnimatePresence initial={false}>
										{activeId === item.id && (
											<motion.ul
												key="content"
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.3 }}
												className="overflow-hidden bg-[var(--background10)] rounded-lg px-[10px] py-[16px]"
											>
												{
													childData.map((child: DataLogsType) => {
														return (
															<li className="mb-[30px] last:mb-0">
																<p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
																	<span className="tip-color font-normal text-[12px]">{ t('security.safeSet.loginTime') }</span>
																	<span>{child.createTime ? dayjs(child.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
																</p>
																<p className="text-[14px] font-medium leading-5 mb-[13px] flex justify-between items-center">
																	<span className="tip-color font-normal text-[12px]">{ t('security.safeSet.ipAddress') }</span>
																	<span>{ child.ip || '--' }</span>
																</p>
																<p className="text-[14px] font-medium leading-5 flex justify-between items-center">
																	<span className="tip-color font-normal text-[12px]">{ t('security.safeSet.loginLocation') }</span>
																	<span>{ child.address || '--' }</span>
																</p>
															</li>
														)
													})
												}
											</motion.ul>
										)}
									</AnimatePresence>
								</li>
							)
						})
					}
				</ul>
				:
				<Empty
					style={{ padding: '64px 0' }}
					imageStyle={{ width: 128 }}
					description='暂无数据'
				/>
			}
		</div>
	)
};

export default SafeEquipment;