import puppeteer from 'puppeteer';
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Form Submit Mechanism Check', () => {
  it('should check how form is submitted', async () => {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // 监听所有网络请求
    const requests = [];
    page.on('request', (request) => {
      if (request.url().includes('api') || request.url().includes('auth')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          type: request.resourceType()
        });
      }
    });
    
    // 监听所有响应
    const responses = [];
    page.on('response', async (response) => {
      if (response.url().includes('api') || response.url().includes('auth')) {
        const responseData = {
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        };
        
        try {
          const text = await response.text();
          if (text) {
            responseData.body = JSON.parse(text);
          }
        } catch (e) {
          responseData.body = null;
        }
        
        responses.push(responseData);
      }
    });
    
    await page.goto('https://www.winuel.com/register', { waitUntil: 'networkidle2' });
    
    // 检查表单元素
    const formInfo = await page.evaluate(() => {
      const form = document.querySelector('form');
      const submitButton = document.querySelector('button[type="submit"]');
      
      return {
        formAction: form?.action,
        formMethod: form?.method,
        formClass: form?.className,
        buttonText: submitButton?.textContent,
        buttonClass: submitButton?.className,
        buttonType: submitButton?.type
      };
    });
    
    console.log('表单信息:', JSON.stringify(formInfo, null, 2));
    
    // 填写表单并提交
    const shortId = Math.floor(Math.random() * 9999);
    await page.type('#username', `user${shortId}`);
    await page.type('#email', `user${shortId}@example.com`);
    await page.type('#password', 'Test123!@#');
    
    console.log('准备提交表单...');
    
    // 点击提交按钮
    const submitButton = await page.$('button[type="submit"]');
    await submitButton!.click();
    
    // 等待一段时间让请求发出
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('捕获的请求数量:', requests.length);
    console.log('捕获的响应数量:', responses.length);
    
    if (requests.length > 0) {
      console.log('请求详情:');
      requests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url} (${req.type})`);
      });
    }
    
    if (responses.length > 0) {
      console.log('响应详情:');
      responses.forEach((resp, index) => {
        console.log(`  ${index + 1}. ${resp.status} ${resp.method} ${resp.url}`);
        if (resp.body) {
          console.log(`     Body:`, JSON.stringify(resp.body, null, 2));
        }
      });
    }
    
    // 检查页面 URL 变化
    const currentUrl = page.url();
    console.log('提交后URL:', currentUrl);
    
    // 检查页面内容
    const pageText = await page.evaluate(() => document.body.textContent?.slice(0, 200));
    console.log('页面内容前200字符:', pageText);
    
    // 截图
    await page.screenshot({ path: 'screenshots/form-submit-check.png' });
    
    await browser.close();
    
    expect(responses.length).toBeGreaterThan(0);
  });
})