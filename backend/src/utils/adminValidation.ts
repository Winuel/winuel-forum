/**
 * 管理员API输入验证工具
 * 提供严格的输入验证和清理功能
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 验证分页参数
 */
export function validatePagination(page?: unknown, pageSize?: unknown): ValidationResult {
  const errors: string[] = []
  
  const pageNum = parseInt(String(page || '1'))
  const size = parseInt(String(pageSize || '20'))
  
  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('页码必须大于0')
  }
  
  if (isNaN(size) || size < 1 || size > 100) {
    errors.push('每页数量必须在1-100之间')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证角色值
 */
export function validateRole(role: unknown): ValidationResult {
  const errors: string[] = []
  const validRoles = ['user', 'moderator', 'admin']
  
  if (!role || typeof role !== 'string') {
    errors.push('角色不能为空')
  } else if (!validRoles.includes(role)) {
    errors.push('无效的角色值')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证封禁原因
 */
export function validateBanReason(reason?: unknown): ValidationResult {
  const errors: string[] = []
  
  if (reason !== undefined && reason !== null) {
    if (typeof reason !== 'string') {
      errors.push('封禁原因必须是字符串')
    } else if (reason.length > 500) {
      errors.push('封禁原因不能超过500个字符')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证搜索关键词
 */
export function validateSearchKeyword(keyword?: unknown): ValidationResult {
  const errors: string[] = []
  
  if (keyword !== undefined && keyword !== null) {
    if (typeof keyword !== 'string') {
      errors.push('搜索关键词必须是字符串')
    } else if (keyword.length > 100) {
      errors.push('搜索关键词不能超过100个字符')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证ID格式（UUID）
 */
export function validateId(id: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!id || typeof id !== 'string') {
    errors.push('ID不能为空')
  } else if (id.length < 1 || id.length > 50) {
    errors.push('ID格式无效')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证状态过滤器
 */
export function validateStatusFilter(status: unknown): ValidationResult {
  const errors: string[] = []
  const validStatuses = ['all', 'active', 'deleted']
  
  if (status !== undefined && status !== null) {
    if (typeof status !== 'string') {
      errors.push('状态必须是字符串')
    } else if (!validStatuses.includes(status)) {
      errors.push('无效的状态值')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证日期范围
 */
export function validateDateRange(startDate?: unknown, endDate?: unknown): ValidationResult {
  const errors: string[] = []
  
  if (startDate !== undefined && startDate !== null) {
    if (typeof startDate !== 'string') {
      errors.push('开始日期必须是字符串')
    } else if (isNaN(Date.parse(startDate))) {
      errors.push('开始日期格式无效')
    }
  }
  
  if (endDate !== undefined && endDate !== null) {
    if (typeof endDate !== 'string') {
      errors.push('结束日期必须是字符串')
    } else if (isNaN(Date.parse(endDate))) {
      errors.push('结束日期格式无效')
    }
  }
  
  // 检查日期范围是否合理
  if (startDate && endDate && !errors.length) {
    const start = new Date(String(startDate))
    const end = new Date(String(endDate))
    if (start > end) {
      errors.push('开始日期不能晚于结束日期')
    }
    
    // 检查日期范围是否超过1年
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > 365) {
      errors.push('日期范围不能超过1年')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证批量操作ID列表
 */
export function validateBatchIds(ids: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!Array.isArray(ids)) {
    errors.push('ID列表必须是数组')
  } else if (ids.length === 0) {
    errors.push('ID列表不能为空')
  } else if (ids.length > 50) {
    errors.push('批量操作数量不能超过50个')
  } else {
    // 验证每个ID
    ids.forEach((id, index) => {
      const idValidation = validateId(id)
      if (!idValidation.isValid) {
        errors.push(`第${index + 1}个ID无效`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证置顶顺序
 */
export function validatePinnedOrder(order: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!Array.isArray(order)) {
    errors.push('置顶顺序必须是数组')
  } else if (order.length > 5) {
    errors.push('最多只能置顶5个帖子')
  } else {
    order.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`第${index + 1}个置顶项格式无效`)
      } else if (!item.id || typeof item.id !== 'string') {
        errors.push(`第${index + 1}个置顶项缺少ID`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证和清理用户输入
 * 组合验证和清理功能
 */
export function validateAndCleanUserInput(input: unknown, maxLength: number = 1000): ValidationResult {
  const errors: string[] = []
  
  if (input === undefined || input === null) {
    errors.push('输入不能为空')
    return { isValid: false, errors }
  }
  
  const strInput = String(input)
  
  if (strInput.length === 0) {
    errors.push('输入不能为空')
  } else if (strInput.length > maxLength) {
    errors.push(`输入长度不能超过${maxLength}个字符`)
  }
  
  // 检查是否包含潜在的XSS攻击模式
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ]
  
  dangerousPatterns.forEach(pattern => {
    if (pattern.test(strInput)) {
      errors.push('输入包含不安全的内容')
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 验证管理员操作
 */
export function validateAdminAction(action: string, targetEntity: string): ValidationResult {
  const errors: string[] = []
  
  const validActions = {
    user: ['ban', 'unban', 'delete', 'update_role'],
    post: ['delete', 'restore', 'pin', 'unpin'],
    comment: ['delete', 'restore'],
  }
  
  if (!validActions[targetEntity as keyof typeof validActions]) {
    errors.push('无效的目标实体类型')
  } else if (!validActions[targetEntity as keyof typeof validActions].includes(action)) {
    errors.push('无效的操作类型')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}