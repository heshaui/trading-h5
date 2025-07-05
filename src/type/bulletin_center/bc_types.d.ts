// 消息列表页
export interface MessageData {
    id?: string; // 消息id - 唯一标识
    title: string; // h6 标签的内容
    time?: string; // timeContent 下的 span 内容
    onClick?: () => void;
    content?: string;
    isDetail?: boolean;
    isClickable?: boolean;
    isRead?: boolean; // 添加已读状态
    classMenu: string;
    onTop?: number; // 置顶状态：1表示置顶，0表示不置顶
}
// 消息详情页
export interface MessageItemDetailProps {
    message: MessageData;
    onBack: () => void;
    currentDetailLabel: string; // 添加当前选中的菜单标签
    currentDetailKey: string;
    onLatestClick: () => void; // 添加点击最新动态的处理函数
    showArticle: boolean; // 添加状态来控制是否显示文章详情
    isDetail: boolean;
    content:string;
    title: string;
    time?: string;
}
// 面包屑
export interface detailBreadCrumbProps {
    items: {
        title: string;
        onClick?: () => void;
    }[];
}
// 渲染公告顶部
export interface RenderBulletinTopProps {
    showDetail: boolean;
    onBack?: () => void; // 添加返回处理函数
    onReadAll?: () => void; // 添加全部已读处理函数
    onUnreadChange?: (checked: boolean) => void; // 添加未读筛选回调
    onSearch?: (value: string) => void; // 添加搜索处理函数
    hasUnreadMessages?: boolean; // 是否有未读消息，用于禁用全部已读按钮
    disableUnreadCheckbox?: boolean; // 是否禁用"只看未读"复选框
}