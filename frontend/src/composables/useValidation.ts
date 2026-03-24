import { ref, computed, type Ref } from 'vue'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
  message?: string
}

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

export function useValidation<T extends Record<string, any>>(initialData: T, rules: ValidationRules) {
  const data = ref<T>({ ...initialData }) as Ref<T>
  const errors = ref<Partial<Record<keyof T, string>>>({})

  const validateField = (field: keyof T): boolean => {
    const fieldRules = rules[field as string]
    if (!fieldRules) return true

    const value = data.value[field]
    let isValid = true

    for (const rule of fieldRules) {
      if (rule.required && !value) {
        errors.value[field] = rule.message || '此字段必填'
        isValid = false
        break
      }

      if (rule.minLength && value && value.length < rule.minLength) {
        errors.value[field] = rule.message || `最少需要 ${rule.minLength} 个字符`
        isValid = false
        break
      }

      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors.value[field] = rule.message || `最多 ${rule.maxLength} 个字符`
        isValid = false
        break
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.value[field] = rule.message || '格式不正确'
        isValid = false
        break
      }

      if (rule.custom) {
        const result = rule.custom(value)
        if (result !== true) {
          errors.value[field] = typeof result === 'string' ? result : (rule.message || '验证失败')
          isValid = false
          break
        }
      }
    }

    if (isValid) {
      delete errors.value[field]
    }

    return isValid
  }

  const validateAll = (): boolean => {
    let isValid = true
    for (const field of Object.keys(rules)) {
      if (!validateField(field as keyof T)) {
        isValid = false
      }
    }
    return isValid
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const reset = () => {
    data.value = { ...initialData }
    clearErrors()
  }

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