import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
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
	.replace(/^\/Home$/, '/')		   // 将 Home 变成 '/'
    .toLowerCase();                    // 小写处理
};
// 2. 生成路由配置
const routes = pageModules.keys().map((key: string) => {
  const mod = pageModules(key);
  const Component = React.lazy(() => Promise.resolve({ default: mod.default }));
  const layout = mod.layout || mod.meta?.layout || 'main';
  // 登录后才能访问
  const requireAuth = mod.meta?.requireAuth ?? false;
  let path = normalizePath(key);

  return {
    path,
    element: <Component />,
    layout,
	  requireAuth
  };
});

console.log(routes)

const AutoRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      {routes.map(({ path, element, layout, requireAuth }) => {
        const Layout = layoutMap[layout] || MainLayout;
        const wrapped = requireAuth
          ? <AuthRoute>{element}</AuthRoute>
          : element;

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
