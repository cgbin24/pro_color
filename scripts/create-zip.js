import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

/**
 * 创建ZIP压缩包
 * @param {string} sourceDir 源目录
 * @param {string} outputPath 输出ZIP文件路径
 * @returns {Promise<void>}
 */
export function createZip(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    // 创建输出目录（如果不存在）
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 创建文件输出流
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // 设置压缩级别
    });

    // 监听输出流关闭事件
    output.on('close', () => {
      console.log(`ZIP archive created: ${outputPath}`);
      console.log(`Total bytes: ${archive.pointer()}`);
      resolve();
    });

    // 监听警告事件
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning during ZIP creation:', err);
      } else {
        reject(err);
      }
    });

    // 监听错误事件
    archive.on('error', (err) => {
      reject(err);
    });

    // 将输出流管道连接到文件
    archive.pipe(output);

    // 将整个目录添加到压缩包
    archive.directory(sourceDir, false);

    // 完成归档过程
    archive.finalize();
  });
} 