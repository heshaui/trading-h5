## 动态路由规则
pages下所有目录的页面组件，排除components目录下的组件
pages/
├── index.tsx            不匹配
├── Home/         		 默认 /
├── Demo/                 
│   ├── components/      不匹配
│   ├── index.tsx        /demo
│   └── otc/index.tsx    /demo/otc

## 布局
目前三种：
MainLayout：包含页头、页脚       默认
BlankLayout: 空页面            需要在页面配置 export const layout = 'blank' 或者 export const meta = {layout: 'blank'}
HeaderOnlyLayout: 只有页头      需要在页面配置 export const layout = 'header-only' 或者 export const meta = {layout: 'header-only'}

## 页面权限
两种：未登录可查看，登录可查看
登录可查看——默认
未登录可查看——需在页面配置 export const meta = {layout: '', requireAuth: false}