# Pro Color 持续集成/持续部署文档

本文档介绍如何设置和使用Pro Color扩展的CI/CD流程。

## GitHub Actions配置

项目使用GitHub Actions进行自动构建和发布。主要流程配置文件位于 `.github/workflows/build-and-release.yml`。

### 工作流程触发条件

- 推送到 `main` 或 `master` 分支时触发构建
- 推送标签（格式为 `v*`，如 `v1.0.0`）时触发构建和发布
- 可以手动在GitHub界面触发

### 工作流程步骤

1. **构建作业(build)**
   - 检出代码
   - 设置Node.js环境
   - 安装依赖
   - 设置私钥（如果有配置）
   - 构建扩展及各种格式
   - 上传构建产物作为工作流程构件

2. **发布作业(release)**（仅在推送标签时执行）
   - 下载构建产物
   - 生成更新日志
   - 创建GitHub Release
   - 上传构建文件作为Release资源

## 私钥管理

为了确保CRX包签名一致，建议配置私钥作为GitHub Secrets。

### 配置私钥Secrets

1. 如果已有私钥文件:
   ```bash
   # 将私钥内容转为Base64格式
   cat private.pem | base64
   ```

2. 如果需要生成新私钥:
   ```bash
   # 本地执行构建CRX一次，会自动生成私钥
   npm run build:crx
   
   # 然后转为Base64格式
   cat private.pem | base64
   ```

3. 在GitHub仓库设置中添加Secrets:
   - 访问仓库的 `Settings` > `Secrets and variables` > `Actions`
   - 点击 `New repository secret`
   - 名称填写: `EXTENSION_PRIVATE_KEY`
   - 值填写: 上面得到的Base64编码内容
   - 点击 `Add secret` 保存

### 使用方法

配置好Secrets后，GitHub Actions会自动使用该私钥进行CRX签名。这样每次构建的CRX包都具有相同的签名，确保浏览器可以顺利更新扩展。

## 版本发布流程

1. 更新 `package.json` 中的版本号（如 `"version": "1.0.0"`）
2. 提交并推送更改到GitHub:
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   git push
   ```

3. 创建并推送标签:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. GitHub Actions会自动执行构建和发布流程
5. 访问仓库的 `Actions` 页面查看构建状态
6. 发布成功后，可在 `Releases` 页面下载构建的文件

## 手动触发构建

如果需要手动触发构建，可以:

1. 访问仓库的 `Actions` 页面
2. 选择 `Build and Release` 工作流
3. 点击 `Run workflow`
4. 选择要运行的分支，点击 `Run workflow` 按钮

## 故障排查

如果构建失败，请检查:

1. GitHub Actions日志，查看详细错误信息
2. 确保所有依赖已正确安装
3. 检查扩展源码是否有错误
4. 验证私钥是否正确配置（对于CRX构建） 