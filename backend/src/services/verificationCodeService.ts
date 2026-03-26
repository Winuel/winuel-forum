/**
 * 验证码管理服务
 * Verification Code Management Service
 * 
 * 负责验证码的创建、验证和管理，包括：
 * - 验证码生成和发送
 * - 验证码验证（格式、有效期、正确性）
 * - 冷却期管理
 * - 过期验证码清理
 * 
 * Responsible for verification code creation, verification, and management, including:
 * - Verification code generation and sending
 * - Verification code validation (format, validity, correctness)
 * - Cooldown period management
 * - Expired verification code cleanup
 * 
 * @package backend/src/services
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
 * Verification Code Type
 * 定义不同用途的验证码类型
 * Defines different verification code types for various purposes
 */
export type VerificationCodeType = 'register' | 'reset_password' | 'change_email' | 'verify_email'

/**
 * 创建验证码输入接口
 * Create Verification Code Input Interface
 * 定义创建验证码所需的数据结构
 * Defines the data structure required for creating a verification code
 */
export interface CreateVerificationCodeInput {
  /** 邮箱地址 / Email address */
  email: string
  /** 验证码类型 / Verification code type */
  type: VerificationCodeType
}

/**
 * 验证验证码输入接口
 * Verify Code Input Interface
 * 定义验证验证码所需的数据结构
 * Defines the data structure required for verifying a verification code
 */
export interface VerifyCodeInput {
  /** 邮箱地址 / Email address */
  email: string
  /** 验证码 / Verification code */
  code: string
  /** 验证码类型 / Verification code type */
  type: VerificationCodeType
}

/**
 * 验证码结果接口
 * Verification Code Result Interface
 * 定义验证码的数据结构
 * Defines the data structure of verification code
 */
export interface VerificationCodeResult {
  /** 验证码 ID / Verification code ID */
  id: string
  /** 邮箱地址 / Email address */
  email: string
  /** 验证码 / Verification code */
  code: string
  /** 验证码类型 / Verification code type */
  type: VerificationCodeType
  /** 过期时间 / Expiration time */
  expiresAt: string
  /** 创建时间 / Creation time */
  createdAt: string
  /** 使用时间 / Usage time */
  usedAt?: string
  /** 尝试次数 / Number of attempts */
  attempts: number
}

/**
 * 验证码管理服务类
 * Verification Code Management Service Class
 * 
 * 提供验证码管理的所有业务逻辑
 * Provides all business logic for verification code management
 */
export class VerificationCodeService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param db - D1 数据库实例 / D1 database instance
   * @param emailService - 邮件服务实例 / Email service instance
   */
  constructor(
    private db: D1Database,
    private emailService: EmailService
  ) {}

  /**
   * 创建并发送验证码
   * Create and Send Verification Code
   * 
   * 生成验证码并通过邮件发送给用户
   * Generates a verification code and sends it to the user via email
   * 
   * @param input - 验证码输入 / Verification code input
   * @returns 创建结果 / Creation result
   */
  async create(input: CreateVerificationCodeInput): Promise<{
    success: boolean
    error?: string
    cooldown?: number // 剩余冷却时间（秒）/ Remaining cooldown time (seconds)
  }> {
    const { email, type } = input

    // 检查是否在冷却期内（60秒）/ Check if within cooldown period (60 seconds)
    const cooldownCheck = await this.checkCooldown(email, type)
    if (cooldownCheck.inCooldown) {
      return {
        success: false,
        error: '发送过于频繁，请稍后再试 / Sending too frequently, please try again later',
        cooldown: cooldownCheck.remainingSeconds
      }
    }

    // 清理该邮箱和类型的旧验证码 / Clean up old verification codes for this email and type
    await this.cleanupOldCodes(email, type)

    // 生成新验证码 / Generate new verification code
    const code = generateVerificationCode()
    const id = generateId()
    const now = new Date().toISOString()
    const expiresAt = getVerificationCodeExpiry()

    // 保存到数据库 / Save to database
    try {
      await this.db.prepare(
        'INSERT INTO verification_codes (id, email, code, type, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, email, code, type, expiresAt, now).run()
    } catch (error: any) {
      console.error('Failed to save verification code:', error, '保存验证码失败:', error)
      return {
        success: false,
        error: '验证码保存失败 / Failed to save verification code'
      }
    }

    // 发送邮件 / Send email
    const emailResult = await this.emailService.sendVerificationCode(email, code)
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error, '发送验证码邮件失败:', emailResult.error)
      // 即使邮件发送失败，验证码也已保存，用户可以尝试重新发送 / Even if email sending fails, verification code is saved, user can try resending
      return {
        success: false,
        error: '邮件发送失败，请稍后再试 / Email sending failed, please try again later'
      }
    }

    return {
      success: true
    }
  }

  /**
   * 验证验证码
   * Verify Verification Code
   * 
   * 验证用户输入的验证码是否正确
   * Verifies if the verification code entered by the user is correct
   * 
   * @param input - 验证输入 / Verification input
   * @returns 验证结果 / Verification result
   */
  async verify(input: VerifyCodeInput): Promise<{
    success: boolean
    error?: string
  }> {
    const { email, code, type } = input

    // 验证验证码格式 / Validate verification code format
    if (!isValidVerificationCode(code)) {
      return {
        success: false,
        error: '验证码格式错误 / Invalid verification code format'
      }
    }

    // 查找验证码 / Find verification code
    const result = await this.db.prepare(
      'SELECT * FROM verification_codes WHERE email = ? AND type = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1'
    ).bind(email, type).first<VerificationCodeResult>()

    if (!result) {
      return {
        success: false,
        error: '验证码不存在或已过期 / Verification code does not exist or has expired'
      }
    }

    // 检查是否过期 / Check if expired
    if (isVerificationCodeExpired(result.expiresAt)) {
      return {
        success: false,
        error: '验证码已过期 / Verification code has expired'
      }
    }

    // 检查验证码是否正确 / Check if verification code is correct
    if (result.code !== code) {
      // 增加尝试次数 / Increment attempt count
      const newAttempts = result.attempts + 1
      await this.db.prepare(
        'UPDATE verification_codes SET attempts = ? WHERE id = ?'
      ).bind(newAttempts, result.id).run()

      // 检查是否超过最大尝试次数 / Check if exceeded maximum attempts
      if (newAttempts >= 3) {
        // 标记为已使用，防止继续尝试 / Mark as used to prevent further attempts
        await this.db.prepare(
          'UPDATE verification_codes SET used_at = ? WHERE id = ?'
        ).bind(new Date().toISOString(), result.id).run()

        return {
          success: false,
          error: '验证码错误次数过多，请重新获取 / Too many incorrect verification code attempts, please get a new one'
        }
      }

      return {
        success: false,
        error: '验证码错误 / Incorrect verification code'
      }
    }

    // 验证成功，标记为已使用 / Verification successful, mark as used
    await this.db.prepare(
      'UPDATE verification_codes SET used_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), result.id).run()

    return {
      success: true
    }
  }

  /**
   * 检查冷却期（私有方法）
   * Check Cooldown Period (Private Method)
   * 
   * 检查用户是否可以再次发送验证码
   * Checks if the user can send another verification code
   * 
   * @param email - 邮箱 / Email
   * @param type - 类型 / Type
   * @returns 冷却状态 / Cooldown status
   */
  private async checkCooldown(
    email: string,
    type: VerificationCodeType
  ): Promise<{
    inCooldown: boolean
    remainingSeconds: number
  }> {
    const cooldownPeriod = 60 // 60秒冷却期 / 60 seconds cooldown period

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
   * 清理旧验证码（私有方法）
   * Clean Up Old Verification Codes (Private Method)
   * 
   * @param email - 邮箱 / Email
   * @param type - 类型 / Type
   */
  private async cleanupOldCodes(email: string, type: VerificationCodeType): Promise<void> {
    // 删除该邮箱和类型的所有未使用的验证码 / Delete all unused verification codes for this email and type
    await this.db.prepare(
      'DELETE FROM verification_codes WHERE email = ? AND type = ? AND used_at IS NULL'
    ).bind(email, type).run()
  }

  /**
   * 清理过期的验证码（定期调用）
   * Clean Up Expired Verification Codes (Call Periodically)
   * 
   * 删除所有过期的验证码记录
   * Deletes all expired verification code records
   * 
   * @returns 删除的记录数 / Number of deleted records
   */
  async cleanupExpiredCodes(): Promise<number> {
    const now = new Date().toISOString()
    const result = await this.db.prepare(
      'DELETE FROM verification_codes WHERE expires_at < ?'
    ).bind(now).run()

    console.log(`Cleaned up ${result.meta.changes || 0} expired verification codes / 清理了 ${result.meta.changes || 0} 个过期验证码`)
    return result.meta.changes || 0
  }
}