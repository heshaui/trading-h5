import React, { useState } from 'react';
import { Upload } from 'antd';
import dayjs from 'dayjs';
import { Toast, Image } from 'antd-mobile'
import type { UploadFile, UploadProps } from 'antd';
import type { CSSProperties } from "react";

import { Iconify } from "@/components/icon/index";
import { fileImg } from "@/services/open";
import { postSaveIdentity } from "@/services/userCenter";
import { encryptData } from '@/utils/encrypt'
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

import frontageLightImg from '@/assets/images/userCenter/identity/frontage_day1.png';
import frontageDarkImg from '@/assets/images/userCenter/identity/frontage_night1.png';
import backLightImg from '@/assets/images/userCenter/identity/back_day2.png';
import backDarkImg from '@/assets/images/userCenter/identity/back_night2.png';
import handcardLightImg from '@/assets/images/userCenter/identity/handcard_day3.png';
import handcardDarkImg from '@/assets/images/userCenter/identity/handcard_night3.png';

interface EventType {
    surname: string;
    firstName: string;
    areaCode: string;
    cardType: string;
    cardCode: string;
    birthday: string;
    frontUrl?: string;
    backUrl?: string;
    selfieUrl?: string;
}

interface UploadCardProps {
    onNext: () => void;
    onPrev: () => void;
    userInfo: EventType;
}
const uploadBgcStyle: CSSProperties = {
    backgroundColor: "var(--background)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: 'center',
    height: "235px",
    width: "360px"
};

const UploadCard: React.FC<UploadCardProps> = ({ onNext, onPrev, userInfo }) => {
    const { t } = useLanguage(['userCenter']);
    const [frontFileLoading, setFrontFileLoading] = useState<boolean>(false);
    const [frontFileUrl, setFrontFileUrl] = useState<string>('');
    const [backFileLoading, setBackFileLoading] = useState<boolean>(false);
    const [backFileUrl, setBackFileUrl] = useState<string>('');
    const [selfieFileLoading, setSelfieFileLoading] = useState<boolean>(false);
    const [selfieFileUrl, setSelfieFileUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false); // 提交loading
    const { isLight } = useTheme(); // 使用 hook

    // Check if all required files are uploaded
    const checkFilesComplete = () => {
        return !!frontFileUrl && !!backFileUrl && !!selfieFileUrl;
    };


    const beforeUpload = (file: File) => {
        const allowedTypes = ['image/jpg','image/jpeg', 'image/png', 'image/gif']
        const isPNG = allowedTypes.includes(file.type);
        if (!isPNG) {
            Toast.show({ icon: 'fail', content: `${file.name} ${t('identity.upload.error1')}` });
        }
        const isLt8M = file.size / 1024 / 1024 < 8;
        if (!isLt8M) {
            Toast.show({ icon: 'fail', content: t('identity.upload.error2') });
            return false;
        }
        return isPNG && isLt8M;
    };

    const onSubmit = async () => {
        if(isLoading) return
        if (checkFilesComplete()) {
            const isNext = checkFilesComplete()
            if (!isNext) return Toast.show({ icon: 'fail', content: t('identity.upload.error3') });
            try {
                const params = {
                    ...userInfo,
                    birthday: dayjs(userInfo.birthday).valueOf() + '',
                    frontUrl: frontFileUrl,
                    backUrl: backFileUrl,
                    selfieUrl: selfieFileUrl,
                    platformType:'H5'
                }

                const encrypt = await encryptData(params)
                console.log(params,111,encrypt,222);
                
                const res = await postSaveIdentity(encrypt)
                setIsLoading(true)
                if (res.code === '0') {
                    Toast.show({ icon: 'success', content: t('identity.upload.success') });
                    sessionStorage.removeItem('idvFormData');
                    onNext();
                    localStorage.setItem('identity_authStatus','3')
                    
                } else {
                    Toast.show({ icon: 'fail', content: res.message });
                }
            } catch (error) {
                Toast.show({ icon: 'fail', content: String(error) });
            } finally {
                setIsLoading(false)
            }

        } else {
            Toast.show({ icon: 'fail', content: t('identity.upload.error3') });
        }
    };

    const propsFront: UploadProps = {
        // 自定义上传
        customRequest: async ({ file, onSuccess, onError }) => {
            // const uploadResult = await fileImg(file as File);
            // const uploadResult = await uploadHandler(file as File);
            setFrontFileLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                // 检查文件类型
                if (!(file instanceof File)) {
                    Toast.show({ icon: 'fail', content: t('identity.upload.error4') });
                    return;
                }
                const res = await fileImg(file);
                if (res.code === '0') {
                    // onSuccess(res.data);
                    console.log(res.data);
                    setFrontFileUrl(res.data.data);
                } else {
                    Toast.show({ icon: 'fail', content: res.message });
                }

            } catch (error) {
                Toast.show({ icon: 'fail', content: String(error) });
            } finally {
                setFrontFileLoading(false);
            }
        },
    };
    const propsBack: UploadProps = {
        // 自定义上传
        customRequest: async ({ file, onSuccess, onError }) => {
            // const uploadResult = await fileImg(file as File);
            // const uploadResult = await uploadHandler(file as File);
            setBackFileLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                // 检查文件类型
                if (!(file instanceof File)) {
                    Toast.show({ icon: 'fail', content: t('identity.upload.error4') });
                    return;
                }
                const res = await fileImg(file);
                if (res.code === '0') {
                    // onSuccess(res.data);
                    // console.log(res.data);
                    setBackFileUrl(res.data.data);

                } else {
                    Toast.show({ icon: 'fail', content: res.message });
                }

            } catch (error) {
                Toast.show({ icon: 'fail', content: String(error) });
            } finally {
                setBackFileLoading(false);
            }
        },
    };
    const propsSelfie: UploadProps = {
        // 自定义上传
        customRequest: async ({ file, onSuccess, onError }) => {
            // const uploadResult = await fileImg(file as File);
            // const uploadResult = await uploadHandler(file as File);
            setSelfieFileLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                // 检查文件类型
                if (!(file instanceof File)) {
                    Toast.show({ icon: 'fail', content: t('identity.upload.error4') });
                    return;
                }
                const res = await fileImg(file);
                if (res.code === '0') {
                    // onSuccess(res.data);
                    console.log(res.data);
                    setSelfieFileUrl(res.data.data);

                } else {
                    Toast.show({ icon: 'fail', content: res.message });
                }

            } catch (error) {
                Toast.show({ icon: 'fail', content: String(error) });
            } finally {
                setSelfieFileLoading(false);
            }
        },
    };
    return (
		<div>
			<h3 className="text-[24px] leading-[34px] font-medium mb-[30px]">
				{/* 上传文件 */}
				{ t('identity.upload.title') }
			</h3>
			<div className="flex justify-center relative mb-[40px]">
				<Image 
					src={frontFileUrl ? frontFileUrl : isLight ? frontageLightImg : frontageDarkImg}
					className="w-[324px] h-[211px] rounded-[10px]"
				/>
				<Upload
					name="frontImage"
					showUploadList={false}
					beforeUpload={beforeUpload}
					{...propsFront}
					maxCount={1}
					className="w-full h-full absolute top-0 flex justify-center items-center"
					openFileDialogOnClick={!frontFileLoading}
				>
					{/* {!frontFileUrl && ( */}
					<div className="w-[160px] flex flex-col">
						<div className="w-full h-[48px] border border-[var(--border-color4)] flex justify-center items-center tip-color">
							<Iconify icon={frontFileLoading ? "eos-icons:bubble-loading" : "solar:upload-linear"} className="text-[24px]" />
							<span className={`font-14 font-w-400 ml-[6px]`}>
								{/* 上传文件 */}
								{t('identity.upload.uploadFile')}
							</span>
						</div>
						<div className={`font-16 font-w-500 mt-[6px] leading-[22px]`}>
							{/* 证件正面 */}
							{t('identity.upload.frontFile')}
						</div>
					</div>
				</Upload>
			</div>
			<div className="flex justify-center relative mb-[40px]">
				<Image 
					src={backFileUrl ? backFileUrl : isLight ? backLightImg : backDarkImg}
					className="w-[324px] h-[211px] rounded-[10px]"
				/>
				<Upload
					showUploadList={false}
					beforeUpload={beforeUpload}
					maxCount={1}
					{...propsBack}
					className="w-full h-full absolute top-0 flex justify-center items-center"
					openFileDialogOnClick={!backFileLoading}
				>
					{/* {!backFileUrl && ( */}
					<div className="w-[160px] flex flex-col">
						<div className="w-full h-[48px] border border-[var(--border-color4)] flex justify-center items-center tip-color">
							<Iconify icon={backFileLoading ? "eos-icons:bubble-loading" : "solar:upload-linear"} className="text-[24px]" />
							<p className={`font-14 font-w-400 ml-[6px]`}>
								{/* 上传文件 */}
								{t('identity.upload.uploadFile')}
							</p>

						</div>
						<div className={`font-16 font-w-500 mt-[6px] leading-[22px]`}>
							{/* 证件反面 */}
							{t('identity.upload.backFile')}
						</div>
					</div>
					{/* )} */}
				</Upload>
			</div>
			<div className="flex justify-center relative mb-[30px]">
				<Image 
					src={selfieFileUrl ? selfieFileUrl : isLight ? handcardLightImg : handcardDarkImg}
					className="w-[324px] h-[211px] rounded-[10px]"
				/>
				<Upload
					name="selfieImage"
					showUploadList={false}
					beforeUpload={beforeUpload}
					maxCount={1}
					{...propsSelfie}
					className="w-full h-full absolute top-0 flex justify-center items-center"
					openFileDialogOnClick={!selfieFileLoading}
				>
					{/* {!selfieFileUrl && ( */}
					<div className="w-[160px] flex flex-col">
						<div className="w-full h-[48px] border border-[var(--border-color4)] flex justify-center items-center">
							<Iconify icon={selfieFileLoading ? "eos-icons:bubble-loading" : "solar:upload-linear"} className="text-[24px]" />
							<p className={`font-14 font-w-400 ml-[6px]`}>
								{/* 上传文件 */}
								{t('identity.upload.uploadFile')}
							</p>

						</div>
						<div className={`font-16 font-w-500 mt-[6px] leading-[22px]`}>
							{/* 手持证件照 */}
							{t('identity.upload.selfieFile')}
						</div>
					</div>
					{/* )} */}
				</Upload>
			</div>
			<ul className={`font-12 font-w-400 tip-color`}>
                <li className="flex items-center mb-[7px]">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`error_icon mr-2 text-[15px]`} />
                    {/* 支持小于8M的JPG、JPEG或PNG格式图片。 */}
                    {t('identity.upload.tip1')}
                </li>
                <li className="flex items-center mb-[7px]">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`error_icon mr-2 text-[15px]`} />
                    {/* 证件照片要求清晰，不允许任何修改和遮挡，必须能看清人像、证件号和姓名。 */}
                    {t('identity.upload.tip2')}
                </li>
                <li className="flex items-center">
                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`error_icon mr-2 text-[15px]`} />
                    {/* 照片需免冠，建议未化妆，手持证件人的五官清晰可鉴，完整漏出手臂。 */}
                    {t('identity.upload.tip3')}
                </li>
            </ul>
			<div className="flex justify-between mt-10 gap-x-[10px]">
                <button
                    className="shrink-0 w-[115px] h-[50px] rounded-[25px] border border-solid border-[var(--border-color4)] flex justify-center items-center text-[16px] font-medium"
                    onClick={onPrev}
                >
                    {/* 上一步 */}
                    {t('identity.upload.prev')}
                </button>
                {!checkFilesComplete() ? (
                    <button
                        className="flex-1 bg-[var(--background17)] rounded-[25px] w-full h-[50px] flex justify-center items-center tip-color text-[16px] font-medium"
                        disabled

                    >
                        {/* 下一步 */}
                        {t('identity.upload.next')}
                    </button>
                ) : (
                    <button
                        type='submit'
                        className="flex-1 h-[50px] flex justify-center items-center bg-[var(--theme-color)] text-[#fff] text-[16px] font-medium"
                        onClick={onSubmit}
                    >
                        {isLoading && <Iconify icon="eos-icons:bubble-loading" className="text-[20px] mr-4" />}
                        {/* 下一步 */}
                        <span>{t('identity.upload.next')}</span>
                    </button>
                )}
            </div>
		</div>
    );
}

export default UploadCard;