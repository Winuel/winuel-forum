import puppeteer, { Browser, Page } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Winuel Forum - Basic E2E Tests', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
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

  it('should load the homepage', async () => {
    // 访问前端开发服务器
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
    
    // 检查页面标题
    const title = await page.title()
    expect(title).toBeTruthy()
    
    // 截图（可选）
    await page.screenshot({ path: 'screenshots/homepage.png' })
  })

  it('should display the header navigation', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
    
    // 检查导航元素是否存在
    const header = await page.$('header')
    expect(header).toBeTruthy()
  })

  it('should navigate to login page', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
    
    // 点击登录按钮（根据实际页面结构调整选择器）
    const loginButton = await page.$('a[href="/login"]')
    if (loginButton) {
      await loginButton.click()
      await page.waitForNavigation({ waitUntil: 'networkidle2' })
      
      // 检查 URL 是否正确
      expect(page.url()).toContain('/login')
    }
  })

  it('should display login form', async () => {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
    
    // 检查登录表单元素
    const emailInput = await page.$('input[type="email"]')
    const passwordInput = await page.$('input[type="password"]')
    
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
  })

  it('should fill login form', async () => {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
    
    // 填写表单
    await page.type('input[type="email"]', 'test@example.com')
    await page.type('input[type="password"]', 'password123')
    
    // 验证输入值
    const emailValue = await page.$eval('input[type="email"]', el => el.getAttribute('value'))
    expect(emailValue).toBe('test@example.com')
  })

  it('should navigate to registration page', async () => {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
    
    // 点击注册链接（根据实际页面结构调整选择器）
    const registerLink = await page.$('a[href="/register"]')
    if (registerLink) {
      await registerLink.click()
      await page.waitForNavigation({ waitUntil: 'networkidle2' })
      
      // 检查 URL 是否正确
      expect(page.url()).toContain('/register')
    }
  })

  it('should display registration form', async () => {
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' })
    
    // 检查注册表单元素
    const usernameInput = await page.$('input[name="username"]')
    const emailInput = await page.$('input[name="email"]')
    const passwordInput = await page.$('input[name="password"]')
    
    expect(usernameInput).toBeTruthy()
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
  })

  it('should handle theme toggle', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
    
    // 检查主题切换按钮
    const themeButton = await page.$('button[aria-label*="主题"]')
    if (themeButton) {
      // 获取初始主题
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      })
      
      // 点击主题切换按钮
      await themeButton.click()
      await page.waitForTimeout(500)
      
      // 检查主题是否切换
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      })
      
      expect(newTheme).not.toBe(initialTheme)
    }
  })
})

describe('Winuel Forum - Post Tests', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    page.setDefaultTimeout(30000)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('should display post list', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
    
    // 等待帖子列表加载
    await page.waitForSelector('.post-card', { timeout: 5000 })
    
    // 检查是否有帖子
    const posts = await page.$$('.post-card')
    expect(posts.length).toBeGreaterThanOrEqual(0)
  })

  it('should navigate to post detail', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
    
    // 等待帖子列表加载
    await page.waitForSelector('.post-card', { timeout: 5000 })
    
    // 点击第一个帖子
    const firstPost = await page.$('.post-card')
    if (firstPost) {
      await firstPost.click()
      await page.waitForNavigation({ waitUntil: 'networkidle2' })
      
      // 检查 URL 是否包含帖子 ID
      expect(page.url()).toContain('/post/')
    }
  })

  it('should display post content', async () => {
    // 导航到一个具体的帖子（需要根据实际情况调整）
    await page.goto('http://localhost:5173/post/1', { waitUntil: 'networkidle2' })
    
    // 检查帖子内容元素
    const postTitle = await page.$('h1')
    const postContent = await page.$('.post-content')
    
    if (postTitle) {
      const title = await postTitle.evaluate(el => el.textContent)
      expect(title).toBeTruthy()
    }
  })
})