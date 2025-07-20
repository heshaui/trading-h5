import { Form, Input, Button } from "antd";
import { Toast, Popup } from 'antd-mobile';

import styles from "../styles/withdrawmoney.module.scss";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { useState } from "react";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import {
    getWithdrawalCheckSmsCode,
    getWithdrawalCheckEmailCode,
    checkWithdrawDeposit,
} from "@/services/assets";
import { getFingerprint } from "@/hooks/user-fingerprint";
import { useLanguage } from '@/hooks/useLanguage';
import QuestionModal from "@/components/LoginAboutPop/questionModal";

interface acountType {
    countryCode?: string;
    email?: string;
    phone?: string;
    googleCode?: string;
    type?: string;
}
interface returnInfoType {
    emailCode?: string;
    phoneCode?: string;
    googleCode?: string;
    countryCode?: string;
    email?: string;
    phone?: string;
}
interface SafeDataType {
    userId?: number;
    registerAccount?: string;
    account?: string;
    status?: number;
    email?: string;
    phone?: string;
    inviteCode?: string;
    parentUserId?: number;
    isGoogleAuth?: number;
    isPhoneAuth?: number;
    isEmailAuth?: number;
    realnessStatus?: number;
    addressStatus?: number;
    countryCode?: string;
    userLevel?: string;
    createTime?: number;
    updateTime?: number;
    tenantId?: string;
    transactionStatus?: number;
    withdrawalStatus?: number;
    famousAphorisms?: string;
    securityIntensity?: number;
    googleCode?: string;
}
type Props = {
    open: boolean;
    onOk: (event: returnInfoType) => void;
    onCancel: () => void;
    type?: string;
    acountInfo: SafeDataType;
};

function WithdrawSafe({ open, onCancel, type, onOk, acountInfo }: Props) {
    const { t } = useLanguage('assets');
    const [isCounting, setIsCounting] = useState(false);
    const [isCounting2, setIsCounting2] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [countdown2, setCountdown2] = useState(60);
    const [firstCheck, setFirstCheck] = useState(true);
    const [firstCheck2, setFirstCheck2] = useState(true);
    const [loading, setLoading] = useState(false); // 按钮loading
    const [codeLoading, setCodeLoading] = useState(false); // 验证码loading
    const [codeLoading2, setCodeLoading2] = useState(false); // 验证码loading
    const [pointout, setPointout] = useState(false);
    const [emailCodeInputValue, setEmailCodeInputValue] = useState("");
    const [phoneCodeInputValue, setPhoneCodeInputValue] = useState("");
    const [googleCodeInputValue, setGoogleCodeInputValue] = useState("");
    const [errOpen, setErrOpen] = useState(false);

    const [form] = Form.useForm();

    const handCancel = () => {
        form.resetFields();
        setFirstCheck(true);
        setFirstCheck2(true);
        onCancel();
    };

    const handOk = async () => {
        form.validateFields().then(async (values) => {
            const dataInfo = {
                emailCode: values.emailCode || "",
                phoneCode: values.phoneCode || "",
                googleCode: values.googleCode || "",
            };

            // onOk(dataInfo)
            // handCancel()
            checkMoneySafe(dataInfo);
        });
    };

    const checkMoneySafe = async (dataInfo: acountType) => {
        setLoading(true);
        try {
            const dataEncrypt = await encryptData(dataInfo);
            const res = await checkWithdrawDeposit(dataEncrypt);
            if (res.code === "0") {
                Toast.show({
                    content: res.message,
                    icon: 'success'
                });
                onOk(dataInfo);
                handCancel();
            } else {
                Toast.show({
                    content: res.message,
                    icon: 'fail'
                });
            }
        } catch (error) {
            // setErrOpen(true)
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
        } finally {
            setLoading(false);
        }
    };

    const getLockPhoneCode = async () => {
        if (isCounting2 || loading || codeLoading2) return;
        setCodeLoading2(true);
        const fingerprint = await getFingerprint();
        try {
            const dataInfo = {
                number: acountInfo?.phone,
                code: acountInfo?.countryCode?.replace("+", ""),
                deviceType: fingerprint,
            };
            const dataEncrypt = await encryptData(dataInfo);
            const res = await getWithdrawalCheckSmsCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck2(false);
                Toast.show({
                    content: res.message,
                    icon: 'success'
                });
                startCountdown2(60);
            } else if (res.code === "10044") {
                Toast.show({
                    content: t("modal.codeValid"),
                    icon: 'fail'
                }); //验证码还在有效期内
            } else {
                Toast.show({
                    content: res.message,
                    icon: 'fail'
                });
            }
            setCodeLoading2(false);
        } catch (error) {
            setCodeLoading2(false);
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
            console.error("获取验证码出错:", error);
        }
    };
    const getLockEmailCode = async () => {
        if (isCounting || loading || codeLoading) return;
        setCodeLoading(true);
        const fingerprint = await getFingerprint();
        try {
            const dataInfo = {
                number: acountInfo?.email,
                deviceType: fingerprint,
            };

            const dataEncrypt = await encryptData(dataInfo);
            // console.log(dataEncrypt, 111);

            const res = await getWithdrawalCheckEmailCode(dataEncrypt);
            if (res.code === "0") {
                setFirstCheck(false);
                Toast.show({
                    content: res.message,
                    icon: 'success'
                });
                startCountdown(60);
            } else if (res.code === "10044") {
                Toast.show({
                    content: t("modal.codeValid"),
                    icon: 'fail'
                }); //验证码还在有效期内
            } else {
                Toast.show({
                    content: res.message,
                    icon: 'fail'
                });
            }
            setCodeLoading(false);
        } catch (error) {
            setCodeLoading(false);
            Toast.show({
                content: String(error),
                icon: 'fail'
            });
            console.error("获取验证码出错:", error);
        }
    };
    const startCountdown = (count: number) => {
        setCountdown(count);
        setIsCounting(true);
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(timer);
                    setIsCounting(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
        // 清理定时器
        return () => clearInterval(timer);
    };
    const startCountdown2 = (count: number) => {
        setCountdown2(count);
        setIsCounting2(true);
        const timer = setInterval(() => {
            setCountdown2((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(timer);
                    setIsCounting2(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
        // 清理定时器
        return () => clearInterval(timer);
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
        // form.setFieldsValue({ emailCode: filteredValue });
        if (type === "email") {
            setEmailCodeInputValue(filteredValue);
            form.setFieldsValue({ emailCode: filteredValue });
        } else if (type === "phone") {
            setPhoneCodeInputValue(filteredValue);
            form.setFieldsValue({ phoneCode: filteredValue });
        } else if (type === "google") {
            setGoogleCodeInputValue(filteredValue);
            form.setFieldsValue({ googleCode: filteredValue });
        }
    };

    const handlePaste = async () => {
        try {
            // 获取剪贴板中的文本内容
            const clipboardText = await navigator.clipboard.readText();
            // 将剪贴板内容设置到表单的 googleCode 字段中
            form.setFieldsValue({
                googleCode: clipboardText,
            });
        } catch (error) {
            console.error("Failed to read clipboard:", error);
        }
    };
    const handQuestionOk = async () => {
        // 判断需要请求的验证码类型
        if (acountInfo.isGoogleAuth === 1) {
            // Google验证开启时
            if (acountInfo.email) {
                // 有邮箱时优先使用邮箱验证
                await getLockEmailCode();
            } else if (acountInfo.phone) {
                // 没有邮箱但有手机号时使用手机验证
                await getLockPhoneCode();
            }
        } else {
            // Google验证未开启时，同时请求邮箱和手机验证码
            if (acountInfo.email) {
                getLockEmailCode();
            }
            if (acountInfo.phone) {
                getLockPhoneCode();
            }
        }
        setPointout(false);
    };

    return (
        <Popup
            visible={open}
            onMaskClick={handCancel}
            onClose={handCancel}
            position="bottom"
            // bodyStyle={{
            //     borderTopLeftRadius: '16px',
            //     borderTopRightRadius: '16px',
            //     minHeight: '60vh',
            //     backgroundColor: 'var(--background5)',
            // }}
            bodyClassName={styles.popContainer}
        >
            <div className={`${styles.title_color} flex-y justify-between h-full pb-5`}>
                {/* 标题栏 */}
                <div className={`${styles.pop_header} flex-x algin-center justify-between`}>
                    <span className={`${styles.title_color} flex-1`}>{t("modal.safeVerification")}</span>
                    <button onClick={() => {
                        handCancel?.();
                    }}
                        className={styles.title_color}
                    >
                        <Iconify icon="eva:close-fill" size={20} className={styles.tip_color} />
                    </button>
                </div>
                {/* 内容区域 */}
                <div className={`flex-col flex-ai-center font-14 font-w-400 ${styles.pop_content} flex-1 px-4 mt-4 pb-4 w-full`}>
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: "100%" }}
                    >
                        {acountInfo.email && (
                            <>
                                <div
                                    className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}
                                >
                                    {/* 邮箱验证 */}
                                    {t("modal.emailCheck")}
                                </div>
                                <p
                                    className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}
                                >
                                    {firstCheck ? t("modal.sent2") : t("modal.resend2")}
                                    <span>&nbsp;{encryptEmail(acountInfo.email)}</span>
                                </p>
                                <Form.Item
                                    name="emailCode"
                                    rules={[{ required: true, message: t("modal.codeError2") }]}
                                >
                                    <Input
                                        autoComplete="off"
                                        styles={{ input: { color: "var(--text-color5)" } }}
                                        allowClear
                                        placeholder={t("modal.inputCode")}
                                        // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        suffix={
                                            <button
                                                type="button"
                                                className={
                                                    isCounting
                                                        ? `${styles.tip_color1_input}`
                                                        : `${styles.text_color}`
                                                }
                                                onClick={getLockEmailCode}
                                            >
                                                {isCounting ? (
                                                    `${countdown}${t("modal.countdown")}`
                                                ) : firstCheck ? (
                                                    <span className={`${styles.default_color}`}>
                                                        {t("modal.sent")}
                                                    </span>
                                                ) : (
                                                    t("modal.resend")
                                                )}
                                            </button>
                                        }
                                        className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                        style={{ borderRadius: "8px" }}
                                        maxLength={6}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleInputChange(e, "email")
                                        }
                                        value={emailCodeInputValue}
                                    />
                                </Form.Item>
                            </>
                        )}
                        {acountInfo.phone &&
                            (acountInfo.isGoogleAuth === 0 ||
                                !acountInfo.email ||
                                !acountInfo.googleCode) && (
                                <>
                                    <div
                                        className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}
                                    >
                                        {t("modal.phone")}
                                    </div>
                                    <p
                                        className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}
                                    >
                                        {firstCheck2 ? t("modal.sent2") : t("modal.resend2")}
                                        <span>&nbsp;{encryptPhoneNumber(acountInfo.phone)}</span>
                                    </p>
                                    <Form.Item
                                        name="phoneCode"
                                        rules={[{ required: true, message: t("modal.codeError2") }]}
                                    >
                                        <Input
                                            autoComplete="off"
                                            styles={{ input: { color: "var(--text-color5)" } }}
                                            allowClear
                                            placeholder={t("modal.inputPhoneCode")}
                                            // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            suffix={
                                                <button
                                                    type="button"
                                                    className={
                                                        isCounting2
                                                            ? `${styles.tip_color1_input}`
                                                            : `${styles.text_color}`
                                                    }
                                                    onClick={getLockPhoneCode}
                                                >
                                                    {isCounting2 ? (
                                                        `${countdown2}${t("modal.countdown")}`
                                                    ) : firstCheck2 ? (
                                                        <span className={`${styles.default_color}`}>
                                                            {t("modal.sent")}
                                                        </span>
                                                    ) : (
                                                        t("modal.resend")
                                                    )}
                                                </button>
                                            }
                                            className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                                            style={{ borderRadius: "8px" }}
                                            maxLength={6}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange(e, "phone")
                                            }
                                            value={phoneCodeInputValue}
                                        />
                                    </Form.Item>
                                </>
                            )}
                        {(acountInfo.isGoogleAuth === 1 || acountInfo.googleCode) && (
                            <>
                                <div
                                    className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}
                                >
                                    {t("modal.google")}
                                </div>
                                <Form.Item
                                    name="googleCode"
                                    rules={[{ required: true, message: t("modal.codeError2") }]}
                                >
                                    <Input
                                        autoComplete="off"
                                        styles={{ input: { color: "var(--text-color5)" } }}
                                        placeholder={t("modal.inputGoogleCode")}
                                        allowClear
                                        className={`${styles.input_box} modal-input`}
                                        suffix={
                                            <button
                                                type="button"
                                                className={`${styles.default_color}`}
                                                onClick={handlePaste}
                                            >
                                                {t("modal.paste")}
                                            </button>
                                        }
                                        maxLength={6}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleInputChange(e, "google")
                                        }
                                        value={googleCodeInputValue}
                                    />
                                </Form.Item>
                            </>
                        )}
                    </Form>
                    {/* 确认按钮 */}
                    <div className="flex-col flex-ai-start mt-8 mb-3 w-full">
                        <button
                            type="submit"
                            className={`${styles.modal_footerBtn} default_btn flex-x-cc`}
                            onClick={handOk}
                        >
                            {loading ? (
                                <Iconify icon="tabler:loader" size={24} className={`loading`} />
                            ) : (
                                t("modal.confirm2")
                            )}
                        </button>
                        <button
                            type="button"
                            className={`text-color mt-5`}
                            onClick={() => setPointout(true)}
                        >
                            {/* 收不到验证码？ */}
                            {t("modal.codeError")}
                        </button>
                    </div>
                </div>
                <QuestionModal
                    open={pointout}
                    onOk={handQuestionOk}
                    type={"safe"}
                    acount={acountInfo.phone || ""}
                    acount2={acountInfo.email || ""}
                    onCancel={() => setPointout(false)}
                />

            </div>
        </Popup>
    );
}

export default WithdrawSafe;
