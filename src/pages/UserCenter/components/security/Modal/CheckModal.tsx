import { Modal, Image } from "antd-mobile";
import { useLanguage } from '@/hooks/useLanguage';
import styles from "./styles/check.module.scss";
import appStore from "@/store"

import ChangePhoneImg from '@/assets/images/userCenter/safe/change_phone.png';
import ChangeEmailImg from '@/assets/images/userCenter/safe/change_email.png';
import ChangeLockImg from '@/assets/images/userCenter/safe/change_lock.png';
import ChangeGoogleImg from '@/assets/images/userCenter/safe/change_google.png';


type Props = {
    open: boolean;
    type: string;
    onOk: (type: string) => void;
    onCancel: () => void;
};
// 0:修改手机号 1:关闭手机验证 2:修改邮箱 3:修改密码 4:关闭谷歌验证
function CheckModal({ open, onCancel, type, onOk }: Props) {
    const { t } = useLanguage(['userCenter']);
    const kvConfigKey=appStore.getKvConfig('out_money')
    const handCancel = () => {
        onCancel()
    };

    const handOk = async () => {
        onOk(type)
        onCancel()
    };
    const ModalFooter = () => {
        return (
            <div className="flex-x-cc mt-10 mb-3" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5`}
                    onClick={handCancel}
                >
                    {t('security.changeCheck.cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {t('security.changeCheck.continue')}
                </button>
            </div>
        );
    };

	const ModalContent = () => {
		return (
			<div className="flex-col flex-ai-center" style={{ width: "100%" }}>
				{/* 修改手机号 */}
				{type == "0" && (
					<>
						<Image src={ ChangePhoneImg } alt="" className={`${styles.icon_box}`} />
						<p className={`${styles.title} `}>
							{t('security.changeCheck.title')}
						</p>
						<p className={`${styles.msg_color} mt-4 text-center` }>
							{t('security.changeCheck.msg11',{time:kvConfigKey})}
						</p>
					</>
				)}
				{/* 关闭手机验证 */}
				{type === "1" && (
					<>
						<Image src={ ChangePhoneImg } alt="" className={`${styles.icon_box}`} />
						<p className={`${styles.title} `}>
							{t('security.changeCheck.title1')}
						</p>
						<p className={`${styles.msg_color} mt-4 text-center` }>
							{t('security.changeCheck.msg1')}
						</p>
					</>
				)}
				{/* 修改邮箱 */}
					{(type === "2") && (
					< >
						<Image src={ ChangeEmailImg } alt="" className={`${styles.icon_box}`} />
						<p className={`${styles.title} `}>
							{t('security.changeCheck.title2')}
						</p>
						<p className={`${styles.msg_color} mt-4 text-center` } style={{width: '70%'}}>
							{t('security.changeCheck.msg21',{time:kvConfigKey})}
						</p>
					</>
				)}
				{/* 修改密码 */}
					{(type === "3"||type==='5') && (
					<>
						<Image src={ ChangeLockImg } alt="" className={`${styles.icon_box}`} />
						<p className={`${styles.title} `}>
							{t('security.changeCheck.title3')}
						</p>
						<p className={`${styles.msg_color} mt-4 text-center` }>
							{t('security.changeCheck.msg31',{time:kvConfigKey})}
						</p>
					</>
				)}
				{/* 解绑谷歌验证 */}
					{type === "4" && (
					<>
						<Image src={ ChangeGoogleImg } alt="" className={`${styles.icon_box}`} width={160} height={160} />
						<p className={`${styles.title} `}>
							{t('security.changeCheck.title4')}
						</p>
						<p className={`${styles.msg_color} mt-4 text-center` }>
							{t('security.changeCheck.msg41',{time:kvConfigKey})}
						</p>
					</>
				)}
				<ModalFooter />
			</div>
		)
	}

    return (
		<Modal
			visible={open}
			content={ <ModalContent /> }
			bodyClassName={ styles.modal_box }
			closeOnMaskClick={true}
			onClose={handCancel}
		/>
    );
}

export default CheckModal;
