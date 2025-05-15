# GitHub Pages 部署说明

Pro Color 浏览器扩展使用 GitHub Pages 提供在线演示网站，展示扩展的功能和使用方法。

## 目录结构

GitHub Pages 内容存放在 `docs/website` 目录中，这种结构有以下优势：
- 与文档内容分离，便于管理
- 支持添加媒体文件如图片和视频
- 便于本地测试和开发

目录结构如下：

```
docs/
├── website/             # GitHub Pages 网站根目录
│   ├── index.html       # 主页面
│   ├── assets/          # 资源文件目录
│   │   ├── images/      # 图片资源
│   │   └── videos/      # 视频资源
│   ├── pro-color-latest.zip # 最新版本的ZIP包
│   ├── pro-color-latest.crx # 最新版本的CRX包
│   └── version.json     # 版本信息
└── github-pages.md      # 本文档（部署说明）
```

## 重要配置（必读）

为了正确部署GitHub Pages，您必须在仓库设置中启用GitHub Pages功能：

1. 访问 https://github.com/cgbin24/pro_color/settings/pages
2. 在 **Source** 部分，选择 **GitHub Actions**
3. 点击 **Save** 按钮保存设置

![GitHub Pages设置示意图](https://docs.github.com/assets/cb-32892/mw-1440/images/help/pages/pages-source-dropdown.webp)

如果不完成此设置，GitHub Actions 将无法部署页面，会出现404错误。

## 自动部署流程

每当代码推送到 `main` 或 `master` 分支时，GitHub Actions 工作流程会自动执行以下步骤：

1. 构建浏览器扩展
2. 更新 `docs/website` 目录中的演示站点内容
3. 部署到 GitHub Pages

## 访问演示站点

演示站点可通过以下地址访问：

```
https://cgbin24.github.io/pro_color/
```

## 网站内容

演示站点包含以下内容：

- 扩展功能简介
- 使用说明
- 最新版本下载链接（ZIP和CRX格式）
- 版本信息

## 手动触发部署

除了自动部署外，还可以通过 GitHub Actions 页面手动触发工作流程部署：

1. 打开仓库的 Actions 页面
2. 选择 "Build and Release" 工作流
3. 点击 "Run workflow" 按钮
4. 选择要部署的分支
5. 点击 "Run workflow" 确认

## 本地测试

如需在本地测试演示网站，可执行以下命令：

```bash
# 克隆仓库
git clone https://github.com/cgbin24/pro_color.git
cd pro_color

# 在本地启动测试服务器
cd docs/website
npx http-server
```

然后在浏览器中访问 `http://localhost:8080` 查看效果。

## 添加媒体文件

如需添加图片或视频等媒体文件：

1. 将图片文件放在 `docs/website/assets/images/` 目录下
2. 将视频文件放在 `docs/website/assets/videos/` 目录下
3. 在HTML中通过相对路径引用：
   ```html
   <!-- 图片示例 -->
   <img src="assets/images/screenshot.png" alt="截图">
   
   <!-- 视频示例 -->
   <video controls>
     <source src="assets/videos/demo.mp4" type="video/mp4">
     您的浏览器不支持视频标签
   </video>
   ```

## 自定义演示网站

如需修改演示网站的内容或样式：

1. 直接编辑 `docs/website/` 目录中的文件
2. 或修改 `.github/workflows/build-and-release.yml` 文件中的 `更新演示站点内容` 步骤

## 常见问题排查

如果GitHub Pages部署失败，请检查以下几点：

1. **确保已启用GitHub Pages**：在仓库设置中，必须将GitHub Pages的源设置为"GitHub Actions"
2. **检查工作流权限**：确保工作流有正确的权限（contents、pages、id-token）
3. **查看错误日志**：在Actions运行日志中查找具体的错误信息
4. **验证文件结构**：确保docs/website目录存在且包含index.html文件
5. **检查分支设置**：确保在正确的分支上操作（一般是main或master）

常见错误：
- `Failed to create deployment (status: 404)`：表示GitHub Pages尚未启用或配置错误
- `Getting signed artifact URL failed`：通常与权限或工作流配置有关 