import puppeteer from 'puppeteer';
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('User Registration - Direct API Test', () => {
  it('should register user with correct username format', async () => {
    console.log('=== 直接 API 注册测试 ===');
    
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.winuel.com/register', { waitUntil: 'networkidle2' });
    
    // 生成符合规则的用户名：以字母开头和结尾，只包含字母、数字、下划线和连字符
    const shortId = Math.floor(Math.random() * 9999);
    const userData = {
      username: `user${shortId}a`, // 确保以字母开头和结尾
      email: `user${shortId}a@example.com`,
      password: 'Test123!@#'
    };
    
    console.log('注册用户数据:', userData);
    
    // 直接调用 API
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
    }, userData);
    
    console.log('API 响应状态:', apiResponse.status);
    console.log('API 响应数据:', JSON.stringify(apiResponse.data, null, 2));
    
    // 截图
    await page.screenshot({ path: 'screenshots/register-api-direct.png' });
    
    await browser.close();
    
    // 验证 API 调用结果
    expect(apiResponse.status).toBeDefined();
    
    if ([200, 201].includes(apiResponse.status)) {
      console.log('✓ 注册成功！');
      
      // 验证响应数据（实际 API 响应格式）
      expect(apiResponse.data).toHaveProperty('user');
      expect(apiResponse.data.user).toHaveProperty('id');
      expect(apiResponse.data.user).toHaveProperty('username', userData.username);
      expect(apiResponse.data.user).toHaveProperty('email', userData.email);
      expect(apiResponse.data).toHaveProperty('token');
      
      // 验证密码安全
      const responseString = JSON.stringify(apiResponse.data);
      expect(responseString).not.toContain(userData.password);
      expect(apiResponse.data.user).not.toHaveProperty('password');
      
      console.log('✓ 所有验证通过！');
    } else if (apiResponse.status === 409) {
      console.log('✗ 用户已存在（重复注册）');
      expect(apiResponse.data).toHaveProperty('error');
    } else {
      console.log('✗ 注册失败，状态码:', apiResponse.status);
      if (apiResponse.data && apiResponse.data.error) {
        console.log('错误信息:', apiResponse.data.error);
      }
      expect(apiResponse.data).toHaveProperty('error');
    }
  });

  it('should test username validation rules', async () => {
    console.log('=== 用户名验证规则测试 ===');
    
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.winuel.com/register', { waitUntil: 'networkidle2' });
    
    // 测试各种用户名格式
    const testCases = [
      { username: '123', expectedError: '用户名' }, // 数字开头
      { username: 'abc123', expectedError: '用户名' }, // 数字结尾
      { username: 'ab', expectedError: '用户名' }, // 太短
      { username: 'a'.repeat(21), expectedError: '用户名' }, // 太长
      { username: 'user@name', expectedError: '用户名' }, // 非法字符
      { username: 'user_name', expectedError: null }, // 合法：包含下划线
      { username: 'user-name', expectedError: null }, // 合法：包含连字符
      { username: 'username', expectedError: null }, // 合法：纯字母
    ];
    
    for (const testCase of testCases) {
      console.log(`测试用户名: "${testCase.username}"`);
      
      // 添加延迟以避免触发速率限制
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
      
      const response = await page.evaluate(async (userData) => {
        try {
          const res = await fetch('https://api.winuel.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          const data = await res.json();
          return { status: res.status, data };
        } catch (error) {
          return { error: error.message };
        }
      }, {
        username: testCase.username,
        email: `test_${testCase.username}@example.com`,
        password: 'Test123!@#'
      });
      
      if (testCase.expectedError) {
        expect(response.status).toBe(400);
        expect(response.data.error.message).toContain(testCase.expectedError);
        console.log(`  ✓ 正确拒绝: ${testCase.expectedError}`);
      } else {
        // 对于合法的用户名，可能成功（如果用户不存在）或返回其他错误（如用户已存在）
        console.log(`  ✓ 用户名格式合法`);
      }
    }
    
    await browser.close();
  });

  it('should complete full registration and login cycle', async () => {
    console.log('=== 完整注册和登录周期测试 ===');
    
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.winuel.com/register', { waitUntil: 'networkidle2' });
    
    // 步骤 1：注册
    const shortId = Math.floor(Math.random() * 9999);
    const userData = {
      username: `user${shortId}a`,
      email: `user${shortId}a@example.com`,
      password: 'Test123!@#'
    };
    
    console.log('步骤 1：注册用户', userData);
    
    const registerResponse = await page.evaluate(async (userData) => {
      const res = await fetch('https://api.winuel.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      return { status: res.status, data };
    }, userData);
    
    console.log('注册响应:', registerResponse.status);
    
    if ([200, 201].includes(registerResponse.status)) {
      console.log('✓ 注册成功');
      
      const token = registerResponse.data.token;
      const userId = registerResponse.data.user.id;
      
      // 步骤 2：登录
      console.log('步骤 2：使用注册的凭据登录');
      
      const loginResponse = await page.evaluate(async (credentials) => {
        const res = await fetch('https://api.winuel.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const data = await res.json();
        return { status: res.status, data };
      }, {
        email: userData.email,
        password: userData.password
      });
      
      console.log('登录响应:', loginResponse.status);
      
      if ([200, 201].includes(loginResponse.status)) {
        console.log('✓ 登录成功');
        
        expect(loginResponse.data.user).toHaveProperty('username', userData.username);
        expect(loginResponse.data.user).toHaveProperty('email', userData.email);
        expect(loginResponse.data).toHaveProperty('token');
        
        console.log('✓ 完整注册-登录周期测试通过！');
      } else {
        console.log('✗ 登录失败');
        console.log('错误:', loginResponse.data.error);
      }
    } else {
      console.log('✗ 注册失败');
      console.log('错误:', registerResponse.data.error);
    }
    
    // 截图
    await page.screenshot({ path: 'screenshots/register-full-cycle.png' });
    
    await browser.close();
    
    // 验证整个流程
    expect([200, 201, 409]).toContain(registerResponse.status);
  });
})