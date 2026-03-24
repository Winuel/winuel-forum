/**
 * 验证码管理服务
 * 负责验证码的创建、验证和管理
 */

import { generateId } from '../utils/crypto'
import {
  generateVerificationCode,
  isValidVerificationCode,
  getVerificationCodeExpiry,
  isVerificationCodeExpired
} from '../utils/otpUtils'
import { EmailService } from './emailService'

/**
 * 验证码类型
 */
export type VerificationCodeType = 'register' | 'reset_password' | 'change_email' | 'verify_email'

/**
 * 验证码输入
 */
export interface CreateVerificationCodeInput {
  email: string
  type: VerificationCodeType
}

/**
 * 验证验证码输入
 */
export interface VerifyCodeInput {
  email: string
  code: string
  type: VerificationCodeType
}

/**
 * 验证码结果
 */
export interface VerificationCodeResult {
  id: string
  email: string
  code: string
  type: VerificationCodeType
  expiresAt: string
  createdAt: string
  usedAt?: string
  attempts: number
}

/**
 * 验证码管理服务类
 */
export class VerificationCodeService {
  constructor(
    private db: D1Database,
    private emailService: EmailService
  ) {}

  /**
   * 创建并发送验证码
   * @param input 验证码输入
   * @returns 创建结果
   */
  async create(input: CreateVerificationCodeInput): Promise<{
    success: boolean
    error?: string
    cooldown?: number // 剩余冷却时间（秒）
  }> {
    const { email, type } = input

    // 检查是否在冷却期内（60秒）
    const cooldownCheck = await this.checkCooldown(email, type)
    if (cooldownCheck.inCooldown) {
      return {
        success: false,
        error: '发送过于频繁，请稍后再试',
        cooldown: cooldownCheck.remainingSeconds
      }
    }

    // 清理该邮箱和类型的旧验证码
    await this.cleanupOldCodes(email, type)

    // 生成新验证码
    const code = generateVerificationCode()
    const id = generateId()
    const now = new Date().toISOString()
    const expiresAt = getVerificationCodeExpiry()

    // 保存到数据库
    try {
      await this.db.prepare(
        'INSERT INTO verification_codes (id, email, code, type, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, email, code, type, expiresAt, now).run()
    } catch (error: any) {
      console.error('Failed to save verification code:', error)
      return {
        success: false,
        error: '验证码保存失败'
      }
    }

    // 发送邮件
    const emailResult = await this.emailService.sendVerificationCode(email, code)
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      // 即使邮件发送失败，验证码也已保存，用户可以尝试重新发送
      return {
        success: false,
        error: '邮件发送失败，请稍后再试'
      }
    }

    return {
      success: true
    }
  }

  /**
   * 验证验证码
   * @param input 验证输入
   * @returns 验证结果
   */
  async verify(input: VerifyCodeInput): Promise<{
    success: boolean
    error?: string
  }> {
    const { email, code, type } = input

    // 验证验证码格式
    if (!isValidVerificationCode(code)) {
      return {
        success: false,
        error: '验证码格式错误'
      }
    }

    // 查找验证码
    const result = await this.db.prepare(
      'SELECT * FROM verification_codes WHERE email = ? AND type = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1'
    ).bind(email, type).first<VerificationCodeResult>()

    if (!result) {
      return {
        success: false,
        error: '验证码不存在或已过期'
      }
    }

    // 检查是否过期
    if (isVerificationCodeExpired(result.expiresAt)) {
      return {
        success: false,
        error: '验证码已过期'
      }
    }

    // 检查验证码是否正确
    if (result.code !== code) {
      // 增加尝试次数
      const newAttempts = result.attempts + 1
      await this.db.prepare(
        'UPDATE verification_codes SET attempts = ? WHERE id = ?'
      ).bind(newAttempts, result.id).run()

      // 检查是否超过最大尝试次数
      if (newAttempts >= 3) {
        // 标记为已使用，防止继续尝试
        await this.db.prepare(
          'UPDATE verification_codes SET used_at = ? WHERE id = ?'
        ).bind(new Date().toISOString(), result.id).run()

        return {
          success: false,
          error: '验证码错误次数过多，请重新获取'
        }
      }

      return {
        success: false,
        error: '验证码错误'
      }
    }

    // 验证成功，标记为已使用
    await this.db.prepare(
      'UPDATE verification_codes SET used_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), result.id).run()

    return {
      success: true
    }
  }

  /**
   * 检查冷却期
   * @param email 邮箱
   * @param type 类型
   * @returns 冷却状态
   */
  private async checkCooldown(
    email: string,
    type: VerificationCodeType
  ): Promise<{
    inCooldown: boolean
    remainingSeconds: number
  }> {
    const cooldownPeriod = 60 // 60秒冷却期

    const result = await this.db.prepare(
      'SELECT created_at FROM verification_codes WHERE email = ? AND type = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(email, type).first<{ created_at: string }>()

    if (!result) {
      return {
        inCooldown: false,
        remainingSeconds: 0
      }
    }

    const createdAt = new Date(result.created_at)
    const now = new Date()
    const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
    const remainingSeconds = cooldownPeriod - elapsedSeconds

    return {
      inCooldown: remainingSeconds > 0,
      remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 0
    }
  }

  /**
   * 清理旧验证码
   * @param email 邮箱
   * @param type 类型
   */
  private async cleanupOldCodes(email: string, type: VerificationCodeType): Promise<void> {
    // 删除该邮箱和类型的所有未使用的验证码
    await this.db.prepare(
      'DELETE FROM verification_codes WHERE email = ? AND type = ? AND used_at IS NULL'
    ).bind(email, type).run()
  }

  /**
   * 清理过期的验证码（定期调用）
   */
  async cleanupExpiredCodes(): Promise<number> {
    const now = new Date().toISOString()
    const result = await this.db.prepare(
      'DELETE FROM verification_codes WHERE expires_at < ?'
    ).bind(now).run()

    console.log(`Cleaned up ${result.meta.changes || 0} expired verification codes`)
    return result.meta.changes || 0
  }
}