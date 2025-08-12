import { FC } from 'react';
import { Iconify } from "@/components/icon"
import { useTranslation } from 'react-i18next';
import styles from '@/pages/UserCenter/overview/index.module.scss';

type RealnessStatus = 0 | 1 | 2 | 3;

interface StatusInfo {
  icon: string;
  className: string;
  text: string;
}

// 身份认证
const statusMap = (t: (key: string) => string): Record<RealnessStatus, StatusInfo> => ({
  0: {
    icon: 'lets-icons:close-ring',
    className: styles.error_icon,
    text: t('overview.reject'), // 已驳回
  },
  1: {
    icon: 'mingcute:safety-certificate-line',
    className: styles.success_icon,
    text: t('overview.auth'), //已认证
  },
  2: {
    icon: 'mingcute:safe-alert-line',
    className: styles.default_icon,
    text: t('overview.unAuth'), // 未认证
  },
  3: {
    icon: 'mingcute:time-line',
    className: styles.warning_color,
    text: t('overview.audit'), // 审核中
  },
});

interface Props {
  realnessStatus?: number;
  textClassName?: string;
  iconClassName?: string;
}

const IdentifyStatus: FC<Props> = ({ realnessStatus = 2, textClassName, iconClassName }) => {
  const { t } = useTranslation('userCenter');
  const map = statusMap(t);

  const { icon, className, text } = map[realnessStatus as RealnessStatus];

  return (
    <div className={`${styles.otherRight} ml-[10px] flex items-center`}>
      <Iconify icon={icon} className={`${className} mr-1 text-[20px] ${iconClassName}`} />
      <span className={`${realnessStatus === 2 ? 'tip-color' : ''} ${textClassName} text-[14px]`}>{text}</span>
    </div>
  );
};

export default IdentifyStatus;
