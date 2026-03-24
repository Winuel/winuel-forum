import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface InfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
  root?: Element | null
}

export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: InfiniteScrollOptions = {}
) {
  const { threshold = 100, rootMargin = '100px', root = null } = options
  const isLoading = ref(false)
  const target = ref<HTMLElement | null>(null)

  const loadMore = async () => {
    if (isLoading.value) return
    isLoading.value = true
    try {
      await callback()
    } finally {
      isLoading.value = false
    }
  }

  const handleScroll = () => {
    if (!target.value || isLoading.value) return

    const rect = target.value.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadMore()
    }
  }

  const start = () => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  const stop = () => {
    window.removeEventListener('scroll', handleScroll)
  }

  onMounted(() => {
    start()
  })

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