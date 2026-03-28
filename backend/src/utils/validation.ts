import { logger } from './logger'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 一次性邮箱黑名单检查器
 */
export class DisposableEmailChecker {
  private blocklist: Set<string>
  private allowlist: Set<string>

  constructor(blocklist: string[] = [], allowlist: string[] = []) {
    this.blocklist = new Set(blocklist.map(d => d.toLowerCase().trim()))
    this.allowlist = new Set(allowlist.map(d => d.toLowerCase().trim()))
  }

  /**
   * 检查邮箱是否为一次性邮箱
   * @param email 邮箱地址
   * @returns 如果是一次性邮箱返回 true，否则返回 false
   */
  isDisposableEmail(email: string): boolean {
    const domain = this.extractDomain(email)
    if (!domain) return false

    // 首先检查是否在允许名单中
    if (this.isInAllowlist(domain)) {
      return false
    }

    // 检查是否在黑名单中
    return this.isInBlocklist(domain)
  }

  /**
   * 提取邮箱域名
   */
  private extractDomain(email: string): string | null {
    const match = email.match(/@([^@]+)$/)
    return match ? match[1].toLowerCase() : null
  }

  /**
   * 检查域名是否在允许名单中
   */
  private isInAllowlist(domain: string): boolean {
    const domainParts = domain.split('.')
    // 检查域名及其所有父域名
    for (let i = 0; i < domainParts.length - 1; i++) {
      const checkDomain = domainParts.slice(i).join('.')
      if (this.allowlist.has(checkDomain)) {
        return true
      }
    }
    return false
  }

  /**
   * 检查域名是否在黑名单中
   */
  private isInBlocklist(domain: string): boolean {
    const domainParts = domain.split('.')
    // 检查域名及其所有父域名（跳过顶级域名）
    for (let i = 0; i < domainParts.length - 1; i++) {
      const checkDomain = domainParts.slice(i).join('.')
      if (this.blocklist.has(checkDomain)) {
        return true
      }
    }
    return false
  }

  /**
   * 添加域名到黑名单
   */
  addToBlocklist(domains: string[]): void {
    domains.forEach(d => this.blocklist.add(d.toLowerCase().trim()))
  }

  /**
   * 添加域名到允许名单
   */
  addToAllowlist(domains: string[]): void {
    domains.forEach(d => this.allowlist.add(d.toLowerCase().trim()))
  }

  /**
   * 获取黑名单大小
   */
  getBlocklistSize(): number {
    return this.blocklist.size
  }

  /**
   * 获取允许名单大小
   */
  getAllowlistSize(): number {
    return this.allowlist.size
  }
}

// 全局检查器实例（需要在应用启动时初始化）
let globalEmailChecker: DisposableEmailChecker | null = null

/**

 * 初始化全局邮箱检查器

 */

export function initEmailChecker(blocklist: string[], allowlist: string[] = []): void {

  try {

    globalEmailChecker = new DisposableEmailChecker(blocklist, allowlist)

  } catch (error) {

    logger.error('Failed to initialize email checker', error)

    // 即使初始化失败，也不抛出错误，继续运行

  }

}



/**

 * 检查邮箱是否为一次性邮箱

 * @param email 邮箱地址

 * @returns 如果是一次性邮箱返回 true，否则返回 false

 */

export function isDisposableEmail(email: string): boolean {

  if (!globalEmailChecker) {

    logger.warn('Email checker not initialized. Please call initEmailChecker first.')

    return false

  }

  try {

    return globalEmailChecker.isDisposableEmail(email)

  } catch (error) {

    logger.error('Error checking disposable email', error)

    return false

  }

}





/**

 * 添加验证邮箱是否为一次性邮箱的结果到 ValidationResult

 */

export function validateDisposableEmail(email: string): ValidationResult {

  if (!globalEmailChecker) {

    logger.warn('Email checker not initialized. Skipping disposable email check.')

    return {

      isValid: true,

      errors: []

    }

  }



  try {

    if (globalEmailChecker.isDisposableEmail(email)) {

      return {

        isValid: false,

        errors: ['不允许使用一次性邮箱注册，请使用您的永久邮箱地址']

      }

    }

  } catch (error) {

    logger.error('Error validating disposable email', error)

    // 验证失败时，为了安全起见，允许通过

  }



  return {

    isValid: true,

    errors: []

  }

}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  // 最小长度检查（至少8位）
  if (password.length < 8) {
    errors.push('密码长度至少为8个字符 / Password must be at least 8 characters')
  }

  // 最大长度检查
  if (password.length > 128) {
    errors.push('密码长度不能超过128个字符 / Password must not exceed 128 characters')
  }

  // 检查是否包含字母
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('密码必须包含至少一个字母 / Password must contain at least one letter')
  }

  // 检查是否包含数字
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字 / Password must contain at least one number')
  }

  // 检查是否包含特殊字符
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符（如：!@#$%^&*等）/ Password must contain at least one special character (e.g., !@#$%^&*)')
  }

  // 检查常见弱密码
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123',
    'password123', '123456789', 'admin', 'letmein',
    'welcome', 'monkey', 'dragon', 'master',
    '12345678', '11111111', 'qwerty123', 'test1234',
    '123456ab', '123abc12', 'password1', '1234qwer',
    'Password123!', 'Admin123!', 'Qwerty123!', 'Test1234!'
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('密码过于简单，请使用更复杂的密码 / Password is too weak, please use a stronger password')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  // 基本的邮箱格式检查
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('邮箱格式不正确')
  }

  // 检查邮箱长度
  if (email.length > 254) {
    errors.push('邮箱地址过长')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = []

  // 检查用户名长度
  if (username.length < 3) {
    errors.push('用户名至少为3个字符')
  }
  if (username.length > 20) {
    errors.push('用户名不能超过20个字符')
  }

  // 检查用户名格式（允许中文、字母、数字、下划线和连字符）
  // 使用更广泛的中文 Unicode 范围
  if (!/^[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaffa-zA-Z0-9_-]+$/.test(username)) {
    errors.push('用户名只能包含中文、字母、数字、下划线和连字符')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 验证帖子标题
 * Validate Post Title
 */
export function validatePostTitle(title: string): ValidationResult {
  const errors: string[] = []

  // 检查标题长度
  if (!title || title.trim().length === 0) {
    errors.push('标题不能为空 / Title cannot be empty')
  }
  if (title.length < 5) {
    errors.push('标题至少为5个字符 / Title must be at least 5 characters')
  }
  if (title.length > 200) {
    errors.push('标题不能超过200个字符 / Title cannot exceed 200 characters')
  }

  // 检查是否包含恶意HTML标签
  const htmlTags = /<[^>]*>/g
  if (htmlTags.test(title)) {
    errors.push('标题不能包含HTML标签 / Title cannot contain HTML tags')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 验证帖子内容
 * Validate Post Content
 */
export function validatePostContent(content: string): ValidationResult {
  const errors: string[] = []

  // 检查内容长度
  if (!content || content.trim().length === 0) {
    errors.push('内容不能为空 / Content cannot be empty')
  }
  if (content.length < 10) {
    errors.push('内容至少为10个字符 / Content must be at least 10 characters')
  }
  if (content.length > 50000) {
    errors.push('内容不能超过50000个字符 / Content cannot exceed 50000 characters')
  }

  // 检查是否包含危险的脚本标签
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      errors.push('内容包含潜在的恶意代码 / Content contains potentially malicious code')
      break
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 验证标签
 * Validate Tags
 */
export function validateTags(tags: string[]): ValidationResult {
  const errors: string[] = []

  // 检查标签数量
  if (!Array.isArray(tags)) {
    errors.push('标签必须是数组 / Tags must be an array')
    return { isValid: false, errors }
  }

  if (tags.length > 10) {
    errors.push('最多10个标签 / Maximum 10 tags allowed')
  }

  // 检查每个标签
  for (const tag of tags) {
    if (typeof tag !== 'string') {
      errors.push('每个标签必须是字符串 / Each tag must be a string')
      continue
    }

    if (tag.length === 0) {
      errors.push('标签不能为空 / Tag cannot be empty')
      continue
    }

    if (tag.length > 30) {
      errors.push(`标签"${tag}"过长，最多30个字符 / Tag "${tag}" is too long, maximum 30 characters`)
      continue
    }

    // 检查标签格式（允许中文、字母、数字、下划线和连字符）
    if (!/^[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaffa-zA-Z0-9_-]+$/.test(tag)) {
      errors.push(`标签"${tag}"包含非法字符 / Tag "${tag}" contains invalid characters`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 验证评论内容
 * Validate Comment Content
 */
export function validateCommentContent(content: string): ValidationResult {
  const errors: string[] = []

  // 检查内容长度
  if (!content || content.trim().length === 0) {
    errors.push('评论内容不能为空 / Comment cannot be empty')
  }
  if (content.length < 2) {
    errors.push('评论至少为2个字符 / Comment must be at least 2 characters')
  }
  if (content.length > 10000) {
    errors.push('评论不能超过10000个字符 / Comment cannot exceed 10000 characters')
  }

  // 检查是否包含危险的脚本标签（与帖子验证相同）
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      errors.push('评论包含潜在的恶意代码 / Comment contains potentially malicious code')
      break
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}