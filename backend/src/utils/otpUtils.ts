/**
 * 验证码工具函数
 * Verification Code Utility Functions
 * 
 * 提供一次性密码（OTP）的生成和验证功能，包括：
 * - 生成 6 位数字验证码
 * - 验证验证码格式
 * - 计算验证码过期时间
 * - 检查验证码是否过期
 * - 格式化验证码显示
 * 
 * Provides one-time password (OTP) generation and verification functionality, including:
 * - Generate 6-digit verification code
 * - Verify verification code format
 * - Calculate verification code expiration time
 * - Check if verification code is expired
 * - Format verification code for display
 * 
 * @package backend/src/utils
 */

/**
 * 生成 6 位数字验证码
 * Generate 6-Digit Verification Code
 * 
 * 生成一个随机的 6 位数字验证码
 * Generates a random 6-digit verification code
 * 
 * @returns 6 位数字字符串 / 6-digit number string
 */
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000)
  return code.toString()
}

/**
 * 验证验证码格式
 * Verify Verification Code Format
 * 
 * 检查验证码是否符合 6 位数字的格式要求
 * Checks if the verification code meets the 6-digit number format requirement
 * 
 * @param code - 验证码 / Verification code
 * @returns 是否有效 / Whether it's valid
 */
export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/**
 * 计算验证码过期时间
 * Calculate Verification Code Expiration Time
 * 
 * 计算验证码的过期时间（当前时间 + 5分钟）
 * Calculates the expiration time of the verification code (current time + 5 minutes)
 * 
 * @returns ISO 格式的过期时间字符串 / ISO format expiration time string
 */
export function getVerificationCodeExpiry(): string {
  const expiryDate = new Date()
  expiryDate.setMinutes(expiryDate.getMinutes() + 5)
  return expiryDate.toISOString()
}

/**
 * 检查验证码是否过期
 * Check if Verification Code is Expired
 * 
 * 检查验证码是否已经过期
 * Checks if the verification code has expired
 * 
 * @param expiresAt - 过期时间（ISO 格式）/ Expiration time (ISO format)
 * @returns 是否已过期 / Whether it's expired
 */
export function isVerificationCodeExpired(expiresAt: string): boolean {
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  return now > expiryDate
}

/**
 * 格式化验证码显示
 * Format Verification Code for Display
 * 
 * 将验证码格式化为每 2 位用空格分隔，便于阅读
 * Formats the verification code with spaces every 2 digits for easy reading
 * 
 * @param code - 6 位数字验证码 / 6-digit verification code
 * @returns 格式化后的验证码 / Formatted verification code
 */
export function formatVerificationCode(code: string): string {
  return code.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3')
}