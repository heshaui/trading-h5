// import appStore from "../stores";
import { LOCAL_STORAGE_KEY } from "../config/apiConfig";
// 从本地存储获取主题色
export const getThemeColorFromStorage = (): string => {
    if (typeof window !== 'undefined') {
        try {
            // const themeData = appStore.getKvConfigAll() || JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.KV_CONFIG) || '') 
            const themeData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.KV_CONFIG) || '') 
            if (themeData) {
                const parsedTheme = themeData
                if (parsedTheme && parsedTheme.theme && parsedTheme.theme.color) {
                    return parsedTheme.theme.color || '#FF5F1F'
                } else {
                    return '#FF5F1F'
                }
            } else {
                return '#FF5F1F'
            }
        } catch (error) {
            console.error('获取主题色失败,使用默认主题色:', error);
            return '#FF5F1F'; // 默认主题色
        }
    }
    return '#FF5F1F'; // 默认主题色
};

// 生成带有透明度的颜色
export const getColorWithOpacity = (color: string, opacity: number): string => {
    // 如果是十六进制颜色
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // 如果已经是 rgba 格式
    if (color.startsWith('rgba')) {
        return color.replace(/[\d\.]+\)$/, `${opacity})`);
    }
    // 如果是 rgb 格式
    if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    return color;
};
// 明暗度
export const getColorWithLowerBrightness = (color: string, brightnessFactor: number): string => {
    // 如果是十六进制颜色
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const newR = Math.max(0, Math.min(255, Math.floor(r * brightnessFactor)));
        const newG = Math.max(0, Math.min(255, Math.floor(g * brightnessFactor)));
        const newB = Math.max(0, Math.min(255, Math.floor(b * brightnessFactor)));
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    // 如果已经是 rgba 格式
    if (color.startsWith('rgba')) {
        const parts = color.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
        if (parts) {
            const r = parseInt(parts[1]);
            const g = parseInt(parts[2]);
            const b = parseInt(parts[3]);
            const newR = Math.max(0, Math.min(255, Math.floor(r * brightnessFactor)));
            const newG = Math.max(0, Math.min(255, Math.floor(g * brightnessFactor)));
            const newB = Math.max(0, Math.min(255, Math.floor(b * brightnessFactor)));
            return `rgba(${newR}, ${newG}, ${newB}, ${parts[4]})`;
        }
    }
    // 如果是 rgb 格式
    if (color.startsWith('rgb')) {
        const parts = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
        if (parts) {
            const r = parseInt(parts[1]);
            const g = parseInt(parts[2]);
            const b = parseInt(parts[3]);
            const newR = Math.max(0, Math.min(255, Math.floor(r * brightnessFactor)));
            const newG = Math.max(0, Math.min(255, Math.floor(g * brightnessFactor)));
            const newB = Math.max(0, Math.min(255, Math.floor(b * brightnessFactor)));
            return `rgb(${newR}, ${newG}, ${newB})`;
        }
    }
    return color;
};
// 定义主题变量映射
export const getThemeVariables = () => {
    const themeColor = getThemeColorFromStorage();
    const warningColor = '#FF8A26'; // 警告色
    const warningBgColor = getColorWithOpacity(warningColor, 0.08); // 8% 透明度的警告色背景

    return {
        light: {
            '--background': '#ffffff',
            '--theme-color': themeColor,
            '--theme-03': getColorWithOpacity(themeColor, 0.3),
            '--theme-05': getColorWithOpacity(themeColor, 0.5),
            '--theme-005': getColorWithOpacity(themeColor, 0.05),
            '--theme-shadow': getColorWithOpacity(themeColor, 0.3),
            '--background2': 'rgb(245, 245, 245)',
            '--background3': '#ffffff',
            '--background4': '#0a0a0a',
            '--background5': '#ffffff',
            '--background6': '#F3F3F3',
            '--background7': '#FFFFFF',
            '--background8': '#FFFFFF',
            '--background9': '#FFFFFF',
            '--background10': '#F5F5F5',
            '--background11': '#ffffff',
            '--background12': '#ffffff',
            '--background13': '#0C0D0C',
            '--background14': '#F5F5F5',
            '--background15': '#ffffff',
            '--background16': '#EBEBEC',
            '--foreground': '#171717',
            '--homeground': '#000000',
            '--homeground2': '#FFFFFF',
            '--btnbgcolor': themeColor,
            '--btnbgcolor1': getColorWithOpacity(themeColor, 0.5),
            '--btnbgcolor2': '#FFFFFF',
            '--btnbgcolor3': '#F5F5F5',
            '--textcolor': '#0a0a0a',
            '--btncolor1': '#979897',
            '--hometext': '#ffffff',
            '--hometext2': '#979897',
            '--hometext3': '#0C0D0C',
            '--btncolor': '#FFFFFF',
            '--btncolor2': '#000317',
            '--btncolor3': '#E1E1E4',
            '--btncolor4': 'linear-gradient(90deg, #00EEFF 0%, #1F40FF 100%)',
            '--btncolor5': themeColor,
            '--btncolor6': '#F3F3F3',
            '--btncolor7': '#FFFFFF',
            '--btncolor8': '#E6E6E6',
            '--btncolor9': '#E1E1E4',
            '--tip-color1': '#6D6F7A',
            '--tip-color2': '#A4A5AC',
            '--text-color': '#1F40FF',
            '--text-color2': '#373949',
            '--text-color3': themeColor,
            '--text-color4': '#9E9E9E',
            '--text-color5': '#0C0D0C',
            '--text-color6': '#676867',
            '--text-color7': '#0C0D0C',
            '--text-color8': '#ffffff',
            '--waring-color': warningColor,
            '--waring-bg': warningBgColor,
            '--error-color': '#F73710',
            '--success-color': '#00C788',
            '--success-shadow': '#00C7884D',
            '--warning-color2': '#F8A145',
            '--cancel-btn': '#F3F3F3',
            '--cancel-color': '#0C0D0C',
            '--cancel-btn2': '#F3F3F3',
            '--border-color': '#DCDCDC',
            '--border-color2': '#FFFFFF1A',
            '--border-color3': '#0C0D0C',
            '--border-color4': '#DCDCDC',
            '--border-color5': '#E5E5E5',
            '--border-color6': '#E5E5E5',
            '--border-color7': '#DCDCDC',
            '--bgc-color':getColorWithOpacity(themeColor, 0.1), // '#FFF5F1',
            '--help-center-banner': 'url("/images/help_center/banner.png")',
            '--help-center-input-text': '#9E9E9E',
            '--help-center-card-bg': '#FFFFFF',
            '--help-center-card-shadow': '0px 0px 36px 0px #A5A5A533',
            '--segmented-item-active-bg': '#FFFFFF',
            '--segmented-item-bgc': '#F6F7FB',
            '--background-menu': '#FFFFFF',
            '--background-menu-item': '#F4F4F4',
            '--card-shadow': '#A5A5A533',
            '--dropdown-menu-hover': '#F4F4F4'
        },
        dark: {
            '--background': '#0a0a0a',
            '--theme-color': themeColor,
            '--theme-03': getColorWithOpacity(themeColor, 0.3),
            '--theme-05': getColorWithOpacity(themeColor, 0.5),
            '--theme-005': getColorWithOpacity(themeColor, 0.05),
            '--theme-shadow': getColorWithOpacity(themeColor, 0.3),
            '--background2': '#0C0B19',
            '--background3': '#333333',
            '--background4': '#0a0a0a',
            '--background5': '#29292F',
            '--background6': 'rgb(20, 20, 20)',
            '--background7': '#FFFFFF14',
            '--background8': '#262626',
            '--background9': '#0C0D0C',
            '--background10': '#202020',
            '--background11': '#111212',
            '--background12': '#232328',
            '--background13': '#232328',
            '--background14': '#333333',
            '--background15': '#37373A',
            '--background16': '#4F4F4F',
            '--foreground': '#ededed',
            '--homeground': '#000000',
            '--homeground2': '#000000',
            '--btnbgcolor': themeColor,
            '--btnbgcolor1': getColorWithOpacity(themeColor, 0.5),
            '--btnbgcolor2': '#1a1a1a',
            '--btnbgcolor3': '#141414',
            '--textcolor': '#ffffff',
            '--btncolor1': '#979897',
            '--hometext': '#ffffff',
            '--hometext2': '#979897',
            '--hometext3': '#FFFFFF',
            '--btncolor': '#373949',
            '--btncolor2': '#ffffff',
            '--btncolor3': '#1E1E20',
            '--btncolor4': 'linear-gradient(90deg, #00EEFF 0%, #1F40FF 100%)',
            '--btncolor5': themeColor,
            '--btncolor6': '#333333',
            '--btncolor7': '#272727',
            '--btncolor8': '#333333',
            '--btncolor9': '#1E1E20',
            '--tip-color1': '#FFFFFFB2',
            '--tip-color2': '#979897',
            '--text-color': '#1F40FF',
            '--text-color2': '#ededed',
            '--text-color3': themeColor,
            '--text-color4': '#9E9E9E',
            '--text-color5': '#ffffff',
            '--text-color6': '#A4A5AC',
            '--text-color7': '#A4A5AC',
            '--text-color8': '#0C0D0C',
            '--waring-color': warningColor,
            '--waring-bg': warningBgColor,
            '--error-color': '#F73710',
            '--success-color': '#00C788',
            '--success-shadow': '#00C7884D',
            '--warning-color2': '#F8A145',
            '--cancel-btn': '#3D3D3F',
            '--cancel-color': '#ffffff',
            '--cancel-btn2': '#333333',
            '--border-color': '#FFFFFF33',
            '--border-color2': '#DCDCDC',
            '--border-color3': '#FFFFFF',
            '--border-color4': '#37373A',
            '--border-color5': '#29292F',
            '--border-color6': '#37373A',
            '--border-color7': '#DCDCDC00',
            '--bgc-color': getColorWithLowerBrightness(themeColor, 0.2), //'#281D1A',
            '--help-center-banner': 'url("/images/help_center/banner_dark.png")',
            '--help-center-input-text': '#979897',
            '--help-center-card-bg': '#232328',
            '--help-center-card-shadow': '0px 0px 36px 0px #A5A5A533',
            '--segmented-item-active-bg': '#272727',
            '--segmented-item-bgc': '#141414',
            '--background-menu': '#232328',
            '--background-menu-item': '#0C0D0C',
            '--card-shadow': '#01367433',
            '--dropdown-menu-hover': '#454545'
        }
    };
}