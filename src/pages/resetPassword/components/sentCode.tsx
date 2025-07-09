/* eslint-disable react-hooks/exhaustive-deps */
import { Form, Input,ConfigProvider} from "antd";
import {Toast} from 'antd-mobile';
// import type { AutoCompleteProps } from 'antd';
import { useState, useEffect, useRef } from "react";
import { useResetStateContext, ResetStateEnum } from "@/context/reset-providers/ResetStateProvider";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../style/reset.module.scss"
import { encryptString } from "@/utils/encrypt"
// import QuestionModal from "@/components/myModal/questionModal";
import { getResetMailCode, getResetSmsCode, getResetPasswordCheck } from "@/services/resetPassword"
// import { encryptData } from "@/utils/encrypt";
import { useLanguage } from '@/hooks/useLanguage';
import { getCheckRule } from "@/services/resetPassword"
import { encryptData } from "@/utils/encrypt";
import { Iconify } from "@/components/icon";
import QuestionModal from "@/components/LoginAboutPop/questionModal";
function ResetPassword() {
    const [form] = Form.useForm();
    const { resetState, setResetState, acount } = useResetStateContext();
    // const [authCode, setAuthCode] = useState('');
    const [pointout, setPointout] = useState(false);
    // const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [countdown, setCountdown] = useState(0);
    const [countdown2, setCountdown2] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [isCounting2, setIsCounting2] = useState(false);
    const [isLoding, setIsLoding] = useState(false);
    const [isCodeLoding, setIsCodeLoding] = useState(false);
    const [isCodeLoding2, setIsCodeLoding2] = useState(false);
    const { t } = useLanguage('resetPassword');
    const [codeInputValue, setCodeInputValue] = useState('');
    const [emailCodeInputValue, setEmailCodeInputValue] = useState('');
    const [phoneCodeInputValue, setPhoneCodeInputValue] = useState('');
    const [googleCodeInputValue, setGoogleCodeInputValue] = useState('');
    // 添加定时器的引用
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timer2Ref = useRef<NodeJS.Timeout | null>(null);
    const goNext = () => {
        form.validateFields()
            .then(async (values) => {
                setIsLoding(true)
                try {
                    // let dataInfo = {}
                    // if (acount.type == 'p') {
                    //     dataInfo = {
                    //         type: acount.type,
                    //         account: acount.acount,
                    //         phoneCode: values.code,
                    //         googleCode: values.googleCode || '',
                    //         emailCode: values.elseCode || ''
                    //     }
                    // } else if (acount.type == 'm') {
                    //     dataInfo = {
                    //         type: acount.type,
                    //         account: acount.acount,
                    //         emailCode: values.code,

                    //         phoneCode: values.elseCode || '',
                    //         googleCode: values.googleCode || '',
                    //     }
                    // }
                    const dataInfo = {
                        type: acount.type,
                        account: acount.acount,
                        emailCode: values.emailCode || '',
                        phoneCode: values.phoneCode || '',
                        googleCode: values.googleCode || '',
                    }
                    const dataEncrypt = await encryptData(dataInfo)
                    // 重置密码校验
                    const res = await getResetPasswordCheck(dataEncrypt)
                    if (res.code === '0') {
                        setResetState(ResetStateEnum.RESET)
                    } else {
                         Toast.show(res.message)
                    }
                    setIsLoding(false)
                } catch (error) {
                    setIsLoding(false)
                     Toast.show(String(error))
                }
            })

            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }
    const goLast = () => {
        clearTimers()
        setResetState(ResetStateEnum.INPUT)
    }
    // 清除定时器的函数
    const clearTimers = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (timer2Ref.current) {
            clearInterval(timer2Ref.current);
            timer2Ref.current = null;
        }
        // 重置状态
        setCountdown(0);
        setCountdown2(0);
        setIsCounting(false);
        setIsCounting2(false);
    };
    const getResetCode = async (type: string) => {
        // if (isCounting || isLoding || isCodeLoding) return
        // if (isCounting2|| isLoding || isCodeLoding2) return
        try {
            if (type == 'm' || type == 'email') {
                if (isCounting || isLoding || isCodeLoding) return
                setIsCodeLoding(true)

                const dataInfo = {
                    number: acount.acount,
                    deviceType: 'Web'
                }
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getResetMailCode(dataEncrypt)
                if (res.code === "0") {
                    Toast.show(t('success'))
                    startCountdown(60);
                } else if (res.code === "10044") {
                    Toast.show(res.message)
                }
                setIsCodeLoding(false)

            } else if (type == 'p' || type == 'phone') {
                if (isCounting2 || isLoding || isCodeLoding2) return
                setIsCodeLoding2(true)
                const dataInfo = {
                    number: acount.acount,
                    code: acount.areaCode?.replace("+", ""),
                    deviceType: 'Web'
                }
                const dataEncrypt = await encryptData(dataInfo)
                const res = await getResetSmsCode(dataEncrypt)
                if (res.code === "0") {
                    Toast.show(t('success'))
                    startCountdown2(60);
                } else if (res.code === "10044") {
                    Toast.show(t('codeError') || res.message)
                }
                setIsCodeLoding2(false)
            }
        } catch (error) {
            setIsCodeLoding(false)
            setIsCodeLoding2(false)
            Toast.show(String(error))
        }
    };
    const getResetCode2 = async () => {
        try {
            const params = {
                type: acount.type,
                account: acount.acount
            }
            const encrypt = await encryptData(params)
            const res = await getCheckRule(encrypt)
            const { data, code } = res
            if (code === '0') {
                if (data.message) {
                    Toast.show(t('codeError'))
                } else {
                    Toast.show(data.message)
                }
                clearTimers()
                // 根据类型启动不同的定时器
                if (acount.type == 'p' || acount.type == 'phone') {
                    // startCountdown(data.phoneTime)
                    // startCountdown2(data.emailTime)
                    startCountdown(60)
                    startCountdown2(60)
                } else if (acount.type == 'm' || acount.type == 'email') {
                    startCountdown(60)
                    startCountdown2(60)
                }
            } else {
                Toast.show(res.message)
            }
        } catch (error) {
            Toast.show(String(error))
        }
    }

    const startCountdown = (count: number) => {
        if (count === 0) return;

        // 清除之前的定时器
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setCountdown(count);
        setIsCounting(true);

        timerRef.current = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setIsCounting(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };

    const startCountdown2 = (count: number) => {
        if (count === 0) return;

        // 清除之前的定时器
        if (timer2Ref.current) {
            clearInterval(timer2Ref.current);
        }

        setCountdown2(count);
        setIsCounting2(true);

        timer2Ref.current = setInterval(() => {
            setCountdown2((prevCountdown) => {
                if (prevCountdown === 1) {
                    if (timer2Ref.current) {
                        clearInterval(timer2Ref.current);
                        timer2Ref.current = null;
                    }
                    setIsCounting2(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        if (resetState !== ResetStateEnum.SENTCODE) {
            clearTimers();
            return;
        }

        // 使用新的时间开始倒计时
        // if (acount.type === 'm' || acount.type === 'email') {
        //     startCountdown(acount?.emailTime || 0);
        //     startCountdown2(acount?.phoneTime || 0);
        // } else if (acount.type === 'p' || acount.type === 'phone') {
        //     startCountdown(acount?.phoneTime || 0);
        //     startCountdown2(acount?.emailTime || 0);
        // }
        if (acount.isEmailAuth === 1) {
            getResetCode('email')
        }
        if (acount.isPhoneAuth === 1 && (acount.isEmailAuth === 0 || acount.isGoogleAuth === 0)) {
            getResetCode('phone')
        }

        return () => {
            clearTimers();
        };
    }, [resetState, acount.type, acount.emailTime, acount.phoneTime]);

    const handleOk = (event: boolean) => {
        if (event) {
            clearTimers()
            if (acount.isEmailAuth === 1) {
                getResetCode('email')
            }
            if (acount.isPhoneAuth === 1 && (acount.isEmailAuth === 0 || acount.isGoogleAuth === 0)) {
                getResetCode('phone')
            }
        }
    }
    // useEffect(() => {
    //     // if (resetState == ResetStateEnum.SENTCODE&&!isLoding&&!isCounting) {
    //     if (resetState == ResetStateEnum.SENTCODE) {
    //         getResetCode()
    //     }
    // }, [resetState])
    // 过滤输入，只允许数字和字母
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, '');
        // setEmailCodeInputValue(filteredValue);
        // form.setFieldsValue({ code: filteredValue });
        if (type === 'code') {
            setCodeInputValue(filteredValue);
            form.setFieldsValue({ code: filteredValue });
        } else if (type === 'phoneCode') {
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ phoneCode: filteredValue });
        } else if (type === 'emailCode') {
            setEmailCodeInputValue(filteredValue);
            form.setFieldsValue({ emailCode: filteredValue });
        } else if (type === 'google') {
            setGoogleCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
        } else if (type === 'elseCode') {
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ phoneCode: filteredValue });
        }
    };
    // 当状态不为 INPUT 时不渲染组件
    if (resetState !== ResetStateEnum.SENTCODE) return null;


    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>

            <div className='mt-1'>
            <ConfigProvider
                    theme={{
                        components: {
                            Form: {
                                itemMarginBottom: 20, // 去除表单项之间的间距
                            },
                            Input: {
                                controlHeightLG: 50,
                                activeBorderColor: 'var(--theme-color)',
                                hoverBorderColor: 'var(--theme-color)',
                                activeBg: 'var(--background11)',
                                hoverBg: 'var(--background11)',
                            },
                        },
                        token: {
                            // colorBgContainerDisabled: '#fff',
                        }
                    }}
                >
                    <Form
                        name="aount"
                        form={form}
                    >
                        {/* <div className="mb-2 font-w-500 flex-col" style={{ width: "300px" }}>
                            {t('sent')}
                            <span className={`${styles.text_color} font-w-400 mt-2`}>{encryptString(acount.acount.toString()) || '-'}</span>
                        </div>
                        <Form.Item noStyle name="code" rules={[{ required: true, message: t('codeNull') }]}>
                            <Input
                                placeholder={t('inputCode')}
                                style={{ borderRadius: "8px", height: "50px" }}
                                // value={authCode}
                                allowClear
                                size='large'
                                suffix={
                                    <button type='button' className={isCounting ? `${styles.text_color}` : 'text-color'} onClick={() => getResetCode('code')}>
                                        {isCounting ? `${countdown} ${t('resendCountdown')}` : t('resend')}
                                    </button>
                                }
                                className={`${styles.mail_input} modal-input`}
                                // className='custom-input'
                                maxLength={6}
                                onChange={(e) => handleInputChange(e, 'code')}
                                value={codeInputValue}
                            />
                        </Form.Item> */}

                        {(acount.isEmailAuth == 1) && <>
                            <div className={`${styles.title_color} mb-3`}>{t('emailCodeTitle')}</div>
                            <Form.Item
                                name="emailCode"
                                rules={[{ required: true, message: t('codeNull') }]}
                                className="position-relative"
                            >
                                <Input
                                    className={`${styles.mail_input} modal-input`}
                                    style={{ width: "100%", height: "50px" }}
                                    placeholder={t('inputCode2')}
                                    allowClear
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => getResetCode('email')}
                                            className={isCounting ? `${styles.tip_color}` : `${styles.text_color}`}
                                        >
                                            {isCounting
                                                ? `${countdown} ${t('resendCountdown')}`
                                                : t('resend')
                                            }
                                        </button>
                                    }
                                    value={emailCodeInputValue}
                                    onChange={(e) => handleInputChange(e, 'emailCode')}
                                    maxLength={6}
                                />
                            </Form.Item>
                        </>}
                        {/* {(acount.type === 'p' && ((acount.isEmailAuth === 1 && acount.isGoogleAuth === 0) || (acount.openAll === 1 && acount.isEmailAuth === 1))) &&
                        <div className={`${styles.title_color} mb-3`}>{t('emailCodeTitle')}</div>} */}
                        {(acount.isPhoneAuth == 1 && (acount.isGoogleAuth == 0 || acount.isEmailAuth == 0))
                            && <>
                                <div className={`${styles.title_color} mb-3`}>{t('phoneCodeTitle')}</div>
                                <Form.Item
                                    name="phoneCode"
                                    rules={[{ required: true, message: t('codeNull') }]}
                                    className="position-relative"
                                >
                                    <Input
                                        className={`${styles.mail_input} modal-input`}
                                        style={{ width: "100%", height: "50px" }}
                                        placeholder={t('inputCode2')}
                                        allowClear
                                        value={phoneCodeInputValue}
                                        onChange={(e) => handleInputChange(e, 'phoneCode')}
                                        suffix={
                                            <button
                                                type="button"
                                                onClick={() => getResetCode('phone')}
                                                className={isCounting2 ? `${styles.tip_color}` : `${styles.text_color}`}
                                            >
                                                {isCounting2
                                                    ? `${countdown2} ${t('resendCountdown')}`
                                                    : t('resend')
                                                }
                                            </button>
                                        }
                                        maxLength={6}
                                    />
                                </Form.Item></>}
                        {(acount.isGoogleAuth == 1) && <>
                            <div className={`${styles.title_color} mb-3`}>{t('googleCodeTitle')}</div>
                            <Form.Item noStyle name="googleCode" rules={[{ required: true, message: t('codeNull') }]}>
                                <Input
                                    placeholder={t('inputCode')}
                                    style={{ borderRadius: "8px", height: "50px" }}
                                    // value={authCode}
                                    allowClear
                                    size='large'
                                    className={`${styles.mail_input} modal-input`}
                                    // className='custom-input'
                                    maxLength={6}
                                    onChange={(e) => handleInputChange(e, 'google')}
                                    value={googleCodeInputValue}
                                />
                            </Form.Item></>}

                    </Form>
                </ConfigProvider>
                <div className='flex mt-10'>
                    <button
                        className={`${styles.goBack_btn} mr-4 flex-x-cc`}
                        onClick={() => goLast()}>{t('goBack')}</button>
                    <button type='submit' className={`btn-color ${styles.next_btn} flex-1 flex-x-cc`} onClick={() => goNext()}>
                        {isLoding ? <Iconify icon="eos-icons:bubble-loading" size={20} /> : t('next')}
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        className={`text-color flex-x-cc mt-5`}
                        onClick={() => setPointout(true)}
                    >
                        {t('cantReceive')}
                    </button>
                </div>
            </div>
            <QuestionModal open={pointout} onOk={handleOk} type={acount.type} acount={acount.acount} onCancel={() => setPointout(false)} />
        </div>
    );
}

export default ResetPassword;
