export interface MenuType {
    title: string;
    icon: IconType;
    path: string;
    type?: 'p1' | 'p2' | 'p3';
}
export type IconType = string | React.ReactNode;
