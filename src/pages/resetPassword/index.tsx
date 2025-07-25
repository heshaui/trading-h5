
import { ResetStateProvider } from "@/context/reset-providers/ResetStateProvider";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "./style/reset.module.scss"
import { Iconify } from "@/components/icon/index";
import InputAcount from "./components/inputAcount";
import SentCode from "./components/sentCode";
import ResetPage from "./components/resetPage";
import { useLanguage } from '@/hooks/useLanguage';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import appStore from "@/store"

function ResetPassword() {
    const { t } = useLanguage('resetPassword');
    const kvConfigKey = appStore.getKvConfig('out_money')
    // const [tabsProps, setTabsProps] = useState('email');
    // const signIn = useSignIn();
    // const { loginType, setLoginType } = useLoginTypeContext();
    // const [authCode, setAuthCode] = useState('');
    // const inputRef = useRef<HTMLInputElement | null>(null);
    // 当状态不为 Authcode 时不渲染组件
    // if (loginType !== LoginTypeEnum.Authcode || registerType !== RegisterTypeEnum.Authcode) return null;
    // if (loginState !== LoginStateEnum.Googlecode) return null;


    return (
        <div className={`relative flex h-max w-full flex-row ${styles.resetPage}`} >
            <div className=" flex-y-cc w-full flex-1 position-relative">
                <div className={``}>
                    <h2 className={`mb-6 font-w-500 font-36 `} >
                        {/* 重置密码 */}
                        {t('reset')}
                    </h2>
                    <div className={`mb-6 flex flex-ai-start  ${styles.warning_box} ${styles.warning_page}`} >
                        <Iconify icon="ep:warning-filled" className="mr-2" size={20} />
                        {/* 为确保您的账户安全，在您更改密码后48小时内禁出金。 */}
                        {t('resetTip2', { time: kvConfigKey || 24 })}
                    </div>
                    <ResetStateProvider>
                        <InputAcount />
                        <SentCode />
                        <ResetPage />
                    </ResetStateProvider>
                </div>

            </div>
        </div>

    );
}

export default ResetPassword;
export const meta = {
	requireAuth: false
}