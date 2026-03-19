import { install } from '@puppeteer/browsers';

async function installChrome() {
  try {
    console.log('正在安装 Chrome 浏览器...');

    const browserPath = await install({
      browser: 'chrome',
      platform: 'linux_arm',
      downloadHost: 'https://registry.npmmirror.com/-/binary/chrome-browser-snapshots',
      buildId: 'latest',
      cacheDir: '/root/.cache/puppeteer'
    });

    console.log('Chrome 安装成功！');
    console.log('安装路径:', browserPath);
  } catch (error) {
    console.error('安装失败:', error.message);
    process.exit(1);
  }
}

installChrome();