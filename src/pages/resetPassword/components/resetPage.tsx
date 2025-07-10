// import { Button, Form, Input,Tabs } from "antd";
import { Input, Form ,Toast} from 'antd-mobile';
// import type { AutoCompleteProps } from 'antd';
import { useState } from "react";
import { useResetStateContext, ResetStateEnum } from "@/context/reset-providers/ResetStateProvider";
// import { toast } from "sonner";
// import store from "@/store";
import { useNavigate, useParams } from 'react-router-dom';
import styles from "../style/reset.module.scss"
import ResetSuccessModal from "@/components/LoginAboutPop/reset_successModal"
import { encryptData } from "@/utils/encrypt";
import { getResetPassword } from "@/services/resetPassword"
import { Iconify } from "@/components/icon/index";
import { useLanguage } from '@/hooks/useLanguage';
function ResetPassword() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { resetState, setResetState, acount } = useResetStateContext();
    const { t } = useLanguage('resetPassword');
    // const [authCode, setAuthCode] = useState('');
    // const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [passwordVisible, setPasswordVisible] = useState(false);
    // const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
    const [verifyPasswordVisible, setverifyPasswordVisible] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    // 密码校验状态
    const [lengthValid, setLengthValid] = useState(false);
    const [charValid, setCharValid] = useState(false)
    const [numValid, setNumValid] = useState(false);

    const [showLengthCheck, setShowLengthCheck] = useState(false);
    const [showCharCheck, setShowCharCheck] = useState(false);
    const [showNumCheck, setShowNumCheck] = useState(false);
    
    const [showRules, setShowRules]=useState(false);



    const goNext = () => {
        navigate('/login');
    }
    const goLast = () => {
        setResetState(ResetStateEnum.SENTCODE)
    }
    const handCancel = () => {
        setResetSuccess(false)
        setResetState(ResetStateEnum.INPUT)
    }
    const onSubmit = () => {
        form
            .validateFields()
            .then(async (values) => {
                try {
                    const dataInfo = {
                        type: acount.type,
                        account: acount.acount,
                        password: values.newPassword,
                        passwordConfirm: values.checkPassword,
                        platformType: 'Web'
                    }
                    const dataEncrypt = await encryptData(dataInfo)
                    const res = await getResetPassword(dataEncrypt)
                    if (res.code === '0') {
                        setResetSuccess(true)

                    } else {
                        Toast.show(res.message)
                    }

                } catch (error) {
                    Toast.show(String(error))
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }
    // 自定义密码验证规则
    const validatePassword = (_: any, value: string) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error(t('passwordNull')));
        }
        // 检查长度是否在 8 - 30 位之间
        if (value.length < 8 || value.length > 100) {
            return Promise.reject();
        }
        // 检查是否包含字母和数字
        // const hasRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,30}$/;
        const hasNumber = /.*\d+.*/
        if (!hasNumber.test(value)) {
            return Promise.reject();
        }
        const hasUpperCase = /.*[A-Z].*/
        if (!hasUpperCase.test(value)) {
            return Promise.reject();
        }

        return Promise.resolve();
    };

    // 监听密码输入变化
    const handlePasswordChange = (value:string) => {
        // const value = e.target.value;
        if(value.length > 0) {
            setShowRules(true);
        }
        if (value.length < 8 || value.length > 100) {
            setLengthValid(false);
        } else {
            setLengthValid(true);
        }
        // 检查是否包含字母和数字
        // const hasRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,30}$/;
        const hasNumber = /.*\d+.*/
        if (!hasNumber.test(value)) {
            setNumValid(false);
        } else {
            setNumValid(true);
        }
        const hasUpperCase = /.*[A-Z].*/
        if (!hasUpperCase.test(value)) {
            setCharValid(false);
        } else {
            setCharValid(true);
        }

        // 显示长度校验，隐藏字符校验
        // setShowLengthCheck(false);
        // setShowCharCheck(false);
        // setShowNumCheck(false)
    };
    const showRule = () => {
        setShowLengthCheck(true);
        setShowCharCheck(true);
        setShowNumCheck(true)
    }
    const hideRule = () => {
        setShowRules(false);

        setShowLengthCheck(false);
        setShowCharCheck(false);
        setShowNumCheck(false)
    }



    if (resetState !== ResetStateEnum.RESET) return null;

    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            {/* <div className="mb-2 font-w-500 flex-col" style={{ width: "300px" }}>新密码
            </div> */}
            <div>
                <Form
                    // style={fromStyle}
                    name="login"
                    form={form}
                    initialValues={{
                        remember: true,
                    }}
                    className={`${styles.login_form}`}
                // onFinish={handleFinish}
                // onValuesChange={usernameChange}
                >
                    <div className={`${styles.title_color} mb-5 font-16 font-w-500 mt-5`}>
                        {/* 新密码 */}
                        {t('newPassword')}
                    </div>
                    <Form.Item name="newPassword" rules={[{ validator: validatePassword }]} className={`${styles.login_form_item}`}>
                        <Input
                        type='password'
                            className={`custom-input ${styles.acount_input} ${styles.mail_input} modal-input`}
                            placeholder={t('newPasswordInput')}
                            clearable={true}
                            // visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                            onChange={handlePasswordChange}
                            maxLength={100}
                            onFocus={showRule}
                            onBlur={hideRule}
                        />
                    </Form.Item>
                    {showRules&&<div className={`mt-1`}>
                        {showLengthCheck && (
                            <div className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.tip_title : styles.tip_color}`}>
                                <Iconify
                                    icon="iconoir:check-circle-solid"
                                    size={16}
                                    className={`mr-1 ${lengthValid ? styles.tip_title : styles.tip_color}`}
                                />
                                {/* 8-100字符 */}
                                {t('passwordLength')}
                            </div>
                        )}
                        {showNumCheck && (
                            <div className={`font-12 mt-0_5 font-w-400 ${styles.ruleItem} ${numValid ? styles.tip_title : styles.tip_color}`}>
                                <Iconify
                                    icon="iconoir:check-circle-solid"
                                    size={16}
                                    className={`mr-1 ${numValid ? styles.tip_title : styles.tip_color}`}
                                />
                                {/* 至少一个大写字母 */}
                                {t('passwordNum')}
                            </div>
                        )}
                        {showCharCheck && (
                            <div className={`font-12 mt-0_5 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color}`}>
                                <Iconify
                                    icon="iconoir:check-circle-solid"
                                    size={16}
                                    className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color}`}
                                />
                                {/* 至少一个大写字母 */}
                                {t('passwordChar2')}
                            </div>
                        )}
                    </div>}

                    <div className={`${styles.title_color} mb-5 font-16 font-w-500 mt-5`}>
                        {/* 确认密码 */}
                        {t('passwordConfirm')}
                    </div>
                    <Form.Item
                    className={`${styles.login_form_item}`}
                        name="checkPassword"
                        rules={[
                            { required: true, message: t('passwordNull') },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t('passwordConfirmError')));
                                },
                            }),
                        ]}
                    >
                        <Input
                        type='password'
                            className={`custom-input ${styles.acount_input} ${styles.mail_input} modal-input`}
                            placeholder={t('passwordConfirm')}
                            clearable={true}
                            // visibilityToggle={{ visible: verifyPasswordVisible, onVisibleChange: setverifyPasswordVisible }}
                        />
                    </Form.Item>
                </Form>


                <div className='flex mt-10'>
                    <button
                        className={`${styles.goBack_btn} flex-x-cc mr-4`}
                        onClick={() => goLast()}>
                        {/* 上一步 */}
                        {t('goBack')}
                    </button>
                    <button type='submit' className={`btn-color flex-x-cc  ${styles.next_btn} flex-1`} onClick={onSubmit}>
                        {/* 确认 */}
                        {t('confirm')}
                    </button>
                </div>
            </div>
            <ResetSuccessModal open={resetSuccess} onOk={() => goNext()} onCancel={() => handCancel()} />
        </div>
    );
}

export default ResetPassword;
