import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '../Footer.vue'

describe('Footer Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Footer, {
      global: {
        stubs: ['router-link']
      }
    })
  })

  it('should render footer component', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('should display social media links', () => {
    const socialLinks = wrapper.findAll('a[aria-label]')
    expect(socialLinks.length).toBe(4)
    
    const githubLink = socialLinks.find((link: any) => link.attributes('aria-label') === 'GitHub')
    expect(githubLink).toBeDefined()
    expect(githubLink.attributes('href')).toBe('https://github.com/Winuel/winuel')
    
    const studioLink = socialLinks.find((link: any) => link.attributes('aria-label') === '工作室主页')
    expect(studioLink).toBeDefined()
    expect(studioLink.attributes('href')).toBe('https://github.com/Winuel')
    
    const emailLink = socialLinks.find((link: any) => link.attributes('aria-label') === '联系我们')
    expect(emailLink).toBeDefined()
    expect(emailLink.attributes('href')).toBe('mailto:lemonhub@163.com')
    
    const websiteLink = socialLinks.find((link: any) => link.attributes('aria-label') === '官方网站')
    expect(websiteLink).toBeDefined()
    expect(websiteLink.attributes('href')).toBe('https://www.winuel.com')
  })

  it('should display navigation links', () => {
    const termsLink = wrapper.find('a[href="/terms"]')
    const privacyLink = wrapper.find('a[href="/privacy"]')
    const contactLink = wrapper.find('a[href="/contact"]')
    
    expect(termsLink.exists()).toBe(true)
    expect(termsLink.text()).toBe('使用条款')
    
    expect(privacyLink.exists()).toBe(true)
    expect(privacyLink.text()).toBe('隐私政策')
    
    expect(contactLink.exists()).toBe(true)
    expect(contactLink.text()).toBe('联系我们')
  })

  it('should display copyright information', () => {
    const copyright = wrapper.find('footer').text()
    expect(copyright).toContain('云纽论坛')
    expect(copyright).toContain('© 2026 All rights reserved')
  })

  it('should display brand logo', () => {
    const logo = wrapper.find('footer svg')
    expect(logo.exists()).toBe(true)
  })

  it('should have proper responsive classes', () => {
    const footer = wrapper.find('footer')
    expect(footer.exists()).toBe(true)
    
    // 验证响应式布局类
    const flexContainer = wrapper.find('.flex')
    expect(flexContainer.classes()).toContain('flex-col')
    expect(flexContainer.classes()).toContain('md:flex-row')
  })

  it('should apply glass morphism effect', () => {
    const footer = wrapper.find('footer')
    expect(footer.classes()).toContain('glass-strong')
    expect(footer.classes()).toContain('backdrop-blur-xl')
  })

  it('should have hover effects on links', () => {
    const navLinks = wrapper.findAll('nav a')
    navLinks.forEach((link: any) => {
      expect(link.classes()).toContain('hover:text-primary-600')
      expect(link.classes()).toContain('transition-colors')
    })
  })

  it('should have hover effects on social icons', () => {
    const socialLinks = wrapper.findAll('a[aria-label]')
    socialLinks.forEach((link: any) => {
      expect(link.classes()).toContain('hover:scale-110')
      expect(link.classes()).toContain('transition-all')
      // 社交图标有不同的背景色 hover 效果
      expect(link.classes().some((cls: string) => cls.startsWith('hover:bg-'))).toBe(true)
    })
  })

  it('should have correct spacing between elements', () => {
    const footer = wrapper.find('footer')
    expect(footer.exists()).toBe(true)
    
    const container = wrapper.find('.container')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('py-8')
  })

  it('should have consistent gap between elements', () => {
    const flexContainer = wrapper.find('.flex-col')
    expect(flexContainer.classes()).toContain('gap-6')
    
    const mdFlexContainer = wrapper.find('.md\\:flex-row')
    expect(mdFlexContainer.classes()).toContain('gap-6')
  })

  it('should have proper text colors', () => {
    const brandName = wrapper.find('.font-semibold')
    expect(brandName.classes()).toContain('text-gray-900')
    
    const copyrightText = wrapper.find('.text-xs')
    expect(copyrightText.classes()).toContain('text-gray-500')
  })

  it('should have proper border styling', () => {
    const footer = wrapper.find('footer')
    expect(footer.classes()).toContain('border-t')
    expect(footer.classes()).toContain('border-gray-200/50')
  })
})