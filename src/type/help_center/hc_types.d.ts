// 帮助中心卡片配置
export interface ConfigurationItem {
    icon: string;
    title: string;
}
// 帮助中心卡片 - 组件props
export interface ConfigurationCardProps {
    configurationList: Array<{
        icon: string;
        title: string;
    }>;
}
// 帮助中心
export interface HelpCenterItem {
    title: string;
    icon: string;
    buttonWord: string;
}

// 帮助中心后端配置 - 组件props
export interface HelpCenterSectionProps {
    helpCenterList?: Array<{
        alt: string;
        title: string;
        icon: string;
        buttonWord: string;
    }>;
    onButtonClick?: (item: HelpCenterItem) => void;
}

// 帮助中心搜索页的分段分类
export type SearchCategory = '全部' | '常见问题' | '公告';

// 帮助中心搜索 - 组件props
export interface SearchDetailProps {
    searchValue: string;
    searchResults?: {
        title: string;
        content: string;
        time: string;
        category?: SearchCategory; // 添加分类字段
    }[];
    setShowSearch: (show: boolean) => void;  // 点击返回按钮
    setSearchValue: (value: string) => void;  // 输入框内容清空
}
// 帮助中心搜索结果 - 组件props
export interface SearchResultProps {
    resultCount: number;
    items: {
        title: string;
        content: string;
        time: string;
        category?: SearchCategory;
    }[];
    currentCategory: SearchCategory;
    searchValue: string; // 添加搜索关键词
}
// 自定义服务菜单
export interface CustomizationProps {
    id: number,
    whiteIcon: string,
    blackIcon: string,
    accessType: number,
    accessPath: string,
    sort: number,
    languageCode: string,
    articleTitle: string,
    languagePath: string
}

// 帮助中心菜单
export interface HelpCenterMenuProps {
    id: number,
    helpDescription: string,
    helpSort: number,
    blackIcon: string,
    whiteIcon: string,
    parentId: number,
    contentId: string,
    languageCode: string,
    articleTitle: string,
    languagePath?: string,
    type: number,
    children?: HelpCenterMenuProps[]|null
}
export interface HelpCenterMenuProps2 {
    id: number,
    helpDescription: string,
    helpSort: number,
    blackIcon: string,
    whiteIcon: string,
    parentId: number,
    contentId: string,
    languageCode: string,
    articleTitle: string,
    languagePath?: string,
    label: string,
    key: string,
    type: number,
    children?: HelpCenterMenuProps2[]|null
}
