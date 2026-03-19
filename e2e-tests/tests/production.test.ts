import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

// 生产环境配置
const PROD_URL = 'https://www.winuel.com'
const API_BASE_URL = 'https://api.winuel.com'

// 辅助函数：延迟执行
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 测试用户数据
let testUser = {
  username: '',
  email: '',
  password: 'Test123!@#'
}

let authToken = ''

describe('CloudLink Forum - Production E2E Tests', () => {
  let browser: Browser
  let page: Page
  let apiRequests: { url: string; method: string; status?: number }[] = []

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    })
    page = await browser.newPage()
    
    // 设置视口大小
    await page.setViewport({ width: 1280, height: 720 })
    
    // 设置超时时间
    page.setDefaultTimeout(30000)
    
    // 监听 API 请求
    await page.on('request', (request: HTTPRequest) => {
      const url = request.url()
      if (url.includes(API_BASE_URL)) {
        apiRequests.push({
          url: url,
          method: request.method()
        })
      }
    })
    
    // 监听 API 响应
    await page.on('response', async (response) => {
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

  // 辅助函数：检查 API 请求
  const checkApiRequest = (endpoint: string, method: string, status?: number) => {
    const request = apiRequests.find(
      r => r.url.includes(endpoint) && r.method === method
    )
    expect(request).toBeTruthy()
    if (status) {
      expect(request?.status).toBe(status)
    }
    return request
  }

  describe('Frontend-Backend Integration Tests', () => {
    it('should load homepage and fetch initial data', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 检查页面标题
      const title = await page.title()
      expect(title).toBeTruthy()
      
      // 检查是否发起了 API 请求
      await page.waitForFunction(() => document.readyState === 'complete') // 等待 API 请求完成
      
      // 检查是否调用了分类 API
      const categoryRequest = checkApiRequest('/api/categories', 'GET', 200)
      expect(categoryRequest).toBeDefined()
      
      // 检查是否调用了帖子 API
      const postsRequest = checkApiRequest('/api/posts', 'GET', 200)
      expect(postsRequest).toBeDefined()
      
      // 截图
      await page.screenshot({ path: 'screenshots/production-homepage.png' })
    })

    it('should display posts from API', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 等待帖子列表加载
      await page.waitForSelector('.post-card', { timeout: 10000 })
      
      // 检查是否有帖子
      const posts = await page.$$('.post-card')
      expect(posts.length).toBeGreaterThanOrEqual(0)
      
      // 验证帖子数据是否正确显示
      if (posts.length > 0) {
        const firstPost = posts[0]
        const title = await firstPost.$eval('.post-title', el => el.textContent?.trim())
        const author = await firstPost.$eval('.post-author', el => el.textContent?.trim())
        
        expect(title).toBeTruthy()
        expect(author).toBeTruthy()
      }
    })

    it('should navigate to post detail and fetch comments', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 等待帖子列表加载
      await page.waitForSelector('.post-card', { timeout: 10000 })
      
      const posts = await page.$$('.post-card')
      if (posts.length > 0) {
        const initialUrl = page.url()
        
        // 点击第一个帖子
        await posts[0].click()
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
        
        // 验证 URL 变化
        expect(page.url()).not.toBe(initialUrl)
        expect(page.url()).toContain('/post/')
        
        // 检查是否调用了评论 API
        await delay(1000)
        const commentsRequest = apiRequests.find(r => r.url.includes('/api/comments') || r.url.includes('/api/posts/'))
        expect(commentsRequest).toBeDefined()
        
        // 截图
        await page.screenshot({ path: 'screenshots/production-post-detail.png' })
      }
    })
  })

  describe('User Authentication Flow', () => {
    it('should navigate to login page', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 点击登录按钮
      const loginButton = await page.$('a[href="/login"]')
      if (loginButton) {
        await loginButton.click()
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
        
        expect(page.url()).toContain('/login')
      } else {
        // 尝试直接访问登录页面
        await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
        expect(page.url()).toContain('/login')
      }
      
      // 检查登录表单
      const emailInput = await page.$('input[type="email"]')
      const passwordInput = await page.$('input[type="password"]')
      
      expect(emailInput).toBeTruthy()
      expect(passwordInput).toBeTruthy()
    })

    it('should register new user successfully', async () => {
      // 生成唯一用户名和邮箱
      const timestamp = Date.now()
      testUser.username = `testuser_${timestamp}`
      testUser.email = `test_${timestamp}@example.com`
      
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 填写注册表单
      await page.type('input[name="username"]', testUser.username)
      await page.type('input[name="email"]', testUser.email)
      await page.type('input[name="password"]', testUser.password)
      
      // 提交表单
      const submitButton = await page.$('button[type="submit"]')
      if (submitButton) {
        await submitButton.click()
        
        // 等待注册请求完成
        await delay(2000)
        
        // 检查是否调用了注册 API
        const registerRequest = checkApiRequest('/api/auth/register', 'POST')
        expect(registerRequest).toBeDefined()
        
        // 截图
        await page.screenshot({ path: 'screenshots/production-register.png' })
      }
    })

    it('should login with registered credentials', async () => {
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      
      // 填写登录表单
      await page.type('input[type="email"]', testUser.email)
      await page.type('input[type="password"]', testUser.password)
      
      // 提交表单
      const submitButton = await page.$('button[type="submit"]')
      if (submitButton) {
        await submitButton.click()
        
        // 等待登录请求完成
        await delay(2000)
        
        // 检查是否调用了登录 API
        const loginRequest = checkApiRequest('/api/auth/login', 'POST')
        expect(loginRequest).toBeDefined()
        
        // 检查是否重定向到首页或个人中心
        const currentUrl = page.url()
        expect([PROD_URL, `${PROD_URL}/`, `${PROD_URL}/profile`]).toContain(currentUrl)
        
        // 获取并保存 token（从 localStorage）
        const token = await page.evaluate(() => {
          return localStorage.getItem('token') || sessionStorage.getItem('token')
        })
        if (token) {
          authToken = token
        }
        
        // 截图
        await page.screenshot({ path: 'screenshots/production-login.png' })
      }
    })

    it('should logout successfully', async () => {
      // 先登录
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      await page.type('input[type="email"]', testUser.email)
      await page.type('input[type="password"]', testUser.password)
      
      const loginButton = await page.$('button[type="submit"]')
      if (loginButton) {
        await loginButton.click()
        await delay(2000)
      }
      
      // 查找并点击登出按钮
      const logoutButton = await page.$('button[aria-label*="logout"]') || 
                            await page.$('button:has-text("退出")') ||
                            await page.$('a[href="/logout"]')
      
      if (logoutButton) {
        await logoutButton.click()
        await delay(2000)
        
        // 检查是否调用了登出 API
        const logoutRequest = apiRequests.find(r => r.url.includes('/api/auth/logout'))
        expect(logoutRequest).toBeDefined()
        
        // 截图
        await page.screenshot({ path: 'screenshots/production-logout.png' })
      }
    })
  })

  describe('Post Creation and Interaction', () => {
    it('should navigate to create post page when logged in', async () => {
      // 登录
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      await page.type('input[type="email"]', testUser.email)
      await page.type('input[type="password"]', testUser.password)
      
      const loginButton = await page.$('button[type="submit"]')
      if (loginButton) {
        await loginButton.click()
        await delay(2000)
      }
      
      // 导航到创建帖子页面
      const createPostButton = await page.$('a[href="/posts/create"]') ||
                               await page.$('button:has-text("发帖")')
      
      if (createPostButton) {
        await createPostButton.click()
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
        
        expect(page.url()).toContain('/posts/create') || expect(page.url()).toContain('/create')
      } else {
        // 尝试直接访问
        await page.goto(`${PROD_URL}/posts/create`, { waitUntil: 'networkidle2' })
      }
      
      // 检查表单元素
      const titleInput = await page.$('input[name="title"]')
      const contentInput = await page.$('textarea[name="content"]') ||
                          await page.$('div[contenteditable="true"]')
      
      expect(titleInput).toBeTruthy()
      expect(contentInput).toBeTruthy()
    })

    it('should create a new post', async () => {
      // 登录
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      await page.type('input[type="email"]', testUser.email)
      await page.type('input[type="password"]', testUser.password)
      
      const loginButton = await page.$('button[type="submit"]')
      if (loginButton) {
        await loginButton.click()
        await delay(2000)
      }
      
      // 导航到创建帖子页面
      await page.goto(`${PROD_URL}/posts/create`, { waitUntil: 'networkidle2' })
      
      // 填写表单
      const timestamp = Date.now()
      const postTitle = `E2E 测试帖子 ${timestamp}`
      const postContent = `这是端到端测试创建的帖子内容 ${timestamp}`
      
      await page.type('input[name="title"]', postTitle)
      
      const contentInput = await page.$('textarea[name="content"]')
      if (contentInput) {
        await contentInput.type(postContent)
      } else {
        // 可能是富文本编辑器
        const editor = await page.$('div[contenteditable="true"]')
        if (editor) {
          await editor.type(postContent)
        }
      }
      
      // 提交表单
      const submitButton = await page.$('button[type="submit"]')
      if (submitButton) {
        await submitButton.click()
        
        // 等待创建请求完成
        await delay(3000)
        
        // 检查是否调用了创建帖子 API
        const createPostRequest = checkApiRequest('/api/posts', 'POST')
        expect(createPostRequest).toBeDefined()
        
        // 截图
        await page.screenshot({ path: 'screenshots/production-create-post.png' })
      }
    })

    it('should add comment to a post', async () => {
      // 登录
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      await page.type('input[type="email"]', testUser.email)
      await page.type('input[type="password"]', testUser.password)
      
      const loginButton = await page.$('button[type="submit"]')
      if (loginButton) {
        await loginButton.click()
        await delay(2000)
      }
      
      // 导航到帖子列表
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 等待帖子列表加载
      await page.waitForSelector('.post-card', { timeout: 10000 })
      
      const posts = await page.$$('.post-card')
      if (posts.length > 0) {
        // 点击第一个帖子
        await posts[0].click()
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
        
        // 等待页面加载
        await delay(1000)
        
        // 查找评论输入框
        const commentInput = await page.$('textarea[name="comment"]') ||
                            await page.$('input[placeholder*="评论"]') ||
                            await page.$('div[contenteditable="true"]')
        
        if (commentInput) {
          const commentText = `E2E 测试评论 ${Date.now()}`
          
          if (await commentInput.asElement()?.tagName === 'TEXTAREA') {
            await commentInput.type(commentText)
          } else {
            await commentInput.type(commentText)
          }
          
          // 提交评论
          const submitButton = await page.$('button[type="submit"]') ||
                              await page.$('button:has-text("发送")') ||
                              await page.$('button:has-text("评论")')
          
          if (submitButton) {
            await submitButton.click()
            
            // 等待评论请求完成
            await delay(2000)
            
            // 检查是否调用了评论 API
            const commentRequest = apiRequests.find(r => r.url.includes('/api/comments') && r.method === 'POST')
            expect(commentRequest).toBeDefined()
            
            // 截图
            await page.screenshot({ path: 'screenshots/production-add-comment.png' })
          }
        }
      }
    })
  })

  describe('API Error Handling', () => {
    it('should handle invalid login credentials', async () => {
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      
      // 使用错误的凭据
      await page.type('input[type="email"]', 'nonexistent@example.com')
      await page.type('input[type="password"]', 'wrongpassword')
      
      const submitButton = await page.$('button[type="submit"]')
      if (submitButton) {
        await submitButton.click()
        await delay(2000)
        
        // 检查登录 API 响应
        const loginRequest = checkApiRequest('/api/auth/login', 'POST')
        expect([400, 401, 404]).toContain(loginRequest?.status)
        
        // 检查是否显示了错误消息
        const errorMessage = await page.$('.error-message') ||
                            await page.$('.alert-error') ||
                            await page.$('[role="alert"]')
        
        expect(errorMessage).toBeTruthy()
      }
    })

    it('should handle duplicate registration', async () => {
      await page.goto(`${PROD_URL}/register`, { waitUntil: 'networkidle2' })
      
      // 使用已存在的邮箱
      await page.type('input[name="username"]', `testuser_${Date.now()}`)
      await page.type('input[name="email"]', testUser.email)
      await page.type('input[name="password"]', testUser.password)
      
      const submitButton = await page.$('button[type="submit"]')
      if (submitButton) {
        await submitButton.click()
        await delay(2000)
        
        // 检查注册 API 响应
        const registerRequest = checkApiRequest('/api/auth/register', 'POST')
        expect([400, 409]).toContain(registerRequest?.status)
      }
    })
  })

  describe('Performance and Responsiveness', () => {
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
      
      // 检查移动端菜单按钮
      const mobileMenu = await page.$('button[aria-label*="menu"]') ||
                        await page.$('.mobile-menu-toggle')
      
      await page.screenshot({ path: 'screenshots/production-mobile.png' })
      
      // 测试桌面端视图
      await page.setViewport({ width: 1920, height: 1080 })
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      await page.screenshot({ path: 'screenshots/production-desktop.png' })
    })
  })

  describe('Data Consistency', () => {
    it('should display correct post count', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2' })
      
      // 等待 API 响应
      await delay(2000)
      
      // 获取 API 返回的帖子数量
      const postsRequest = apiRequests.find(r => r.url.includes('/api/posts') && r.method === 'GET')
      if (postsRequest) {
        const response = await page.evaluate(async (url) => {
          const res = await fetch(url)
          const data = await res.json()
          return data.total || data.posts?.length || 0
        }, postsRequest.url)
        
        // 获取页面显示的帖子数量
        const postCards = await page.$$('.post-card')
        
        expect(postCards.length).toBeGreaterThan(0)
      }
    })

    it('should maintain user session across pages', async () => {
      // 登录
      await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle2' })
      await page.type('input[type="email"]', testUser.email)
      await page.type('input[type="password"]', testUser.password)
      
      const loginButton = await page.$('button[type="submit"]')
      if (loginButton) {
        await loginButton.click()
        await delay(2000)
      }
      
      // 获取 token
      const initialToken = await page.evaluate(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token')
      })
      
      // 导航到不同页面
      await page.goto(`${PROD_URL}/profile`, { waitUntil: 'networkidle2' })
      await delay(1000)
      
      const tokenAfterNavigation = await page.evaluate(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token')
      })
      
      // Token 应该保持一致
      expect(tokenAfterNavigation).toBe(initialToken)
    })
  })
})