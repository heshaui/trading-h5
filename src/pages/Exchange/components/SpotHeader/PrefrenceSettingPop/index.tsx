import React from 'react';
import { Popup } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { observer } from 'mobx-react-lite';
import { Iconify } from "@/components/icon";
import PopIndex from './pop_index';
import { usePopTypeContext, PopTypeProvider, PopTypeEnum } from '@/hooks/usePopProvider';

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
            bodyClassName="!bg-[var(--background17)] !text-[var(--text-color5)]"
        >
            <div className="flex-col h-full">
                {/* 头部 */}
               <div className="flex h-[60px] px-4 text-[16px] font-medium justify-between items-center border-b border-color">
                    {popType === PopTypeEnum.INDEX && t('spot.drawer.preferences')}
                    {popType === PopTypeEnum.TRADE_RULE && (
                        <>
                            <div className='flex-x align-center'>
                                <button className="mr-1" onClick={goIndex}>
                                    <Iconify icon="icon-park-outline:left" className="text-[24px]" />
                                </button>
                                {t('spot.drawer.tradeRule')}
                            </div>
                            <button onClick={handClose}>
                                <Iconify icon="eva:close-outline" className="text-[24px] tip-color" />
                            </button>
                        </>
                    )}
                    {popType === PopTypeEnum.FEE_COIN && (
                        <>
                            <div className='flex-x align-center'>
                                <button onClick={goIndex}>
                                    <Iconify icon="icon-park-outline:left" className="text-[24px]" />
                                </button>
                                {t('spot.drawer.feeCoin')}
                            </div>
                            <button onClick={handClose}>
                                <Iconify icon="eva:close-outline" className="text-[24px] tip-color" />
                            </button>
                        </>
                    )}  
                </div>
                {/* 内容区域 */}
                <PopIndex />
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