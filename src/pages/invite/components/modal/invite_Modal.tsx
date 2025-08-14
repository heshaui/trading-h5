import { Modal, ConfigProvider, Form, QRCode } from "antd";
import { Image ,Toast} from "antd-mobile";
import type { ModalProps } from "antd/es/modal/interface";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "../../styles/modal.module.css";
import { Iconify } from "@/components/icon/index";
// import { useTranslation } from 'next-i18next';
import appStore from "@/store"
import { useLanguage } from '@/hooks/useLanguage';
import invitePic from '@/assets/images/invite/modal_icon.png'

type Props = {
    open: boolean;
    // onOk?: (event: boolean) => void;
    onOk: () => void;
    onCancel: () => void;
};

function NicknameModal({ open, onCancel, onOk }: Props) {
    // const router = useRouter();
    const { t } = useLanguage(['invite']);
    const [form] = Form.useForm();
    const BASE_URL = process.env.NEXT_PUBLIC_INVITE_BASE;
    const rewardInfo=appStore.getInviteInfo()
    const handCancel = () => {
        form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        // form.validateFields()
        //     .then(async (values) => {
        //         onOk
        //         handCancel()
        //     });
        onOk()
    };
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
        form.setFieldsValue({ nickname: filteredValue });
    };

    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className={`${styles.modal_footer} flex-y-cc`} >
                <div className={`${styles.modal_footer_box} flex-x-cc`}>
                    <button
                        type="submit"
                        className={`${styles.modal_footerBtn} default_btn flex-x-cc`}
                        onClick={handOk}
                    >
                        {/* 我知道了 */}
                        {t('invite.inviteModal.okBtn')}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={handCancel}
                >
                    <Iconify icon="carbon:close-outline" className="mt-7" size={35} style={{ color: '#fff' }} />
                </button>

            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Modal: {
                        // contentBg: "var(--background13)",
                        // footerBg: "var(--background13)",
                        // headerBg: "var(--background13)",
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                }
            }}
        >
            <Modal
                open={open}
                // title={<p className={`${styles.title}`} >修改昵称</p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={500}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                    // header: styles.modal_header,
                    // mask: styles.modal_mask,
                }}
            >
                <div className="flex-col flex-ai-center  pb-5" style={{ width: "100%" }}>
                    <p className={`${styles.title_color2} font-28 font-w-500`}>
                        {/* 邀请好友获得 */}
                        {t('invite.inviteModal.title')}
                        <span className={styles.strong_color}>{t('invite.inviteModal.title2')}</span>
                        </p>
                    <Image src={invitePic} alt="invite_modal" className={styles.modal_image_box} />
                    <div className="flex-x align-center">
                        <p className={`${styles.title_color2} font-16 font-w-400 mr-9`}>
                            {/* 注册 14 天内累计充值不低于 100 USDT且完成实名认证，即可获得好友现货交易手续费 */}
                            {/* {t('invite.inviteModal.tip1')} */}
                            {rewardInfo.isRealname?.toString() == '1' ? t('invite.inviteModal.tip11', { time: rewardInfo.validTime, count: rewardInfo.rechargeLimit, coinName: 'USDT'})
                                : t('invite.inviteModal.tip12', { time: rewardInfo.validTime, count: rewardInfo.rechargeLimit, coinName: 'USDT'})}
                            <span className={styles.strong_color}>{rewardInfo.rebateRatio}%</span>
                            {/* 返佣 */}
                            {t('invite.inviteModal.tip2')}
                        </p>
                        <div
                            className={`${styles.modal_QRCode}`}
                            style={{ padding: "5px" }}>
                            <QRCode value={`${BASE_URL}/register`}
                            style={{ backgroundColor: "#fff", padding: "5px", minWidth: "68px" }} size={68} /> 
                        </div>
                       
                    </div>
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default NicknameModal;
