import * as fs from 'fs';
import * as path from 'path';
import ChromeExtension from 'crx';
import { fileURLToPath } from 'url';
import { generateKeyPair } from 'crypto';
import { promisify } from 'util';

const generateKeyPairAsync = promisify(generateKeyPair);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const sourceDir = path.join(distDir, 'source');
const crxDir = path.join(distDir, 'crx');
const privateKeyPath = path.join(rootDir, 'private.pem');

/**
 * 生成RSA私钥
 * @returns {Promise<Buffer>} 私钥内容
 */
async function generatePrivateKey() {
  console.log('生成新的RSA私钥...');
  
  try {
    const { privateKey } = await generateKeyPairAsync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    return Buffer.from(privateKey);
  } catch (err) {
    console.error('生成私钥失败:', err);
    throw err;
  }
}

/**
 * 生成CRX文件
 */
async function buildCrx() {
  try {
    console.log('开始构建CRX文件...');
    
    // 确保输出目录存在
    if (!fs.existsSync(crxDir)) {
      fs.mkdirSync(crxDir, { recursive: true });
    }

    // 检查源文件目录是否存在
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`源文件目录不存在: ${sourceDir}`);
    }

    let privateKey;
    
    // 检查私钥是否存在，如果不存在则创建一个新的私钥
    if (fs.existsSync(privateKeyPath)) {
      console.log(`使用已有私钥: ${privateKeyPath}`);
      privateKey = fs.readFileSync(privateKeyPath);
    } else {
      console.log('未找到私钥，将创建新私钥...');
      // 使用Node.js的crypto模块生成RSA密钥对
      privateKey = await generatePrivateKey();
      
      // 保存私钥到文件
      fs.writeFileSync(privateKeyPath, privateKey);
      console.log(`已创建新私钥并保存到: ${privateKeyPath}`);
    }
    
    // 创建CRX实例并使用私钥
    const crx = new ChromeExtension({
      privateKey: privateKey
    });

    // 包含扩展目录
    console.log(`加载扩展目录: ${sourceDir}`);
    await crx.load(sourceDir);

    // 生成.crx文件
    console.log('正在打包CRX文件...');
    const crxBuffer = await crx.pack();
    
    // 写入.crx文件
    const crxPath = path.join(crxDir, 'pro-color.crx');
    fs.writeFileSync(crxPath, crxBuffer);
    console.log(`CRX文件创建成功: ${crxPath}`);
    
    return true;
  } catch (err) {
    console.error('构建CRX过程中发生错误:', err.message);
    throw err;
  }
}

// 执行构建
console.log('===============================');
console.log('开始CRX扩展打包过程');
console.log('===============================');

buildCrx()
  .then(() => {
    console.log('===============================');
    console.log('CRX扩展打包成功完成!');
    console.log('===============================');
  })
  .catch(err => {
    console.error('===============================');
    console.error('构建CRX失败:', err.message);
    console.error('===============================');
    process.exit(1);
  }); 