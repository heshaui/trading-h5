import { Modal,CenterPopup } from "antd-mobile";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "../../styles/qrcode.module.css";
// import { Iconify } from "@/components/icon/index";
// import {updateUserCenter} from '@/services/userCenter'
// import { useState } from "react";
// import {encryptData} from '@/utils/encrypt'
// import dayjs from "dayjs";
import { useLanguage } from '@/hooks/useLanguage';
// import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";

interface UserCenterData {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    birthday?: string,
    isNicknameUpdate?: boolean,
    nicknameUpdateTime?: number,
}

type Props = {
    open: boolean;
    qrcode: string,
    onOk: (event: boolean) => void;
    onCancel: () => void;
};

function QRCodeModal({ open, qrcode, onCancel, onOk }: Props) {
    const { t } = useLanguage('common');
    
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        // Handle OK action
    };

    // const ModalFooter: ModalProps["footer"] = () => {
    //     return (
    //         <div className="flex-x align-center justify-end" >
    //             {/* <button
    //                 type="button"
    //                 className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
    //                 onClick={handCancel}
    //             >
    //                 {t('cancel')}
    //             </button> */}
    //         </div>
    //     );
    // };

    return (<></>
            // <Modal
            //     open={open}
            //     // title={<p className={`${styles.title}`} >
            //     //     {/* 修改昵称 */}
            //     //     {t('usersetting.modifyNickname')}
            //     // </p>}
            //     centered
            //     onCancel={handCancel}
            //     footer={ModalFooter}
            //     width={250}
            //     className={`modal_box`}
            //     classNames={{
            //         content: styles.modal_content,
            //         body: styles.modal_body,
            //         footer: styles.modal_footer,
            //     }}
            // >
            //     <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
            //     <QRCode value={qrcode}
            //         style={{ backgroundColor: "#fff", padding: "6px", minWidth: "68px" }} size={168} />
            //     </div>
            // </Modal>
    );
}

export default QRCodeModal;
