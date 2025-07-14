import React, { useState, useEffect } from 'react';
import { Toast, Input } from 'antd-mobile';
import { useLanguage } from '@/hooks/useLanguage';
import { Iconify } from '@/components/icon';
import { getCountryCode } from "@/services/open";
import SelectPop from '@/components/SelectPop';

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
    const { t } = useLanguage('userCenter');
	const [countryData, setCountryData] = useState<ICountryData[]>([]);
    const [isNext, setIsNext] = useState(false);
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

	useEffect(() => {
		getCountryCodeData();
	}, [])

    return (
		<div>
			<div>
				<div>{t('identity.idv.country.title')}</div>
				<SelectPop 
					value={form.areaCode}
					options={countryData} 
					placeholder={t('identity.idv.country.placeholder')}
					onChange={(value) => updateField('areaCode', value)}
				/>
			</div>
			<div>
				<div>
					{/* 证件类型 */}
                    {t('identity.idv.idType.title')}
				</div>
				<SelectPop 
					value={form.cardType}
					options={cardTypeSeelect} 
					onChange={(value) => updateField('cardType', value)}
				/>
			</div>
			<div>
				<div>
					{/* 证件号码 */}
                    {t('identity.idv.idNumber.title')}
				</div>
				<Input 
					value={form.cardCode}
					onChange={(value) => updateField('cardCode', value)}
				/>
			</div>
		</div>
    );
};

export default BasicInfo;