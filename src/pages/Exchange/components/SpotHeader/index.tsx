import React from 'react';
import { useLanguage } from '@/hooks';
import { Iconify } from '@/components/icon';

const SpotHeader: React.FC = () => {
    const { t } = useLanguage('')
    return (
        <div className="px-4 py-3">
            <div className="flex justify-between items-center">
                <button>
                    <span>Bsdt/uuuu</span>
                    <Iconify icon="eva:arrow-down-fill" className="text-[16px]" />
                </button>
            </div>
        </div>
    )
}

export default SpotHeader;