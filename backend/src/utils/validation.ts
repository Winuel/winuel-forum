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