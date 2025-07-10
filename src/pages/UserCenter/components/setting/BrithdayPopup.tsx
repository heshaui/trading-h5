import { Form, DatePicker } from "antd";
import { Toast, Popup } from 'antd-mobile';
import styles from "./styles/nickname.module.scss";
import { Iconify } from "@/components/icon/index";
import { updateUserCenter } from '@/services/userCenter';
import dayjs from 'dayjs';
import { encryptData } from '@/utils/encrypt'
import { useLanguage } from '@/hooks/useLanguage';

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
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async (values) => {
                console.log(values,dayjs(values.birthday).valueOf(),111);
                const params = {
                    userId: userId,
                    birthday: dayjs(values.birthday).valueOf() + '' 
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

            });
    };
    const ModalFooter = () => {

        return (
            <div className="flex-x align-center justify-center mt-5" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    {t('cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
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
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: "100%" }}
                    // initialValues={{ nickname: nickname||'' }}
                    >
                        <Form.Item name="birthday" rules={[
                            { validator: validatePassword }
                        ]}>
                            {/* <Input placeholder="年/月/日"
                                className={`${styles.input_box} modal-input`}
                                maxLength={13}
                                suffix={
                                    <Iconify icon="cuida:calendar-outline" className={`${styles.suffix_icon} mr-1`} />
                                }
                            /> */}
                            <DatePicker
                                className={`custom-input ${styles.input_box} modal-input2`}
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('usersetting.birthday.placeholder')}
                                allowClear
                                disabledDate={(current) => {
                                    // 使用dayjs禁用当前日期以后的日期
                                    return  current > dayjs().endOf('day');
                                }}
                                suffixIcon={
                                    <Iconify icon="cuida:calendar-outline"
                                        className={`${styles.suffix_icon} mr-1`}
                                        size={20} />
                                }
                            />
                        </Form.Item>
                        <ul className={`${styles.msg_color} mt-2_5 font-12 font-w-400`}>
                            <li className="flex align-base ">
                                {t('usersetting.birthday.tip')}
                            </li>
                        </ul>
                    </Form>
                    <ModalFooter />
                </div>
        </Popup>
    );
}

export default BirthdayModal;
