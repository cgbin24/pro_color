import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const sourceDir = path.join(distDir, 'source');

/**
 * 修复dist目录结构
 */
function fixDistStructure() {
  console.log('正在修复dist目录结构...');
  
  // 确保source目录存在
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }
  
  // 获取dist目录下所有文件和目录
  const items = fs.readdirSync(distDir);
  
  // 将非目录的文件移到source目录（除了特定目录外）
  const excludeDirs = ['source', 'zip', 'crx', 'release'];
  
  items.forEach(item => {
    const itemPath = path.join(distDir, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();
    
    // 如果是文件或不是特定目录，则移到source
    if (!isDirectory || !excludeDirs.includes(item)) {
      const targetPath = path.join(sourceDir, item);
      
      // 如果是目录但不是特定目录，递归复制
      if (isDirectory) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        copyDirectory(itemPath, targetPath);
        fs.rmSync(itemPath, { recursive: true, force: true });
      } 
      // 如果是文件，直接移动
      else {
        // 如果目标文件已存在，先删除
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }
        fs.renameSync(itemPath, targetPath);
      }
      
      console.log(`移动 ${item} 到 source 目录`);
    }
  });
  
  console.log('dist目录结构修复完成');
}

/**
 * 递归复制目录
 */
function copyDirectory(source, target) {
  const items = fs.readdirSync(source);
  
  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// 执行修复
fixDistStructure(); 