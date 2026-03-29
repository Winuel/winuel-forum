import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { UserService } from '../services/userService'
import { VerificationCodeService } from '../services/verificationCodeService'
import { PasswordResetService } from '../services/passwordResetService'
import { authMiddleware } from '../middleware/auth'
import { strictAuthRateLimit } from '../middleware/rateLimit'
import { csrfProtectionMiddleware } from '../middleware/csrf'
import { validatePassword, validateEmail, validateUsername, validateDisposableEmail } from '../utils/validation'
import { createError, handleError, formatErrorResponse } from '../utils/errorHandler'
import { logger } from '../utils/logger'

const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

authRouter.post('/register', strictAuthRateLimit, async (c) => {
  try {
    const { username, email, password, verificationCode } = await c.req.json()

    if (!username || !email || !password || !verificationCode) {
      throw createError.missingField('username, email, password, and verificationCode are required')
    }

    // 验证用户名
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      throw createError.validationError(usernameValidation.errors.join(', '))
    }

    // 验证邮箱
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw createError.validationError(emailValidation.errors.join(', '))
    }

    // 验证一次性邮箱
    const disposableValidation = validateDisposableEmail(email)
    if (!disposableValidation.isValid) {
      throw createError.validationError(disposableValidation.errors.join(', '))
    }

    // 验证密码
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      throw createError.validationError(passwordValidation.errors.join(', '))
    }

    // 验证验证码
    const emailService = (globalThis as any).emailService
    if (emailService && emailService.isAvailable()) {
      const verificationCodeService = new VerificationCodeService(c.env.DB, emailService)
      const verifyResult = await verificationCodeService.verify({
        email,
        code: verificationCode,
        type: 'register'
      })

      if (!verifyResult.success) {
        return c.json({
          success: false,
          error: {
            code: 'INVALID_VERIFICATION_CODE',
            message: verifyResult.error
          }
        }, 400)
      }
    }

    const userService = new UserService(c.env.DB)
    const existingUser = await userService.findByEmail(email)

    if (existingUser) {
      throw createError.alreadyExists('email')
    }

    const result = await userService.create({ username, email, password })
    return c.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

authRouter.post('/login', strictAuthRateLimit, async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      throw createError.missingField('email, password are required')
    }

    const userService = new UserService(c.env.DB)
    const result = await userService.login({ email, password })

    // Set httpOnly cookie for enhanced security
    c.header('Set-Cookie', `auth_token=${result.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`)

    return c.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 401
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

/**
 * 管理员登录端点 - 返回 ADMIN 受众的令牌
 */
authRouter.post('/admin/login', strictAuthRateLimit, async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      throw createError.missingField('email, password are required')
    }

    const userService = new UserService(c.env.DB)
    const result = await userService.adminLogin({ email, password })

    // Set httpOnly cookie for enhanced security
    c.header('Set-Cookie', `admin_token=${result.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`)

    return c.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 401
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

authRouter.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const userService = new UserService(c.env.DB)
    const userData = await userService.getPublicUser(user.userId)

    if (!userData) {
      throw createError.notFound('user')
    }

    return c.json({
      success: true,
      data: userData
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

authRouter.post('/logout', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.substring(7)

    // 将令牌添加到黑名单
    // Add token to blacklist
    if (token && (globalThis as any).tokenBlacklist) {
      // 令牌过期时间为 1 小时（与 JWT 访问令牌过期时间一致）
      // Token expiration time is 1 hour (consistent with JWT access token expiration)
      await (globalThis as any).tokenBlacklist.addToken(token, 3600)
    }

    return c.json({
      success: true,
      message: '退出成功 / Logout successful'
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

/**
 * 发送验证码
 * POST /api/auth/send-verification-code
 */
authRouter.post('/send-verification-code', strictAuthRateLimit, async (c) => {
  try {
    const { email, type = 'register' } = await c.req.json()

    if (!email) {
      throw createError.missingField('email is required')
    }

    // 验证邮箱格式
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw createError.validationError(emailValidation.errors.join(', '))
    }

    // 验证一次性邮箱
    const disposableValidation = validateDisposableEmail(email)
    if (!disposableValidation.isValid) {
      throw createError.validationError(disposableValidation.errors.join(', '))
    }

    // 获取邮件服务
    const emailService = (globalThis as any).emailService
    const emailServiceError = (globalThis as any).EMAIL_SERVICE_ERROR

    logger.debug('Email service status', {
      serviceExists: !!emailService,
      isAvailable: emailService?.isAvailable?.(),
      error: emailServiceError
    })

    if (!emailService) {
      logger.error('Email service not initialized', { error: emailServiceError })
      throw createError.internalError(
        '邮件服务未初始化，请联系管理员。' +
        (emailServiceError ? ` 错误信息: ${emailServiceError}` : '')
      )
    }

    if (!emailService.isAvailable()) {
      logger.error('Email service not available', { error: emailServiceError })
      throw createError.internalError(
        '邮件服务当前不可用，请稍后重试。' +
        (emailServiceError ? ` 错误信息: ${emailServiceError}` : '')
      )
    }

    const verificationCodeService = new VerificationCodeService(c.env.DB, emailService)

    logger.debug('Attempting to send verification code', { email, type })
    const result = await verificationCodeService.create({ email, type })

    if (!result.success) {
      if (result.cooldown) {
        logger.debug('Verification code cooldown', { email, cooldown: result.cooldown })
        return c.json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: result.error,
            details: `请在 ${result.cooldown} 秒后重试`
          }
        }, 429)
      }
      logger.error('Failed to create verification code', { error: result.error })
      throw createError.internalError(result.error || '发送验证码失败')
    }

    logger.info('Verification code sent successfully', { email })
    return c.json({
      success: true,
      message: '验证码已发送，请查看您的邮箱'
    })
  } catch (error: any) {
    logger.error('Error in send-verification-code', error)
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

/**
 * 验证验证码
 * POST /api/auth/verify-code
 */
authRouter.post('/verify-code', strictAuthRateLimit, async (c) => {
  try {
    const { email, code, type = 'register' } = await c.req.json()

    if (!email || !code) {
      throw createError.missingField('email and code are required')
    }

    // 验证邮箱格式
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw createError.validationError(emailValidation.errors.join(', '))
    }

    // 获取邮件服务
    const emailService = (globalThis as any).emailService
    if (!emailService || !emailService.isAvailable()) {
      throw createError.internalError('邮件服务不可用')
    }

    const verificationCodeService = new VerificationCodeService(c.env.DB, emailService)

    const result = await verificationCodeService.verify({ email, code, type })

    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_VERIFICATION_CODE',
          message: result.error
        }
      }, 400)
    }

    return c.json({
      success: true,
      message: '验证码验证成功'
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

/**
 * 请求密码重置
 * POST /api/auth/request-password-reset
 */
authRouter.post('/request-password-reset', strictAuthRateLimit, async (c) => {
  try {
    const { email } = await c.req.json()

    if (!email) {
      throw createError.missingField('email is required')
    }

    // 验证邮箱格式
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw createError.validationError(emailValidation.errors.join(', '))
    }

    // 查找用户
    const userService = new UserService(c.env.DB)
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ? AND deleted_at IS NULL')
      .bind(email)
      .first<{ id: string }>()

    if (!user) {
      // 为了安全，即使用户不存在也返回成功，避免枚举攻击
      logger.info('Password reset requested for non-existent email', { email })
      return c.json({
        success: true,
        message: '如果该邮箱已注册，您将收到密码重置邮件'
      })
    }

    // 检查是否已有有效的重置令牌
    const passwordResetService = new PasswordResetService(c.env.DB)
    const hasValidToken = await passwordResetService.hasValidToken(user.id)
    if (hasValidToken.hasValid) {
      logger.info('Password reset requested but valid token already exists', { userId: user.id })
      return c.json({
        success: true,
        message: '密码重置邮件已发送，请检查您的邮箱'
      })
    }

    // 创建重置令牌
    const result = await passwordResetService.createResetToken(user.id)
    if (!result.success || !result.token) {
      throw createError.internalError(result.error || '创建密码重置令牌失败')
    }

    // 发送重置邮件
    const emailService = (globalThis as any).emailService
    if (!emailService || !emailService.isAvailable()) {
      throw createError.internalError('邮件服务不可用')
    }

    // 生成重置链接（前端需要实现重置页面）
    const resetLink = `${(globalThis as any).ENV?.API_URL || 'https://api.winuel.com'}/api/auth/reset-password?token=${result.token}`
    
    // 这里应该使用邮件服务发送邮件
    // 由于邮件服务实现可能不同，这里只是记录
    logger.info('Password reset email should be sent', { email, resetLink: resetLink.substring(0, 50) + '...' })

    // 实际项目中，这里应该调用emailService发送邮件
    // await emailService.sendPasswordResetEmail(email, resetLink)

    return c.json({
      success: true,
      message: '如果该邮箱已注册，您将收到密码重置邮件'
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

/**
 * 重置密码
 * POST /api/auth/reset-password
 */
authRouter.post('/reset-password', strictAuthRateLimit, async (c) => {
  try {
    const { token, newPassword } = await c.req.json()

    if (!token || !newPassword) {
      throw createError.missingField('token and newPassword are required')
    }

    // 验证新密码强度
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      throw createError.validationError(passwordValidation.errors.join(', '))
    }

    // 重置密码
    const passwordResetService = new PasswordResetService(c.env.DB)
    const result = await passwordResetService.resetPassword({ token, newPassword })

    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: 'PASSWORD_RESET_FAILED',
          message: result.error || '重置密码失败'
        }
      }, 400)
    }

    return c.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    })
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

export default authRouter
