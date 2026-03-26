/**
 * 防抖组合式函数
 * Debounce Composable Function
 * 
 * 提供防抖功能，用于延迟处理频繁触发的事件
 * Provides debounce functionality to delay processing frequently triggered events
 * 
 * @package frontend/src/composables
 */

import { ref, watch, type Ref } from 'vue'

/**
 * 防抖函数
 * Debounce Function
 * 
 * 创建一个响应式的防抖值，当原始值变化时，只在指定的延迟时间后更新
 * Creates a reactive debounced value that only updates after the specified delay when the original value changes
 * 
 * @param value - 要防抖的响应式值 / Reactive value to debounce
 * @param delay - 延迟时间（毫秒），默认为 300ms / Delay time in milliseconds, default is 300ms
 * @returns 防抖后的响应式值 / Debounced reactive value
 * 
 * @example
 * // 使用示例 / Usage example
 * const searchQuery = ref('')
 * const debouncedQuery = useDebounce(searchQuery, 500)
 * // searchQuery 变化后，debouncedQuery 会在 500ms 后更新
 * // After searchQuery changes, debouncedQuery will update after 500ms
 */
export function useDebounce<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  // 创建防抖值的响应式引用 / Create reactive reference for debounced value
  const debouncedValue = ref(value.value) as Ref<T>
  // 存储定时器引用 / Store timer reference
  let timeout: ReturnType<typeof setTimeout> | null = null

  // 监听原始值的变化 / Watch for changes in original value
  watch(value, (newValue) => {
    // 清除之前的定时器 / Clear previous timer
    if (timeout) {
      clearTimeout(timeout)
    }

    // 设置新的定时器 / Set new timer
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}