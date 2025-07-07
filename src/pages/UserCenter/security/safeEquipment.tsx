import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon'
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
	const [expandedMap, setExpandedMap] = useState({});
	const [deviceNoData, setDeviceNoData] = useState<DataType[]>([]);
	const [deviceNo, setDeviceNo] = useState<string>('');
	// 标记是否已经处理过URL参数
    const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);
	
	const delectDeviceNo = async (id: number | string) => {
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

	// 初始化展开信息expandedMap
	const initExpandedMap = (data: DataType[]) => {
		data.map((item: DataType, index: number) => {
			
		})
	}

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
    useEffect(() => {0
        getDeviceNoData();
    }, []);

	return (
		<div className="p-4">
			<div className="">
				<h3 className="text-[20px] leading-[28px] font-medium" onClick={() => navigate(-1)}>
					<Iconify icon="icon-park-outline:left" className="text-[24px]"/>
					<span className="ml-1">{ t('security.securityDevice') }</span>
				</h3>
				<p className="text-[14px] leading-[20px] font-normal tip-color mt-2">{ t('security.safeSet.deviceManageDesc') }</p>
			</div>
			<ul>
				{
					deviceNoData.map((item: DataType) => {
						return (
							<li>
								<div className="">
									<div>{ item.deviceNo || '--' }</div>
									<div>
										{
											item.isCurrent && <p className="">
												{/* 当前设备 */}
												{t('security.safeSet.currentDevice')}
											</p>
										}
										<Iconify icon={expandedRowKeys.includes(item.id) ? "icon-park-solid:up-one"
											: "icon-park-solid:down-one"}
											style={{ color: "var(--theme-color)" }}
											className='ml-2'
											size={20}
										/>
										<button>{ t('security.delect.btn') }</button>
									</div>
								</div>
								<p>
									<span>{ t('security.safeSet.loginTime') }</span>
									<span>{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
								</p>
								<p>
									<span>{ t('security.safeSet.ipAddress') }</span>
									<span>{ item.ip || '--' }</span>
								</p>
								<p>
									<span>{ t('security.safeSet.loginLocation') }</span>
									<span>{ item.address || '--' }</span>
								</p>
								<div>

								</div>
							</li>
						)
					})
				}
			</ul>
		</div>
	);
};

export default SafeEquipment;