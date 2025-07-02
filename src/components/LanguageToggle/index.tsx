import React, { useState } from 'react';
import { Selector, SpinLoading, Button, Popover, List, Image } from 'antd-mobile';
import { useLanguage } from '../../hooks/useLanguage';
import { supportedLanguages, languageNames } from '../../utils/languageLoader';
import iconDown from '../assets/icons/public/icon_earth_line.png';
import './index.css';
import { Action } from 'antd-mobile/es/components/popover'
import { DownOutline } from 'antd-mobile-icons';

const LanguageToggle: React.FC = () => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const [visible, setVisible] = useState(false);

  const handleLanguageSelect = (lang: string) => {
    if (lang !== currentLanguage) {
      changeLanguage(lang);
      setVisible(false);
    }
  };  
  const popupContent = (lang:string)=>{
    return <Button
          onClick={() => handleLanguageSelect(lang)}
          style={{
            width:'100%',
            backgroundColor: lang === currentLanguage ? '#e6f4ff' : 'transparent',
            border:'none'
          }}
        >
          {languageNames[lang as keyof typeof languageNames]}
        </Button>
  };

  const options = supportedLanguages.map(lang => ({
    label: languageNames[lang as keyof typeof languageNames],
    value: lang,
  }));
  const actions: Action[] =supportedLanguages.map(lang => ({
    key: lang,
    text: popupContent(lang),
    }));
  
  const handleLanguageChange = async (value: string[]) => {
    if (value[0] && value[0] !== currentLanguage) {
      await changeLanguage(value[0]);
    }
  };


  // const popupContent = (
  //   <List>
  //     {actions.map((option) => (
  //       <List.Item
  //         key={option.key}
  //         onClick={() => handleLanguageSelect(option.key as string)}
  //         style={{
  //           backgroundColor: option.key === currentLanguage ? '#e6f4ff' : 'transparent'
  //         }}
  //       >
  //         {option.text}
  //       </List.Item>
  //     ))}
  //   </List>
  // );

  return (
    <div className="language-toggle">
      <span className="language-toggle-label">
        语言 / Language
        {isLoading && <SpinLoading style={{ marginLeft: 8 }} />}
      </span>

      {/* 使用 Selector 组件（推荐） */}
      {/* <Selector
        options={options}
        value={[currentLanguage]}
        onChange={handleLanguageChange}
        columns={3}
        className="language-selector"
        disabled={isLoading}
      /> */}
      <Popover.Menu
        actions={actions}
        visible={visible}
        onVisibleChange={setVisible}
        trigger="click"
        placement="bottom"
        maxCount={6}
      >
          <button
          className='button-language font-16'
          >
            <div className='flex-x align-center flex-1'>
              <Image
              src={iconDown}
              alt=""
              width={24}
              height={24}
              className='mr-3'
            />
            {languageNames[currentLanguage as keyof typeof languageNames]}
            </div>
            
            <DownOutline fontSize={18}/>
            </button>
      </Popover.Menu>
    </div>
  );
};

export default LanguageToggle; 