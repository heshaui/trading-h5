import React, { useState, useEffect } from 'react';
import { Toast, Input } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { getCountryCode } from "@/services/open";
import dayjs, { Dayjs } from 'dayjs';
import SelectPop from '@/components/SelectPop';
import DateTimePop from '@/components/DateTimePop';

interface InfoProps {
    onNext: (event: EventType) => void;
}
interface ICountryData {
    id: number;
    areaCode: string;
    iconUrl: string;
    countryName: string;
    status: number;
	value: string;
	label: string;
}
interface EventType {
    surname: string;
    firstName: string;
    areaCode: string;
    cardType: string;
    cardCode: string;
    birthday: string;
}

interface OptionsType {
	label: string;
	value: string;
}

const BasicInfo: React.FC = () => {
    const { t } = useLanguage(['userCenter', 'common']);
	const [countryData, setCountryData] = useState<ICountryData[]>([]);
    const [isNext, setIsNext] = useState(false);
	const [visible, setVisible] = useState(false);
	const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [form, setForm] = useState<EventType>({
		surname: '',
		firstName: '',
		areaCode: '',
		cardType: '',
		cardCode: '',
		birthday: '',
	})

	const updateField = (key: string, value: string|number) => {
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const cardTypeSeelect: { label: string, value: string }[] = [
        {
            label: t('identity.certified.idTypes.idCard'), // 居民身份证
            value: '1'
        },
        {
            label: t('identity.certified.idTypes.passport'), // 普通护照
            value: '2'
        },
        {
            label: t('identity.certified.idTypes.driverLicense'), // 驾驶证
            value: '3'
        }
    ]

	const getCountryCodeData = async () => {
        try {

            const res = await getCountryCode();
            if (res.code === '0') {
                const info = res.data.map((item: ICountryData) => {
                    return {
                        ...item,
                        label: item.countryName,
                        value: item.areaCode
                    }
                }).filter((item: any) => item.status === 1);
                setCountryData(info);
            }

        } catch (error) {
			Toast.show({
				icon: 'fail',
				content: String(error)
			});
        }
    }

	const getLabel = (value: string, type: string = 'area') => {
		const data = type === 'area' ? countryData : cardTypeSeelect;
		const currentData = data.find((item: ICountryData | OptionsType) => item.value === value)
		return currentData?.label
	}

	const onSubmit = () => {

	}

	useEffect(() => {
		getCountryCodeData();
	}, [])

    return (
		<div>
			<h4 className="text-[18px] leading-[25px] font-medium">
				{/* 证件验证 */}
				{t('identity.idv.title')}
			</h4>
			<p className="text-[14px] leading-[20px] tip-color mt-[10px] mb-[30px]">
				{/* 请务必确保输入信息与证件信息一致 */}
				{t('identity.idv.inputTip')}
			</p>
			<div className="mb-5">
				<div className="text-[16px] leading-[22px] mb-[10px]">
					{t('identity.idv.country.title')}
				</div>
				<SelectPop 
					value={form.areaCode}
					options={countryData} 
					title={t('identity.idv.country.placeholder')}
					onChange={(value) => updateField('areaCode', value)}
					renderBtn={(open) => (
						<button 
							className="border border-solid input-border rounded-lg w-full h-[50px] px-[13px] text-[14px] flex justify-between items-center"
							onClick={open}
						>
							{
								form.areaCode ? 
								<span>{getLabel(form.areaCode)}</span> : 
								<span className="placeholder-color">{t('identity.idv.country.placeholder')}</span>
							}
							<Iconify icon="icon-park-outline:down" className="text-[24px]"/>
						</button>
					)}
				/>
			</div>
			<div className="mb-5">
				<div className="text-[16px] leading-[22px] mb-[10px]">
					{/* 证件类型 */}
                    {t('identity.idv.idType.title')}
				</div>
				<SelectPop 
					value={form.cardType}
					options={cardTypeSeelect}
					title={t('identity.idv.idType.placeholder')} 
					onChange={(value) => updateField('cardType', value)}
					renderBtn={(open) => (
						<button 
							className="border border-solid input-border rounded-lg w-full h-[50px] px-[13px] text-[14px] flex justify-between items-center"
							onClick={open}
						>
							{
								form.cardType ? 
								<span>{getLabel(form.cardType, 'card')}</span> : 
								<span className="placeholder-color">{t('identity.idv.idType.placeholder')}</span>
							}
							<Iconify icon="icon-park-outline:down" className="text-[24px]"/>
						</button>
					)}
				/>
			</div>
			<div className="mb-5">
				<div className="text-[16px] leading-[22px] mb-[10px]">
					{/* 证件号码 */}
                    {t('identity.idv.idNumber.title')}
				</div>
				<Input 
					value={form.cardCode}
					placeholder={t('identity.idv.idNumber.placeholder')}
					className="w-full h-[50px]"
					maxLength={50}
					onChange={(value) => {
						const filteredValue = value.replace(/[\u4e00-\u9fa5]/g, '');
						if (value !== filteredValue) {
							// 如果有中文字符被过滤掉，则更新输入框的值
							updateField('cardCode', filteredValue);
						}
					}}
				/>
			</div>
			<div className="mb-5 flex justify-between gap-x-[13px]">
				<div>
					<div className="text-[16px] leading-[22px] mb-[10px]">
						{/* 姓 */}
                        {t('identity.idv.name.surname')}
					</div>
					<Input 
						value={form.surname}
						placeholder={t('identity.idv.name.placeholder')}
						className="w-full h-[50px]"
						onChange={(value) => updateField('surname', value)}
					/>
				</div>
				<div>
					<div className="text-[16px] leading-[22px] mb-[10px]">
						{/* 名 */}
                        {t('identity.idv.name.firstName')}
					</div>
					<Input 
						value={form.firstName}
						placeholder={t('identity.idv.idNumber.placeholder')}
						className="w-full h-[50px]"
						onChange={(value) => updateField('cardCode', value)}
					/>
				</div>
			</div>
			<div>
				<div className="text-[16px] leading-[22px] mb-[10px]">
					{/* 出生日期 */}
                    {t('identity.idv.birthday.title')}
				</div>
				<button 
                    className="border border-solid input-border rounded-lg w-full h-[50px] flex justify-between items-center px-[11px] text-[14px]"
                    onClick={() => setVisible(true)}
                >
                    {
                        dateRange[0] ?
                        <span>{ dateRange[0].format('YYYY-MM-DD') }</span>
                        :
                        <span className="placeholder-color"> {t('identity.idv.birthday.placeholder')} </span>
                    }
                    <Iconify icon="cuida:calendar-outline" className="text-[20px]" />
                </button>
			</div>
			{!isNext ? (
				<button
					className={`${styles.btn_style} disabled_btn2 cursor-not-allowed`}
					disabled
				>
					{/* 下一步 */}
					{t('identity.idv.button.next')}
				</button>
			) : (
				<button
					type='submit'
					className={`default_btn ${styles.btn_style} flex-1`}
					onClick={ onSubmit }
				>
					{/* 下一步 */}
					{t('identity.idv.button.next')}
				</button>
			)}
			<DateTimePop
				popupVisible={visible}
				handlePopupClose={() => setVisible(false)}
				title={ t('usersetting.birthday.selectDate') }
				value={dateRange}
				onChange={setDateRange}
				minDate={dayjs(1800)}
				maxDate={dayjs()}
				type="date"
			/>
		</div>
    );
};

export default BasicInfo;