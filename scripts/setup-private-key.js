import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const privateKeyPath = path.join(rootDir, 'private.pem');

/**
 * 设置扩展私钥
 * 
 * 在CI/CD环境中，如果提供了EXTENSION_PRIVATE_KEY环境变量，
 * 则使用它的值作为私钥；否则尝试使用现有私钥或自动生成
 */
function setupPrivateKey() {
  console.log('正在设置扩展私钥...');
  
  // 1. 检查环境变量
  const privateKeyFromEnv = process.env.EXTENSION_PRIVATE_KEY;
  
  if (privateKeyFromEnv) {
    console.log('使用环境变量中的私钥');
    fs.writeFileSync(privateKeyPath, privateKeyFromEnv);
    console.log(`私钥已保存到: ${privateKeyPath}`);
    return true;
  }
  
  // 2. 检查现有私钥
  if (fs.existsSync(privateKeyPath)) {
    console.log(`使用现有私钥: ${privateKeyPath}`);
    return true;
  }
  
  // 3. 如果在CI环境中但没有找到私钥，发出警告
  if (process.env.CI) {
    console.warn('警告: 在CI环境中未找到私钥。');
    console.warn('CRX构建可能会生成一个新的私钥，导致每次构建的签名不同。');
    console.warn('建议配置EXTENSION_PRIVATE_KEY环境变量。');
  } else {
    console.log('未找到私钥，CRX构建过程将自动生成新的私钥。');
  }
  
  return false;
}

// 执行私钥设置
setupPrivateKey(); 