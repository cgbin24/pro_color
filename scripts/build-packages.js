import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createZip } from './create-zip.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const sourceDir = path.join(distDir, 'source');
const zipDir = path.join(distDir, 'zip');
const zipPath = path.join(zipDir, 'pro-color.zip');
const releaseDir = path.join(distDir, 'release');
const version = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;

/**
 * 创建所有格式的包
 */
async function buildAllPackages() {
  try {
    console.log('开始构建所有格式的包...');
    
    // 确保目录存在
    ensureDirectories();
    
    // 1. 创建ZIP压缩包
    console.log('\n创建ZIP压缩包...');
    await createZip(sourceDir, zipPath);
    console.log(`ZIP包已创建: ${zipPath}`);
    
    // 2. 尝试创建CRX (如果build-crx.js存在)
    console.log('\n尝试创建CRX包...');
    try {
      execSync('node scripts/build-crx.js', { stdio: 'inherit' });
    } catch (err) {
      console.warn('创建CRX失败，可能需要单独运行build:crx命令');
    }
    
    // 3. 创建带版本号的发布文件
    console.log('\n创建发布版本...');
    createReleaseFiles();
    
    console.log('\n所有包构建完成!');
    console.log(`构建结果位于: ${distDir}`);
    console.log('- source: 构建后的源文件');
    console.log('- zip: ZIP压缩包');
    console.log('- crx: Chrome扩展包');
    console.log('- release: 带版本号的发布文件');
    
  } catch (err) {
    console.error('构建失败:', err);
    process.exit(1);
  }
}

/**
 * 确保所有必要的目录存在
 */
function ensureDirectories() {
  [distDir, sourceDir, zipDir, releaseDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * 创建带版本号的发布文件
 */
function createReleaseFiles() {
  // 复制ZIP到release目录，添加版本号
  const releaseZipPath = path.join(releaseDir, `pro-color-v${version}.zip`);
  fs.copyFileSync(zipPath, releaseZipPath);
  console.log(`发布ZIP文件已创建: ${releaseZipPath}`);
  
  // 如果CRX文件存在，也复制到release目录
  const crxPath = path.join(distDir, 'crx/pro-color.crx');
  if (fs.existsSync(crxPath)) {
    const releaseCrxPath = path.join(releaseDir, `pro-color-v${version}.crx`);
    fs.copyFileSync(crxPath, releaseCrxPath);
    console.log(`发布CRX文件已创建: ${releaseCrxPath}`);
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
}

// 执行构建
buildAllPackages(); 