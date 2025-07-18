import React from 'react';
import { Popup } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import { Iconify } from "@/components/icon";
import PopIndex from './pop_index';
import { usePopTypeContext, PopTypeProvider, PopTypeEnum } from '@/hooks/usePopProvider';
import styles from './styles/index.module.scss';

interface Props {
    open: boolean;
    onCancel: () => void;
}

// 内部组件，使用Context
const PrefrenceSettingContent: React.FC<Props> = observer(({ open, onCancel }) => {
    const { t } = useLanguage(['spot']);
    const { popType, setPopType } = usePopTypeContext();

    const goIndex = () => {
        setPopType(PopTypeEnum.INDEX)
    }
    const handClose = () => {
        onCancel()
        setPopType(PopTypeEnum.INDEX)
    }


    return (
        <Popup
            visible={open}
            onClose={handClose}
            position='right'
            closeOnMaskClick
            bodyStyle={{ width: '80vw', height: '100vh' }}
            bodyClassName="!bg-[var(--background5)] !text-[var(--text-color5)]"
        >
            <div className="flex-col h-full">
                {/* 头部 */}
               <div className="flex h-[50px] justify-between items-center border-b border-color">
                    {popType === PopTypeEnum.INDEX && t('spot.drawer.preferences')}
                    {popType === PopTypeEnum.TRADE_RULE && (
                        <div className='flex-x align-center justify-between w-full'>
                            <div className='flex-x align-center'>
                                <button onClick={goIndex}>
                                    <Iconify icon="icon-park-outline:left" className={`${styles.tip_color}`} size={24} />
                                </button>
                                {t('spot.drawer.tradeRule')}
                            </div>
                            <button onClick={handClose}>
                                <Iconify icon="eva:close-outline" className={`${styles.tip_color} ml-1`} size={24} />
                            </button>
                        </div>
                    )}
                    {popType === PopTypeEnum.FEE_COIN && (
                        <div className='flex-x align-center justify-between w-full'>
                            <div className='flex-x align-center'>
                                <button onClick={goIndex}>
                                    <Iconify icon="icon-park-outline:left" className={`${styles.tip_color}`} size={24} />
                                </button>
                                {t('spot.drawer.feeCoin')}
                            </div>
                            <button onClick={handClose}>
                                <Iconify icon="eva:close-outline" className={`${styles.tip_color} ml-1`} size={24} />
                            </button>
                        </div>
                    )}  
                </div>

                {/* 内容区域 */}
                <div className={`${styles.content} flex-1 overflow-y-auto`}>
                    <PopIndex />
                </div>
            </div>
        </Popup>
    );
});

// 外部组件，提供Provider
const PrefrenceSettingPop: React.FC<Props> = ({ open, onCancel }) => {
    return (
        <PopTypeProvider>
            <PrefrenceSettingContent open={open} onCancel={onCancel} />
        </PopTypeProvider>
    );
};

export default PrefrenceSettingPop; 