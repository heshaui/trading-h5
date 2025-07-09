import React, { useState, useMemo } from 'react';
import { Button, Popover, Popup, Image, Tabs, SearchBar } from 'antd-mobile';
import { useLanguage } from '../../hooks/useLanguage';
import { supportedLanguages, languageNames } from '../../utils/languageLoader';
import iconDown from '../../assets/icons/public/icon_earth_line.png';
import iconDownDark from '../../assets/icons/public/icon_earth_dark.png';
import styles from './index.module.scss';
import { Action } from 'antd-mobile/es/components/popover'
import { DownOutline ,CloseOutline} from 'antd-mobile-icons';
import appStore from '@/store';
import { useThemeMode } from '@/hooks/useThemeMode';
import { CustomTab } from '@/components/CustomCom';
import { NoData } from '@/components/noData';
interface ListItem {
  key: string;
  title: string;
  value: string;
  onClick?: () => void;
}
type Props = {
  isMenu?: boolean;
  open?: boolean;
  onClose?: () => void;
}
const LanguageToggle: React.FC<Props> = ({ isMenu = false, open = false, onClose }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const { isDayMode } = useThemeMode();
  const rateList = appStore.getRateData() || appStore.rateData;
  const langList = appStore.getLangList() || appStore.languageList;
  const [langFilterValue, setLangFilterValue] = useState<string>('')
  const [rateFilterValue, setRateFilterValue] = useState<string>('')

  const handleLanguageSelect = (lang: string) => {
    if (lang !== currentLanguage) {
      changeLanguage(lang);
      setVisible(false);
      onClose?.();
    }
  };

  const handleRateSelect = (rateKey: string) => {
    appStore.setRateKey(rateKey);
    onClose?.();
  };
  const popupContent = (lang: string) => {
    return <Button
      onClick={() => handleLanguageSelect(lang)}
      style={{
        width: '100%',
        backgroundColor: lang === currentLanguage ? '#e6f4ff' : 'transparent',
        border: 'none'
      }}
    >
      {languageNames[lang as keyof typeof languageNames]}
    </Button>
  };

  const actions: Action[] = supportedLanguages.map(lang => ({
    key: lang,
    text: popupContent(lang),
  }));
  const filteredLang = useMemo(() => {
    return langList.map((item) => {
      // 确保使用正确的语言代码作为 value
      const languageCode = item.shortKey || item.langEncode;
      
      return {
        key: item.shortKey || item.id,
        id: item.id,
        status: item.status,
        title: item.span,
        value: languageCode, // 使用处理后的语言代码
        onClick: () => {
          handleLanguageSelect(languageCode)
        }
      }
    }).filter((item) => {
      // 如果筛选值为空，返回全部
      if (!langFilterValue || langFilterValue.trim() === '') {
        return true;
      }
      // 否则进行模糊搜索（不区分大小写）
      return item.title.toLowerCase().includes(langFilterValue.toLowerCase()) ||
        item.value.toLowerCase().includes(langFilterValue.toLowerCase());
    })
  }, [langList, langFilterValue, currentLanguage])

  const filteredRate = useMemo(() => {
    return rateList.map((item) => {
      return {
        key: item.key || item.id,
        id: item.id,
        status: item.status,
        title: item.span,
        value: item.key,
        onClick: () => {
          handleRateSelect(item.key)
        }
      }
    }).filter((item) => {
      // 如果筛选值为空，返回全部
      if (!rateFilterValue || rateFilterValue.trim() === '') {
        return true;
      }
      // 否则进行模糊搜索（不区分大小写）
      return item.title.toLowerCase().includes(rateFilterValue.toLowerCase()) ||
        item.value.toLowerCase().includes(rateFilterValue.toLowerCase());
    })
  }, [rateList, rateFilterValue])

  const ListComponent = (list: ListItem[], currentValue?: string) => {
    if (list.length === 0) {
      return <NoData className={`mt-5`} />
    }

    return list.map((item) => {
      // 简化活跃状态判断：只进行直接比较
      const isActive = currentValue === item.value;

      return (
        <li key={item.value || item.key}
          className={`${styles.listItem}  ${isActive ? styles.active : ''}`}>
          <button
            className={`${styles.listButton} ${styles.title_color} ${isActive ? 'font-w-500' : 'font-w-400'} font-16  w-full text-left`}
            onClick={item.onClick} >

            {item.title}
          </button>
        </li>
      )
    })
  }
  const tabsItems = [
    {
      title: t('common.langAndRate.lang'),//'语言',
      key: 'language',
      children: (
        <div className={styles.tabContent}>
          <div className={styles.searchContainer}>
            <SearchBar
              placeholder={t('common.langAndRate.search')}
              value={langFilterValue}
              onChange={setLangFilterValue}
              className={styles.searchBar}
            />
          </div>
          <div className={`${styles.listContainer} mt-4`}>
            <ul className={styles.list}>
              {ListComponent(filteredLang, currentLanguage)}
            </ul>
          </div>
        </div>
      )
    },
    {
      title: t('common.langAndRate.rate'),//'汇率',
      key: 'rate',
      children: (
        <div className={styles.tabContent}>
          <div className={styles.searchContainer}>
            <SearchBar
              placeholder={t('common.langAndRate.search')}
              value={rateFilterValue}
              onChange={setRateFilterValue}
              className={styles.searchBar}
            />
          </div>
          <div className={`${styles.listContainer} mt-4`}>
            <ul className={styles.list}>
              {ListComponent(filteredRate, appStore.getRateKey())}
            </ul>
          </div>
        </div>
      )
    }
  ]


  return (
    <div>
      {!isMenu ? <Popover.Menu
        actions={actions}
        visible={visible}
        onVisibleChange={setVisible}
        trigger="click"
        placement="bottom"
        maxCount={6}
      >
        <button
          className={`${styles.buttonLanguage} font-16`}
        >
          <div className='flex-x align-center flex-1 font-w-500'>
            <Image
              src={isDayMode ? iconDownDark : iconDown}
              alt=""
              width={24}
              height={24}
              className='mr-3'
            />
            {languageNames[currentLanguage as keyof typeof languageNames]}
          </div>

          <DownOutline fontSize={18} color="var(--text-color5)" />
        </button>
      </Popover.Menu>
        : <>
          <Popup
            visible={open}
            onClose={() => {
              onClose?.();
            }}
            // destroyOnClose
            closeOnMaskClick
            bodyStyle={{ height: '70vh' }}
            bodyClassName={styles.popContainer}
          >
            <div className={`${styles.title_color} `}>
              <div className='relative'>
                <div className={`${styles.pop_header} flex-x algin-center justify-end`}>
                  <button onClick={() => {
                    onClose?.();
                  }}
                    className={styles.tip_color}
                  >
                    <CloseOutline fontSize={24} />
                  </button>
                </div>
                <CustomTab
                  tabsItems={tabsItems}
                  direction='ltr'
                  stretch={false}
                  activeLineMode='fixed'
                  className={`mt-4`}
                />
              </div>

            </div>
          </Popup>
        </>}

    </div>
  );
};

export default LanguageToggle; 