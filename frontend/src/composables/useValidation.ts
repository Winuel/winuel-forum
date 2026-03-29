/**
 * 验证组合式函数
 * Validation Composable Function
 * 
 * 提供表单验证功能，支持多种验证规则
 * Provides form validation functionality with support for multiple validation rules
 * 
 * @package frontend/src/composables
 */

import { ref, computed, type Ref } from 'vue'

/**
 * 验证规则接口
 * Validation Rule Interface
 *
 * 定义单个字段的验证规则
 * Defines validation rules for a single field
 */
export interface ValidationRule {
  /** 是否必填 / Whether required */
  required?: boolean
  /** 最小长度 / Minimum length */
  minLength?: number
  /** 最大长度 / Maximum length */
  maxLength?: number
  /** 正则表达式模式 / Regular expression pattern */
  pattern?: RegExp
  /** 自定义验证函数 / Custom validation function */
  custom?: (value: unknown) => boolean | string
  /** 错误消息 / Error message */
  message?: string
}

/**
 * 验证规则集合接口
 * Validation Rules Collection Interface
 * 
 * 定义多个字段的验证规则
 * Defines validation rules for multiple fields
 */
export interface ValidationRules {
  [key: string]: ValidationRule[]
}

/**
 * 验证组合式函数
 * Validation Composable Function
 * 
 * 创建一个可复用的表单验证系统
 * Creates a reusable form validation system
 * 
 * @param initialData - 初始数据 / Initial data
 * @param rules - 验证规则 / Validation rules
 * @returns 验证相关的响应式数据和方法 / Validation-related reactive data and methods
 * 
 * @example
 * // 使用示例 / Usage example
 * const { data, errors, isValid, validateField, validateAll } = useValidation(
 *   { username: '', password: '' },
 *   {
 *     username: [
 *       { required: true, message: '用户名必填' },
 *       { minLength: 3, message: '用户名至少3个字符' }
 *     ],
 *     password: [
 *       { required: true, message: '密码必填' },
 *       { minLength: 6, message: '密码至少6个字符' }
 *     ]
 *   }
 * )
 */
export function useValidation<T extends Record<string, unknown>>(initialData: T, rules: ValidationRules) {
  // 表单数据 / Form data
  const data = ref<T>({ ...initialData }) as Ref<T>
  // 验证错误 / Validation errors
  const errors = ref<Partial<Record<keyof T, string>>>({})

  /**
   * 验证单个字段
   * Validate Single Field
   * 
   * @param field - 字段名 / Field name
   * @returns 验证是否通过 / Whether validation passed
   */
  const validateField = (field: keyof T): boolean => {
    const fieldRules = rules[field as string]
    if (!fieldRules) return true

    const value = data.value[field]
    let isValid = true

    // 遍历所有验证规则 / Iterate through all validation rules
    for (const rule of fieldRules) {
      // 必填验证 / Required validation
      if (rule.required && !value) {
        errors.value[field] = rule.message || '此字段必填 / This field is required'
        isValid = false
        break
      }

      // 最小长度验证 / Minimum length validation
      if (rule.minLength && value && value.length < rule.minLength) {
        errors.value[field] = rule.message || `最少需要 ${rule.minLength} 个字符 / Minimum ${rule.minLength} characters required`
        isValid = false
        break
      }

      // 最大长度验证 / Maximum length validation
      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors.value[field] = rule.message || `最多 ${rule.maxLength} 个字符 / Maximum ${rule.maxLength} characters allowed`
        isValid = false
        break
      }

      // 正则表达式验证 / Regular expression validation
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.value[field] = rule.message || '格式不正确 / Invalid format'
        isValid = false
        break
      }

      // 自定义验证 / Custom validation
      if (rule.custom) {
        const result = rule.custom(value)
        if (result !== true) {
          errors.value[field] = typeof result === 'string' ? result : (rule.message || '验证失败 / Validation failed')
          isValid = false
          break
        }
      }
    }

    // 如果验证通过，清除错误 / If validation passed, clear error
    if (isValid) {
      delete errors.value[field]
    }

    return isValid
  }

  /**
   * 验证所有字段
   * Validate All Fields
   * 
   * @returns 所有字段是否都验证通过 / Whether all fields passed validation
   */
  const validateAll = (): boolean => {
    let isValid = true
    for (const field of Object.keys(rules)) {
      if (!validateField(field as keyof T)) {
        isValid = false
      }
    }
    return isValid
  }

  /**
   * 清除所有错误
   * Clear All Errors
   */
  const clearErrors = () => {
    errors.value = {}
  }

  /**
   * 重置表单
   * Reset Form
   * 
   * 重置数据到初始值并清除所有错误
   * Resets data to initial values and clears all errors
   */
  const reset = () => {
    data.value = { ...initialData }
    clearErrors()
  }

  /**
   * 计算属性：是否所有字段都有效
   * Computed Property: Whether all fields are valid
   */
  const isValid = computed(() => Object.keys(errors.value).length === 0)

  return {
    data,
    errors,
    isValid,
    validateField,
    validateAll,
    clearErrors,
    reset
  }
}