import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Iconify } from '@/components/icon';
// 包含页头、页脚
import MainLayout from './layouts/MainLayout';
// 空页面
import BlankLayout from './layouts/BlankLayout';
// 包含页头
import HeaderOnlyLayout from './layouts/HeaderOnlyLayout';
import AuthRoute from './AuthRoute';

// 1. 自动导入页面组件 pages下所有目录的，不包含components目录下的组件
const pageModules = require.context('../pages', true, /^\.\/(?!.*\/components\/).*\.tsx$/);
const layoutMap: Record<string, React.FC<{ children: React.ReactNode }>> = {
  main: MainLayout,
  blank: BlankLayout,
  'header-only': HeaderOnlyLayout
};
// 完整路径转路由路径
const normalizePath = (filePath: string): string => {
  return filePath
    .replace('./', '/')                // 去掉 ./ 前缀
    .replace(/\.tsx$/, '')             // 去掉后缀
    .replace(/\/index$/, '')           // /xxx/index → /xxx
    .replace(/^\/index$/, '/')         // index.tsx → 根路由 /
	  .replace(/^\/Home$/, '/')		      // 将 Home 变成 '/'
    .toLowerCase();                    // 小写处理
};
// 2. 生成路由配置
const routes = pageModules.keys().map((key: string) => {
  const mod = pageModules(key);
  // console.log(mod)
  const Component = React.lazy(() => Promise.resolve({ default: mod.default }));
  const layout = mod.layout || mod.meta?.layout || 'main';
  // 登录后才能访问
  const requireAuth = mod.meta?.requireAuth ?? true;
  let path = normalizePath(key);

  return {
    path,
    element: <Component />,
    layout,
	  requireAuth
  };
});

// console.log(routes)

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background9)]">
      <div className="relative w-[48px] h-[48px]">
        <div className="absolute w-[48px] h-[48px] border-[3px] border-solid border-transparent border-t-[var(--theme-color)] rounded-full animate-spin"></div>
        <div className="absolute w-[48px] h-[48px] border-[3px] border-solid border-transparent border-t-[var(--theme-color)] rounded-full animate-spin-delay" style={{ animationDelay: '-0.45s' }}></div>
        <div className="absolute w-[48px] h-[48px] border-[3px] border-solid border-transparent border-t-[var(--theme-color)] rounded-full animate-spin-delay" style={{ animationDelay: '-0.3s' }}></div>
      </div>
    </div>
  )
}

const AutoRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {routes.map(({ path, element, layout, requireAuth }) => {
        const Layout = layoutMap[layout] || MainLayout;
        const wrapped = element

        return (
          <Route
            key={path}
            path={path}
            element={<Layout>{wrapped}</Layout>}
          />
        );
      })}
    </Routes>
  </Suspense>
);

export default AutoRoutes;
