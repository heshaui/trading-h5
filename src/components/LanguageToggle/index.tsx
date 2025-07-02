import React from 'react';
import { Selector } from 'antd-mobile';
import { useLanguage } from '../../hooks/useLanguage';
import './index.scss';

const LanguageToggle: React.FC = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const options = [
    {
      label: t('language.zh'),
      value: 'zh',
    },
    {
      label: t('language.en'),
      value: 'en',
    },
  ];

  return (
    <div className="language-toggle">
      <span className="language-toggle-label">语言 / Language</span>
      <Selector
        options={options}
        value={[currentLanguage]}
        onChange={(value) => {
          if (value[0]) {
            changeLanguage(value[0]);
          }
        }}
        columns={2}
        className="language-selector"
      />
    </div>
  );
};

export default LanguageToggle; 