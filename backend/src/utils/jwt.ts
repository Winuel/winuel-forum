import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '../db/models'

let JWT_SECRET: Uint8Array | null = null

/**
 * 常见弱密钥列表
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
 * 检查密钥是否为常见弱密钥
 */
function isWeakSecret(secret: string): boolean {
  const lowerSecret = secret.toLowerCase()
  return WEAK_SECRETS.some(weak => lowerSecret.includes(weak))
}

/**
 * 计算密钥的熵值（复杂性）
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
  let hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret)
  
  let poolSize = 0
  if (hasLowercase) poolSize += charset.lowercase
  if (hasUppercase) poolSize += charset.uppercase
  if (hasDigits) poolSize += charset.digits
  if (hasSpecial) poolSize += charset.special
  
  // 熵值 = log2(poolSize) * length
  const entropy = Math.log2(poolSize) * secret.length
  return entropy
}

/**
 * 验证密钥强度
 */
export function validateJWTSecret(secret: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 检查长度
  if (secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }
  
  // 检查是否为常见弱密钥
  if (isWeakSecret(secret)) {
    errors.push('JWT_SECRET is too common or weak. Use a more secure secret.')
  }
  
  // 检查复杂性
  const hasLowercase = /[a-z]/.test(secret)
  const hasUppercase = /[A-Z]/.test(secret)
  const hasDigits = /[0-9]/.test(secret)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret)
  
  if (!hasLowercase) {
    errors.push('JWT_SECRET must contain at least one lowercase letter')
  }
  if (!hasUppercase) {
    errors.push('JWT_SECRET must contain at least one uppercase letter')
  }
  if (!hasDigits) {
    errors.push('JWT_SECRET must contain at least one digit')
  }
  if (!hasSpecial) {
    errors.push('JWT_SECRET must contain at least one special character')
  }
  
  // 检查熵值（至少80位）
  const entropy = calculateEntropy(secret)
  if (entropy < 80) {
    errors.push(`JWT_SECRET entropy (${entropy.toFixed(2)} bits) is too low. Minimum 80 bits required.`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function initJWT(secret: string): void {
  try {
    // 验证密钥强度
    const validation = validateJWTSecret(secret)
    
    if (!validation.valid) {
      console.error('JWT_SECRET validation failed:')
      validation.errors.forEach(error => console.error(`  - ${error}`))
      throw new Error(validation.errors[0])
    } else {
      // 记录密钥强度信息
      const entropy = calculateEntropy(secret)
      console.log(`JWT initialized successfully (entropy: ${entropy.toFixed(2)} bits)`)
    }
    
    JWT_SECRET = new TextEncoder().encode(secret)
  } catch (error) {
    console.error('Failed to initialize JWT:', error)
    throw error
  }
}

function getSecret(): Uint8Array {
  if (!JWT_SECRET) {
    console.error('JWT not initialized. Call initJWT() first')
    throw new Error('JWT not initialized. Call initJWT() first')
  }
  return JWT_SECRET
}

/**
 * 受众类型定义
 */
export enum Audience {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * 带受众的 JWT Payload
 */
export interface TokenPayload extends JWTPayload {
  aud: string
  iat?: number
  exp?: number
}

export async function generateToken(payload: JWTPayload, audience: Audience = Audience.USER): Promise<string> {
  const secret = getSecret()
  const tokenPayload = {
    ...payload,
    aud: audience
  }
  
  return new SignJWT(tokenPayload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setAudience(audience)
    .setIssuer('winuel-api')
    .sign(secret)
}

export async function verifyToken(token: string, expectedAudience?: Audience): Promise<TokenPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'winuel-api',
      audience: expectedAudience
    })
    
    // 如果指定了受众，验证是否匹配
    if (expectedAudience && payload.aud !== expectedAudience) {
      console.warn(`Token audience mismatch: expected ${expectedAudience}, got ${payload.aud}`)
      return null
    }
    
    return payload as unknown as TokenPayload
  } catch (error) {
    return null
  }
}