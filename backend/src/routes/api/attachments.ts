/**
 * 代码附件API路由
 * 使用依赖注入容器
 */

import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { DEPENDENCY_TOKENS } from '../../utils/di'
import { authMiddleware } from '../../middleware/auth'
import { CodeAttachmentService } from '../../services/codeAttachmentService'
import { logger } from '../../utils/logger'

/**
 * 允许的编程语言白名单
 * Allowed Programming Languages Whitelist
 * 
 * 防止恶意代码上传，只允许已知的编程语言
 * Prevents malicious code uploads, only allows known programming languages
 */
const ALLOWED_LANGUAGES: string[] = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust',
  'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'json', 'yaml', 'sql', 'bash',
  'shell', 'markdown', 'xml', 'other'
]

/**
 * 验证文件名安全性
 * Validate File Name Security
 * 
 * 防止路径遍历攻击
 * Prevents path traversal attacks
 * 
 * @param fileName - 文件名 / File name
 * @returns 是否安全 / Whether safe
 */
function isFileNameSafe(fileName: string): boolean {
  // 检查是否包含路径遍历字符
  // Check if contains path traversal characters
  const dangerousPatterns = [
    '..', './', '\\\\', '/', '\0', '<', '>', '"', "'", '|', ':', '*', '?'
  ]
  
  for (const pattern of dangerousPatterns) {
    if (fileName.includes(pattern)) {
      return false
    }
  }
  
  // 检查文件扩展名
  // Check file extension
  const dangerousExtensions = [
    '.exe', '.sh', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.py', '.rb', '.php', '.pl', '.cgi', '.asp', '.jsp'
  ]
  
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  if (dangerousExtensions.includes(extension)) {
    return false
  }
  
  return true
}

/**
 * 验证语言类型
 * Validate Language Type
 * 
 * @param language - 语言类型 / Language type
 * @returns 是否有效 / Whether valid
 */
function isLanguageAllowed(language: string): boolean {
  return ALLOWED_LANGUAGES.includes(language.toLowerCase())
}

/**
 * 生成安全的文件名
 * Generate Secure File Name
 * 
 * 使用UUID和原始文件名生成安全的文件名，防止文件名注入攻击
 * Uses UUID and original file name to generate secure file name, prevents file name injection attacks
 * 
 * @param originalFileName - 原始文件名 / Original file name
 * @returns 安全的文件名 / Secure file name
 */
function generateSecureFileName(originalFileName: string): string {
  // 提取文件扩展名
  // Extract file extension
  const extension = originalFileName.substring(originalFileName.lastIndexOf('.'))
  
  // 生成UUID作为文件名前缀
  // Generate UUID as file name prefix
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  
  // 组合成安全的文件名
  // Combine into secure file name
  return `${timestamp}-${random}${extension}`
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 上传代码附件
app.post('/upload', authMiddleware, async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '需要登录' }
    }, 401)
  }

  try {
    const body = await c.req.json()
    const { post_id, file_name, language, content } = body

    // 验证必要参数 / Validate required parameters
    if (!post_id || !file_name || !language || !content) {
      return c.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '缺少必要参数' }
      }, 400)
    }

    // 验证文件名安全性 / Validate file name security
    if (!isFileNameSafe(file_name)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_FILE_NAME', message: '文件名包含非法字符或扩展名' }
      }, 400)
    }

    // 验证文件名长度 / Validate file name length
    if (file_name.length > 255) {
      return c.json({
        success: false,
        error: { code: 'FILE_NAME_TOO_LONG', message: '文件名过长，最大255字符' }
      }, 400)
    }

    // 验证语言类型 / Validate language type
    if (!isLanguageAllowed(language)) {
      return c.json({
        success: false,
        error: { 
          code: 'INVALID_LANGUAGE', 
          message: `不支持的语言类型。支持的语言: ${ALLOWED_LANGUAGES.join(', ')}`
        }
      }, 400)
    }

    // 验证内容长度 / Validate content length
    if (content.length > 512 * 1024) { // 512KB
      return c.json({
        success: false,
        error: { code: 'CONTENT_TOO_LARGE', message: '代码内容超过512KB限制' }
      }, 400)
    }

    // 验证内容不为空 / Validate content is not empty
    if (!content.trim()) {
      return c.json({
        success: false,
        error: { code: 'EMPTY_CONTENT', message: '代码内容不能为空' }
      }, 400)
    }

    // 生成安全的文件名
    // Generate secure file name
    const secureFileName = generateSecureFileName(file_name)

    // 检测潜在的恶意代码 / Detect potential malicious code
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,          // Script tags
      /<iframe[^>]*>.*?<\/iframe>/gi,          // Iframe tags
      /javascript:/gi,                           // JavaScript protocol
      /on\w+\s*=/gi,                             // Event handlers
      /eval\s*\(/gi,                             // Eval function
      /<object[^>]*>.*?<\/object>/gi,           // Object tags
      /<embed[^>]*>.*?<\/embed>/gi,             // Embed tags
      /data:text\/html/gi,                        // Data URLs
      /document\.cookie/gi,                      // Cookie access
      /document\.write/gi,                       // Document write
      /window\.location/gi,                      // Location redirect
      /<\?php/gi,                                // PHP tags
      /<%/g,                                     // ASP tags
    ]

    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        return c.json({
          success: false,
          error: { code: 'MALICIOUS_CODE_DETECTED', message: '检测到潜在的恶意代码' }
        }, 400)
      }
    }

    const result = await service.upload({
      post_id,
      file_name: secureFileName,
      original_file_name: file_name, // 保存原始文件名
      language,
      content
    })

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: result.error }
      }, 400)
    }

    return c.json({
      success: true,
      data: result.attachment
    })
  } catch (error) {
    logger.error('Upload error', error)
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '上传失败' }
    }, 500)
  }
})

// 获取代码附件详情
app.get('/:id', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()

  const result = await service.getAttachment(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: result.error }
    }, 404)
  }

  return c.json({
    success: true,
    data: result.attachment
  })
})

// 获取帖子的所有代码附件
app.get('/post/:postId', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { postId } = c.req.param()

  const result = await service.getPostAttachments(postId)

  return c.json({
    success: true,
    data: result.attachments || []
  })
})

// 删除代码附件
app.delete('/:id', authMiddleware, async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '需要登录' }
    }, 401)
  }

  // 验证权限（附件的作者或管理员才能删除）
  const attachment = await service.getAttachment(id)
  if (attachment.success && attachment.attachment) {
    const user = c.get('user')
    const isAuthor = attachment.attachment.author_id === user?.userId
    const isAdmin = user?.role === 'admin'
    
    if (!isAuthor && !isAdmin) {
      return c.json({
        success: false,
        error: { code: 'FORBIDDEN', message: '没有权限删除此附件' }
      }, 403)
    }
  }

  const result = await service.deleteAttachment(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'DELETE_FAILED', message: result.error }
    }, 400)
  }

  return c.json({
    success: true,
    message: '附件已删除'
  })
})

// 获取版本历史
app.get('/:id/versions', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()

  const result = await service.getVersionHistory(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'GET_VERSIONS_FAILED', message: result.error }
    }, 400)
  }

  return c.json({
    success: true,
    data: result.versions || []
  })
})

// 获取审查提议
app.get('/:id/reviews', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()

  const result = await service.getReviews(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'GET_REVIEWS_FAILED', message: result.error }
    }, 400)
  }

  return c.json({
    success: true,
    data: result.reviews || []
  })
})

export default app