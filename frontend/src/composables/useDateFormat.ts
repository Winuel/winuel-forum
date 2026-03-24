import { computed, type Ref } from 'vue'

export interface DateFormatOptions {
  format?: 'relative' | 'full' | 'short' | 'long'
  locale?: string
}

export function useDateFormat(date: Ref<Date | string | number>, options: DateFormatOptions = {}) {
  const { format = 'relative', locale = 'zh-CN' } = options

  const formatted = computed(() => {
    const dateObj = typeof date.value === 'string' || typeof date.value === 'number'
      ? new Date(date.value)
      : date.value

    if (isNaN(dateObj.getTime())) {
      return '无效日期'
    }

    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (format === 'relative') {
      if (seconds < 60) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      if (days < 30) return `${Math.floor(days / 7)}周前`
      if (days < 365) return `${Math.floor(days / 30)}个月前`
      return `${Math.floor(days / 365)}年前`
    }

    if (format === 'short') {
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    if (format === 'long') {
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // full format
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