import puppeteer, { Browser, Page } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Site Inspection', () => {
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

  it('should inspect homepage structure', async () => {
    await page.goto('https://www.winuel.com', { waitUntil: 'networkidle2' })
    
    // 获取页面标题
    const title = await page.title()
    console.log('页面标题:', title)
    
    // 获取所有链接
    const links = await page.$$eval('a', elements => elements.map(el => ({
      text: el.textContent?.trim(),
      href: el.getAttribute('href')
    })))
    console.log('所有链接:', links.slice(0, 10))
    
    // 获取所有按钮
    const buttons = await page.$$eval('button', elements => elements.map(el => ({
      text: el.textContent?.trim(),
      type: el.getAttribute('type')
    })))
    console.log('所有按钮:', buttons)
    
    // 获取所有输入框
    const inputs = await page.$$eval('input', elements => elements.map(el => ({
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      placeholder: el.getAttribute('placeholder')
    })))
    console.log('所有输入框:', inputs)
    
    // 截图
    await page.screenshot({ path: 'screenshots/site-inspection-home.png' })
    
    // 保存 HTML 内容
    const html = await page.content()
    console.log('页面 HTML 长度:', html.length)
  })
})