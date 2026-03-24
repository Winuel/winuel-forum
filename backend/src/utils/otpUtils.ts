/**
 * 验证码工具函数
 * 用于生成和验证一次性密码（OTP）
 */

/**
 * 生成 6 位数字验证码
 * @returns 6 位数字字符串
 */
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000)
  return code.toString()
}

/**
 * 验证验证码格式
 * @param code 验证码
 * @returns 是否有效
 */
export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/**
 * 计算验证码过期时间（当前时间 + 5分钟）
 * @returns ISO 格式的过期时间字符串
 */
export function getVerificationCodeExpiry(): string {
  const expiryDate = new Date()
  expiryDate.setMinutes(expiryDate.getMinutes() + 5)
  return expiryDate.toISOString()
}

/**
 * 检查验证码是否过期
 * @param expiresAt 过期时间（ISO 格式）
 * @returns 是否已过期
 */
export function isVerificationCodeExpired(expiresAt: string): boolean {
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  return now > expiryDate
}

/**
 * 格式化验证码显示（每2位用空格分隔，便于阅读）
 * @param code 6位数字验证码
 * @returns 格式化后的验证码
 */
export function formatVerificationCode(code: string): string {
  return code.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3')
}