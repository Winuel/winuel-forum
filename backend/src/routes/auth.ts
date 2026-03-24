import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { UserService } from '../services/userService'
import { VerificationCodeService } from '../services/verificationCodeService'
import { authMiddleware } from '../middleware/auth'
import { strictAuthRateLimit } from '../middleware/rateLimit'
import { csrfProtectionMiddleware } from '../middleware/csrf'
import { validatePassword, validateEmail, validateUsername, validateDisposableEmail } from '../utils/validation'
import { createError, handleError, formatErrorResponse } from '../utils/errorHandler'

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
    return c.json(result)
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
    
    return c.json(result)
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
    
    return c.json(result)
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

    return c.json(userData)
  } catch (error: any) {
    const errorInfo = handleError(error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500
    return c.json(formatErrorResponse(errorInfo), statusCode)
  }
})

authRouter.post('/logout', authMiddleware, csrfProtectionMiddleware, async (c) => {
  return c.json({ message: '退出成功' })
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
    if (!emailService || !emailService.isAvailable()) {
      throw createError.internalError('邮件服务不可用')
    }

    const verificationCodeService = new VerificationCodeService(c.env.DB, emailService)

    const result = await verificationCodeService.create({ email, type })

    if (!result.success) {
      if (result.cooldown) {
        return c.json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: result.error,
            details: `请在 ${result.cooldown} 秒后重试`
          }
        }, 429)
      }
      throw createError.internalError(result.error || '发送验证码失败')
    }

    return c.json({
      success: true,
      message: '验证码已发送，请查看您的邮箱'
    })
  } catch (error: any) {
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

export default authRouter
