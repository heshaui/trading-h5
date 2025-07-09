import { Form, Input } from "antd";
import { Toast, Popup, Image } from 'antd-mobile';
import styles from "./styles/setGoogle.module.scss";
import { useState } from "react";
import { Iconify } from "@/components/icon/index";
import { getSmsCode, getEmailCode, unbindGoogle } from "@/services/safeCenter";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import QuestionModal from "@/components/PopUp/questionModal";
import appStore from "@/store";
import { useLanguage } from '@/hooks/useLanguage';

import ChangeGoogleImg from '@/assets/images/userCenter/safe/change_google.png'

interface acountType {
  countryCode?: string;
  email?: string;
  phone?: string;
  googleCode?: string;
  type?: string;
}
interface SafeDataType {
  phone?: string;
  email?: string;
  countryCode?: string;
  googleCode?: boolean;
  password?: boolean;
  deviceNos?: string;
  recentIp?: string;
  userId?: string;
  type?: string;
}
type Props = {
  open: boolean;
  // onOk?: (event: boolean) => void;
  onOk: () => void;
  onCancel: () => void;
  type?: string;
  acountInfo: SafeDataType;
};

function UnbindGoogleModal({ open, onCancel, type, onOk, acountInfo }: Props) {
  const { t } = useLanguage(["userCenter"]);
  const [isCounting, setIsCounting] = useState(false);
  const [isCounting2, setIsCounting2] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [countdown2, setCountdown2] = useState(60);
  const [firstCheck, setFirstCheck] = useState(true);
  const [firstCheck2, setFirstCheck2] = useState(true);
  const [loading, setLoading] = useState(false); // 按钮loading
  const [codeLoading, setCodeLoading] = useState(false); // 验证码loading
  const [codeLoading2, setCodeLoading2] = useState(false); // 验证码loading
  const [emailCodeInputValue, setEmailCodeInputValue] = useState("");
  const [phoneCodeInputValue, setPhoneCodeInputValue] = useState("");
  const [googleCodeInputValue, setGoogleCodeInputValue] = useState("");

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [form] = Form.useForm();
  const kvConfigKey = appStore.getKvConfig("out_money");
  // console.log(acountInfo, 123);

  const handCancel = () => {
    form.resetFields();
    setFirstCheck(true);
    setFirstCheck2(true);
    onCancel();
  };

  const handOk = async () => {
    // onOk(type)
    // 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:修改密码 4:关闭谷歌验证 5:绑定邮箱
    form.validateFields().then(async (values) => {
      setLoading(true);
      try {
        const params = {
          isGoogleAuth: 0,
          code: values.emailCode || "",
          email: values.emailCode ? acountInfo.email : "",

          googleCode: values.googleCode || "",

          phoneCode: values.phoneCode || "",
          phone: values.phoneCode ? acountInfo.phone : "",
          countryCode: values.phoneCode ? acountInfo.countryCode : "",
          platformType: "H5",
        };
        const dataEncrypt = await encryptData(params);
        const res = await unbindGoogle(dataEncrypt);
        if (res.code === "0") {
          Toast.show({
            icon: 'success',
            content: t("success") || res.message,
          });
          onOk();
          handCancel();
        } else {
          Toast.show({
            icon: 'fail',
            content: res.message,
          });
        }
      } catch (error) {
        setLoading(false);
        Toast.show({
          icon: 'fail',
          content: String(error),
        });
        console.log(error);
      } finally {
        setLoading(false);
      }
    });
  };

  const getPhoneCode = async () => {
    if (isCounting2 || loading || codeLoading2) return;
    setCodeLoading2(true);
    try {
      const dataInfo = {
        number: acountInfo?.phone,
        code: acountInfo?.countryCode,
        deviceType: "H5",
      };
      const dataEncrypt = await encryptData(dataInfo);
      const res = await getSmsCode(dataEncrypt);
      if (res.code === "0") {
        setFirstCheck2(false);
        Toast.show({
          icon: 'success',
          content: t("success") || res.message,
        });
        startCountdown2(60);
      } else if (res.code === "10044") {
        Toast.show({
          icon: 'fail',
          content: t("security.error1"),
        });
      } else {
        Toast.show({
          icon: 'fail',
          content: res.message,
        });
      }
      setCodeLoading2(false);
    } catch (error) {
      setCodeLoading2(false);
      Toast.show({
        icon: 'fail',
        content: String(error),
      });
      console.error("获取验证码出错:", error);
    }
  };
  const getMailCode = async () => {
    if (isCounting || loading || codeLoading) return;
    setCodeLoading(true);
    try {
      const dataInfo = {
        number: acountInfo?.email,
        deviceType: "H5",
      };
      const dataEncrypt = await encryptData(dataInfo);
      const res = await getEmailCode(dataEncrypt);
      if (res.code === "0") {
        setFirstCheck(false);
        Toast.show({
          icon: 'success',
          content: t("success") || res.message,
        });
        startCountdown(60);
      } else if (res.code === "10044") {
        Toast.show({
          icon: 'fail',
          content: t("security.error1"),
        });
      } else {
        Toast.show({
          icon: 'fail',
          content: res.message,
        });
      }
      setCodeLoading(false);
    } catch (error) {
      setCodeLoading(false);
      Toast.show({
        icon: 'fail',
        content: String(error),
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
  const handQuestionOk = (type: string) => {
    if (type === "phone") {
      getPhoneCode();
    } else if (type === "email") {
      getMailCode();
    }
    setQuestionModalOpen(false);
  };
  // 过滤输入，只允许数字和字母
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const { value } = e.target;
    // 只保留数字和字母
    const filteredValue = value.replace(/[^0-9]/g, "");
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
  const ModalFooter = () => {
    return (
      <div className="flex-x align-center justify-end">
        <button
          type="submit"
          className={`${styles.modal_footerBtn} default_btn mt-4 mb-6 mr-5`}
          onClick={handOk}
        >
          {t("security.unbindGoogle.unbind")}
        </button>
        <button
          type="submit"
          className={`${styles.modal_footerBtn} cancel_btn2 mt-4 mb-6`}
          onClick={handCancel}
        >
          {t("security.unbindGoogle.cancel")}
        </button>
      </div>
    );
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
        <p className={`${styles.title}`}>
            <span>{t("security.unbindGoogle.title")}</span>
            <Iconify icon="mingcute:close-line" className="text-[24px] text-[#676867]" onClick={onCancel} />
        </p>
        <div className="p-4">
          <div className="flex-col flex-ai-center">
            <Image
              src={ ChangeGoogleImg }
              alt=""
              className={`${styles.icon_box}`}
            />

            <p className={`${styles.msg_color}`}>
              {t("security.unbindGoogle.confirmUnbind")}
            </p>
            <div
              className={`mb-6 mt-7 ${styles.warning_box} font-12 font-w-400`}
            >
              <p>{t("security.unbindGoogle.warmTip")}</p>
              <p>
                {t("security.unbindGoogle.tipContent2", {
                  time: kvConfigKey || 24,
                })}
              </p>
            </div>
          </div>
          <Form
            name="nickname"
            form={form}
            size="large"
            style={{ width: "100%" }}
          >
            {acountInfo.email && (
              <>
                <div className={`font-16 font-w-400 ${styles.tip_title}`}>
                  {t("security.email")}
                </div>
                <p
                  className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}
                >
                  {firstCheck ? t("security.sent2") : t("security.resend2")}
                  <span>&nbsp;{encryptEmail(acountInfo.email)}</span>
                </p>
                <Form.Item
                  name="emailCode"
                  rules={[{ required: true, message: t("security.codeError") }]}
                >
                  <Input
                    autoComplete="off"
                    styles={{ input: { color: "var(--text-color5)" } }}
                    allowClear
                    placeholder={t("security.inputEmailCode")}
                    suffix={
                      <button
                        type="button"
                        className={
                          isCounting
                            ? `${styles.tip_color1_input}`
                            : `${styles.text_color}`
                        }
                        onClick={getMailCode}
                      >
                        {isCounting ? (
                          `${countdown}${t("security.countdown")}`
                        ) : firstCheck ? (
                          <span className={`${styles.default_color}`}>
                            {t("security.sent")}
                          </span>
                        ) : (
                          t("security.resend")
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
            {acountInfo.phone && !acountInfo.email && (
              <>
                <div
                  className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}
                >
                  {t("security.phone")}
                </div>
                <p
                  className={`${styles.tip_color} font-12 font-w-400 mt-1 mb-2_5`}
                >
                  {firstCheck2 ? t("security.sent2") : t("security.resend2")}
                  <span>&nbsp;{encryptPhoneNumber(acountInfo.phone)}</span>
                </p>
                <Form.Item
                  name="phoneCode"
                  rules={[{ required: true, message: t("security.codeError") }]}
                >
                  <Input
                    autoComplete="off"
                    styles={{ input: { color: "var(--text-color5)" } }}
                    allowClear
                    placeholder={t("security.inputPhoneCode")}
                    // prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    suffix={
                      <button
                        type="button"
                        className={
                          isCounting2
                            ? `${styles.tip_color1_input}`
                            : `${styles.text_color}`
                        }
                        onClick={getPhoneCode}
                      >
                        {isCounting2 ? (
                          `${countdown2}${t("security.countdown")}`
                        ) : firstCheck2 ? (
                          <span className={`${styles.default_color}`}>
                            {t("security.sent")}
                          </span>
                        ) : (
                          t("security.resend")
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
            {(acountInfo.phone || acountInfo.email) && (
              <div
                className={`error_icon font-14 font-w-500 mt-1 mb-2_5 cursor-pointer`}
                onClick={() => setQuestionModalOpen(true)}
              >
                {t("security.error3")}
              </div>
            )}
            <Form.Item
              name="googleCode"
              rules={[{ required: true, message: t("security.codeError") }]}
            >
              <Input
                autoComplete="off"
                styles={{ input: { color: "var(--text-color5)" } }}
                placeholder={t("security.inputGoogleCode")}
                allowClear
                className={`${styles.input_box} modal-input`}
                suffix={
                  <button
                    type="button"
                    className={`${styles.default_color}`}
                    onClick={handlePaste}
                  >
                    {t("security.paste")}
                  </button>
                }
                maxLength={6}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, "google")
                }
                value={googleCodeInputValue}
              />
            </Form.Item>
          </Form>
          <ModalFooter />
        </div>
        <QuestionModal
          open={questionModalOpen}
          onAgain={handQuestionOk}
          onCancel={() => setQuestionModalOpen(false)}
          type={acountInfo.phone ? "phone" : "email"}
          acount={
            acountInfo.phone
              ? acountInfo.phone
              : acountInfo.email
              ? acountInfo.email
              : ""
          }
        />
    </Popup>
  );
}

export default UnbindGoogleModal;
