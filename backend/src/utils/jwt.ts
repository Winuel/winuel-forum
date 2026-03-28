/**
 * JWT（JSON Web Token）工具函数
 * JWT (JSON Web Token) Utility Functions
 * 
 * 提供 JWT 令牌的生成和验证功能，包括：
 * - 令牌生成（支持 USER 和 ADMIN 两种受众）
 * - 令牌验证
 * - 密钥强度验证
 * - 弱密钥检测
 * 
 * Provides JWT token generation and verification functionality, including:
 * - Token generation (supports USER and ADMIN audiences)
 * - Token verification
 * - Secret key strength validation
 * - Weak secret detection
 * 
 * @package backend/src/utils
 */

import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '../db/models'

/** JWT 密钥 / JWT secret */
let JWT_SECRET: Uint8Array | null = null

/**
 * 常见弱密钥列表
 * Common Weak Secrets List
 * 
 * 包含常见的弱密码和容易被猜测的密钥
 * Contains common weak passwords and easily guessable secrets
 */
const WEAK_SECRETS = [
  'password',
  '12345678',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  'secret',
  'jwtsecret',
  'changeme',
  'admin',
  'root',
  'test',
  'demo',
  'default',
  'password123',
  '1234567890',
  'qwerty123',
  'abcdef123456',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'hello',
  'football',
  'baseball',
  'trustno1',
  'iloveyou',
  'sunshine',
  'princess',
  'admin123',
  'welcome123',
  'password1',
  '123456789'
]

/**
 * 检查密钥是否为常见弱密钥（私有函数）
 * Check if Secret is Common Weak Secret (Private Function)
 * 
 * @param secret - 要检查的密钥 / Secret to check
 * @returns 是否为弱密钥 / Whether it's a weak secret
 */
function isWeakSecret(secret: string): boolean {
  const lowerSecret = secret.toLowerCase()
  return WEAK_SECRETS.some(weak => lowerSecret.includes(weak))
}

/**
 * 计算密钥的熵值（复杂性）（私有函数）
 * Calculate Secret Entropy (Complexity) (Private Function)
 * 
 * 熵值越高，密钥越安全
 * Higher entropy means more secure secret
 * 
 * @param secret - 密钥 / Secret
 * @returns 熵值（位）/ Entropy value (bits)
 */
function calculateEntropy(secret: string): number {
  const charset: Record<string, number> = {
    lowercase: 26,
    uppercase: 26,
    digits: 10,
    special: 32
  }
  
  let hasLowercase = /[a-z]/.test(secret)
  let hasUppercase = /[A-Z]/.test(secret)
  let hasDigits = /[0-9]/.test(secret)
  let hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/.test(secret)
  
  let poolSize = 0
  if (hasLowercase) poolSize += charset.lowercase
  if (hasUppercase) poolSize += charset.uppercase
  if (hasDigits) poolSize += charset.digits
  if (hasSpecial) poolSize += charset.special
  
  // 熵值 = log2(poolSize) * length / Entropy = log2(poolSize) * length
  const entropy = Math.log2(poolSize) * secret.length
  return entropy
}

/**
 * 验证密钥强度
 * Validate Secret Strength
 * 
 * 检查密钥是否符合安全要求
 * Checks if the secret meets security requirements
 * 
 * @param secret - 要验证的密钥 / Secret to validate
 * @returns 验证结果 / Validation result
 */
export function validateJWTSecret(secret: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 检查长度 / Check length
  if (secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long / JWT_SECRET 至少需要32个字符')
  }
  
  // 检查是否为常见弱密钥 / Check if it's a common weak secret
  if (isWeakSecret(secret)) {
    errors.push('JWT_SECRET is too common or weak. Use a more secure secret. / JWT_SECRET 太常见或太弱。请使用更安全的密钥。')
  }
  
  // 检查复杂性 / Check complexity
  const hasLowercase = /[a-z]/.test(secret)
  const hasUppercase = /[A-Z]/.test(secret)
  const hasDigits = /[0-9]/.test(secret)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/.test(secret)
  
  if (!hasLowercase) {
    errors.push('JWT_SECRET must contain at least one lowercase letter / JWT_SECRET 必须包含至少一个小写字母')
  }
  if (!hasUppercase) {
    errors.push('JWT_SECRET must contain at least one uppercase letter / JWT_SECRET 必须包含至少一个大写字母')
  }
  if (!hasDigits) {
    errors.push('JWT_SECRET must contain at least one digit / JWT_SECRET 必须包含至少一个数字')
  }
  if (!hasSpecial) {
    errors.push('JWT_SECRET must contain at least one special character / JWT_SECRET 必须包含至少一个特殊字符')
  }
  
  // 检查熵值（至少80位）/ Check entropy (minimum 80 bits)
  const entropy = calculateEntropy(secret)
  if (entropy < 80) {
    errors.push(`JWT_SECRET entropy (${entropy.toFixed(2)} bits) is too low. Minimum 80 bits required. / JWT_SECRET 熵值（${entropy.toFixed(2)} 位）太低。最少需要80位。`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 初始化 JWT
 * Initialize JWT
 * 
 * 设置 JWT 密钥并验证其强度
 * Sets JWT secret and validates its strength
 * 
 * @param secret - JWT 密钥 / JWT secret
 * @throws 如果密钥验证失败 / Throws if secret validation fails
 */
export function initJWT(secret: string): void {
  try {
    // 验证密钥强度 / Validate secret strength
    const validation = validateJWTSecret(secret)
    
    if (!validation.valid) {
      console.error('JWT_SECRET validation failed: / JWT_SECRET 验证失败:')
      validation.errors.forEach(error => console.error(`  - ${error}`))
      throw new Error(validation.errors[0])
    } else {
      // 记录密钥强度信息 / Log secret strength info
      const entropy = calculateEntropy(secret)
      console.log(`JWT initialized successfully (entropy: ${entropy.toFixed(2)} bits) / JWT 初始化成功（熵值：${entropy.toFixed(2)} 位）`)
    }
    
    JWT_SECRET = new TextEncoder().encode(secret)
  } catch (error) {
    console.error('Failed to initialize JWT:', error, '初始化 JWT 失败:', error)
    throw error
  }
}

/**
 * 获取 JWT 密钥（私有函数）
 * Get JWT Secret (Private Function)
 * 
 * @returns JWT 密钥 / JWT secret
 * @throws 如果 JWT 未初始化 / Throws if JWT is not initialized
 */
function getSecret(): Uint8Array {
  if (!JWT_SECRET) {
    console.error('JWT not initialized. Call initJWT() first / JWT 未初始化。请先调用 initJWT()')
    throw new Error('JWT not initialized. Call initJWT() first / JWT 未初始化。请先调用 initJWT()')
  }
  return JWT_SECRET
}

/**
 * 受众类型枚举
 * Audience Type Enum
 * 
 * 定义 JWT 令牌的受众类型
 * Defines the audience types for JWT tokens
 */
export enum Audience {
  /** 普通用户受众 / Regular user audience */
  USER = 'user',
  /** 管理员受众 / Admin audience */
  ADMIN = 'admin'
}

/**
 * 带受众的 JWT Payload 接口
 * JWT Payload with Audience Interface
 * 
 * 定义 JWT 令牌的负载数据结构
 * Defines the payload data structure for JWT tokens
 */
export interface TokenPayload extends JWTPayload {
  /** 受众 / Audience */
  aud: string
  /** 签发时间（可选）/ Issued at (optional) */
  iat?: number
  /** 过期时间（可选）/ Expiration time (optional) */
  exp?: number
}

/**
 * 令牌类型枚举
 * Token Type Enum
 * 
 * 定义JWT令牌的类型
 * Defines the types of JWT tokens
 */
export enum TokenType {
  /** 访问令牌 / Access token */
  ACCESS = 'access',
  /** 刷新令牌 / Refresh token */
  REFRESH = 'refresh'
}

/**
 * 生成 JWT 令牌
 * Generate JWT Token
 * 
 * 生成一个包含指定负载和受众的 JWT 令牌
 * Generates a JWT token with the specified payload and audience
 * 
 * @param payload - 令牌负载数据 / Token payload data
 * @param audience - 受众类型 / Audience type
 * @param tokenType - 令牌类型 / Token type (默认为访问令牌)
 * @returns JWT 令牌字符串 / JWT token string
 */
export async function generateToken(
  payload: JWTPayload,
  audience: Audience = Audience.USER,
  tokenType: TokenType = TokenType.ACCESS
): Promise<string> {
  const secret = getSecret()
  const tokenPayload = {
    ...payload,
    aud: audience,
    type: tokenType
  }

  // 访问令牌1小时过期，刷新令牌7天过期
  // Access token expires in 1 hour, refresh token expires in 7 days
  const expirationTime = tokenType === TokenType.ACCESS ? '1h' : '7d'

  return new SignJWT(tokenPayload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .setAudience(audience)
    .setIssuer('winuel-api')
    .sign(secret)
}

/**
 * 生成令牌对（访问令牌和刷新令牌）
 * Generate Token Pair (Access Token and Refresh Token)
 * 
 * 同时生成访问令牌和刷新令牌
 * Generates both access token and refresh token simultaneously
 * 
 * @param payload - 令牌负载数据 / Token payload data
 * @param audience - 受众类型 / Audience type
 * @returns 令牌对对象 / Token pair object
 */
export async function generateTokenPair(
  payload: JWTPayload,
  audience: Audience = Audience.USER
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await generateToken(payload, audience, TokenType.ACCESS)
  const refreshToken = await generateToken(payload, audience, TokenType.REFRESH)

  return {
    accessToken,
    refreshToken
  }
}

/**
 * 验证 JWT 令牌
 * Verify JWT Token
 * 
 * 验证 JWT 令牌的有效性
 * Verifies the validity of a JWT token
 * 
 * @param token - JWT 令牌字符串 / JWT token string
 * @param expectedAudience - 期望的受众（可选）/ Expected audience (optional)
 * @param expectedTokenType - 期望的令牌类型（可选）/ Expected token type (optional)
 * @returns 令牌负载数据或 null / Token payload data or null
 */
export async function verifyToken(
  token: string,
  expectedAudience?: Audience,
  expectedTokenType?: TokenType
): Promise<TokenPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'winuel-api',
      audience: expectedAudience
    })

    // 如果指定了受众，验证是否匹配 / If audience is specified, verify it matches
    if (expectedAudience && payload.aud !== expectedAudience) {
      console.warn(`Token audience mismatch: expected ${expectedAudience}, got ${payload.aud} / 令牌受众不匹配：期望 ${expectedAudience}，实际 ${payload.aud}`)
      return null
    }

    // 如果指定了令牌类型，验证是否匹配 / If token type is specified, verify it matches
    if (expectedTokenType && (payload as any).type !== expectedTokenType) {
      console.warn(`Token type mismatch: expected ${expectedTokenType}, got ${(payload as any).type} / 令牌类型不匹配：期望 ${expectedTokenType}，实际 ${(payload as any).type}`)
      return null
    }

    return payload as unknown as TokenPayload
  } catch (error) {
    return null
  }
}
