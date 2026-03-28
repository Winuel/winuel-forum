import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateDisposableEmail,
  initEmailChecker,
} from '../../utils/validation'

describe('Validation Utils', () => {
  beforeEach(() => {
    initEmailChecker([], [])
  })

  describe('validateUsername', () => {
    it('should accept valid username', () => {
      const result = validateUsername('testuser')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept username with numbers and hyphens', () => {
      const result = validateUsername('user123-abc')
      expect(result.isValid).toBe(true)
    })

    it('should accept Chinese username', () => {
      const result = validateUsername('张三丰')
      expect(result.isValid).toBe(true)
    })

    it('should accept mixed Chinese and English username', () => {
      const result = validateUsername('张三丰abc123')
      expect(result.isValid).toBe(true)
    })

    it('should accept username starting with number', () => {
      const result = validateUsername('123user')
      expect(result.isValid).toBe(true)
    })

    it('should accept username ending with number', () => {
      const result = validateUsername('user123')
      expect(result.isValid).toBe(true)
    })

    it('should reject too short username', () => {
      const result = validateUsername('ab')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('用户名至少为3个字符')
    })

    it('should reject too long username', () => {
      const result = validateUsername('a'.repeat(21))
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('用户名不能超过20个字符')
    })

    it('should reject username with invalid characters', () => {
      const result = validateUsername('user@name')
      expect(result.isValid).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('邮箱格式不正确')
    })

    it('should reject email without domain', () => {
      const result = validateEmail('test@')
      expect(result.isValid).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password with letters, numbers and special characters', () => {
      const result = validatePassword('myPassword1!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with uppercase letters, numbers and special characters', () => {
      const result = validatePassword('MyPassword1!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with only lowercase letters, numbers and special characters', () => {
      const result = validatePassword('mypassword1!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with only uppercase letters, numbers and special characters', () => {
      const result = validatePassword('MYPASSWORD1!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password with only 7 characters', () => {
      const result = validatePassword('test12!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码长度至少为8个字符 / Password must be at least 8 characters')
    })

    it('should reject password with only letters', () => {
      const result = validatePassword('testabcdef!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个数字 / Password must contain at least one number')
    })

    it('should reject password with only numbers', () => {
      const result = validatePassword('12345678!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个字母 / Password must contain at least one letter')
    })

    it('should reject password without special characters', () => {
      const result = validatePassword('test12345')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个特殊字符（如：!@#$%^&*等）/ Password must contain at least one special character (e.g., !@#$%^&*)')
    })

    it('should reject common weak passwords', () => {
      const result = validatePassword('password123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码过于简单，请使用更复杂的密码 / Password is too weak, please use a stronger password')
    })

    it('should reject too long password', () => {
      const result = validatePassword('a'.repeat(129) + '1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码长度不能超过128个字符 / Password must not exceed 128 characters')
    })

    it('should reject password without letters but with numbers and special characters', () => {
      const result = validatePassword('12345678!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个字母 / Password must contain at least one letter')
    })

    it('should reject password with only letters and special characters but no numbers', () => {
      const result = validatePassword('testpassword!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个数字 / Password must contain at least one number')
    })

    it('should reject password with only letters and numbers but no special characters', () => {
      const result = validatePassword('testpassword123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密码必须包含至少一个特殊字符（如：!@#$%^&*等）/ Password must contain at least one special character (e.g., !@#$%^&*)')
    })
  })

  describe('validateDisposableEmail', () => {
    beforeEach(() => {
      initEmailChecker(['tempmail.com', 'throwaway.email'], ['example.com'])
    })

    it('should accept non-disposable email', () => {
      const result = validateDisposableEmail('user@example.com')
      expect(result.isValid).toBe(true)
    })

    it('should reject disposable email', () => {
      const result = validateDisposableEmail('user@tempmail.com')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('不允许使用一次性邮箱注册，请使用您的永久邮箱地址')
    })

    it('should reject another disposable email', () => {
      const result = validateDisposableEmail('user@throwaway.email')
      expect(result.isValid).toBe(false)
    })
  })
})