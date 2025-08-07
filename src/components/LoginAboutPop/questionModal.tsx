import { Popup } from 'antd-mobile'
import { Iconify } from "@/components/icon/index";
import styles from "./styles/Popup.module.scss";
import { encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import { useLanguage } from "@/hooks/useLanguage";
type Props = {
    open: boolean;
    acount: string | null;
    acount2?: string | null;
    type: string | null;
    onOk?: (event: boolean) => void;
    onAgain?: (type: string) => void;
    onCancel: () => void;
};

function QuestionModal({ open, onOk, acount, acount2, type, onCancel, onAgain }: Props) {
    const { t } = useLanguage('common');
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        onCancel()
        onOk?.(true)
        onAgain?.(type||'')
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    };

    return (
        <Popup
            visible={open}
            onClose={onCancel}
            closeOnMaskClick
            position='bottom'
            bodyStyle={{ minHeight: '50vh', paddingBottom: '5%' }}
            bodyClassName={styles.userCenterPopContainer}
            className={styles.login_form}
        >
            <div>
                <div className={`${styles.title_color} mb-3`}>
                    {/* 无法收到验证码？ */}
                    {t('cantReceive')}
                </div>
                
                <h4 className={`${styles.title_color} mt-7`}>
                    {/* 若长时间没有收到验证码，请检查以下事项： */}
                    {t('check')}
                </h4>
                <ul>
                    <li className={`${styles.tip_color} font-w-400`}>
                        <Iconify icon="mingcute:diamond-square-fill" className={`${styles.theme_color} mr-2`} size={10} />
                        {(type === "m" || type === "email" || type === "mail") && (<>
                            {/* 确保您的邮箱为 */}
                            {t('check1')}
                            <span>{acount ? encryptEmail(acount) : "-"}</span></>)}
                        {(type === "p" || type === "phone") && (<>
                            {/* 确保您的手机为 */}
                            {t('check2')}
                            <span>{acount ? encryptPhoneNumber(acount) : "-"}</span></>)}
                        {(type === "safe" && acount && acount2) &&(<>
                            {/* 确保您的手机/邮箱为 */}
                            {t('check3')}
                            {encryptPhoneNumber(acount)}或{encryptEmail(acount2)}
                        </>)}
                        {(type === "safe" && acount && !acount2) &&(<>
                            {/* 确保您的手机为 */}
                            {t('check2')}
                            {encryptPhoneNumber(acount)}
                        </>)}
                        {(type === "safe" && !acount && acount2) &&(<>
                            {/* 确保您的邮箱为 */}
                            {t('check1')}
                            {encryptEmail(acount2)}
                        </>)}
                    </li>
                    <li className={`${styles.tip_color} font-w-400`}>
                        <Iconify icon="mingcute:diamond-square-fill" className={`${styles.theme_color} mr-2`} size={10} />
                        {/* 检查验证码是否位于垃圾箱中 */}
                        {t('check4')}
                    </li>
                    <li className={`${styles.tip_color} font-w-400`}>
                        <Iconify icon="mingcute:diamond-square-fill" className={`${styles.theme_color} mr-2`} size={10} />
                        {/* 验证码可能存在延迟，过了10分钟后再试 */}
                        {t('check5')}
                    </li>
                </ul>

                <div className="flex-col flex-ai-start mt-10 mb-3">
                    <button
                        type="button"
                        className={`${styles.modal_btn} btn-color`}
                        onClick={handCancel}
                    >
                        {t('beSure')}
                    </button>
                    <button
                        type="button"
                        className={`${styles.modal_btn} cancel_btn2 mt-5`}
                        onClick={handOk}
                    >
                        {t('resend')}
                    </button>
                </div>
            </div>
        </Popup>
    );
}

export default QuestionModal;
