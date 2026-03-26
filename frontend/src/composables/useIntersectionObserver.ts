/**
 * 交叉观察器组合式函数
 * Intersection Observer Composable Function
 * 
 * 提供元素可见性检测功能
 * Provides element visibility detection functionality
 * 
 * @package frontend/src/composables
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 交叉观察器选项接口
 * Intersection Observer Options Interface
 * 
 * 定义交叉观察器的配置选项
 * Defines configuration options for intersection observer
 */
export interface IntersectionObserverOptions {
  /** 触发阈值 / Trigger threshold */
  threshold?: number | number[]
  /** 根边距 / Root margin */
  rootMargin?: string
  /** 根元素 / Root element */
  root?: Element | null
}

/**
 * 交叉观察器组合式函数
 * Intersection Observer Composable Function
 * 
 * 创建一个元素可见性检测系统
 * Creates an element visibility detection system
 * 
 * @param target - 要观察的目标元素引用 / Target element reference to observe
 * @param options - 配置选项 / Configuration options
 * @returns 可见性状态和控制方法 / Visibility status and control methods
 * 
 * @example
 * // 使用示例 / Usage example
 * const elementRef = ref<HTMLElement | null>(null)
 * const { isVisible } = useIntersectionObserver(elementRef, {
 *   threshold: 0.5
 * })
 * 
 * // 在模板中使用 / Use in template
 * // <div ref="elementRef">
 * //   {{ isVisible ? '可见' : '不可见' }}
 * // </div>
 */
export function useIntersectionObserver(
  target: Ref<Element | null>,
  options: IntersectionObserverOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px', root = null } = options
  // 元素是否可见 / Whether element is visible
  const isVisible = ref(false)

  // IntersectionObserver 实例 / IntersectionObserver instance
  let observer: IntersectionObserver | null = null

  /**
   * 停止观察
   * Stop Observing
   * 
   * 断开观察器连接
   * Disconnects the observer
   */
  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  /**
   * 开始观察
   * Start Observing
   * 
   * 创建并启动观察器
   * Creates and starts the observer
   */
  const start = () => {
    if (!target.value) return

    // 先停止之前的观察 / Stop previous observation first
    stop()

    // 创建新的观察器 / Create new observer
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.isIntersecting
      },
      { threshold, rootMargin, root }
    )

    // 开始观察目标元素 / Start observing target element
    observer.observe(target.value)
  }

  // 组件挂载时开始观察 / Start observing when component mounts
  onMounted(() => {
    start()
  })

  // 组件卸载时停止观察 / Stop observing when component unmounts
  onUnmounted(() => {
    stop()
  })

  return {
    isVisible,
    start,
    stop
  }
}