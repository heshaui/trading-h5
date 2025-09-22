// import { Button, Form, Input,Tabs } from "antd";
"use client";
import { Input,  Form, Segmented ,Toast} from 'antd-mobile';
// import type { AutoCompleteProps } from 'antd';
import { useState, useEffect } from "react";
import { useResetStateContext, ResetStateEnum } from "@/context/reset-providers/ResetStateProvider";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../style/reset.module.scss"
import { emailSuffixes } from "@/utils/enum";                      
import { useNavigate, useParams } from 'react-router-dom';
import PhoneCodeSelector from "@/components/PhoneCodeSelector/PhoneCodePop"
import { useLanguage } from '@/hooks/useLanguage';
import { getCheckRule } from "@/services/resetPassword"
import { encryptData } from "@/utils/encrypt";
// import { toast } from "sonner";
import { Iconify } from "@/components/icon";
import EmailAuto from "@/components/EmailAuto";

interface acountType {
    type: string;
    acount: string;
    areaCode?: string
}
function ResetPassword() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { resetState, setResetState, setAcount } = useResetStateContext();
    // const [authCode, setAuthCode] = useState('');
    // const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [tabsProps, setTabsProps] = useState('email');
    const { acount, type, areaCode } = useParams();
    const { t } = useLanguage('resetPassword');
    const [isLoding, setIsLoding] = useState(false);
    // console.log(acount, type, areaCode, 123);

    // 定义粘贴功能的处理函数
    // const handlePaste = async () => {
    //     try {
    //         // 使用 Clipboard API 读取剪贴板内容
    //         const clipboardData = await navigator.clipboard.readText();
    //         // 如果输入框引用存在，将剪贴板内容赋值给输入框的值
    //         // if (inputRef.current) {
    //         //     inputRef.current.input.value = clipboardData;
    //         // }
    //         if (clipboardData) {
    //             setAuthCode(clipboardData)
    //         }
    //     } catch (error) {
    //         // 捕获并打印可能出现的错误
    //         console.error('Err:', error);
    //     }
    // };
    const goBackPage = () => {
        navigate('/login');
    }
    const goNext = () => {
        form
            .validateFields()
            .then(async (values) => {
                console.log(values);
                let data: acountType = {
                    type: "",
                    acount: ""
                }
                if (tabsProps === 'email') {
                    data = {
                        type: 'm',
                        acount: values.acount,
                    }
                } else if (tabsProps === 'phone') {
                    data = {
                        type: 'p',
                        acount: values.acountNumber,
                        areaCode: values.areaCode
                    }

                }
                // setAcount(data)
                // setResetState(ResetStateEnum.SENTCODE)
                setIsLoding(true)
                try {
                    const params = {
                        type: data.type,
                        account: data.acount
                    }
                    const encrypt = await encryptData(params)
                    const res = await getCheckRule(encrypt)
                    if (res.code === '0') {
                        const dataInfo = Object.assign({}, data, res.data)
                        setAcount(dataInfo)
                        // if (res.data.message) {
                        //     Toast.show(t('codeError'))

                        // } else {
                        //     Toast.show(res.message)
                        // }
                        setResetState(ResetStateEnum.SENTCODE)

                    } else {
                        Toast.show(res.message)
                    }
                } catch (error) {
                    Toast.show(String(error))
                }finally{
                    setIsLoding(false)
                }


            })
            .catch(error => {
                console.log(error)
            })

}


const tabsChange = (value: any) => {
    setTabsProps(value)
};
useEffect(() => {
    // 初始表单内容
    form.setFieldsValue({
        areaCode: type === 'p' && acount && acount !== 'undefined' ? `+${areaCode}` : "+1",
        acount: type === 'm' && acount && acount !== 'undefined' ? acount : "",
        acountNumber: type === 'p' && acount && acount !== 'undefined' ? acount : ""
    });
    if (type === 'm') {
        setTabsProps('email')
    } else if (type === 'p') {
        setTabsProps('phone')
    }
}, [acount, type, areaCode, form]);

if (resetState !== ResetStateEnum.INPUT) return null;

return (<>

        <Segmented
            className={`${styles.custom_segmented} custom-segmented`}
            options={[
                {
                    label: (
                        //  button-color
                        <div className={`${styles.tabs_label}`} >
                            <div>
                                {t('email')}</div>
                        </div>

                    ),
                    value: 'email',
                },
                {
                    label: (
                        <div className={`${styles.tabs_label}`} >
                            <div>{t('phone')}</div>
                        </div>

                    ),
                    value: 'phone',
                },

            ]}
            onChange={tabsChange}
            defaultValue={tabsProps}
            value={tabsProps}
        />

        <div className="flex-col mt-6 h-full" style={{ width: "100%" }}>
            {/* <div className="mb-7  font-w-500" style={{ width: "300px" }}>手机号/邮箱</div> */}
            <Form
                name="aount"
                form={form}
                className={`${styles.login_form}`}
            // initialValues={{ areaCode: areaCode||"+1", acount: type === 'm' ? acount : "", acountNumber: type === 'p' ? acount : "" }}
            >
                {tabsProps === 'email' && (<Form.Item  className={`${styles.login_form_item} mt-1`} name="acount" 
                rules={[
                    { required: true, message: t('inputAcount') }
                ]}
                >
                    {/* <AutoComplete
                        onSearch={handleSearch}
                        // placeholder="请输入手机/邮箱"
                        placeholder={t('inputAcount')}
                        options={options}
                        allowClear={true}
                        backfill={true}
                        className={`${styles.acount_input} auto-complete-input  autoComplete-custom custom-sleect`}
                    // onChange={getValue}
                    /> */}
                        <EmailAuto placeholder={t('inputAcount')} showHistory={false} />
                </Form.Item>)}
                {tabsProps === 'phone' && (
                    <Form.Item  className={`${styles.login_form_item} mt-1`} >
                        <div className={`flex ${styles.acount_input}`}>
                            <PhoneCodeSelector />
                            <Form.Item  className={`${styles.login_form_item}`} noStyle name="acountNumber" rules={[{ required: true, message: t('smsInputNull') }]}>
                                <Input placeholder={t('smsInput')} clearable={true} className={`${styles.mail_input} ml-2 custom-input modal-input`} />
                            </Form.Item>
                        </div>
                    </Form.Item>
                )}
                <div className='flex mt-6'>
                <button
                    type="button"
                    className={`${styles.goBack_btn} flex-x-cc mr-4`}
                    onClick={() => goBackPage()}>
                    {t('goBack')}
                </button>
                <button type='submit' className={`btn-color ${styles.next_btn} flex-x-cc flex-1`} onClick={goNext}>
                    {isLoding ? <Iconify icon="eos-icons:bubble-loading" size={20} /> : t('next')}
                    </button>
            </div>
            </Form>
            

        </div>
</>

);
}

export default ResetPassword;
