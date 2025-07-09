import { Form, Input, Steps, QRCode } from "antd";
import { Toast, Popup } from 'antd-mobile';
import styles from "./styles/setGoogle.module.scss";
import { Iconify } from "@/components/icon/index";
import { useState, useEffect } from "react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { getGoogleKey, bindGoogle } from "@/services/safeCenter";
// import {
//     getSmsCode,
//     getEmailCode,
//     unbindGoogle
// } from '@/services/safeCenter'
import { encryptData } from "@/utils/encrypt";
import { useLanguage } from '@/hooks/useLanguage';
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

function BindGoogleModal({ open, onCancel, type, onOk, acountInfo }: Props) {
  // const router = useRouter();
  const [firstCheck, setFirstCheck] = useState(true);
  const [firstCheck2, setFirstCheck2] = useState(true);
  const [loading, setLoading] = useState(false); // 按钮loading
  const [qrCodeLoading, setQrCodeLoading] = useState("loading"); // 二维码loading
  const [current, setCurrent] = useState(0);
  const [codeInputValue, setCodeInputValue] = useState("");
  const [secretKey, setSecretKey] = useState({
    secretKey: "",
    codeUri: "",
  });
  const { t } = useLanguage(["userCenter"]);
  const [codeValue] = useState("https://ant.design"); //, setcodeValue
  const { copyFn } = useCopyToClipboard();

  const [form] = Form.useForm();

  const handCancel = () => {
    form.resetFields();
    setFirstCheck(true);
    setFirstCheck2(true);
    onCancel();
  };

  const handOk = async () => {
    // onOk(type)
    // 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:修改密码 4:关闭谷歌验证 5:绑定邮箱
    form.validateFields().then(async (values: { googleCode: any; }) => {
      setLoading(true);
      try {
        const params = {
          googleCode: values.googleCode || "",
          platformType: "H5",
        };
        const dataEncrypt = await encryptData(params);
        const res = await bindGoogle(dataEncrypt);
        if (res.code === "0") {
            Toast.show({
                icon: 'success',
                content: t("success") || res.message,
            })
          onOk();
          handCancel();
          setCurrent(0);
        } else {
            Toast.show({
                icon: 'fail',
                content: res.message,
            })
        }
      } catch (error) {
        setLoading(false);
        // console.log(error);
      } finally {
        setLoading(false);
      }
    });
  };
  // 过滤输入，只允许数字和字母
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // 只保留数字和字母
    const filteredValue = value.replace(/[^0-9]/g, "");
    setCodeInputValue(filteredValue);
    form.setFieldsValue({ googleCode: filteredValue });
  };

  const getGoogleKeyData = async () => {
    try {
      const res = await getGoogleKey();
      if (res.code === "0") {
        setSecretKey({
          secretKey: res.data.secretKey,
          codeUri: res.data.codeUri,
        });
      } else {
        Toast.show({
            icon: 'fail',
            content: res.message,
        })
      }
    } catch (error) {
        Toast.show({
            icon: 'fail',
            content: String(error),
        })
    }
  };

  const steps = [
    {
      title: (
        <p className={`${styles.tip_title}`}>
          {/* Android/iOS 谷歌验证器下载 */}
          {t("security.bindGoogle.title1")}
        </p>
      ),
      description: (
        <div>
          <p className={`${styles.tip_color} font-12 font-w-400`}>
            {t("security.bindGoogle.tip1")}
          </p>
          <p className={`${styles.tip_color} font-12 font-w-400 mt-1`}>
            {t("security.bindGoogle.tip2")}
          </p>
        </div>
      ),
    },
    {
      title: (
        <p className={`${styles.tip_title}`}>
          {/* 在谷歌验证器中添加密钥并备份 */}
          {t("security.bindGoogle.title2")}
        </p>
      ),
      description: (
        <div>
          <p className={`${styles.tip_color} font-12 font-w-400`}>
            {t("security.bindGoogle.tip3")}
          </p>
          <p className={`error_icon font-12 font-w-400 mt-1`}>
            <Iconify icon="mingcute:warning-fill" size={12} />
            {t("security.bindGoogle.tip4")}
          </p>
          <div className={`flex-x align-end mt-1`}>
            <QRCode
              style={{
                backgroundColor: "#fff",
                padding: "6px",
                minWidth: "68px",
              }}
              value={`${secretKey.codeUri || ""}`}
              size={68}
            />
            <div className={`${styles.tip_title} ml-4`}>
              <p className={`${styles.tip_title} font-12 font-w-400`}>
                {t("security.bindGoogle.copyKey")}
              </p>
              <div className={`${styles.invite_code} font-12 mt-1`}>
                <span className={`${styles.tip_color} mr-2`}>
                  {secretKey.secretKey || "--"}
                </span>
                <Iconify
                  icon="bx:copy"
                  className={`${styles.tip_title} cursor-pointer`}
                  size={20}
                  onClick={() => copyFn(secretKey.secretKey || "")}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <p className={`${styles.tip_title}`}>
          {/* 验证谷歌验证码 */}
          {t("security.bindGoogle.title3")}
        </p>
      ),
      description: (
        <div>
          <Form form={form} layout="vertical" className="mt-2_5">
              <Form.Item
                name="googleCode"
                rules={[
                  {
                    required: true,
                    message: t("security.bindGoogle.googleCodeNull"),
                  },
                ]}
              >
                <Input
                  autoComplete="off"
                  styles={{ input: { color: "var(--text-color5)" } }}
                  placeholder={t("security.bindGoogle.googleCodeNull")}
                  style={{ width: "90%" }}
                  className={`${styles.authcode_input} ${styles.input_box} modal-input2`}
                  maxLength={6}
                  value={codeInputValue}
                  onChange={handleInputChange}
                />
              </Form.Item>
            </Form>
        </div>
      ),
    },
  ];
  const onNextSetup = () => {
    setCurrent(current + 1);
  };
  // const onPrevSetup = () => {
  //     setCurrent(current - 1);
  // }
  useEffect(() => {
    if (open) {
      getGoogleKeyData();
    }
  }, [open]);
  const ModalFooter = () => {
    return (
      <div className="flex-x-cc" style={{ width: "100%" }}>
        <div
          className="flex-x align-center justify-end"
          style={{ width: "80%" }}
        >
          {current < steps.length - 1 && (
            <button
              type="submit"
              className={`${styles.modal_footerBtn2} default_btn mt-4 mb-6 mr-5`}
              onClick={onNextSetup}
            >
              {/* 下一步 */}
              {t("security.bindGoogle.next")}
            </button>
          )}
          {current === steps.length - 1 && (
            <button
              type="submit"
              className={`${styles.modal_footerBtn2} default_btn mt-4 mb-6 mr-5`}
              onClick={handOk}
            >
              {/* 绑定 */}
              {t("security.bindGoogle.bind")}
            </button>
          )}
          <button
            type="submit"
            className={`${styles.modal_footerBtn2}  cancel_btn2 mt-4 mb-6`}
            onClick={handCancel}
          >
            {/* 取消 */}
            {t("security.bindGoogle.cancel")}
          </button>
        </div>
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
                {/* 输入验证码开启谷歌验证器 */}
                <span>{t("security.bindGoogle.modalTitle")}</span>
                <Iconify icon="mingcute:close-line" className="text-[24px] text-[#676867]" onClick={onCancel} />
            </p>
            <div className="p-4">
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    <Steps
                        direction="vertical"
                        current={current}
                        labelPlacement="vertical"
                        items={steps}
                        className="custom-steps"
                    />
                </div>
                <ModalFooter />
            </div>
      </Popup>
  );
}

export default BindGoogleModal;
