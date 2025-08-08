import { useEffect, useState, useCallback, } from "react";
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
import { getLongLangCode } from "@/utils/stringMap";
import styles from "./styles/Footer.module.scss";
import { Image } from 'antd-mobile';
import { useLogoImage } from "@/hooks/useKv";
import LanguageToggle from "@/components/LanguageToggle";
import iconDown from '../../assets/icons/public/icon_download_line.png';
import discord from '@/assets/icons/public/icon_discord.png';
import { DownOutline, UpOutline } from 'antd-mobile-icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { ReactComponent as DownSvg } from '@/assets/icons/public/icon_down.svg';


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
	const { t } = useTranslation("common");
	const langKey = appStore.getLang() ? getLongLangCode(appStore.getLang()) : "en_US";
	const allConfig = appStore.getKvConfigAll();
	const footerConfig = appStore.getKvConfig("footer_setting");
	const languageList = appStore.getLangList();
	// 获取footer自定义数据
	const [customFooter, setCustomFooter] = useState<FooterProps[]>([]);
	const [selectFooter, setSelectFooter] = useState<string | null>(null)
	// 添加社交媒体列表状态
	const [socialMediaList, setSocialMediaList] = useState<SocialMediaItem[]>([]);
	const { logoUrl } = useLogoImage("");
	// 添加折叠状态管理
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
	const { isDayMode } = useThemeMode();


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
	const goLink = (url: string) => {
		if (url.startsWith("http")) {
			window.open(url, "_blank", "noopener");
		} else {
			//   router.push(url);
		}
	};
	//   // 渲染社交媒体图标
	const renderSocialMediaIcons = () => {
		// 渲染从API获取的社交媒体图标
		if (socialMediaList.length === 0) {
			// 如果没有社交媒体数据，显示默认的Discord图标
			return (
				<div style={{ marginBottom: '10px' }} >
					<Image
						src={discord}
						alt=''
						width={20}
						height={20}
					/>
				</div>
			);
		}

		return socialMediaList.map((item, index) => (
			<div key={item.id || index} className="mr-4 mt-0_5">
				<button onClick={() => goLink(item.linkUrl)}>
					<Image
						src={item.imgUrl || ""}
						alt={item.nameText || ""}
						width={24}
						height={24}
						style={{ borderRadius: "50%", height: "24px", width: "24px" }}
					/>
				</button>
			</div>
		));
	};

	// 切换折叠状态
	const toggleExpand = (itemId: string) => {
		setExpandedItems(prev => ({
			...prev,
			[itemId]: !prev[itemId]
		}));
	};

	const renderCustomFooter = () => {
		if (customFooter?.length > 0) {
			return customFooter.map((item, index) => (
				<div key={index} className={`${styles.footer_content} mb-4`}>
					<div className={`${styles.footerList}`}>
						<div className={`${styles.footer_title_wrapper}`}>
							<button
								className={`${styles.title_color} font-16 mb-2 w-full`}
								onClick={() => item.children && item.children.length > 0 ? toggleExpand(`item-${index}`) : goLink(item.accessPath)}
							>
								<div className="flex-x align-center justify-between w-full font-16 font-w-500" >
									<span className="flex-1 text-left">{item.bottomName || "--"}</span>
									{item.children && item.children.length > 0 && (
										<span className="ml-2">
											<DownSvg 
												color="var(--text-color5)"
												 className='w-[24px] h-[24px]'
												style={{
													transition: 'transform 0.3s ease',
													transform: expandedItems[`item-${index}`] ? 'rotate(180deg)' : 'rotate(0deg)'
												}}
											/>
										</span>
									)}
								</div>
							</button>
						</div>
						{item.children && item.children.length > 0 && expandedItems[`item-${index}`] && (
							<ul className="mt-3" style={{
								animation: 'fadeIn 0.3s ease-in-out'
							}}>
								{item.children.map((childItem, childIndex) => (
									<li key={childIndex} className="mb-2">
										<button 
											onClick={() => goLink(childItem.accessPath)}
											className={`${styles.footer_child_item} font-14`}
										>
											{childItem.bottomName || "--"}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			));
		}
		return null;
	};

	useEffect(() => {
		fetchSocialMedia();
	}, []);

	useEffect(() => {
		if (allConfig) {
			fetchFooterSetting();
			// setSelectedLang(
			// 	languageList.find((item) => item.key.includes(i18n.language))?.span ||
			// 	i18n.language
			// );
		}
	}, [allConfig, langKey]);

	return (<>
		{/* {footerConfig &&
			(footerConfig.toString() === "0" || footerConfig?.status == "0") ? ( */}
			<div className={`${styles.footer_container_box} flex-x-cc`} style={{ borderTop: "0.5px solid var(--border-color9)" }}>
				<div className={`${styles.footerContainer} flex-y`} >
					<div className={styles.logoAndButton}>
						<div className={styles.logo}>
							<Image
								src={logoUrl || ""}
								alt="footer logo"
								width={140}
								height={28} // 固定高度
								style={{ height: "28px", width: '140px' }} // 使用style控制宽度自适应
							// onError={() => setLogoUrl('')} // 图片加载失败时使用默认值
							/>
						</div>
						<p suppressHydrationWarning className={`${styles.tip_color}`}>{`©2023 - 2024 ${allConfig?.tenant_cache_name || ""}.`}</p>
						<div className={`${styles.footer_left} mt-4`}>


							<LanguageToggle />
							{/* <button className={`${styles.button_download} font-16 mt-3`}>
								<div className="flex-x-cc w-full">
									<div className="mr-3">
										<Image
											src={isDayMode?iconDown:iconDownDark}
											alt=""
											width={24}
											height={24}
										/>
									</div>
									<div className="flex-1 text-left">
										{t("footer.downloadApp")}
									</div>
								</div>
							</button> */}
						</div>
					</div>
					{/*底部菜单 */}
					<div className={`${styles.footer} flex-y mt-7`} suppressHydrationWarning>
						{renderCustomFooter()}
					</div>
					{/* 社区 */}
					<div className=" pt-4 flex-y mt-7">
						<div  className={`${styles.title_color} font-16 font-w-500 mb-2`}>
							{/* 社区 */}
							{t("footer.community")}
						</div>
						<div className="flex-x flex-wrap">
							{renderSocialMediaIcons()}
						</div>
					</div>
				</div>

			</div>
		{/* // ) : (
		// 	<div dangerouslySetInnerHTML={{ __html: selectFooter || "" }} />
		// )} */}

	</>
	)
}

export default Footer;