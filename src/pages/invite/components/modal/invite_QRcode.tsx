import { Modal, ConfigProvider, Form, QRCode } from "antd";
import type { ModalProps } from "antd/es/modal/interface";
import styles from "../../styles/qrcode.module.css";
import { useLanguage } from '@/hooks/useLanguage';
interface UserCenterData {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    birthday?: string,
    isNicknameUpdate?:boolean,
    nicknameUpdateTime?: number,
  }
type Props = {
    open: boolean;
    qrcode:string,
    onOk: (event: boolean) => void;
    onCancel: () => void;
};

function QRCodeModal({ open,qrcode, onCancel ,onOk}: Props) {
    const { t } = useLanguage('common');
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
       
    };

    const ModalFooter: ModalProps["footer"] = () => {
        return (
            <div className="flex-x align-center justify-end" >
                {/* <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    {t('cancel')}
                </button> */}
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 0, // 去除表单项之间的间距
                    },
                    Input: {
                        // color: '#FF5F1F',
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        controlHeightLG: 50,
                        activeBg:'var(--background5)',
                        hoverBg:'var(--background5)',
                    },
                    Button: {
                        controlHeightLG: 50,
                        defaultActiveBorderColor: 'var(--theme-color)', //默认按钮激活态边框颜色
                        defaultActiveColor: 'var(--theme-color)', //默认按钮激活态文本颜色
                        defaultBg: 'var(--theme-color)', //默认按钮背景颜色
                        defaultHoverBorderColor: 'var(--theme-color)', //默认按钮悬浮态边框颜色
                        defaultHoverColor: 'var(--theme-color)', //默认按钮悬浮态文本颜色
                        defaultColor: '#fff', //默认按钮文本颜色
                    },
                    Modal:{
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    }
                },
                token: {
                    colorText: 'rgba(0,0,0,0.88)',
                }
            }}
        >
            <Modal
                open={open}
                // title={<p className={`${styles.title}`} >
                //     {/* 修改昵称 */}
                //     {t('usersetting.modifyNickname')}
                // </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={250}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
                closable={false}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                <QRCode value={qrcode}
                    style={{ backgroundColor: "#fff", padding: "6px", minWidth: "68px" }} size={168} />
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default QRCodeModal;
