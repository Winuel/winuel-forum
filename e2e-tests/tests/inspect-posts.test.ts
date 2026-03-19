import puppeteer, { Browser, Page } from 'puppeteer'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Posts Structure Inspection', () => {
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

  it('should inspect posts structure', async () => {
    await page.goto('https://www.winuel.com', { waitUntil: 'networkidle2' })
    
    // 获取所有包含帖子链接的元素
    const postLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/post/"]'))
      return links.map(link => {
        const parent = link.closest('div') || link.closest('article') || link.parentElement
        return {
          href: link.getAttribute('href'),
          text: link.textContent?.trim(),
          parentClass: parent?.className,
          parentTag: parent?.tagName,
          html: parent?.outerHTML?.slice(0, 200)
        }
      })
    })
    console.log('帖子链接和父元素:', JSON.stringify(postLinks, null, 2))
    
    // 获取所有可能的帖子容器
    const containers = await page.evaluate(() => {
      const containers = []
      document.querySelectorAll('article, .post, .card, .item').forEach(el => {
        containers.push({
          tag: el.tagName,
          class: el.className,
          html: el.outerHTML.slice(0, 300)
        })
      })
      return containers
    })
    console.log('可能的帖子容器:', JSON.stringify(containers, null, 2))
    
    // 获取页面主体结构
    const mainStructure = await page.evaluate(() => {
      const main = document.querySelector('main') || document.querySelector('.main') || document.body
      const children = Array.from(main.children).slice(0, 5)
      return children.map(child => ({
        tag: child.tagName,
        class: child.className,
        id: child.id
      }))
    })
    console.log('页面主体结构:', JSON.stringify(mainStructure, null, 2))
    
    // 截图
    await page.screenshot({ path: 'screenshots/inspect-posts.png' })
  })
})