import { type CSSProperties, useState, useEffect } from "react";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "@/context/register-providers/LoginStateProvider";
import store from "@/store";
import { emailSuffixes } from "@/utils/enum";
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login.module.scss'
import { useLanguage } from '@/hooks/useLanguage';
import { encryptData } from "@/utils/encrypt";
import { Toast, Form, Input, Checkbox } from 'antd-mobile'
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import EmailAuto from "@/components/EmailAuto";
import { Iconify } from "@/components/icon";

const fromStyle: CSSProperties = {
    borderRadius: "5px",
    width: "100%",
    minWidth: "350px",
};

export default function RegisterMail() {
    const navigate = useNavigate();
    const { t } = useLanguage('login');
    const [preCheck, setpreCheck] = useState(false); //是否需要二次验证
    const [isOpen, setIsOpen] = useState(true); //是否展开
    const { setLoginState } = useLoginStateContext();
    // const { registerType, setRegisterType } = useRegisterTypeContext();
    const { registerType } = useRegisterTypeContext();
    // const signIn = useSignIn();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 密码校验状态
    const [lengthValid, setLengthValid] = useState(false);
    const [charValid, setCharValid] = useState(false)
    const [numValid, setNumValid] = useState(false);

    const [showLengthCheck, setShowLengthCheck] = useState(false);
    const [showCharCheck, setShowCharCheck] = useState(false);
    const [showNumCheck, setShowNumCheck] = useState(false);
    
    const [showRules, setShowRules] = useState(false);

    // 获取浏览器指纹
    const getFingerprint = async () => {
        const result = await FingerprintJS.load();
        const visitorId = await result.get();
        return visitorId.visitorId;
    };

    useEffect(() => {
        // 获取 URL 参数中的邀请码
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get('inviteCode');
        // 如果 URL 中有 inviteCode，设置到表单的 referee 字段
        if (inviteCode) {
            form.setFieldValue('referee', inviteCode);
        }
    }, [form]);

    // 当注册状态不为 EMAIL 时不渲染组件
    const handleFinish = async () => {
        form
            .validateFields(['email', 'password','agree'])
            .then(async (values: any) => {
                // form.resetFields(); // 重置表单
                // if (loading) return;
                // console.log(values, 111);
                // "请先同意用户协议和隐私政策"
                if (!values.agree) return Toast.show(t('registerForm.agreeErr'))
                const data = {
                    type: "m",
                    email: values.email,
                    password: values.password,
                    parentInviteCode: isOpen ? values.referee : "",
                }
                store.updateRegisterInfo(data)

                goAuthCode();

            })
            .catch((info: any) => {
                console.log("Validate Failed:", info);
            });
        // form.resetFields(); //重置表单
        // setLoading(true);

    }
    // 跳转规则
    const goAuthCode = () => {
        store.setAuthcodeState(LoginStateEnum.REGISTER, RegisterTypeEnum.EMAIL); //存储跳转前状态
        setLoginState(LoginStateEnum.Authcode) //设置跳转状态
    }

    const usernameChange = (changedValues: any) => {
        Object.keys(changedValues).forEach((key) => {
            if (key === "username" && preCheck) {
                setpreCheck(false);
            }
        });

    }

    const goLogin = () => {
        // setLoginState(LoginStateEnum.LOGIN)
        navigate("/login")
    }

    // 自定义密码验证规则
    const validatePassword = (_: any, value: string) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        
        // if (!value) {
        //     return Promise.reject(new Error(t('registerForm.passwordNull')));
        // }
        // 检查长度是否在 8 - 100 位之间
        if (value.length < 8 || value.length > 100) {
            return Promise.reject(new Error(t('registerForm.passwordPlaceholder')));
        }
        // 检查是否包含数字
        const hasNumber = /.*\d+.*/
        if (!hasNumber.test(value)) {
            return Promise.reject(new Error(t('registerForm.passwordnum')));
        }
        // 检查是否包含大写字母
        const hasUpperCase = /.*[A-Z].*/
        if (!hasUpperCase.test(value)) {
            return Promise.reject(new Error(t('registerForm.passwordletter')));
        }

        return Promise.resolve();
    };

    // 监听密码输入变化
    const handlePasswordChange = (value: string) => {
        if (value.length > 0) {
            setShowRules(true);
        }
        
        // 检查长度是否在 8 - 100 位之间
        if (value.length < 8 || value.length > 100) {
            setLengthValid(false);
        } else {
            setLengthValid(true);
        }
        
        // 检查是否包含数字
        const hasNumber = /.*\d+.*/
        if (!hasNumber.test(value)) {
            setNumValid(false);
        } else {
            setNumValid(true);
        }
        
        // 检查是否包含大写字母
        const hasUpperCase = /.*[A-Z].*/
        if (!hasUpperCase.test(value)) {
            setCharValid(false);
        } else {
            setCharValid(true);
        }
    };
    
    const showRule = () => {
        setShowLengthCheck(true);
        setShowCharCheck(true);
        setShowNumCheck(true);
    }
    
    const hideRule = () => {
        setShowRules(false);
        setShowLengthCheck(false);
        setShowCharCheck(false);
        setShowNumCheck(false);
    }

    if (registerType !== RegisterTypeEnum.EMAIL) return null;
    return (
        <div className="flex-y-cc mt-7" >

            <Form
                name="register"
                form={form}
                initialValues={{
                    remember: true,
                }}
                // onFinish={handleFinish}
                onValuesChange={usernameChange}
                className={`${styles.login_form}`}
            >
                <div className={`${styles.title_color} mb-1 font-16 font-w-500`}>
                    {/* 邮箱 */}
                    {t('registerForm.emailTitle')}
                </div>

                <Form.Item name="email" rules={[
                    { required: true, message: t('emailNull') },
                    { type: "email", message: t('emailErr') }
                ]}
                    className={`${styles.login_form_item}`}
                >
                    <EmailAuto placeholder={t('registerForm.emailPlaceholder')} showHistory={false} />
                </Form.Item>

                <div className={`${styles.title_color} mb-1 font-16 font-w-500`}>
                    {/* 密码 */}
                    {t('registerForm.passwordTitle')}
                </div>
                <Form.Item name="password" 
                    rules={[
                        { required: true, message: t('registerForm.passwordNull') },
                        { validator: validatePassword }
                    ]}
                    className={`${styles.login_form_item}`}>
                    <Input
                        type="password"
                        clearable={true}
                        placeholder={t('registerForm.passwordPlaceholder')}
                        maxLength={100}
                        className={`${styles.mail_input}`}
                        onChange={handlePasswordChange}
                        onFocus={showRule}
                        onBlur={hideRule}
                    />
                </Form.Item>

                {showRules && <div className={`mt-1 mb-4`}>
                    {showLengthCheck && (
                        <div className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.tip_title : styles.tip_color}`}>
                            <Iconify
                                icon="iconoir:check-circle-solid"
                                size={16}
                                className={`mr-1 ${lengthValid ? styles.tip_title : styles.tip_color}`}
                            />
                            {/* 8-100个字符 */}
                            {t('registerForm.passwordRule1')}
                        </div>
                    )}
                    {showNumCheck && (
                        <div className={`font-12 mt0_5 font-w-400 ${styles.ruleItem} ${numValid ? styles.tip_title : styles.tip_color}`}>
                            <Iconify
                                icon="iconoir:check-circle-solid"
                                size={16}
                                className={`mr-1 ${numValid ? styles.tip_title : styles.tip_color}`}
                            />
                            {/* 至少包含一个数字 */}
                            {t('registerForm.passwordnum')}
                        </div>
                    )}
                    {showCharCheck && (
                        <div className={`font-12 mt0_5 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color}`}>
                            <Iconify
                                icon="iconoir:check-circle-solid"
                                size={16}
                                className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color}`}
                            />
                            {/* 至少包含一个大写字母 */}
                            {t('registerForm.passwordletter')}
                        </div>
                    )}
                </div>}

                <div
                    className={`${styles.title_color} mb-1 font-16 font-w-500 flex-x algin-center cursor-pointer`}
                >
                    {/* 推荐人的邀请码(选填) */}
                    {t('registerForm.refereeTitle')}
                    <Iconify
                        icon={isOpen ? "cuida:caret-up-outline" : "cuida:caret-down-outline"}
                        className={`${styles.tip_icon} ml-1`}
                        size={20}
                        onClick={() => { setIsOpen(!isOpen) }}
                    />
                </div>
                {isOpen && (
                    <Form.Item name="referee" className={`${styles.login_form_item}`}>
                        <Input
                            type="text"
                            placeholder={t('registerForm.refereePlaceholder')}
                            clearable={true}
                            className={`${styles.mail_input}`}
                            maxLength={8}
                        />
                    </Form.Item>
                )}

                <Form.Item name="agree" valuePropName="checked" className={`${styles.login_form_item}`}>
                    <Checkbox className={`${styles.custom_checkbox} text-color-default`}>
                        <p className={`${styles.title_color} font-16`}>
                            {/* 我已阅读并同意 */}
                            {t('agree')} <span className="theme-color">{t('protocol')}</span> {t('and')} <span className="theme-color">{t('policy')}</span>
                        </p>
                    </Checkbox>
                </Form.Item>
            </Form>

            <button type="submit" className={`${styles.login_button} flex-x-cc w-full button-color mt-5`}
                onClick={handleFinish}>
                {/* 注册 */}
                {t('registerForm.registerButton')}
            </button> 

            <div className="flex-cc mt-4">
                <p>
                    {/* 已有账号？ */}
                    {t('registerForm.hasAccount')}
                    <button
                        type="button"
                        className="theme_color"
                        onClick={goLogin}
                    >
                        {/* 登录 */}
                        {t('login')}
                    </button>
                </p>
            </div>
        </div>
    );
}


 