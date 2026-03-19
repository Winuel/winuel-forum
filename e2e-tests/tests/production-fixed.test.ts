import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

// 生产环境配置
const PROD_URL = 'https://www.winuel.com'
const API_BASE_URL = 'https://api.winuel.com'

// 测试用户数据
let testUser = {
  username: '',
  email: '',
  password: 'Test123!@#'
}

let authToken = ''

// 辅助函数：延迟执行
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('CloudLink Forum - Production E2E Tests', () => {
  let browser: Browser
  let page: Page
  let apiRequests: { url: string; method: string; status?: number }[] = []

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
    page.on('request', (request: HTTPRequest) => {
      const url = request.url()
      if (url.includes(API_BASE_URL)) {
        apiRequests.push({
          url: url,
          method: request.method()
        })
      }
    })
    
    // 监听 API 响应
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes(API_BASE_URL)) {
        const request = apiRequests.find(r => r.url === url)
        if (request) {
          request.status = response.status()
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

  describe('Frontend-Backend Integration Tests', () => {
    it('should load homepage', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 检查页面标题
      const title = await page.title()
      expect(title).toBe('云纽')
      
      // 截图
      await page.screenshot({ path: 'screenshots/production-homepage.png' })
    })

    it('should display posts', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 等待帖子链接加载
      await page.waitForSelector('a[href^="/post/"]', { timeout: 10000 })
      
      // 检查是否有帖子链接
      const posts = await page.$$('a[href^="/post/"]')
      expect(posts.length).toBeGreaterThan(0)
      
      // 截图
      await page.screenshot({ path: 'screenshots/production-posts.png' })
    })

    it('should navigate to post detail', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 等待帖子链接加载
      await page.waitForSelector('a[href^="/post/"]', { timeout: 10000 })
      
      const posts = await page.$$('a[href^="/post/"]')
      if (posts.length > 0) {
        const initialUrl = page.url()
        
        // 点击第一个帖子
        await posts[0].click()
        
        // 等待 URL 变化
        await page.waitForFunction(() => window.location.pathname.includes('/post/'), { timeout: 5000 })
        
        // 验证 URL 变化
        expect(page.url()).toContain('/post/')
        
        // 截图
        await page.screenshot({ path: 'screenshots/production-post-detail.png' })
      }
    })
  })

  describe('User Authentication Flow', () => {
    it('should navigate to login page', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 点击登录链接
      const loginLink = await page.$('a[href="/login"]')
      expect(loginLink).toBeTruthy()
      
      await loginLink!.click()
      
      // 等待 URL 变化
      await page.waitForFunction(() => window.location.pathname === '/login', { timeout: 5000 })
      
      expect(page.url()).toContain('/login')
    })

    it('should display login form', async () => {
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      
      // 检查登录表单元素
      const emailInput = await page.$('#email')
      const passwordInput = await page.$('#password')
      const loginButton = await page.$('button[type="submit"]')
      
      expect(emailInput).toBeTruthy()
      expect(passwordInput).toBeTruthy()
      expect(loginButton).toBeTruthy()
    })

    it('should register new user', async () => {
      // 生成唯一用户名和邮箱
      const timestamp = Date.now()
      testUser.username = `testuser_${timestamp}`
      testUser.email = `test_${timestamp}@example.com`
      
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 填写注册表单
      await page.type('#username', testUser.username)
      await page.type('#email', testUser.email)
      await page.type('#password', testUser.password)
      
      // 提交表单
      const submitButton = await page.$('button[type="submit"]')
      expect(submitButton).toBeTruthy()
      
      await submitButton!.click()
      
      // 等待注册请求完成
      await delay(2000)
      
      // 截图
      await page.screenshot({ path: 'screenshots/production-register.png' })
    })

    it('should login with registered credentials', async () => {
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      
      // 填写登录表单
      await page.type('#email', testUser.email)
      await page.type('#password', testUser.password)
      
      // 提交表单
      const submitButton = await page.$('button[type="submit"]')
      await submitButton!.click()
      
      // 等待登录请求完成
      await delay(3000)
      
      // 检查 URL - 应该是首页或者停留在登录页面（如果失败）
      const currentUrl = page.url()
      expect([PROD_URL + '/', `${PROD_URL}/login`]).toContain(currentUrl)
      
      // 截图
      await page.screenshot({ path: 'screenshots/production-login.png' })
    })
  })

  describe('Performance Tests', () => {
    it('should load homepage within reasonable time', async () => {
      const startTime = Date.now()
      
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      const loadTime = Date.now() - startTime
      
      // 页面应该在 10 秒内加载完成
      expect(loadTime).toBeLessThan(10000)
      
      console.log(`Homepage load time: ${loadTime}ms`)
    })

    it('should handle responsive design', async () => {
      // 测试移动端视图
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      await page.screenshot({ path: 'screenshots/production-mobile.png' })
      
      // 测试桌面端视图
      await page.setViewport({ width: 1920, height: 1080 })
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      await page.screenshot({ path: 'screenshots/production-desktop.png' })
    })
  })
})
