import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CloudLink 文档',
  description: 'CloudLink 论坛系统官方文档 - 基于 Cloudflare Workers 的现代化论坛解决方案',
  lang: 'zh-CN',
  
  base: '/',
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0ea5e9' }],
    ['meta', { name: 'og:title', content: 'CloudLink 文档' }],
    ['meta', { name: 'og:description', content: 'CloudLink 论坛系统官方文档' }],
    ['meta', { name: 'og:type', content: 'website' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    siteTitle: 'CloudLink',
    
    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: 'API', link: '/api/overview' },
      { text: '教程', link: '/tutorial/basic-usage' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门指南',
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '配置指南', link: '/guide/configuration' },
            { text: '部署指南', link: '/guide/deployment' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API文档',
          items: [
            { text: 'API概述', link: '/api/overview' },
            { text: '认证接口', link: '/api/authentication' },
            { text: '用户接口', link: '/api/users' },
            { text: '帖子接口', link: '/api/posts' },
            { text: '评论接口', link: '/api/comments' }
          ]
        }
      ],
      '/tutorial/': [
        {
          text: '教程',
          items: [
            { text: '基础使用', link: '/tutorial/basic-usage' },
            { text: '高级功能', link: '/tutorial/advanced-features' },
            { text: '插件开发', link: '/tutorial/plugin-development' },
            { text: '最佳实践', link: '/tutorial/best-practices' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LemonStudio-hub/yunniu' },
      { icon: 'twitter', link: 'https://twitter.com/cloudlink' }
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024 Lemon Studio'
    },

    search: {
      provider: 'local'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'short'
      }
    }
  },

  markdown: {
    lineNumbers: true,
    vue: {
      templateCompilerOptions: {
        compilerOptions: {
          isCustomElement: (tag) => false
        }
      }
    }
  },

  vite: {
    css: {
      postcss: './postcss.config.js'
    }
  },

  // 禁用严格的死链检查
  strict: false,

  // 完全禁用死链检查
  deadLinks: false
})