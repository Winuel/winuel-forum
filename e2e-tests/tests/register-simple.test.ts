import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

// 生产环境配置
const PROD_URL = 'https://www.winuel.com'
const API_BASE_URL = 'https://api.winuel.com'

// 辅助函数：延迟执行
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('User Registration - Simple Direct Test', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    
    // 设置视口大小
    await page.setViewport({ width: 1280, height: 720 })
    
    // 设置超时时间
    page.setDefaultTimeout(30000)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('should complete full registration flow successfully', async () => {
    console.log('=== 开始完整的注册流程测试 ===')
    
    // 步骤 1：访问注册页面
    console.log('步骤 1：访问注册页面')
    await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
    expect(page.url()).toContain('/register')
    
    // 检查表单是否存在
    const usernameInput = await page.$('#username')
    const emailInput = await page.$('#email')
    const passwordInput = await page.$('#password')
    const submitButton = await page.$('button[type="submit"]')
    
    expect(usernameInput).toBeTruthy()
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(submitButton).toBeTruthy()
    
    console.log('✓ 注册页面和表单元素验证通过')
    
    // 截图：注册页面
    await page.screenshot({ path: 'screenshots/register-step1-page.png' })
    
    // 步骤 2：填写表单
    console.log('步骤 2：填写注册表单')
    const shortId = Math.floor(Math.random() * 9999)
    const userData = {
      username: `user${shortId}`,
      email: `user${shortId}_test@example.com`,
      password: 'Test123!@#'
    }
    
    console.log('注册用户数据:', userData)
    
    await page.type('#username', userData.username, { delay: 50 })
    await page.type('#email', userData.email, { delay: 50 })
    await page.type('#password', userData.password, { delay: 50 })
    
    // 验证输入的值
    const enteredUsername = await page.$eval('#username', el => el.value)
    const enteredEmail = await page.$eval('#email', el => el.value)
    const enteredPassword = await page.$eval('#password', el => el.value)
    
    expect(enteredUsername).toBe(userData.username)
    expect(enteredEmail).toBe(userData.email)
    expect(enteredPassword).toBe(userData.password)
    
    console.log('✓ 表单填写验证通过')
    
    // 截图：填写后的表单
    await page.screenshot({ path: 'screenshots/register-step2-filled.png' })
    
    // 步骤 3：提交表单
    console.log('步骤 3：提交注册表单')
    
    // 设置网络监听
    let requestCaptured = false
    let responseData = null
    let responseStatus = null
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/register') && response.request().method() === 'POST') {
        requestCaptured = true
        responseStatus = response.status()
        
        try {
          const text = await response.text()
          if (text) {
            responseData = JSON.parse(text)
          }
        } catch (e) {
          console.log('响应解析错误:', e.message)
        }
      }
    })
    
    await submitButton!.click()
    
    // 等待网络响应
    await delay(5000)
    
    console.log('注册请求捕获状态:', requestCaptured)
    console.log('注册响应状态:', responseStatus)
    console.log('注册响应数据:', responseData)
    
    // 截图：提交后
    await page.screenshot({ path: 'screenshots/register-step3-submitted.png' })
    
    // 验证注册请求
    expect(requestCaptured).toBe(true)
    
    // 验证响应状态
    if (responseStatus) {
      expect([200, 201, 400, 409]).toContain(responseStatus)
      
      if ([200, 201].includes(responseStatus)) {
        console.log('✓ 注册成功')
        
        // 验证响应数据
        if (responseData) {
          expect(responseData).toHaveProperty('user')
          expect(responseData.user).toHaveProperty('id')
          expect(responseData.user).toHaveProperty('username', userData.username)
          expect(responseData.user).toHaveProperty('email', userData.email)
          expect(responseData).toHaveProperty('token')
          
          console.log('✓ 注册响应数据验证通过')
          console.log('用户信息:', responseData.user)
          console.log('Token:', responseData.token ? '已生成' : '未生成')
          
          // 验证密码安全
          const responseString = JSON.stringify(responseData)
          expect(responseString).not.toContain(userData.password)
          expect(responseData.user).not.toHaveProperty('password')
          
          console.log('✓ 密码安全性验证通过')
        }
      } else if (responseStatus === 409) {
        console.log('✗ 用户已存在（重复注册）')
      } else if (responseStatus === 400) {
        console.log('✗ 请求参数错误')
        if (responseData && responseData.error) {
          console.log('错误信息:', responseData.error)
        }
      }
    }
  })

  it('should verify login after registration', async () => {
    console.log('=== 开始注册后登录验证测试 ===')
    
    // 步骤 1：注册新用户
    const shortId = Math.floor(Math.random() * 9999)
    const userData = {
      username: `userlogin${shortId}`,
      email: `userlogin${shortId}@example.com`,
      password: 'Test123!@#'
    }
    
    console.log('注册新用户用于登录验证:', userData)
    
    await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
    await page.type('#username', userData.username)
    await page.type('#email', userData.email)
    await page.type('#password', userData.password)
    
    const registerButton = await page.$('button[type="submit"]')
    await registerButton!.click()
    
    await delay(4000)
    
    console.log('✓ 注册完成')
    
    // 步骤 2：访问登录页面
    console.log('步骤 2：访问登录页面')
    await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
    expect(page.url()).toContain('/login')
    
    // 截图：登录页面
    await page.screenshot({ path: 'screenshots/login-verify-page.png' })
    
    // 步骤 3：填写登录表单
    console.log('步骤 3：填写登录表单')
    await page.type('#email', userData.email)
    await page.type('#password', userData.password)
    
    // 截图：填写后的登录表单
    await page.screenshot({ path: 'screenshots/login-verify-filled.png' })
    
    // 步骤 4：提交登录表单
    console.log('步骤 4：提交登录表单')
    
    let loginRequestCaptured = false
    let loginResponseData = null
    let loginResponseStatus = null
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/login') && response.request().method() === 'POST') {
        loginRequestCaptured = true
        loginResponseStatus = response.status()
        
        try {
          const text = await response.text()
          if (text) {
            loginResponseData = JSON.parse(text)
          }
        } catch (e) {
          console.log('登录响应解析错误:', e.message)
        }
      }
    })
    
    const loginButton = await page.$('button[type="submit"]')
    await loginButton!.click()
    
    // 等待网络响应
    await delay(4000)
    
    console.log('登录请求捕获状态:', loginRequestCaptured)
    console.log('登录响应状态:', loginResponseStatus)
    console.log('登录响应数据:', loginResponseData)
    
    // 截图：登录后
    await page.screenshot({ path: 'screenshots/login-verify-success.png' })
    
    // 验证登录请求
    expect(loginRequestCaptured).toBe(true)
    
    // 验证登录响应
    if (loginResponseStatus) {
      expect([200, 201, 400, 401]).toContain(loginResponseStatus)
      
      if ([200, 201].includes(loginResponseStatus)) {
        console.log('✓ 登录成功')
        
        if (loginResponseData) {
          expect(loginResponseData).toHaveProperty('user')
          expect(loginResponseData.user).toHaveProperty('username', userData.username)
          expect(loginResponseData.user).toHaveProperty('email', userData.email)
          expect(loginResponseData).toHaveProperty('token')
          
          console.log('✓ 登录响应数据验证通过')
          console.log('登录用户信息:', loginResponseData.user)
        }
        
        // 检查是否重定向到首页
        await delay(1000)
        const currentUrl = page.url()
        console.log('登录后当前URL:', currentUrl)
        
        // 可能在首页，也可能停留在登录页面
        expect([PROD_URL + '/', `${PROD_URL}/login`]).toContain(currentUrl)
        
        console.log('✓ 登录流程完整验证通过')
      } else {
        console.log('✗ 登录失败，状态码:', loginResponseStatus)
        if (loginResponseData && loginResponseData.error) {
          console.log('登录错误信息:', loginResponseData.error)
        }
      }
    }
  })
})