import { useEffect, useState, useCallback } from "react";
import {
	getCustomFooter,
	getLogo,
	getSocialMediaList,
	getSelectFooter,
  } from "@/services/footer";
  import { useTranslation } from "react-i18next";
  import appStore from "@/store";
 import {
	FooterListProps,
	FooterProps,
  } from "@/type/types";
import { transformDOMPurify } from "@/utils/transformDOMPurify";

  // 添加社交媒体项的接口
interface SocialMediaItem {
	id: number;
	nameText: string;
	imgUrl: string;
	linkUrl: string;
	status: number;
	createTime: number;
	updateTime: number;
	tenantId: string;
  }
  interface FooterItem {
	bottomName: string;
	children?: FooterItem[];
  }  
const Footer = () => {
	const { t, i18n } = useTranslation("common");
  const langKey = appStore.getLang() || "en_US";
  const allConfig = appStore.getKvConfigAll();
  const footerConfig = appStore.getKvConfig("footer_setting");
  const languageList = appStore.getLangList();
  // 获取footer自定义数据
  const [customFooter, setCustomFooter] = useState<FooterProps[]>([]);
  const [selectFooter, setSelectFooter] = useState<string | null>(null)
  // 添加社交媒体列表状态
  const [socialMediaList, setSocialMediaList] = useState<SocialMediaItem[]>([]);
	  // 获取社交媒体列表
	  const fetchSocialMedia = async () => {
		try {
		  const response = await getSocialMediaList();
		  if (response?.code === "0" && response.data) {
			setSocialMediaList(response.data);
		  }
		} catch (error) {
		  console.error("获取社交媒体列表失败:", error);
		}
	  };

  // 获取 footer 设置
  const fetchFooterSetting = async () => {
    try {
      if (footerConfig?.status === "1" || footerConfig?.toString() === "1") {
        // kv为1
        getSelectFooterJson();
      } else {
        // json
        getCustomFooterJson();
      }
    } catch (error) {
      console.error("获取footer设置失败2:", error);
    }
  };
  const getCustomFooterJson = async () => {
    try {
      const res = await getCustomFooter({ lang: langKey });
      // console.log(res.data, 111);

      if (res.code === "0" && res.data) {
        const filteredData = filterFooterList(res.data);
        setCustomFooter(filteredData);
      }
    } catch (error) {
      console.error("获取footer设置失败0:", error);
    }
  };
  const getSelectFooterJson = async () => {
    try {
      const res = await getSelectFooter({ lang: langKey });

      if (res?.code === "0" && res.data) {
        const htmlString = transformDOMPurify(res.data);
        // 设置净化后的 HTML
        setSelectFooter(htmlString);
        // console.log('转换后的 HTML:', htmlString);
      }
    } catch (error) {
      console.error("获取社交媒体列表失败1:", error);
    }
  };
  const filterFooterList = (list: FooterProps[]): FooterProps[] => {
    return list
      .filter((item) => item.show === 1)
      .map((item) => ({
        ...item,
        children: item.children ? filterFooterList(item.children) : undefined,
      }));
  };

//   useEffect(() => {
//     fetchSocialMedia();
//   }, []);
	return (
		<>页脚</>
	)
}

export default Footer;