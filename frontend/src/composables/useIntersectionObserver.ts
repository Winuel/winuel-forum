import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface IntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  root?: Element | null
}

export function useIntersectionObserver(
  target: Ref<Element | null>,
  options: IntersectionObserverOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px', root = null } = options
  const isVisible = ref(false)

  let observer: IntersectionObserver | null = null

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  const start = () => {
    if (!target.value) return

    stop()

    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.isIntersecting
      },
      { threshold, rootMargin, root }
    )

    observer.observe(target.value)
  }

  onMounted(() => {
    start()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    isVisible,
    start,
    stop
  }
}