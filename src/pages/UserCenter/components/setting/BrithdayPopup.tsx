import { Form, DatePicker } from "antd";
import { Toast, Popup } from 'antd-mobile';
import styles from "./styles/nickname.module.scss";
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter';
import dayjs, { Dayjs } from 'dayjs';
import { encryptData } from '@/utils/encrypt'
import { useLanguage } from '@/hooks/useLanguage';
import DateTimePop from '@/components/DateTimePop';
import { useState } from 'react'

type Props = {
    open: boolean;
    userId: number;
    // onOk?: (event: boolean) => void;
    onOk: (bool: boolean) => void;
    onCancel: () => void;
};

function BirthdayModal({ open, onCancel, userId, onOk }: Props) {
    // const router = useRouter();
    const [form] = Form.useForm();
    const { t } = useLanguage(['common']);
    const [visible, setVisible] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs(), null]);
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        // form.validateFields()
        //     .then(async (values) => {
                

        //     });
        if (!dateRange[0]) return Toast.show({
            icon: 'fail',
            content: t('usersetting.birthday.required'),
        });
        const params = {
            userId: userId,
            birthday: dayjs(dateRange[0]).valueOf() + '' 
        }
        try {
            const encrypt = await encryptData(params)
            const res = await updateUserCenter(encrypt);
            if(res.code === '0'){
                Toast.show({
                    icon: 'success',
                    content: t('usersetting.birthday.modifySuccess'),
                });
                onOk(true)
                onCancel()
            }else{
                Toast.show({
                    icon: 'fail',
                    content: res.message,
                });
            }

        } catch (error) {
            Toast.show({
                icon: 'fail',
                content: String(error),
            });
        }
    };
    const ModalFooter = () => {

        return (
            <div className="flex justify-between gap-x-[10px] mt-5">
                <button className="w-[50%] rounded-[22px] h-[44px] cancel_btn2 flex justify-center items-center" onClick={handCancel}>
                {t('cancel')}
                </button>
                <button className="w-[50%] rounded-[22px] h-[44px] default_btn flex justify-center items-center" onClick={handOk}>
                {t('save')}
                </button>
            </div>
        );
    };
    // 自定义验证规则
    const validatePassword = (_: any, value: string) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error(t('usersetting.birthday.required')));
        }
        const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD']
        let isValid = false;

        validFormats.forEach((format) => {
            if (dayjs(value, format, true).isValid()) {
                isValid = true;
            }
        });

        if (!isValid) {
            return Promise.reject(new Error(t('usersetting.birthday.invalidFormat')));
        }

        return Promise.resolve();
    };

    return (
        <Popup
            visible={open}
            onClose={onCancel}
            closeOnMaskClick
            position='left'
            bodyStyle={{ width: '100vw' }}
            bodyClassName="!bg-[var(--background5)] !text-[var(--text-color5)]"
        >
            <p className={`${styles.title}`} >
                {t('usersetting.birthday.title')}
                <Iconify icon="mingcute:close-line" className="text-[24px] text-[#676867]" onClick={onCancel} />
            </p>
            <div className="p-4">
                <button 
                    className="border border-solid input-border rounded-lg w-full h-[50px] flex justify-between items-center px-[11px] text-[14px]"
                    onClick={() => setVisible(true)}
                >
                    {
                        dateRange[0] ?
                        <span>{ dateRange[0].format('YYYY-MM-DD') }</span>
                        :
                        <span className="placeholder-color"> {t('usersetting.birthday.placeholder')} </span>
                    }
                    <Iconify icon="cuida:calendar-outline" className="text-[20px]" />
                </button>
                <p className="text-[12px] tip_color mt-2">{t('usersetting.birthday.tip')}</p>
                <ModalFooter />
                <DateTimePop
                    popupVisible={visible}
                    handlePopupClose={() => setVisible(false)}
                    title={ t('usersetting.birthday.title') }
                    value={dateRange}
                    onChange={setDateRange}
                    minDate={dayjs('1900-01-01')}
                    maxDate={dayjs()}
                    type="date"
                />
            </div>
        </Popup>
    );
}

export default BirthdayModal;
