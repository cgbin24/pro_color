import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs'
import * as path from 'path'

// 构建content-script.js
const contentScriptConfig = defineConfig({
  build: {
    outDir: 'dist/source',
    emptyOutDir: false, // 不清空输出目录
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/content-script/index.ts'),
      name: 'proColorContentScript',
      fileName: 'content-script',
      formats: ['iife']
    }
  }
});

// 构建其他部分
const mainConfig = defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-chrome-extension-files',
      closeBundle() {
        // 定义各种输出目录
        const sourceDir = 'dist/source';
        const zipDir = 'dist/zip';
        const crxDir = 'dist/crx';
        
        // 确保目录存在
        [sourceDir, zipDir, crxDir].forEach(dir => {
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
        });
        
        // 复制静态资源到source目录
        if (existsSync('public/themes.css')) {
          copyFileSync('public/themes.css', `${sourceDir}/themes.css`);
        }
        
        // 复制manifest.json
        if (existsSync('public/manifest.json')) {
          copyFileSync('public/manifest.json', `${sourceDir}/manifest.json`);
        }
        
        // 创建options.html
        writeFileSync(`${sourceDir}/options.html`, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pro Color - 设置</title>
  <link rel="stylesheet" href="./options.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./options.js"></script>
</body>
</html>
        `.trim());
        
        // 注：ZIP和CRX打包移至单独的脚本中处理，避免在vite配置中引入过多依赖
        console.log('构建基本文件完成，可以使用 npm run build:package 创建ZIP和CRX包');
      }
    }
  ],
  build: {
    outDir: 'dist/source',
    emptyOutDir: true, // 清空输出目录
    minify: false, // 禁用代码压缩，便于调试
    cssCodeSplit: true, // 启用CSS代码分割
    rollupOptions: {
      input: {
        options: resolve(__dirname, 'src/pages/options/index.tsx'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        format: 'esm',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'options.css') {
            return 'options.css';
          }
          return '[name].[ext]';
        }
      }
    }
  }
});

// 这里可以根据环境变量或命令行参数选择不同的配置
export default process.env.BUILD_TARGET === 'content-script' 
  ? contentScriptConfig 
  : mainConfig;
