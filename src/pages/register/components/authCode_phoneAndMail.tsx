/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  LoginTypeEnum,
  useLoginTypeContext,
  RegisterTypeEnum,
  useRegisterTypeContext,
  LoginStateEnum,
  useLoginStateContext,
} from "@/context/register-providers/LoginStateProvider";
import store from "@/store";
import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import {
  getRegister,
  getRegisterMailCode,
  getRegisterSmsCode,
} from "@/services/login";
import { encryptData } from "@/utils/encrypt";
import { useNavigate } from "react-router-dom";
import styles from "../styles/authCode.module.scss";
import { useLanguage } from '@/hooks/useLanguage';
import { Toast, Form, Input } from 'antd-mobile';
import QuestionModal from "@/components/PopUp/questionModal";
import RepeatModal from "@/components/PopUp/register_repeatModal";

function AuthCode() {
  const { t } = useLanguage("login");
  const navigate = useNavigate();
  const [pointout, setPointout] = useState(false);

  const { setLoginType } = useLoginTypeContext();
  const { setRegisterType } = useRegisterTypeContext();
  const { loginState, setLoginState } = useLoginStateContext();
  const [countdown, setCountdown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [sentCodeFlag, setSentCodeFlag] = useState(false);
  const [repeatModalOPen, setRepeatModalOPen] = useState(false); //重复账号弹窗
  const [loading, setLoading] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState("");
  const [requestMsg, setRequestMsg] = useState(
    t("authCodeForm.registerSuccess")
  ); //'success'
  const [toastType, setToastType] = useState("success");
  const registerInfo = store.registerInfo;

  const [form] = Form.useForm();

  const goBackPage = () => {
    const authcodeState = store.authcodeState;
    if (authcodeState.state === LoginStateEnum.LOGIN) {
      setLoginState(authcodeState.state);
      if (
        authcodeState.type === LoginTypeEnum.EMAIL ||
        authcodeState.type === LoginTypeEnum.PHONE
      ) {
        setLoginType(authcodeState.type);
      }
    } else if (authcodeState.state === LoginStateEnum.REGISTER) {
      setLoginState(authcodeState.state);
      if (
        authcodeState.type === RegisterTypeEnum.EMAIL ||
        authcodeState.type === RegisterTypeEnum.PHONE
      ) {
        setRegisterType(authcodeState.type);
      }
    }
  };

  const onSubmit = () => {
    form
      .validateFields()
      .then(async (values: any) => {
        // form.resetFields(); // 重置表单
        // console.log(values, 111);
        setLoading(true);
        try {
          let dataInfo = {};
          if (registerInfo.type === "m") {
            dataInfo = {
              type: registerInfo.type,
              email: registerInfo.email,
              password: registerInfo.password,
              parentInviteCode: registerInfo.parentInviteCode || "",
              code: values.code,
            };
          } else if (registerInfo.type === "p") {
            dataInfo = {
              type: registerInfo.type,
              phone: registerInfo.phone,
              password: registerInfo.password,
              parentInviteCode: registerInfo.parentInviteCode || "",
              countryCode: registerInfo.countryCode?.replace("+", ""),
              code: values.code,
            };
          }
          const dataEncrypt = await encryptData(dataInfo);
          const res = await getRegister(dataEncrypt);
          if (res.code === "0") {
            setRequestMsg(res.message);
            goLoginPage();
          } else if (res.code === "10043") {
            setRequestMsg(res.message);
            setToastType("error");
            setRepeatModalOPen(true);
          } else {
            Toast.show({
              content: res.message,
              icon: "fail",
            });
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
          Toast.show({
            content: String(error),
            icon: "fail",
          });
        }
      })
      .catch((info: any) => {
        console.log("Validate Failed:", info);
      });
  };

  const getRegisterCode = async () => {
    if (isCounting || loading || sentCodeFlag) return;
    try {
      setSentCodeFlag(true);
      if (registerInfo.type === "m") {
        const dataInfo = {
          number: registerInfo.email || "",
          deviceType: "H5",
        };
        const dataEncrypt = await encryptData(dataInfo);
        const res = await getRegisterMailCode(dataEncrypt);
        if (res.code === "0") {
          Toast.show({
            content: t("success") || res.message,
            icon: "success",
          });
          startCountdown(60);
        } else if (res.code === "10044") {
          Toast.show({
            content: res.message,
            icon: "fail",
          });
        }
        setSentCodeFlag(false);
      } else if (registerInfo.type === "p") {
        const dataInfo = {
          number: registerInfo.phone || "",
          code: registerInfo.countryCode?.replace("+", ""),
          deviceType: "H5",
        };
        const dataEncrypt = await encryptData(dataInfo);
        const res = await getRegisterSmsCode(dataEncrypt);
        if (res.code === "0") {
          Toast.show({
            content: t("success") || res.message,
            icon: "success",
          });
          startCountdown(60);
        } else if (res.code === "10044") {
          Toast.show({
            content: res.message,
            icon: "fail",
          });
        }
        setSentCodeFlag(false);
      }
    } catch (error) {
      setSentCodeFlag(false);
      console.error("获取验证码出错:", error);
    }
  };

  const handCancel = () => {
    setRepeatModalOPen(false);
    setLoginState(LoginStateEnum.REGISTER);
    setRegisterType(RegisterTypeEnum.EMAIL);
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

  const handCodeOk = async () => {
    setPointout(false);
    await getRegisterCode();
  };

  const goLoginPage = () => {
    store.clearUserToken();
    navigate("/login");
  };

  // 过滤输入，只允许数字
  const handleInputChange = (value: string) => {
    // 只保留数字
    const filteredValue = value.replace(/[^0-9]/g, "");
    setCodeInputValue(filteredValue);
    form.setFieldsValue({ code: filteredValue });
  };

  useEffect(() => {
    if (loginState == LoginStateEnum.Authcode) {
      getRegisterCode();
    }
  }, [loginState]);

  // 当状态不为 Authcode 时不渲染组件
  if (loginState !== LoginStateEnum.Authcode) return null;

  return (
    <div className={`flex-col ${styles.authCodePage}`} >
      <div className="mb-2">
        <p className="font-16 font-w-500 mb-1">
          {/* 已发送验证码至 */}
          {t("authCodeForm.title")}
        </p>
        <p className={`${styles.tip_color1}`}>
          {registerInfo.type === "m" && encryptEmail(registerInfo.email)}
          {registerInfo.type === "p" && (
            <>
              <span>{registerInfo.countryCode}&nbsp;&nbsp;</span>
              {encryptPhoneNumber(registerInfo.phone)}
            </>
          )}
        </p>
      </div>

      <Form
        name="authCode"
        form={form}
        className={`${styles.login_form}`}
      >
        <Form.Item
          name="code"
          rules={[{ required: true, message: t("authCodeForm.codeNull") }]}
          className={`${styles.login_form_item} mt-1 position-relative`}
          extra={
            <button
              type="button"
              className={`${styles.code_btn} ${
                isCounting ? styles.tip_color : styles.text_color
              } mr-3`}
              onClick={getRegisterCode}
            >
              {/* 重新发送/60s 重发 */}
              {isCounting
                ? `${countdown} ${t("authCodeForm.resendCountdown")}`
                : t("authCodeForm.resend")}
            </button>
          }
        >
          <Input
            type="number"
            autoComplete="off"
            className={`${styles.mail_input}`}
            style={{ color: "var(--text-color5)" }}
            placeholder={t("authCodeForm.placeholder")}
            value={codeInputValue}
            onChange={handleInputChange}
            clearable={true}
            maxLength={6}
          />
        </Form.Item>
      </Form>

      <div className="flex mt-6">
        <button
          type="button"
          className={`${styles.goback_btn} flex-x-cc`}
          onClick={() => goBackPage()}
        >
          {/* 上一步 */}
          {t("authCodeForm.prevStep")}
        </button>
        {!loading ? (
          <button
            type="submit"
            className={`${styles.submit_btn} flex-x-cc btn-color`}
            onClick={onSubmit}
          >
            {/* 提交 */}
            {t("authCodeForm.submit")}
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.submit_btn} flex-x-cc btn-disable login-loading`}
          >
            {/* 提交 */}
            {t("authCodeForm.submit")}
          </button>
        )}
      </div>

      <div>
        <button
          type="button"
          className={`theme_color mt-5`}
          onClick={() => setPointout(true)}
        >
          {/* 收不到验证码？ */}
          {t("authCodeForm.cantReceive")}
        </button>
      </div>

      <QuestionModal
        open={pointout}
        type={registerInfo.type}
        acount={
          registerInfo.type === "m"
            ? registerInfo.email || ""
            : registerInfo.type === "p"
            ? registerInfo.phone || ""
            : ""
        }
        onOk={() => setPointout(false)}
        onCancel={handCodeOk}
      />
      <RepeatModal
        open={repeatModalOPen}
        type={toastType}
        message={requestMsg}
        acount={
          registerInfo.type === "m"
            ? registerInfo.email || ""
            : registerInfo.type === "p"
            ? registerInfo.phone || ""
            : ""
        }
        onCancel={handCancel}
        onOk={() => goLoginPage()}
      />
    </div>
  );
}

export default AuthCode;
