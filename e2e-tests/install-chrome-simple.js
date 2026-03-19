import { install } from '@puppeteer/browsers';

console.log('开始安装 Chrome...');

install({
  browser: 'chrome',
  platform: 'linux_arm',
  buildId: '146.0.7680.153',
  cacheDir: '/root/.cache/puppeteer'
}).then(path => {
  console.log('Chrome 安装成功！');
  console.log('路径:', path);
}).catch(err => {
  console.error('安装失败:', err.message);
  process.exit(1);
});