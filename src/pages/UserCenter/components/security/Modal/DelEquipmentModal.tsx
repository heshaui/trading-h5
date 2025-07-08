import React from 'react';
import { Modal, ConfigProvider, Form, Input } from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';

type Props = {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
};



const DeleteModal: React.FC<Props> = ({open, onOk, onCancel}) => {
    const { t } = useLanguage('userCenter');
    const ModalTitle: React.FC = () => {
        return (
            <p className="bg-[var(--background5)] border border-b-[var(--border-color6)]] font-medium text-[16px]">
                {/* 确认删除这台设备吗？ */}
                {t('security.delect.title')}
            </p>
        )
    }
    const ModalContent: React.FC = () => {
        return (
            <div className="bg-[var(--background5)] p-4">
                <div className="text-[var(--text-color5)] text-[14px] mb-[10px]">
                    {/* 移除后，该设备将退出登录态！ */}
                    {t('security.delect.msg')}
                </div>
                <div className="text-[14px] font-medium flex justify-end">
                    <button
                        type="button"
                        className="min-w-[80px] px-[28px] py-[8px] rounded-[40px] cancel_btn2 mr-5"
                        onClick={onCancel}
                    >
                        {/* 取消 */}
                        {t('security.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="min-w-[80px] px-[28px] py-[8px] rounded-[40px] cancel_btn2 mr-5"
                        onClick={onOk}
                    >
                        {/* 确认 */}
                        {t('security.confirm')}
                    </button>
                </div>
            </div>
        )
    }
    return (
        <Modal
            visible={open}
            title={ <ModalTitle /> }
            content={ <ModalContent /> }
            closeOnAction
            onClose={onCancel}
        />
    )
}

export default DeleteModal;
