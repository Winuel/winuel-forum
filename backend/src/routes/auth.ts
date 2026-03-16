import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { UserService } from '../services/userService'
import { authMiddleware } from '../middleware/auth'
import { strictAuthRateLimit } from '../middleware/rateLimit'
import { validatePassword, validateEmail, validateUsername, validateDisposableEmail } from '../utils/validation'
import { createError, handleError, formatErrorResponse } from '../utils/errorHandler'

const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

authRouter.post('/register', strictAuthRateLimit, async (c) => {
  try {
    const { username, email, password } = await c.req.json()

    if (!username || !email || !password) {
      throw createError.missingField('username, email, password are required')
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

authRouter.post('/logout', authMiddleware, async (c) => {
  return c.json({ message: '退出成功' })
})

export default authRouter