/**
 * XSS防护工具
 * 提供内容清理和转义功能，防止XSS攻击
 */

/**
 * 转义HTML特殊字符
 * 用于纯文本内容的转义
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 转义URL参数
 */
export function escapeUrl(unsafe: string): string {
  if (!unsafe) return ''
  return encodeURIComponent(unsafe)
}

/**
 * 清理HTML内容
 * 移除危险标签和属性，但保留安全的HTML格式
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // 移除危险的标签和属性
  const dangerousPatterns = [
    // 脚本标签
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // 事件处理器
    /\s*on\w+\s*=\s*["'][^"']*["']/gi,
    // javascript: 协议
    /javascript:[^"']*/gi,
    // data: 协议（可能包含恶意代码）
    /data:[^"']*/gi,
    // iframe标签
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    // object标签
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    // embed标签
    /<embed\b[^>]*>/gi,
    // form标签
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    // input标签
    /<input\b[^>]*>/gi,
    // button标签（可能有onclick事件）
    /<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi,
    // style标签（可能包含表达式）
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    // link标签
    /<link\b[^>]*>/gi,
    // meta标签（可能有刷新跳转）
    /<meta\b[^>]*>/gi,
  ]

  let sanitized = html
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  return sanitized
}

/**
 * 清理用户输入的纯文本
 * 移除所有HTML标签
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '')
}

/**
 * 清理用户名
 * 限制特殊字符和长度
 */
export function sanitizeUsername(username: string): string {
  if (!username) return ''
  // 移除HTML标签和危险字符
  const sanitized = sanitizeText(username)
  // 限制长度
  return sanitized.substring(0, 20)
}

/**
 * 验证并清理URL
 * 确保URL协议安全
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  try {
    const parsedUrl = new URL(url)
    // 只允许http和https协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '#'
    }
    return url
  } catch {
    // 无效的URL
    return '#'
  }
}

/**
 * 清理JSON数据
 * 防止JSON注入攻击
 */
export function sanitizeJson(jsonString: string): string {
  if (!jsonString) return ''
  
  try {
    const parsed = JSON.parse(jsonString)
    // 移除函数和特殊对象
    const cleaned = JSON.parse(JSON.stringify(parsed, (_key, value) => {
      // 移除函数
      if (typeof value === 'function') {
        return undefined
      }
      // 移除undefined
      if (value === undefined) {
        return null
      }
      return value
    }))
    return JSON.stringify(cleaned)
  } catch {
    // 如果解析失败，返回空对象
    return '{}'
  }
}

/**
 * 清理用户输入的通用函数
 * 根据输入类型选择适当的清理方法
 */
export function sanitizeInput(input: unknown, type: 'text' | 'html' | 'url' | 'username' | 'json'): string {
  switch (type) {
    case 'text':
      return sanitizeText(String(input))
    case 'html':
      return sanitizeHtml(String(input))
    case 'url':
      return sanitizeUrl(String(input))
    case 'username':
      return sanitizeUsername(String(input))
    case 'json':
      return sanitizeJson(String(input))
    default:
      return sanitizeText(String(input))
  }
}

/**
 * Vue 3 v-html 指令的清理包装器
 * 使用方法: <div v-html="cleanHtml(userContent)"></div>
 */
export function cleanHtml(html: string): string {
  return sanitizeHtml(html)
}