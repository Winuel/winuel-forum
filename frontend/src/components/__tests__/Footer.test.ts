import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '../Footer.vue'

describe('Footer Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Footer, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })
  })

  it('should render footer component', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('should display brand logo and name', () => {
    const brandSection = wrapper.find('.text-gradient-simple')
    expect(brandSection.text()).toBe('云纽论坛')
  })

  it('should display social media links', () => {
    const socialLinks = wrapper.findAll('a[aria-label]')
    expect(socialLinks.length).toBeGreaterThan(0)
    
    const githubLink = socialLinks.find((link: any) => link.attributes('aria-label') === 'GitHub')
    expect(githubLink).toBeDefined()
    expect(githubLink.attributes('href')).toBe('https://github.com/LemonStudio-hub/yunniu')
  })

  it('should display product navigation links', () => {
    const productLinks = wrapper.findAll('a[href="/features"]')
    expect(productLinks.length).toBeGreaterThan(0)
  })

  it('should display community navigation links', () => {
    const communityLinks = wrapper.findAll('a[href="/blog"]')
    expect(communityLinks.length).toBeGreaterThan(0)
  })

  it('should display support navigation links', () => {
    const supportLinks = wrapper.findAll('a[href="/help"]')
    expect(supportLinks.length).toBeGreaterThan(0)
  })

  it('should have subscription form', () => {
    const subscribeForm = wrapper.find('form')
    expect(subscribeForm.exists()).toBe(true)
    
    const emailInput = wrapper.find('input[type="email"]')
    expect(emailInput.exists()).toBe(true)
    
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.exists()).toBe(true)
  })

  it('should handle subscription form submission', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const submitButton = wrapper.find('button[type="submit"]')
    
    await emailInput.setValue('test@example.com')
    await submitButton.trigger('submit')
    
    // 等待模拟的订阅完成
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 验证订阅成功消息显示
    expect(wrapper.vm.subscribeSuccess).toBe(true)
    expect(wrapper.vm.subscribeMessage).toContain('订阅成功')
  })

  it('should validate empty email submission', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const submitButton = wrapper.find('button[type="submit"]')
    
    // 尝试提交空邮箱
    await submitButton.trigger('submit')
    
    // 表单应该阻止提交（HTML5 验证）
    expect(emailInput.attributes('required')).toBeDefined()
  })

  it('should display legal links', () => {
    const termsLink = wrapper.find('a[href="/terms"]')
    const privacyLink = wrapper.find('a[href="/privacy"]')
    const cookiesLink = wrapper.find('a[href="/cookies"]')
    
    expect(termsLink.exists()).toBe(true)
    expect(privacyLink.exists()).toBe(true)
    expect(cookiesLink.exists()).toBe(true)
  })

  it('should have language toggle button', () => {
    const languageButton = wrapper.find('button')
    expect(languageButton.exists()).toBe(true)
  })

  it('should toggle language on button click', async () => {
    const languageButton = wrapper.findAll('button').find((btn: any) => btn.text().includes('中文') || btn.text().includes('English'))
    
    expect(languageButton).toBeDefined()
    
    const initialLanguage = wrapper.vm.currentLanguage
    
    await languageButton.trigger('click')
    
    expect(wrapper.vm.currentLanguage).not.toBe(initialLanguage)
  })

  it('should display copyright information', () => {
    const copyright = wrapper.find('footer').text()
    expect(copyright).toContain('© 2026 云纽论坛')
    expect(copyright).toContain('All rights reserved')
  })

  it('should have proper responsive classes', () => {
    // 验证响应式网格布局
    const gridSection = wrapper.find('.grid')
    expect(gridSection.classes()).toContain('grid-cols-1')
    expect(gridSection.classes()).toContain('md:grid-cols-2')
    expect(gridSection.classes()).toContain('lg:grid-cols-5')
  })

  it('should apply glass morphism effect', () => {
    const footer = wrapper.find('footer')
    expect(footer.classes()).toContain('glass-strong')
    expect(footer.classes()).toContain('backdrop-blur-xl')
  })
})
