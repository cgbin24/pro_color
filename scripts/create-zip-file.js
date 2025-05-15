import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createZip } from './create-zip.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const sourceDir = path.join(distDir, 'source');
const zipDir = path.join(distDir, 'zip');
const zipPath = path.join(zipDir, 'pro-color.zip');

/**
 * 创建ZIP压缩包
 */
async function createZipFile() {
  try {
    console.log('开始创建ZIP压缩包...');
    
    // 确保目标目录存在
    if (!fs.existsSync(zipDir)) {
      fs.mkdirSync(zipDir, { recursive: true });
    }
    
    // 确保源文件目录存在
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`源文件目录不存在: ${sourceDir}`);
    }
    
    // 创建ZIP文件
    await createZip(sourceDir, zipPath);
    console.log(`ZIP压缩包创建成功: ${zipPath}`);
    
    return true;
  } catch (err) {
    console.error('创建ZIP文件时发生错误:', err.message);
    throw err;
  }
}

// 执行压缩
console.log('===============================');
console.log('开始ZIP压缩包创建过程');
console.log('===============================');

createZipFile()
  .then(() => {
    console.log('===============================');
    console.log('ZIP压缩包创建完成!');
    console.log('===============================');
  })
  .catch(err => {
    console.error('===============================');
    console.error('创建ZIP失败:', err.message);
    console.error('===============================');
    process.exit(1);
  }); 