import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

// 生产环境配置
const PROD_URL = 'https://www.winuel.com'
const API_BASE_URL = 'https://api.winuel.com'

// 辅助函数：延迟执行
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('User Registration - Detailed Tests', () => {
  let browser: Browser
  let page: Page
  let apiRequests: { url: string; method: string; status?: number; requestBody?: any; responseBody?: any }[] = []

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
    
    // 监听 API 请求
    page.on('request', async (request: HTTPRequest) => {
      const url = request.url()
      if (url.includes(API_BASE_URL)) {
        const requestData = {
          url: url,
          method: request.method(),
          status: undefined,
          requestBody: undefined,
          responseBody: undefined
        }
        
        // 获取请求体（仅对 POST/PUT 请求）
        if (['POST', 'PUT'].includes(request.method())) {
          try {
            const postData = request.postData()
            if (postData) {
              requestData.requestBody = JSON.parse(postData)
            }
          } catch (e) {
            requestData.requestBody = request.postData()
          }
        }
        
        apiRequests.push(requestData)
      }
    })
    
    // 监听 API 响应
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes(API_BASE_URL)) {
        const request = apiRequests.find(r => r.url === url)
        if (request) {
          request.status = response.status()
          
          // 获取响应体
          try {
            const text = await response.text()
            if (text) {
              request.responseBody = JSON.parse(text)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    })
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    // 清空 API 请求记录
    apiRequests = []
  })

  describe('Registration Page Validation', () => {
    it('should access registration page', async () => {
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 检查页面标题
      const title = await page.title()
      console.log('注册页面标题:', title)
      
      // 检查 URL
      expect(page.url()).toContain('/register')
      
      // 截图
      await page.screenshot({ path: 'screenshots/register-page-access.png' })
    })

    it('should display registration form with all required fields', async () => {
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 检查所有必需的表单字段
      const usernameInput = await page.$('#username')
      const emailInput = await page.$('#email')
      const passwordInput = await page.$('#password')
      const submitButton = await page.$('button[type="submit"]')
      
      expect(usernameInput).toBeTruthy()
      expect(emailInput).toBeTruthy()
      expect(passwordInput).toBeTruthy()
      expect(submitButton).toBeTruthy()
      
      // 检查输入框的占位符和属性
      const usernameAttrs = await usernameInput!.evaluate(el => ({
        placeholder: el.placeholder,
        required: el.required,
        type: el.type
      }))
      console.log('用户名输入框属性:', usernameAttrs)
      
      const emailAttrs = await emailInput!.evaluate(el => ({
        placeholder: el.placeholder,
        required: el.required,
        type: el.type
      }))
      console.log('邮箱输入框属性:', emailAttrs)
      
      const passwordAttrs = await passwordInput!.evaluate(el => ({
        placeholder: el.placeholder,
        required: el.required,
        type: el.type
      }))
      console.log('密码输入框属性:', passwordAttrs)
      
      // 截图
      await page.screenshot({ path: 'screenshots/register-form-validation.png' })
    })
  })

  describe('Registration Form Submission', () => {
    it('should submit valid registration data', async () => {
      // 生成唯一用户数据（用户名必须符合：3-20个字符，以字母开头和结尾，只能包含字母、数字、下划线和连字符）
      const shortId = Math.floor(Math.random() * 9999)
      const userData = {
        username: `user${shortId}`, // 确保不超过20个字符
        email: `test_${shortId}_${Date.now()}@example.com`,
        password: 'Test123!@#'
      }
      
      console.log('准备注册用户:', userData)
      
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 填写表单
      await page.type('#username', userData.username, { delay: 100 })
      await page.type('#email', userData.email, { delay: 100 })
      await page.type('#password', userData.password, { delay: 100 })
      
      // 验证输入的值
      const enteredUsername = await page.$eval('#username', el => el.value)
      const enteredEmail = await page.$eval('#email', el => el.value)
      const enteredPassword = await page.$eval('#password', el => el.value)
      
      expect(enteredUsername).toBe(userData.username)
      expect(enteredEmail).toBe(userData.email)
      expect(enteredPassword).toBe(userData.password)
      
      // 截图：填写后的表单
      await page.screenshot({ path: 'screenshots/register-form-filled.png' })
      
      // 提交表单
      const submitButton = await page.$('button[type="submit"]')
      await submitButton!.click()
      
      // 等待请求完成
      await delay(3000)
      
      // 检查 API 请求
      const registerRequest = apiRequests.find(r => r.url.includes('/api/auth/register') && r.method === 'POST')
      expect(registerRequest).toBeDefined()
      
      console.log('注册请求:', {
        url: registerRequest?.url,
        status: registerRequest?.status,
        requestBody: registerRequest?.requestBody,
        responseBody: registerRequest?.responseBody
      })
      
      // 验证请求体
      expect(registerRequest?.requestBody).toMatchObject({
        username: userData.username,
        email: userData.email,
        password: userData.password
      })
      
      // 验证响应状态
      expect([200, 201]).toContain(registerRequest?.status)
      
      // 验证响应体包含用户信息和 token
      if (registerRequest?.responseBody) {
        expect(registerRequest.responseBody).toHaveProperty('user')
        expect(registerRequest.responseBody.user).toHaveProperty('id')
        expect(registerRequest.responseBody.user).toHaveProperty('username', userData.username)
        expect(registerRequest.responseBody.user).toHaveProperty('email', userData.email)
        expect(registerRequest.responseBody).toHaveProperty('token')
        
        console.log('注册成功！用户信息:', registerRequest.responseBody.user)
        console.log('Token:', registerRequest.responseBody.token ? '已生成' : '未生成')
      }
      
      // 截图：提交后的页面
      await page.screenshot({ path: 'screenshots/register-submitted.png' })
    })

    it('should handle duplicate email registration', async () => {
      // 使用已存在的邮箱
      const existingEmail = 'test_existing@example.com'
      const shortId = Math.floor(Math.random() * 9999)
      const userData = {
        username: `userdup${shortId}`,
        email: existingEmail,
        password: 'Test123!@#'
      }
      
      console.log('尝试使用已存在的邮箱注册:', userData)
      
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 填写表单
      await page.type('#username', userData.username)
      await page.type('#email', userData.email)
      await page.type('#password', userData.password)
      
      // 提交表单
      const submitButton = await page.$('button[type="submit"]')
      await submitButton!.click()
      
      // 等待请求完成
      await delay(3000)
      
      // 检查 API 请求
      const registerRequest = apiRequests.find(r => r.url.includes('/api/auth/register') && r.method === 'POST')
      expect(registerRequest).toBeDefined()
      
      console.log('重复邮箱注册请求:', {
        status: registerRequest?.status,
        responseBody: registerRequest?.responseBody
      })
      
      // 验证响应状态（应该返回错误）
      expect([400, 409]).toContain(registerRequest?.status)
      
      // 验证错误响应
      if (registerRequest?.responseBody) {
        expect(registerRequest.responseBody).toHaveProperty('success', false)
        expect(registerRequest.responseBody).toHaveProperty('error')
        
        console.log('重复邮箱错误信息:', registerRequest.responseBody.error)
      }
      
      // 截图：重复邮箱错误
      await page.screenshot({ path: 'screenshots/register-duplicate-email.png' })
    })

    it('should validate form fields - invalid email format', async () => {
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 填写无效的邮箱格式
      await page.type('#username', 'userinvalid')
      await page.type('#email', 'invalid-email-format')
      await page.type('#password', 'Test123!@#')
      
      // 尝试提交表单
      const submitButton = await page.$('button[type="submit"]')
      await submitButton!.click()
      
      // 等待请求完成
      await delay(2000)
      
      // 检查是否有 API 请求（如果有，应该是被拒绝的）
      const registerRequest = apiRequests.find(r => r.url.includes('/api/auth/register') && r.method === 'POST')
      
      if (registerRequest) {
        console.log('无效邮箱格式请求:', {
          status: registerRequest?.status,
          responseBody: registerRequest?.responseBody
        })
        
        // 验证响应状态（应该返回验证错误）
        expect([400, 422]).toContain(registerRequest?.status)
      } else {
        console.log('表单验证在前端阻止了提交')
      }
      
      // 截图：无效邮箱格式
      await page.screenshot({ path: 'screenshots/register-invalid-email.png' })
    })

    it('should validate form fields - weak password', async () => {
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 填写弱密码
      const shortId = Math.floor(Math.random() * 9999)
      await page.type('#username', `userweak${shortId}`)
      await page.type('#email', `test_weak_${shortId}@example.com`)
      await page.type('#password', '123') // 弱密码
      
      // 尝试提交表单
      const submitButton = await page.$('button[type="submit"]')
      await submitButton!.click()
      
      // 等待请求完成
      await delay(2000)
      
      // 检查 API 请求
      const registerRequest = apiRequests.find(r => r.url.includes('/api/auth/register') && r.method === 'POST')
      
      if (registerRequest) {
        console.log('弱密码请求:', {
          status: registerRequest?.status,
          responseBody: registerRequest?.responseBody
        })
        
        // 验证响应状态（应该返回验证错误）
        expect([400, 422]).toContain(registerRequest?.status)
      } else {
        console.log('表单验证在前端阻止了提交')
      }
      
      // 截图：弱密码
      await page.screenshot({ path: 'screenshots/register-weak-password.png' })
    })
  })

  describe('Post-Registration Verification', () => {
    it('should allow login after successful registration', async () => {
      // 先注册一个新用户
      const shortId = Math.floor(Math.random() * 9999)
      const userData = {
        username: `userlogin${shortId}`,
        email: `test_login_${shortId}@example.com`,
        password: 'Test123!@#'
      }
      
      console.log('注册新用户以验证登录:', userData)
      
      // 注册
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      await page.type('#username', userData.username)
      await page.type('#email', userData.email)
      await page.type('#password', userData.password)
      
      const submitButton = await page.$('button[type="submit"]')
      await submitButton!.click()
      
      await delay(3000)
      
      // 验证注册成功
      const registerRequest = apiRequests.find(r => r.url.includes('/api/auth/register') && r.method === 'POST')
      expect([200, 201]).toContain(registerRequest?.status)
      
      console.log('注册成功，准备登录验证')
      
      // 清空 API 请求记录
      apiRequests = []
      
      // 现在尝试登录
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      await page.type('#email', userData.email)
      await page.type('#password', userData.password)
      
      const loginButton = await page.$('button[type="submit"]')
      await loginButton!.click()
      
      await delay(3000)
      
      // 检查登录请求
      const loginRequest = apiRequests.find(r => r.url.includes('/api/auth/login') && r.method === 'POST')
      expect(loginRequest).toBeDefined()
      
      console.log('登录请求:', {
        status: loginRequest?.status,
        requestBody: loginRequest?.requestBody,
        responseBody: loginRequest?.responseBody
      })
      
      // 验证登录成功
      expect([200, 201]).toContain(loginRequest?.status)
      
      if (loginRequest?.responseBody) {
        expect(loginRequest.responseBody).toHaveProperty('user')
        expect(loginRequest.responseBody.user).toHaveProperty('username', userData.username)
        expect(loginRequest.responseBody.user).toHaveProperty('email', userData.email)
        expect(loginRequest.responseBody).toHaveProperty('token')
        
        console.log('登录成功！用户信息:', loginRequest.responseBody.user)
      }
      
      // 检查是否重定向到首页
      await delay(1000)
      expect(page.url()).toBe(PROD_URL + '/')
      
      // 截图：登录成功
      await page.screenshot({ path: 'screenshots/register-post-login.png' })
    })
  })

  describe('Security and Data Validation', () => {
    it('should not store plain password in response', async () => {
      const shortId = Math.floor(Math.random() * 9999)
      const userData = {
        username: `usersec${shortId}`,
        email: `test_security_${shortId}@example.com`,
        password: 'Test123!@#'
      }
      
      console.log('检查密码安全性:', userData)
      
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      await page.type('#username', userData.username)
      await page.type('#email', userData.email)
      await page.type('#password', userData.password)
      
      const submitButton = await page.$('button[type="submit"]')
      await submitButton!.click()
      
      await delay(3000)
      
      const registerRequest = apiRequests.find(r => r.url.includes('/api/auth/register') && r.method === 'POST')
      
      if (registerRequest?.responseBody) {
        // 确保响应中没有明文密码
        const responseString = JSON.stringify(registerRequest.responseBody)
        expect(responseString).not.toContain(userData.password)
        
        // 确保用户对象中没有密码字段
        expect(registerRequest.responseBody.user).not.toHaveProperty('password')
        
        console.log('✓ 密码安全性验证通过：响应中不包含明文密码')
      }
      
      // 截图：安全性验证
      await page.screenshot({ path: 'screenshots/register-security.png' })
    })
  })
})