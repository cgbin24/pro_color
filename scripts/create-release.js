import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipDir = path.join(distDir, 'zip');
const zipPath = path.join(zipDir, 'pro-color.zip');
const crxDir = path.join(distDir, 'crx');
const crxPath = path.join(crxDir, 'pro-color.crx');
const releaseDir = path.join(distDir, 'release');
const version = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;

/**
 * 创建发布文件
 */
async function createReleaseFiles() {
  try {
    console.log('开始创建发布文件...');
    
    // 确保release目录存在
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }
    
    // 检查ZIP文件是否存在
    if (!fs.existsSync(zipPath)) {
      throw new Error(`ZIP文件不存在: ${zipPath}`);
    }
    
    // 复制ZIP到release目录，添加版本号
    const releaseZipPath = path.join(releaseDir, `pro-color-v${version}.zip`);
    fs.copyFileSync(zipPath, releaseZipPath);
    console.log(`发布ZIP文件已创建: ${releaseZipPath}`);
    
    // 如果CRX文件存在，也复制到release目录
    if (fs.existsSync(crxPath)) {
      const releaseCrxPath = path.join(releaseDir, `pro-color-v${version}.crx`);
      fs.copyFileSync(crxPath, releaseCrxPath);
      console.log(`发布CRX文件已创建: ${releaseCrxPath}`);
    } else {
      console.warn(`CRX文件不存在: ${crxPath}，跳过该步骤`);
    }
    
    // 创建版本信息文件
    const versionInfoPath = path.join(releaseDir, 'version-info.json');
    const versionInfo = {
      version,
      buildDate: new Date().toISOString(),
      files: fs.readdirSync(releaseDir).filter(file => file !== 'version-info.json')
    };
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
    console.log(`版本信息文件已创建: ${versionInfoPath}`);
    
    return true;
  } catch (err) {
    console.error('创建发布文件时发生错误:', err.message);
    throw err;
  }
}

// 执行发布
console.log('===============================');
console.log('开始创建发布文件');
console.log('===============================');

createReleaseFiles()
  .then(() => {
    console.log('===============================');
    console.log('发布文件创建完成!');
    console.log('===============================');
  })
  .catch(err => {
    console.error('===============================');
    console.error('创建发布文件失败:', err.message);
    console.error('===============================');
    process.exit(1);
  }); 