/**
 * 无限滚动组合式函数
 * Infinite Scroll Composable Function
 * 
 * 提供无限滚动功能，用于实现分页加载
 * Provides infinite scroll functionality for implementing pagination loading
 * 
 * @package frontend/src/composables
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 无限滚动选项接口
 * Infinite Scroll Options Interface
 * 
 * 定义无限滚动的配置选项
 * Defines configuration options for infinite scroll
 */
export interface InfiniteScrollOptions {
  /** 触发加载的距离阈值（像素）/ Distance threshold to trigger loading (pixels) */
  threshold?: number
  /** 根边距 / Root margin */
  rootMargin?: string
  /** 根元素 / Root element */
  root?: Element | null
}

/**
 * 无限滚动组合式函数
 * Infinite Scroll Composable Function
 * 
 * 创建一个无限滚动的加载系统
 * Creates an infinite scroll loading system
 * 
 * @param callback - 加载更多数据的回调函数 / Callback function to load more data
 * @param options - 配置选项 / Configuration options
 * @returns 无限滚动相关的响应式数据和方法 / Infinite scroll-related reactive data and methods
 * 
 * @example
 * // 使用示例 / Usage example
 * const { target, isLoading, loadMore } = useInfiniteScroll(async () => {
 *   await fetchMoreData()
 * }, { threshold: 200 })
 * 
 * // 在模板中使用 / Use in template
 * // <div ref="target">
 * //   <!-- 内容 / Content -->
 * // </div>
 */
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: InfiniteScrollOptions = {}
) {
  const { threshold = 100, rootMargin = '100px', root = null } = options
  // 是否正在加载 / Whether currently loading
  const isLoading = ref(false)
  // 目标元素引用 / Target element reference
  const target = ref<HTMLElement | null>(null)

  /**
   * 加载更多数据
   * Load More Data
   * 
   * 执行回调函数加载更多数据
   * Executes callback function to load more data
   */
  const loadMore = async () => {
    // 防止重复加载 / Prevent duplicate loading
    if (isLoading.value) return
    isLoading.value = true
    try {
      await callback()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 处理滚动事件（私有方法）
   * Handle Scroll Event (Private Method)
   * 
   * 监听滚动事件，在接近底部时触发加载
   * Listens to scroll events and triggers loading when approaching bottom
   */
  const handleScroll = () => {
    if (!target.value || isLoading.value) return

    const rect = target.value.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // 检查是否接近底部 / Check if approaching bottom
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadMore()
    }
  }

  /**
   * 开始监听滚动事件
   * Start Listening to Scroll Events
   */
  const start = () => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  /**
   * 停止监听滚动事件
   * Stop Listening to Scroll Events
   */
  const stop = () => {
    window.removeEventListener('scroll', handleScroll)
  }

  // 组件挂载时开始监听 / Start listening when component mounts
  onMounted(() => {
    start()
  })

  // 组件卸载时停止监听 / Stop listening when component unmounts
  onUnmounted(() => {
    stop()
  })

  return {
    target,
    isLoading,
    loadMore,
    start,
    stop
  }
}