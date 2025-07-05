// 净化html
import DOMPurify from 'dompurify';

export const transformDOMPurify = (html: string) => {
    const purifyConfig = {
        ALLOWED_TAGS: ['div',
            'span',
            'p', 'a',
            'ul', 'li',
            'ol',
            'hr',
            'br',
            'strong',
            'em',
            'u',
            's',
            'small',
            'sup',
            'img',
            'image',
            'figcaption',
            'video',
            'audio',
            'header',
            'nav',
            'main',
            'section',
            'article',
            'aside',
            'footer',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: ['style', 'class', 'href', 'target'],
        ALLOW_DATA_ATTR: false
    };
    // 将 JSX 风格的样式对象转换为标准 HTML style 字符串
    let htmlString = html.replace(
        /style={{\s*([^}]+)\s*}}/g,
        (match: string, styles: string) => {
            // 将 JSX 样式对象转换为 CSS 样式字符串
            const cssString = styles
                .split(',')
                .map((style: string) => {
                    const [key, value] = style.split(':').map(s => s.trim());
                    return `${key}: ${value.replace(/'/g, '')}`;
                })
                .join(';');
            return `style="${cssString}"`;
        }
    );

    // 使用 DOMPurify 净化 HTML
    htmlString = DOMPurify.sanitize(htmlString,purifyConfig);
    return htmlString;
};