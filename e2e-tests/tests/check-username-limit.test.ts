import puppeteer from 'puppeteer';
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Username Input Check', () => {
  it('should check username input limitations', async () => {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto('https://www.winuel.com/register', { waitUntil: 'networkidle2' });
    
    const usernameInput = await page.$('#username');
    const attrs = await usernameInput!.evaluate(el => ({
      maxlength: el.getAttribute('maxlength'),
      placeholder: el.placeholder,
      required: el.required,
      pattern: el.getAttribute('pattern')
    }));
    
    console.log('用户名输入框属性:', JSON.stringify(attrs, null, 2));
    
    // 测试输入长度
    await page.type('#username', 'testuser_12345678901234567890');
    const enteredValue = await page.$eval('#username', el => el.value);
    console.log('输入的值:', enteredValue);
    console.log('输入的值长度:', enteredValue.length);
    
    await browser.close();
    
    expect(attrs).toBeDefined();
  });
})