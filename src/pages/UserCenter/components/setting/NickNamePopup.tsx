import { Form, Input } from "antd";
import { Toast, Popup } from 'antd-mobile';
import styles from "./styles/nickname.module.scss";
import { Iconify } from "@/components/icon/index";
import {updateUserCenter} from '@/services/userCenter'
import { useState } from "react";
import {encryptData} from '@/utils/encrypt'
import dayjs from "dayjs";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useLanguage } from '@/hooks/useLanguage';
import appStore from "@/store";

interface UserCenterData {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    birthday?: string,
    isNicknameUpdate?:boolean,
    nicknameUpdateTime?: number,
  }
type Props = {
    open: boolean;
    nicknameInfo: UserCenterData;
    // onOk?: (event: boolean) => void;
    onOk: (event: boolean) => void;
    onCancel: () => void;
};

function NicknameModal({ open, onCancel ,nicknameInfo,onOk}: Props) {
    const { t } = useLanguage('common');
    const [form] = Form.useForm();
    const [inputValue, setInputValue] = useState(nicknameInfo.nickname || '');
    const handCancel = () => {
        onCancel()
    };
const kvConfig=appStore.getKvConfigAll()
    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async(values) => {
                // console.log(values);
                if(!nicknameInfo?.isNicknameUpdate) return Toast.show({
                  icon: 'fail',
                  content: t('usersetting.modifyOnce'),
                });
                try {
                    const param={
                        // userId:localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO)||'',
                        nickname:values.nickname
                    }
                    const encrypt=await encryptData(param)
                    const res=await updateUserCenter(encrypt)
                    if(res.code==='0'){
                        onOk(true)
                        handCancel()
                        Toast.show({
                          icon: 'success',
                          content: t('usersetting.modifySuccess'),
                        });
                    }else{
                        Toast.show({
                          icon: 'fail',
                          content: res.message,
                        });
                    }
                } catch (error) {
                    Toast.show({
                      icon: 'fail',
                      content: String(error),
                    });
                }
            });
    };
      // 过滤输入，只允许数字和字母
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
        setInputValue(filteredValue);
        form.setFieldsValue({ nickname: filteredValue });
    };

    const ModalFooter = () => {

        return (
            <div className="flex justify-between gap-x-[10px] mt-5">
                <button type="button" className="w-[50%] rounded-[22px] h-[44px] cancel_btn2 flex justify-center items-center" onClick={handCancel}>
                    {t('cancel')}
                </button>
                <button type="submit" className="w-[50%] rounded-[22px] h-[44px] default_btn flex justify-center items-center" onClick={handOk}>
                    {t('save')}
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
            bodyClassName="!h-auto !bg-[var(--background17)] !text-[var(--text-color5)]"
        >
            <p className="flex justify-between items-center h-[50px] text-[14px] font-medium px-4 border-b border-[var(--border-color6)]">
                <span>{t('usersetting.modifyNickname')}</span>
                <Iconify icon="mingcute:close-line" className="text-[14px]" onClick={onCancel} />
            </p>
            <div className="p-4 pb-[30px]">
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: "100%" }}
                        initialValues={{ nickname: nicknameInfo.nickname||'' }}
                    >
                        <Form.Item name="nickname" rules={[{ required: true,message: t('usersetting.nicknameRequired') }]}>
                            <Input  className={`${styles.input_box} modal-input`}
                            onChange={handleInputChange}
                            value={inputValue}
                            maxLength={25}/>
                        </Form.Item>
                        {nicknameInfo&&!nicknameInfo?.isNicknameUpdate&& <p className="error_icon font-12 font-w-400 mt-1">

                            {dayjs(Number(nicknameInfo?.nicknameUpdateTime)).format('YYYY-MM-DD HH:mm:ss')}{t('usersetting.modifyNicknameOnce')}
                            </p>}
                        <ul className={`${styles.msg_color} mt-2_5 font-12 font-w-400`}>
                            <li className="flex align-base ">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 24h内仅可修改1次。 */}
                                {t('usersetting.modifyNicknameOnceTip1', {time:kvConfig?.nickname_modify_time || 24})}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 昵称仅支持数字、字母，不得超出25字符。 */}
                                {t('usersetting.modifyNicknameOnceTip2')}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 不可使用个人真实姓名及联系方式等，以防泄漏您的隐私。 */}
                                {t('usersetting.modifyNicknameOnceTip3')}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 昵称内容必须符合所在国家或地区的法律规定。如有违规，IMBIT有权对其修改或实施对账号禁言、封号等惩罚性措施。 */}
                                {t('usersetting.modifyNicknameOnceTip4')}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 历史昵称可能因为版本关系，存在不符合上述规范的情况，将无法同步至域名url。 */}
                                {t('usersetting.modifyNicknameOnceTip5')}
                            </li>
                        </ul>
                    </Form>
                    <ModalFooter />
                </div>
        </Popup>
    );
}

export default NicknameModal;
