# Pro Color 浏览器扩展

Pro Color 是一个强大的浏览器主题扩展，可以让您自定义网页颜色方案，包括暗色模式支持。

## 核心功能

- 🎨 四种预设主题：白色、护眼绿、纸张黄、夜间深色
- 🔄 每个网站单独设置主题，记住您的偏好
- 🌙 兼容系统深色模式
- 📱 响应式设计，自动适应各种屏幕
- 📝 支持导入/导出配置
- 🔌 支持懒加载内容的动态处理

## 技术栈

- React + TypeScript
- Vite 构建
- Chrome Extension Manifest V3

## 开发指南

### 环境要求

- Node.js 16+
- npm 8+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建扩展

#### 基本构建 (只生成源文件)

```bash
npm run build:extension
```

所有构建文件将位于 `dist/source` 目录中，可以直接加载到浏览器进行测试。

#### 打包构建 (生成多种格式)

```bash
npm run build:package
```

此命令将自动执行以下步骤:
1. `build:extension` - 构建源文件到 `dist/source` 目录
2. `build:zip` - 创建ZIP压缩包到 `dist/zip` 目录
3. `build:crx` - 创建CRX扩展包到 `dist/crx` 目录
4. `build:release` - 复制带版本号的文件到 `dist/release` 目录

您也可以单独运行每个步骤:

```bash
# 只创建ZIP格式
npm run build:zip

# 只创建CRX格式 
npm run build:crx

# 只生成发布文件
npm run build:release
```

## CRX扩展包构建说明

CRX文件构建需要RSA私钥进行签名。首次运行 `npm run build:crx` 时会自动生成私钥文件 `private.pem`，请妥善保管该文件以用于将来的更新。

**注意:** 如果删除或丢失私钥文件，生成的新CRX将与之前发布的CRX具有不同的签名，Chrome浏览器将视为不同的扩展。

### 常见问题排查

如果CRX构建失败，请检查:

1. 确保 `dist/source` 目录存在并包含有效的扩展文件
2. 确保 `private.pem` 私钥文件权限正确且可读
3. 确保已安装 `crx` 模块: `npm install --save-dev crx`
4. 如果遇到 `privateKey` 相关错误，可能是私钥格式问题，尝试删除 `private.pem` 让脚本重新生成

## 目录结构

```
├── public/             # 静态资源
│   ├── icons/          # 扩展图标
│   ├── manifest.json   # 扩展配置文件
│   └── themes.css      # 主题样式
├── src/                # 源代码
│   ├── background/     # 后台脚本
│   ├── content-script/ # 内容脚本
│   └── pages/          # 扩展页面
├── scripts/            # 构建脚本
│   ├── build-crx.js           # CRX打包脚本
│   ├── create-zip-file.js     # ZIP打包脚本
│   ├── create-release.js      # 发布文件生成脚本
│   └── create-zip.js          # ZIP压缩模块
├── .github/            # GitHub相关配置
│   └── workflows/      # GitHub Actions工作流
├── docs/               # 文档
│   └── CI-CD.md        # CI/CD配置文档
└── dist/               # 构建输出
    ├── source/         # 构建后的源文件
    ├── zip/            # ZIP压缩包
    ├── crx/            # Chrome扩展包
    └── release/        # 版本发布文件
```

## 发布流程

### 手动发布

1. 更新 `package.json` 中的版本号
2. 运行 `npm run build:package` 生成所有需要的格式
3. 使用 `dist/release` 目录中的文件进行发布:
   - `pro-color-vX.X.X.zip`: 用于提交到Chrome商店
   - `pro-color-vX.X.X.crx`: 用于直接分发给用户
   - `version-info.json`: 包含版本和构建信息

### GitHub Actions自动发布

项目配置了GitHub Actions自动构建和发布流程，使用方法：

1. 更新 `package.json` 中的版本号（例如 `"version": "1.0.0"`）
2. 提交并推送更改到GitHub
3. 创建一个与版本号匹配的标签并推送:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. GitHub Actions将自动执行以下操作:
   - 构建扩展的所有格式（源文件、ZIP、CRX）
   - 创建GitHub Release
   - 上传构建的文件作为Release资源
   - 生成更新日志

您可以在GitHub仓库的"Actions"和"Releases"标签页查看构建和发布状态。

更多关于CI/CD配置的详细信息，请参阅 [CI/CD文档](docs/CI-CD.md)。

## 注意事项

- 私钥文件 (`private.pem`) 用于签名CRX文件，请勿将其包含在版本控制中
- 确保在提交到Chrome商店前测试扩展的所有功能
- 对于CI/CD环境，可以将私钥保存为GitHub Secrets或仓库Secrets
- GitHub Actions工作流程配置在 `.github/workflows/build-and-release.yml` 文件中

## 加载扩展

1. 打开 Chrome 浏览器，进入扩展管理页面 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist/source` 目录

## 使用说明

- 安装后，在任何网页右侧会出现一个悬浮按钮
- 点击按钮可以切换主题颜色
- 设置会自动保存，下次访问同一网站时自动应用
- 进入扩展的设置页可以管理所有网站配置

## 演示站点

Pro Color 浏览器扩展提供了在线演示站点，您可以通过以下链接访问：

```
https://cgbin24.github.io/pro_color/
```

在演示站点上，您可以：
- 了解扩展的主要功能
- 查看使用说明
- 下载最新版本的扩展包（ZIP和CRX格式）

演示站点内容位于 `docs/website` 目录中，由 GitHub Pages 提供支持，每次推送到主分支后自动更新。更多关于演示站点的信息，请参阅 [GitHub Pages 部署说明](docs/github-pages.md)。 