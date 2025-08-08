import { Form, Input } from "antd";
import { Toast, Popup } from 'antd-mobile';
import type { ModalProps } from "antd/es/modal/interface";
import styles from "./styles/setLock.module.scss";
import { Iconify } from "@/components/icon/index";
import { useState, useEffect } from "react";
import { encryptData } from "@/utils/encrypt";
import { setPassword } from "@/services/safeCenter";
import { useLanguage } from '@/hooks/useLanguage';
type Props = {
  open: boolean;
  // onOk?: (event: boolean) => void;
  onOk: () => void;
  onCancel: () => void;
  type: string;
};

function LockModal({ open, onCancel, type, onOk }: Props) {
  const { t } = useLanguage(['userCenter']);
  const [verifyPasswordVisible, setverifyPasswordVisible] = useState(false);

  // 密码校验状态
  const [lengthValid, setLengthValid] = useState(false);
  const [charValid, setCharValid] = useState(false);
  const [showLengthCheck, setShowLengthCheck] = useState(false);
  const [showCharCheck, setShowCharCheck] = useState(false);


  const [form] = Form.useForm();

  const handCancel = () => {
    setShowLengthCheck(false);
    setShowCharCheck(false);
    setLengthValid(false);
    setCharValid(false);
    form.resetFields();
    onCancel()
  };

  const handOk = async () => {
    // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    form.validateFields()
      .then(async (values) => {
        // console.log(values);
        try {
          const params = {
            password: values.password,
            checkPassword: values.checkPassword,
            platformType:'H5'
          }
          const dataEncrypt = await encryptData(params)
          const res = await setPassword(dataEncrypt)
          if (res.code === "0") {
            Toast.show({
                icon: 'success',
                content: t("success") || res.message,
            })
            onOk()
            handCancel()
          }
        } catch (error) {
            Toast.show({
				icon: 'fail',
				content: String(error),
			})
        }

      });
  };

  // 自定义密码验证规则
  const validatePassword = (_: any, value: string) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (!value) {
      return Promise.reject(new Error(t('security.lockSafe.lockError')));
    }
    // 检查长度是否在 8 - 100 位之间
    const isLengthValid = value.length >= 8 && value.length <= 100;
    if (!isLengthValid) {
      setShowLengthCheck(true);
      setShowCharCheck(false);
      return Promise.reject();
    }

    // 检查是否包含大写字母和数字
    const hasUpperLetter = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const isCharValid = hasUpperLetter && hasNumber;

    if (!isCharValid) {
      setShowLengthCheck(false);
      setShowCharCheck(true);
      return Promise.reject();
    }

    // 所有校验都通过
    setShowLengthCheck(false);
    setShowCharCheck(false);
    return Promise.resolve();
  };
  // 监听密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 检查长度
    const isLengthValid = value.length >= 8 && value.length <= 100;

    // 检查是否包含大写字母和数字
    const hasUpperLetter = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const isCharValid = hasUpperLetter && hasNumber;

    // 更新状态
    setLengthValid(isLengthValid);
    setCharValid(isCharValid);

    // 显示长度校验，隐藏字符校验
    setShowLengthCheck(true);
    setShowCharCheck(false);

    // 如果长度校验通过，1秒后切换到字符校验
    if (isLengthValid) {
      setTimeout(() => {
        setShowLengthCheck(false);
        setShowCharCheck(true);

        // 如果字符校验也通过，1秒后隐藏
        if (isCharValid) {
          setTimeout(() => {
            setShowCharCheck(false);
          }, 1000);
        }
      }, 1000);
    }
  };
  // // 重置状态
  // useEffect(() => {
  //   if (!open) {
  //     setShowLengthCheck(false);
  //     setShowCharCheck(false);
  //     setLengthValid(false);
  //     setCharValid(false);
  //     form.resetFields();
  //   }
  // }, [open, form]);
  const ModalFooter = () => {

    return (
      <div>
        <button
          type="submit"
          className={`${styles.modal_footerBtn} default_btn mt-8 mb-6`}
          onClick={handOk}
        >
          {t('security.confirm')}
        </button>
      </div>
    );
  };

  return (
	<Popup
		visible={open}
		onClose={onCancel}
		closeOnMaskClick
		position='bottom'
    bodyStyle={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
    bodyClassName="!h-auto !bg-[var(--background5)] !text-[var(--text-color5)]"
	>
		<p className={`${styles.title}`}>
			<span>{type === '5' ? t('security.lockSafe.setPassword') : t('security.lockSafe.modifyPassword')}</span>
			<Iconify icon="mingcute:close-line" className="text-[24px] text-[var(--text-color9)]" onClick={onCancel} />
		</p>
		<div className="p-4 pb-[30px]">
          {/* t() */}
          <Form
            name="nickname"
            form={form}
            size="large"
            style={{ width: "100%" }}
          >
            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>{t('security.lockSafe.newPassword')}</div>
            <Form.Item name="password" rules={[{ validator: validatePassword }]}>
              <Input.Password maxLength={100}
                autoComplete="off"
                styles={{ input: { color: "var(--text-color5)" } }}
                placeholder={t('security.lockSafe.inputPassword')}
                allowClear={true}
                className={`${styles.input_box} modal-input `}
                onChange={handlePasswordChange}
              />
            </Form.Item>
            <div className={`mt-1`}>
              {showLengthCheck && (
                <div className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.tip_title : styles.tip_color}`}>
                  <Iconify
                    icon="iconoir:check-circle-solid"
                    size={16}
                    className={`mr-1 ${lengthValid ? styles.tip_title : styles.tip_color}`}
                  />
                  {t('security.lockSafe.error3')}
                </div>
              )}

              {showCharCheck && (
                <div className={`font-12 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color}`}>
                  <Iconify
                    icon="iconoir:check-circle-solid"
                    size={16}
                    className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color}`}
                  />
                  {t('security.lockSafe.error4')}
                </div>
              )}
              {/* <div className="font-12 font-w-400">
                     <Iconify icon="iconoir:check-circle-solid" size={16} className="mr-1"/>
                       至少一个大写字母
                  </div> */}
            </div>
            <div className={`font-16 font-w-400 mb-2_5 mt-5 ${styles.tip_title}`}>{t('security.lockSafe.checkPassword')}</div>
            <Form.Item name="checkPassword"
              rules={[
                { required: true, message: t('security.lockSafe.lockError') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {

                      return Promise.resolve();
                    }

                    return Promise.reject(new Error(t('security.lockSafe.lockError2')));
                  },
                }),
              ]}>
              <Input.Password
                autoComplete="off"
                styles={{ input: { color: "var(--text-color5)" } }}
                allowClear
                placeholder={t('security.lockSafe.checkPassword')}
                className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                style={{ borderRadius: "8px" }}
                visibilityToggle={{ visible: verifyPasswordVisible, onVisibleChange: setverifyPasswordVisible }}
              />
              {/* <button className='text-color mt-1'>粘贴</button> */}
            </Form.Item>

          </Form>
		  <ModalFooter />
        </div>
	</Popup>
  );
}

export default LockModal;
