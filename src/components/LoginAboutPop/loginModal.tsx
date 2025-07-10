import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles/Popup.module.scss';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Popup, Toast } from 'antd-mobile';
import { Input, Form, ConfigProvider } from 'antd';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from "react"; //type CSSProperties,
import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import {
    getLogin,
    getLoginMailCode,
    getLoginSmsCode,
    getLoginCheck,
} from "@/services/login";
import { isShowArr } from "@/utils/filterLang";
import store from '@/store';
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { encryptData } from "@/utils/encrypt";
import QuestionModal from "./questionModal";

interface acountType {
    type: string;
    email?: string;
    phone?: string;
    deviceType: string;
    password: string;
    authCodePhone?: string;
    authCodeMail?: string;
    authCodeGoogle?: string;
    countryCode?: string;
    isGoogleAuth?: number;
    isPhoneAuth?: number;
    isEmailAuth?: number;
    openAll?: number;
    emailTime?: number;
    phoneTime?: number;
}
type Props = {
    open: boolean;
    // acount?: string | null;
    acountInfo: acountType;
    // type?: string | null; //onOk, acount, type,
    onOk?: () => void;
    onCancel: () => void;
};
const LoginModal: React.FC<Props> = observer(({ open, onCancel, acountInfo, onOk }) => {
    const { t } = useLanguage("login");
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [countdown2, setCountdown2] = useState(0);
    const [isCounting2, setIsCounting2] = useState(false);
    const [pointout, setPointout] = useState(false);
    const [loading, setLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeInputValue, setCodeInputValue] = useState("");
    const [emailCodeInputValue, setEmailCodeInputValue] = useState("");
    const [phoneCodeInputValue, setPhoneCodeInputValue] = useState("");
    const [googleCodeInputValue, setGoogleCodeInputValue] = useState("");

    // 添加定时器的引用
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timer2Ref = useRef<NodeJS.Timeout | null>(null);

    // 添加 ref 来存储上一次的账户信息，用于比较
    const prevAccountRef = useRef({
        type: "",
        email: "",
        phone: "",
    });

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

    const handCancel = () => {
        clearTimers();
        onCancel();
    };
    // 获取浏览器指纹
    const getFingerprint = async () => {
        const result = await FingerprintJS.load();
        const visitorId = await result.get();
        return visitorId.visitorId;
    };
    // 过滤输入，只允许数字和字母
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: string
    ) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^0-9]/g, "");
        // setEmailCodeInputValue(filteredValue);
        // form.setFieldsValue({ code: filteredValue });
        if (type === "code") {
            setCodeInputValue(filteredValue);
            form.setFieldsValue({ code: filteredValue });
        } else if (type === "phoneCode") {
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ phoneCode: filteredValue });
        } else if (type === "emailCode") {
            setEmailCodeInputValue(filteredValue);
            form.setFieldsValue({ emailCode: filteredValue });
        } else if (type === "google") {
            setGoogleCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
        }
    };

    const handOk = async () => {
        form
            .validateFields()
            .then(async (values) => {
                // onOk()
                setLoading(true);
                try {
                    const fingerprint = await getFingerprint();
                    let dataInfo = {};
                    if (acountInfo.type === "m") {
                        dataInfo = {
                            type: acountInfo.type,
                            email: acountInfo.email,
                            deviceType: fingerprint,
                            platformType: "Web",
                            password: acountInfo.password,

                            authCodeMail: values.code || "",

                            authCodeGoogle: values.googleCode || "",
                            authCodePhone: values.phoneCode || "",
                        };
                    } else if (acountInfo.type === "p") {
                        dataInfo = {
                            type: acountInfo.type,
                            phone: acountInfo.phone,
                            deviceType: fingerprint,
                            platformType: "Web",
                            password: acountInfo.password,
                            countryCode: acountInfo.countryCode,

                            // authCodePhone: values.code,
                            // authCodeMail: values.emailCode || '',
                            // authCodeGoogle: values.googleCode || '',
                            authCodeMail: values.code || "",
                            authCodeGoogle: values.googleCode || "",
                            authCodePhone: values.phoneCode || "",
                        };
                    }
                    const dataEncrypt = await encryptData(dataInfo);
                    const res = await getLogin(dataEncrypt);
                    if (res.code === "0") {
                        Toast.show({
                            content: t("loginsuccess"),
                            icon: "success",
                        });
                        store.setUserToken(res.data.token);
                        store.updateUserInfo({ ...res.data });
                        navigate("/");
                        // 获取用户信息
                        // await getUserInfo()
                        // 更新网站配置
                        if (typeof window !== "undefined") {
                            store.getKvConfigAllFromApi();
                            store.loadCoinList();
                            store.loadGetUserInfo();
                        }
                    } else {
                        Toast.show({
                            content: res.message,
                            icon: "fail",
                        });
                    }
                    setLoading(false);
                    handCancel();
                } catch (error) {
                    setLoading(false);
                    Toast.show({
                        content: String(error),
                        icon: "fail",
                    });
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const getLoginCheckList = async () => {
        if (isCounting || isCounting2 || loading || codeLoading)
            return Toast.show({
                content: t("safeModal.codeValid"),
                icon: "fail",
            });
        setCodeLoading(true);
        const fingerprint = await getFingerprint();
        let param = {};
        if (acountInfo.type === "m") {
            param = {
                account: acountInfo.email,
                type: acountInfo.type,
                deviceType: fingerprint,
            };
        } else if (acountInfo.type === "p") {
            param = {
                account: acountInfo.phone,
                type: acountInfo.type,
                // countryCode: acountInfo.countryCode,
                deviceType: fingerprint,
            };
        }
        const dataEncrypt = await encryptData(param);
        try {
            const res = await getLoginCheck(dataEncrypt);
            if (res.code === "0") {
                if (res.data.message) {
                    Toast.show({
                        content: res.data.message,
                        icon: "fail",
                    });
                } else {
                    Toast.show({
                        content: t("success"),
                        icon: "success",
                    });
                }
                clearTimers();
                // if (acountInfo.type === 'm') {
                //     startCountdown(acountInfo?.emailTime || 0);
                //     startCountdown2(acountInfo?.phoneTime || 0);
                //     // startCountdown(60);
                //     // startCountdown2(60);
                // } else if (acountInfo.type === 'p') {
                //     startCountdown(acountInfo?.phoneTime || 0);
                //     startCountdown2(acountInfo?.emailTime || 0);
                //     // startCountdown(60);
                //     // startCountdown2(60)
                // }
                startCountdown(60);
                startCountdown2(60);
            } else if (res.code === "10044") {
                Toast.show({
                    content: t("safeModal.codeValid"),
                    icon: "fail",
                });
            } else {
                Toast.show({
                    content: res.message,
                    icon: "fail",
                });
            }
        } catch (error) {
            Toast.show({
                content: String(error),
                icon: "fail",
            });
        } finally {
            setCodeLoading(false);
        }
    };
    const getLoginCode = async () => {
        if (isCounting || loading || codeLoading) return;
        setCodeLoading(true);
        try {
            // setSentCodeFlag(false)
            if (acountInfo.type === "m") {
                const dataInfo = {
                    number: acountInfo.email || "",
                    // code: "",
                    deviceType: "H5",
                };

                const dataEncrypt = await encryptData(dataInfo);
                const res = await getLoginMailCode(dataEncrypt);
                if (res.code === "0") {
                    Toast.show({
                        content: res.message,
                        icon: "success",
                    });
                    startCountdown(60);
                } else if (res.code === "10044") {
                    Toast.show({
                        content: t("safeModal.codeValid"),
                        icon: "fail",
                    });
                } else {
                    Toast.show({
                        content: res.message,
                        icon: "fail",
                    });
                }
                setCodeLoading(false);
            } else if (acountInfo.type === "p") {
                const dataInfo = {
                    number: acountInfo.phone || "",
                    code: acountInfo.countryCode?.replace("+", ""),
                    deviceType: "H5",
                };
                const dataEncrypt = await encryptData(dataInfo);
                const res = await getLoginSmsCode(dataEncrypt);
                if (res.code === "0") {
                    Toast.show({
                        content: res.message,
                        icon: "success",
                    });
                    startCountdown(60);
                } else if (res.code === "10044") {
                    Toast.show({
                        content: t("safeModal.codeValid"),
                        icon: "fail",
                    });
                } else {
                    Toast.show({
                        content: res.message,
                        icon: "fail",
                    });
                }
                setCodeLoading(false);
            }
        } catch (error) {
            setCodeLoading(false);
            Toast.show({
                content: String(error),
                icon: "fail",
            });
            console.error(t("safeModal.getLoginCodeError"), error);
        }
    };
    const getLoginCode2 = async () => {
        getLoginCheckList();
    };
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
    const handleOk = (event: boolean) => {
        if (event) {
            // if ((acountInfo.openAll === 1 && acountInfo.isGoogleAuth === 1 && (acountInfo.isEmailAuth === 0 && acountInfo.isPhoneAuth === 0)) ||
            //     (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 1)) {
            //     return
            // } else {
            //     getLoginCode2()
            // }
            if (isShowList()?.length === 1 && isShowList()?.includes("google")) {
                return;
            } else {
                getLoginCode2();
            }
        }
    };
    const isShowList = () => {
        // let showList = []
        // if (acountInfo.openAll === 1) {
        //     // 新设备/IP登录，验证全部绑定的验证方式
        //     if (acountInfo.isGoogleAuth === 1) {
        //         showList.push('google')
        //     }
        //     if (acountInfo.isEmailAuth === 1) {
        //         showList.push('email')
        //     }
        //     if (acountInfo.isPhoneAuth === 1) {
        //         showList.push('phone')
        //     }
        // } else if (acountInfo.openAll === 0) {
        //     // 非新设备/IP登录，只验证一个，优先级：谷歌 > 邮箱 > 手机号
        //     if (acountInfo.isGoogleAuth === 1) {
        //         showList.push('google')
        //     } else if (acountInfo.isEmailAuth === 1) {
        //         showList.push('email')
        //     } else if (acountInfo.isPhoneAuth === 1) {
        //         showList.push('phone')
        //     }
        // }
        // return showList
        return isShowArr(
            acountInfo.isGoogleAuth || 0,
            acountInfo.isEmailAuth || 0,
            acountInfo.isPhoneAuth || 0,
            "login",
            acountInfo.openAll || 0
        );
    };

    useEffect(() => {
        if (!open) {
            clearTimers();
            return;
        }

        // 使用新的时间开始倒计时
        // if (acountInfo.type === 'm') {
        //     startCountdown(acountInfo?.emailTime || 0);
        //     startCountdown2(acountInfo?.phoneTime || 0);
        // } else if (acountInfo.type === 'p') {
        //     startCountdown(acountInfo?.phoneTime || 0);
        //     startCountdown2(acountInfo?.emailTime || 0);
        // }
        startCountdown(60);
        startCountdown2(60);
        return () => {
            clearTimers();
        };
    }, [open, acountInfo.type, acountInfo.emailTime, acountInfo.phoneTime]);


    return (<>
        <Popup
            visible={open}
            onClose={onCancel}
            // destroyOnClose
            closeOnMaskClick
            position='bottom'
            bodyStyle={{ minHeight: '50vh', paddingBottom: '5%' }}
            bodyClassName={styles.userCenterPopContainer}
            className={`${styles.login_form}`}
        >
            <div >
                <ConfigProvider
                    theme={{
                        components: {
                            Form: {
                                // itemMarginBottom: 0, // 去除表单项之间的间距
                            },
                            Input: {
                                activeBorderColor: "var(--theme-color)",
                                hoverBorderColor: "var(--theme-color)",
                                controlHeightLG: 50,
                                activeBg: "var(--background5)",
                                hoverBg: "var(--background5)",
                            },
                        }
                    }}
                >
                    <Form form={form} style={{ margin: "10px 0" }} colon={false}>
                        {/* {((acountInfo.openAll === 1 && acountInfo.isEmailAuth === 1) ||
                        (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 0 && acountInfo.isEmailAuth === 1)) */}
                        {isShowList()?.includes("email") && (
                            <>
                                <div className={`${styles.title_color} mb-3`}>
                                    {t("safeModal.emailCodeTitle")}
                                </div>
                                <Form.Item
                                    name="code"
                                    rules={[{ required: true, message: t("safeModal.codeNull") }]}
                                    className="position-relative"
                                >
                                    <Input
                                        type='number'
                                        autoComplete="off"
                                        styles={{ input: { color: "var(--text-color5)" } }}
                                        className={`${styles.input_box} modal-input`}
                                        style={{ width: "100%", height: "40px" }}
                                        placeholder={t("safeModal.inputPlaceholder")}
                                        value={codeInputValue}
                                        onChange={(e) => handleInputChange(e, "code")}
                                        allowClear
                                        suffix={
                                            <button
                                                type="button"
                                                onClick={getLoginCode2}
                                                className={
                                                    isCounting
                                                        ? `${styles.tip_color}`
                                                        : `${styles.text_color}`
                                                }
                                            >
                                                {/* 重新发送/60s 重发 */}
                                                {isCounting
                                                    ? `${countdown} ${t("safeModal.resendCountdown")}`
                                                    : t("safeModal.resend")}
                                            </button>
                                        }
                                        maxLength={6}
                                    />
                                </Form.Item>
                            </>
                        )}
                        {/* {((acountInfo.openAll === 1 && acountInfo.isPhoneAuth === 1) ||
                        (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 0 && acountInfo.isEmailAuth === 0 && acountInfo.isPhoneAuth === 1)) */}
                        {isShowList()?.includes("phone") && (
                            <>
                                <div className={`${styles.title_color} mb-3`}>
                                    {t("safeModal.phoneCodeTitle")}
                                </div>
                                <Form.Item
                                    name="phoneCode"
                                    rules={[{ required: true, message: t("safeModal.codeNull") }]}
                                    className="position-relative"
                                >
                                    <Input
                                        type='number'
                                        autoComplete="off"
                                        styles={{ input: { color: "var(--text-color5)" } }}
                                        className={`${styles.input_box} modal-input`}
                                        style={{ width: "100%", height: "40px" }}
                                        placeholder={t("safeModal.inputPlaceholder")}
                                        allowClear
                                        value={phoneCodeInputValue}
                                        onChange={(e) => handleInputChange(e, "phoneCode")}
                                        suffix={
                                            <button
                                                type="button"
                                                onClick={getLoginCode2}
                                                className={
                                                    isCounting2
                                                        ? `${styles.tip_color}`
                                                        : `${styles.text_color}`
                                                }
                                            >
                                                {/* 重新发送/60s 重发 */}
                                                {isCounting2
                                                    ? `${countdown2} ${t("safeModal.resendCountdown")}`
                                                    : t("safeModal.resend")}
                                            </button>
                                        }
                                        maxLength={6}
                                    />
                                </Form.Item>
                            </>
                        )}

                        {/* {((acountInfo.openAll === 1 && acountInfo.isGoogleAuth === 1) || (acountInfo.openAll === 0 && acountInfo.isGoogleAuth === 1)) */}
                        {isShowList()?.includes("google") && (
                            <>
                                <div className={`${styles.title_color} mb-3`}>
                                    {t("safeModal.googleCodeTitle")}
                                </div>
                                <Form.Item
                                    name="googleCode"
                                    rules={[{ required: true, message: t("safeModal.codeNull") }]}
                                    className="position-relative"
                                >
                                    <Input
                                        type='number'
                                        autoComplete="off"
                                        styles={{ input: { color: "var(--text-color5)" } }}
                                        className={`${styles.input_box} modal-input`}
                                        style={{ width: "100%", height: "40px" }}
                                        placeholder={t("safeModal.inputPlaceholder")}
                                        allowClear
                                        maxLength={6}
                                        value={googleCodeInputValue}
                                        onChange={(e) => handleInputChange(e, "google")}
                                    />
                                </Form.Item>
                            </>
                        )}
                        {/* {(acountInfo.type === 'p' &&acountInfo.openAll === 1 && acountInfo.isEmailAuth === 1) 
                    && <>
                        <div className={`${styles.title_color} mb-3`}>{t('safeModal.emailCodeTitle')}</div>
                        <Form.Item
                            name="emailCode"
                            rules={[{ required: true, message: t('safeModal.codeNull') }]}
                            className="position-relative"
                        >
                            <Input
                                className={`${styles.input_box} modal-input`}
                                style={{ width: "100%", height: "40px" }}
                                placeholder={t('safeModal.inputPlaceholder')}
                                allowClear
                                suffix={
                                    <button
                                        type="button"
                                        onClick={getLoginCode2}
                                        className={isCounting2 ? `${styles.tip_color}` : `${styles.text_color}`}
                                    >
                                        {isCounting2
                                            ? `${countdown2} ${t('safeModal.resendCountdown')}`
                                            : t('safeModal.resend')
                                        }
                                    </button>
                                }
                                value={emailCodeInputValue}
                                onChange={(e) => handleInputChange(e, 'emailCode')}
                                maxLength={6}
                            />
                        </Form.Item>
                    </>} */}
                    </Form>
                </ConfigProvider>
                <div className="flex-col flex-ai-start mt-10 mb-3">
                    {!loading ? (
                        <button
                            type="submit"
                            className={`${styles.modal_btn} btn-color`}
                            onClick={handOk}
                        >
                            {/* 确认 */}
                            {t("safeModal.confirm")}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.modal_btn} btn-disable login-loading`}
                        >
                            {/* 确认 */}
                            {t("safeModal.confirm")}
                        </button>
                    )}
                    {!(isShowList()?.length === 1 && isShowList()?.includes("google")) && (
                        <button
                            type="button"
                            className={`text_color mt-5`}
                            onClick={() => setPointout(true)}
                        >
                            {/* 收不到验证码？ */}
                            {t("safeModal.cantReceive")}
                        </button>
                    )}
                </div>
                <QuestionModal
                    open={pointout}
                    onOk={handleOk}
                    onCancel={() => setPointout(false)}
                    acount={acountInfo.email || null}
                    acount2={acountInfo.phone || null}
                    type={acountInfo.type}
                />
            </div>
        </Popup>
    </>
    )
})

export default LoginModal;