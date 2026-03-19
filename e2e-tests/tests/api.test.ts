import puppeteer, { Browser, Page } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('CloudLink Forum - API E2E Tests', () => {
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

  it('should fetch categories from API', async () => {
    const response = await page.evaluate(async () => {
      const res = await fetch('http://localhost:8787/api/categories')
      return {
        status: res.status,
        data: await res.json()
      }
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('categories')
    expect(Array.isArray(response.data.categories)).toBe(true)
  })

  it('should fetch posts from API', async () => {
    const response = await page.evaluate(async () => {
      const res = await fetch('http://localhost:8787/api/posts?page=1&limit=20')
      return {
        status: res.status,
        data: await res.json()
      }
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('posts')
    expect(Array.isArray(response.data.posts)).toBe(true)
  })

  it('should handle user registration', async () => {
    const timestamp = Date.now()
    const userData = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'Test123!@#'
    }
    
    const response = await page.evaluate(async (data) => {
      const res = await fetch('http://localhost:8787/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return {
        status: res.status,
        data: await res.json()
      }
    }, userData)
    
    // 期望返回 201（创建成功）或 409（用户已存在）
    expect([200, 201, 409]).toContain(response.status)
  })

  it('should handle user login', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Test123!@#'
    }
    
    const response = await page.evaluate(async (data) => {
      const res = await fetch('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return {
        status: res.status,
        data: await res.json()
      }
    }, loginData)
    
    // 登录可能成功也可能失败（取决于用户是否存在）
    expect([200, 400, 401, 404]).toContain(response.status)
  })

  it('should handle invalid credentials', async () => {
    const invalidData = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    }
    
    const response = await page.evaluate(async (data) => {
      const res = await fetch('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return {
        status: res.status,
        data: await res.json()
      }
    }, invalidData)
    
    // 期望返回 400 或 401（认证失败）
    expect([400, 401]).toContain(response.status)
  })

  it('should enforce rate limiting', async () => {
    const requests = []
    
    // 发送多个请求以触发速率限制
    for (let i = 0; i < 6; i++) {
      const response = await page.evaluate(async () => {
        const res = await fetch('http://localhost:8787/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
        })
        return res.status
      })
      requests.push(response)
    }
    
    // 至少有一个请求应该被速率限制（429）
    expect(requests).toContain(429)
  })
})