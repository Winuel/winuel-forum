import puppeteer, { Browser, Page } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Auth Pages Inspection', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    page.setDefaultTimeout(30000)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('should inspect login page', async () => {
    await page.goto('https://www.winuel.com/login', { waitUntil: 'networkidle2' })
    
    // 获取所有输入框
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        required: input.required
      }))
    })
    console.log('登录页面输入框:', JSON.stringify(inputs, null, 2))
    
    // 获取所有按钮
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(button => ({
        type: button.type,
        text: button.textContent?.trim(),
        className: button.className
      }))
    })
    console.log('登录页面按钮:', JSON.stringify(buttons, null, 2))
    
    // 获取表单
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map(form => ({
        action: form.action,
        method: form.method,
        className: form.className
      }))
    })
    console.log('登录页面表单:', JSON.stringify(forms, null, 2))
    
    // 截图
    await page.screenshot({ path: 'screenshots/inspect-login.png' })
  })

  it('should inspect register page', async () => {
    await page.goto('https://www.winuel.com/register', { waitUntil: 'networkidle2' })
    
    // 获取所有输入框
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        required: input.required
      }))
    })
    console.log('注册页面输入框:', JSON.stringify(inputs, null, 2))
    
    // 获取所有按钮
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(button => ({
        type: button.type,
        text: button.textContent?.trim(),
        className: button.className
      }))
    })
    console.log('注册页面按钮:', JSON.stringify(buttons, null, 2))
    
    // 截图
    await page.screenshot({ path: 'screenshots/inspect-register.png' })
  })
})