/**
 * 日期格式化组合式函数
 * Date Format Composable Function
 * 
 * 提供日期格式化功能，支持多种格式
 * Provides date formatting functionality with support for multiple formats
 * 
 * @package frontend/src/composables
 */

import { computed, type Ref } from 'vue'

/**
 * 日期格式化选项接口
 * Date Format Options Interface
 * 
 * 定义日期格式化的配置选项
 * Defines configuration options for date formatting
 */
export interface DateFormatOptions {
  /** 格式类型 / Format type */
  format?: 'relative' | 'full' | 'short' | 'long'
  /** 语言环境 / Locale */
  locale?: string
}

/**
 * 日期格式化组合式函数
 * Date Format Composable Function
 * 
 * 创建一个可响应式的日期格式化系统
 * Creates a reactive date formatting system
 * 
 * @param date - 日期值的响应式引用 / Reactive reference to date value
 * @param options - 配置选项 / Configuration options
 * @returns 格式化后的日期 / Formatted date
 * 
 * @example
 * // 使用示例 / Usage example
 * const postDate = ref(new Date())
 * const { formatted } = useDateFormat(postDate, {
 *   format: 'relative'
 * })
 * 
 * // 在模板中使用 / Use in template
 * // {{ formatted }} // 输出: "刚刚" 或 "5分钟前" / Output: "刚刚" or "5分钟前"
 */
export function useDateFormat(date: Ref<Date | string | number>, options: DateFormatOptions = {}) {
  const { format = 'relative', locale = 'zh-CN' } = options

  /**
   * 格式化后的日期（计算属性）
   * Formatted Date (Computed Property)
   * 
   * 根据指定的格式类型返回格式化后的日期字符串
   * Returns formatted date string based on specified format type
   */
  const formatted = computed(() => {
    // 将日期转换为 Date 对象 / Convert date to Date object
    const dateObj = typeof date.value === 'string' || typeof date.value === 'number'
      ? new Date(date.value)
      : date.value

    // 检查日期是否有效 / Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '无效日期 / Invalid date'
    }

    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    // 相对时间格式 / Relative time format
    if (format === 'relative') {
      if (seconds < 60) return '刚刚 / Just now'
      if (minutes < 60) return `${minutes}分钟前 / ${minutes} minute(s) ago`
      if (hours < 24) return `${hours}小时前 / ${hours} hour(s) ago`
      if (days < 7) return `${days}天前 / ${days} day(s) ago`
      if (days < 30) return `${Math.floor(days / 7)}周前 / ${Math.floor(days / 7)} week(s) ago`
      if (days < 365) return `${Math.floor(days / 30)}个月前 / ${Math.floor(days / 30)} month(s) ago`
      return `${Math.floor(days / 365)}年前 / ${Math.floor(days / 365)} year(s) ago`
    }

    // 短格式 / Short format
    if (format === 'short') {
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // 长格式 / Long format
    if (format === 'long') {
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 完整格式 / Full format
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  })

  return { formatted }
}