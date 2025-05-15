# GitHub Pages 部署说明

Pro Color 浏览器扩展使用 GitHub Pages 提供在线演示网站，展示扩展的功能和使用方法。

## 自动部署流程

每当代码推送到 `main` 或 `master` 分支时，GitHub Actions 工作流程会自动执行以下步骤：

1. 构建浏览器扩展
2. 创建演示网站
3. 部署到 GitHub Pages

## 访问演示网站

演示网站可通过以下地址访问：

```
https://cgbin24.github.io/pro_color/
```

## 网站内容

演示网站包含以下内容：

- 扩展功能简介
- 使用说明
- 最新版本下载链接（ZIP和CRX格式）
- 版本信息

## 文件结构

GitHub Pages 部署的文件结构如下：

```
/
├── index.html           # 主页面
├── pro-color-latest.zip # 最新版本的ZIP包
├── pro-color-latest.crx # 最新版本的CRX包
├── version.json         # 版本信息
└── README.md            # 仓库说明
```

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

# 安装依赖
npm install

# 构建扩展
npm run build:extension

# 在本地启动测试服务器
cd dist/source
npx http-server
```

然后在浏览器中访问 `http://localhost:8080` 查看效果。

## 自定义演示网站

如需修改演示网站的内容或样式，请编辑 `.github/workflows/build-and-release.yml` 文件中的 `构建演示网站` 步骤。 