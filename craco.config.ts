// craco.config.ts
import path from 'path';
import pxToViewport from 'postcss-px-to-viewport';

const config = {
  style: {
    postcss: {
      plugins: [
        pxToViewport({
          viewportWidth: 375, // 设计稿宽度
          unitPrecision: 5, // 设置转换后的 vw 单位的小数点精度
          viewportUnit: 'vw',
          selectorBlackList: ['.ignore', '.no-vw'], // 不转 vw 的类名
          minPixelValue: 1,
          mediaQuery: false, // 不处理媒体查询中的 px
        }),
      ],
    },
    sass: {
        loaderOptions: {
            additionalData: `@import "src/styles/variables.scss";`
        }
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

export default config;