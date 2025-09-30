import { Popup, Toast } from "antd-mobile";
// import { Checkbox } from "antd";

// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
import styles from "../styles/modal.module.scss";
import { Iconify } from "@/components/icon/index";
// import { updateUserCenter } from '@/services/userCenter'
// import { useState } from "react";
// import {encryptData} from '@/utils/encrypt'
// import dayjs from "dayjs";
import { useLanguage } from '@/hooks/useLanguage';
// import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
// import { encryptData } from '@/utils/encrypt'
// import {revocationOrder} from '@/services/spot'
import errIcon from "@/assets/images/spot/spotOrder/icon_spot_err3.png"

type Props = {
    open: boolean;
    orderId: string[];
    errMsg?: string;
    type:number;
    onOk: (orderId: string[],type:number) => void;
    onCancel: () => void;
};

function DelectModal({ open, onCancel, onOk, errMsg, orderId,type }: Props) {
    const { t } = useLanguage(['spot']);
    
    const handCancel = () => {
        // form.resetFields();
        onCancel()
    };

    const handOk = async () => {
        // try {
        //     const paeam={
        //         orderId: orderId,
        //     }
        //     const encrypt=await encryptData(paeam)
        //     const res = await revocationOrder(encrypt)
        //     if(res.code==='0'){
        //         Toast.show({
        //             content: res.message,
        //             icon: 'success'
        //         })
        //         onOk()
        //         onCancel()¸
        //     }else{
        //         Toast.show({
        //             content: res.message,
        //             icon: 'fail'
        //         })
        //     }
        // } catch (error) {
        //     Toast.show({
        //         content: String(error),
        //         icon: 'fail'
        //     })
        // }
        onOk(orderId,1)
    };

    return (
        <Popup
            visible={open}
            onMaskClick={handCancel}
            onClose={handCancel}
            className="modal_box"
            bodyStyle={{
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
            }}
            bodyClassName="!h-auto !bg-[var(--background17)] !text-[var(--text-color5)] pt-[18px] pb-[20px] px-4"
        >
            <div className="h-[14px] flex justify-end mb-[28px]">
                <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
            </div>
            <div className="flex-col flex-ai-center" >
                <div className="flex-y-cc w-full">
                    <img 
                        src={errIcon}
                        alt="" 
                        className="w-[160px] h-[160px]" 
                    />
                    <p className={`mt-1 font-20 font-w-500 text-center`}>
                        {errMsg || `${type===1?t('spot.cancelOrderModal.title3'): t('spot.cancelOrderModal.title2')}`}
                    </p>
                </div>
                
                <div className="flex-x-cc mt-[40px] w-full">
                    <button
                        type="button"
                        className={`h-[50px] flex-1 flex justify-center items-center bg-[var(--background14)] rounded-[25px] text-[14px] font-medium mr-[11px]`}
                        onClick={handCancel}
                    >
                        {t('spot.cancelOrderModal.cancel')}
                    </button>
                    <button
                        type="button"
                        className={`h-[50px] flex-1 flex justify-center items-center bg-[var(--theme-color)] rounded-[25px] text-[14px] font-medium`}
                        onClick={handOk}
                    >
                        {t('spot.cancelOrderModal.confirm')}
                    </button>
                </div>
            </div>
        </Popup>
    );
}

export default DelectModal;
