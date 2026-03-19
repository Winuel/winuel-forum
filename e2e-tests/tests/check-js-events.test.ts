import puppeteer from 'puppeteer';
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('JavaScript Events Check', () => {
  it('should check JavaScript event handling', async () => {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.winuel.com/register', { waitUntil: 'networkidle2' });
    
    // 检查表单元素
    const formEvents = await page.evaluate(() => {
      const form = document.querySelector('form');
      const submitButton = document.querySelector('button[type="submit"]');
      
      return {
        formExists: !!form,
        buttonExists: !!submitButton,
        buttonText: submitButton?.textContent,
        buttonId: submitButton?.id,
        buttonClass: submitButton?.className
      };
    });
    
    console.log('表单元素检查:', JSON.stringify(formEvents, null, 2));
    
    // 检查 Vue 实例（如果使用 Vue）
    const vueInfo = await page.evaluate(() => {
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        const vueInstance = (submitButton as any).__vueParentComponent;
        return {
          hasVue: !!vueInstance,
          buttonVueData: vueInstance ? Object.keys(vueInstance.ctx || {}) : []
        };
      }
      return { hasVue: false };
    });
    
    console.log('Vue 框架检查:', JSON.stringify(vueInfo, null, 2));
    
    // 尝试直接调用 API
    console.log('尝试直接调用注册 API...');
    
    const shortId = Math.floor(Math.random() * 9999);
    const apiResponse = await page.evaluate(async (userData) => {
      try {
        const response = await fetch('https://api.winuel.com/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }, {
      username: `user${shortId}`,
      email: `user${shortId}@example.com`,
      password: 'Test123!@#'
    });
    
    console.log('直接 API 调用结果:', JSON.stringify(apiResponse, null, 2));
    
    // 截图
    await page.screenshot({ path: 'screenshots/js-events-check.png' });
    
    await browser.close();
    
    // 验证 API 调用成功
    expect(apiResponse.status).toBeDefined();
    expect([200, 201, 400, 409]).toContain(apiResponse.status);
  });
})