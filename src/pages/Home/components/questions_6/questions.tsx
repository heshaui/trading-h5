
import React from 'react';
import styles from '../styles/questions.module.scss';
// import { Collapse } from "antd";
// import type { CollapseProps } from 'antd';
// import type { CSSProperties } from 'react';
// import { useTranslation } from 'next-i18next';
// import { Iconify } from '@/components/icon';
export default function Questions() {
    // const { t } = useTranslation(['home']);

    // const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    //     {
    //         key: '1',
    //         label: t('questionsTip1'), //'IMBIT都提供哪些产品'
    //         children: <p>{t('text1')}</p>,
    //         style: panelStyle,
    //         showArrow: false, //隐藏组件的箭头图标
    //         extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />
    //     },
    //     {
    //         key: '2',
    //         label: t('questionsTip2'),//'如何通过IMBIT平台购买比特币？',
    //         children: <p>{t('text2')}</p>,
    //         style: panelStyle,
    //         showArrow: false,
    //         extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />
    //     },
    //     {
    //         key: '3',
    //         label: t('questionsTip3'),//'美国公民可以使用IMBIT吗？',
    //         children: <p>{t('text3')}</p>,
    //         style: panelStyle,
    //         showArrow: false,
    //         extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />

    //     },
    //     {
    //         key: '4',
    //         label: t('questionsTip4'),//'什么是数字货币？',
    //         children: <p>{t('text4')}</p>,
    //         style: panelStyle,
    //         showArrow: false,
    //         extra: <Iconify icon="formkit:add" size={26} className={styles.icon_color3} />

    //     },
    // ];
    const panelStyle: React.CSSProperties = {
        marginBottom: 12,
        background: "var( --btnbgcolor2)",
        borderRadius: "8px",
    };

    return (<></>
        // <div className={`${styles.questions_page}`}>
        //     <div className={`${styles.questions_main} flex-column flex-ai-center flex-jc-center`}>
        //         <h2 className={`${styles.questions_main_title1}`}>{t('questionsTitle')}</h2>
        //         <div className={`${styles.main_questions_box}`}>
        //             <Collapse
        //                 className={`${styles.main_questions} custom-collapse`}
        //                 bordered={false}
        //                 // defaultActiveKey={['1']}
        //                 // expandIcon={({ isActive }) => <span>  </span>}/
        //                 style={{ background: "var( --homeground2)", color: "var(--hometext3)" }}
        //                 // style={{ background: token.colorBgContainer }}
        //                 items={getItems(panelStyle)}
        //                 size="large"
        //             />

        //             {/* <div className='main-questions-list flex flex-ai-center flex-jc-between'>
        //             <h3>IMBIT都提供哪些产品</h3>
        //             <Iconify icon="formkit:add"  size={26} className={styles.icon_color}/>
        //         </div>
        //         <div className='main-questions-list flex flex-ai-center flex-jc-between'>
        //             <h3>如何通过IMBIT平台购买比特币？</h3>
        //             <Iconify icon="formkit:add"  size={26} className={styles.icon_color}/>
        //         </div>
        //         <div className='main-questions-list flex flex-ai-center flex-jc-between'>
        //             <h3>美国公民可以使用IMBIT吗？</h3>
        //             <Iconify icon="formkit:add"  size={26} className={styles.icon_color}/>
        //         </div>
        //         <div className='main-questions-list flex flex-ai-center flex-jc-between'>
        //             <h3>什么是数字货币？</h3>
        //             <Iconify icon="formkit:add"  size={26} className={styles.icon_color}/>
        //         </div> */}
        //         </div>
        //     </div>
        // </div>
    );
}
