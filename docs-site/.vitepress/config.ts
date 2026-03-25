import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CloudLink 文档',
  description: 'CloudLink 论坛系统官方文档 - 基于 Cloudflare Workers 的现代化论坛解决方案',
  lang: 'zh-CN',

  base: '/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'og:title', content: 'CloudLink 文档' }],
    ['meta', { name: 'og:description', content: 'CloudLink 论坛系统官方文档' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:image', content: '/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'CloudLink 文档' }],
    ['meta', { name: 'twitter:description', content: 'CloudLink 论坛系统官方文档' }],
    ['meta', { name: 'twitter:image', content: '/og-image.png' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    siteTitle: 'CloudLink',

    // 外观选项 - 启用暗黑模式
    appearance: 'dark',

    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: 'API', link: '/api/overview' },
      { text: '教程', link: '/tutorial/basic-usage' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门指南',
          collapsible: true,
          collapsed: false,
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
          collapsible: true,
          collapsed: false,
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
          collapsible: true,
          collapsed: false,
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
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'short'
      }
    },

    // 启用返回顶部按钮
    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    // 启用编辑链接
    editLink: {
      pattern: 'https://github.com/LemonStudio-hub/yunniu/edit/main/docs-site/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 启用文档页脚
    docFooter: {
      prev: '上一页',
      next: '下一页'
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
    },
    // 配置代码块主题
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    // 启用自定义容器
    config: (md) => {
      // 可以添加自定义 markdown-it 插件
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
  deadLinks: false,

  // 性能优化
  cacheDir: '.vitepress/cache',

  // 构建配置
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
})