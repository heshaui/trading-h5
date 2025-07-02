// HomeMenu
export interface HomeMenuProps {
    t: (key: string) => string;
    test: string;
}
export type MenuListItem = {
    key: string;
    title: string | ReactNode;
    widthSet?: IconName;
    // items: Array<{ key: React.Key; label: React.ReactNode }>;
    linkHref?: string; // 跳转路径
    onClick?: () => void;
    items: Array<{
        key: React.Key | string;
        label: React.ReactNode;
        type: menuType; // 使 type 可选，并允许更多类型
        children?: MenuListItem['items'];
    }>;
}
export type menuType = 'group' | 'item' | 'divider' | string;
export interface MenuItems extends MenuListItem['items'] { };
export type Props = {
    menuList: MenuListItem;
    haveSubMenu?: React.Dispatch<React.SetStateAction<boolean>>;
    haveArrow?: boolean;
    isCascading?: boolean;
}
export type LabelComponentProps = {
    src?: string | StaticImport;
    h5Text?: string;
    spanText?: string;
    haveItemChildren?: boolean;
    isOtherItem?: boolean;
    isMore?: boolean;
    isUser?: boolean;
    isUserList?: boolean;
    items?: MenuListItem['items'];
    isSearch?: boolean;
    isTabs?: boolean;
    tabsItems?: Array<{
        key: string;
        label: React.ReactNode;
        children?: React.ReactNode;
    }>
    isNew?: boolean;
    ulItems?: Array<{
        liContent: string;
    }>;
    isPositive?: boolean;
    isInput?: boolean;
    isLanguage?: boolean;
    onInputChange?: (value: string) => void;  // 输入框
    onClickLogout?: () => void;  // 点击
    onClick?: () => void;  // 点击
    nickName?: string; // 我的 - 昵称
    level?: string; // 我的 - 等级
    myWords_1?: string; // 我的 - 交易量
    myWords_2?: string; // 我的 - 具体交易量
    myWords_3?: string; // 我的 - 交易量币种
    needHover?: boolean; // 公告中心hover
}
// 定义TabsItem的数据类型
export interface TabsItemData extends LabelComponentProps {
    src: string;
    h5Text: string;
    spanText: string;
    incNum?: string;
    normalNum?: string;
    colorSpan?: string;
    isPositive?: boolean;
    isFire?: boolean;
}
export interface HomeMenuChildrenLabelProps extends LabelComponentProps {
    needNumber?: boolean;
    isMargin?: boolean;
    tabsItemsData?: Array<{
        src: string;
        h5Text: string;
        spanText: string;
        incNum?: string;
        normalNum?: string;
        colorSpan?: string;
        isPositive?: boolean;
    }>;
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface TabsItemProps extends TabsItemData {
    needNumber?: boolean;
    isFire?: boolean;
    index?: number;
    haveNumber?: boolean;
    isHover?: boolean;
}
// export type IconName = 'download' | 'bell' | 'question' | 'global';
export type IconName = string;

// Footer
export type FooterListProps = {
    title: string;
    items: FooterProps[];
};
export type FooterProps = {
    bottomId: number,
    bottomDescription: string,
    languageKey: string,
    accessType: number,
    accessPath: string,
    orderIndex: number,
    tenantId: string,
    parentId: number,
    translationId: number,
    bottomName: string,
    languageCode: string,
    languagePath: string,
    show: number,
    children?: FooterProps[]
}
// CurrencyTrading
export interface CurrencyTradingProps {
    title: string;
}
export interface TrendDataItem {
    date: string;
    value: number;
}

// FundingTable
// 定义通用的表格数据接口
export interface BaseTableData {
    key: React.Key; // 每行数据的唯一标识
}
// 表格1的数据接口
export interface Table1Data extends BaseTableData {
    currency: React.ReactNode; // 币种
    quantityHeld: number; // 持有数量
    convertedToUSDT: number; // 折合USDT
    todayPLUSDT: string[]; // 今日盈亏USDT
    availableOrFrozen: string[]; // 可用/冻结
    lockPosition: number; // 锁仓
    dailyVariation: string; // 日变化
    currencyPriceTrend: React.ReactNode; // 持币价格走势
}
// 表格2的数据接口
export interface Table2Data extends BaseTableData {
    accountName: string; // 账户名称
    convertedToUSDT: string; // 折合USDT
    todayPLUSDT: string; // 今日盈亏USDT
    assetProportion: string; // 资产占比
    assetProportionNode: string; // 资产占比
}
// 语言
export interface LanguageParams {
    id?: number;
    lang: string;
    remark?: string;
    langEncode?: string;
    status?: number;
}
export interface FormattedLanguage {
    span?: string;
    label?: string;
    key?: string;
}
// 汇率
export interface ExchangeRateParams {
    id?: number;
    shortName: string;
    status?: number;
}

// 接口数据泛型
export interface ApiResponse<T> {
    code: string;
    message: string;
    reqNo: string | null;
    data: T;
}