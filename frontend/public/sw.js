// Winuel Forum Service Worker
// 提供离线支持、缓存管理和后台同步功能

const CACHE_NAME = 'winuel-v1'
const OFFLINE_CACHE = 'winuel-offline-v1'
const RUNTIME_CACHE = 'winuel-runtime-v1'

// 需要预缓存的关键资源
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API 请求缓存策略
const API_CACHE_DURATION = 5 * 60 * 1000 // 5分钟
const STATIC_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7天

// Service Worker 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE)
      console.log('[SW] Pre-caching offline page')
      await cache.addAll(PRECACHE_URLS)
      
      // 等待新版本激活
      await self.skipWaiting()
    })()
  )
})

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    (async () => {
      // 删除旧版本的缓存
      const cacheNames = await caches.keys()
      const cachesToDelete = cacheNames.filter(name => 
        name !== CACHE_NAME && 
        name !== OFFLINE_CACHE && 
        name !== RUNTIME_CACHE
      )
      
      await Promise.all(
        cachesToDelete.map(name => {
          console.log('[SW] Deleting old cache:', name)
          return caches.delete(name)
        })
      )
      
      // 立即控制所有客户端
      self.clients.claim()
    })()
  )
})

// Service Worker 拦截请求事件
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 只处理同源请求
  if (url.origin !== self.location.origin) {
    return
  }
  
  // API 请求使用网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
  } 
  // 静态资源使用缓存优先策略
  else if (isStaticResource(url)) {
    event.respondWith(handleStaticRequest(request))
  } 
  // HTML 导航请求使用网络优先策略，失败时返回离线页面
  else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
  } 
  // 其他请求使用网络优先策略
  else {
    event.respondWith(handleOtherRequest(request))
  }
})

// 处理 API 请求（网络优先）
async function handleApiRequest(request) {
  try {
    const response = await fetch(request)
    
    // 只缓存成功的 GET 请求
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(RUNTIME_CACHE)
      await cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', request.url)
    
    // 网络失败时尝试从缓存获取
    const cache = await caches.open(RUNTIME_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 返回离线响应
    return new Response(
      JSON.stringify({ 
        error: 'offline',
        message: '网络连接失败，请检查网络设置' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 处理静态资源请求（缓存优先）
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    console.log('[SW] Serving from cache:', request.url)
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[SW] Static request failed:', request.url)
    throw error
  }
}

// 处理导航请求（网络优先）
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request)
    
    // 缓存成功的 HTML 响应
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page')
    
    // 返回离线页面
    const cache = await caches.open(OFFLINE_CACHE)
    const offlinePage = await cache.match('/offline.html')
    
    if (offlinePage) {
      return offlinePage
    }
    
    // 如果离线页面也不存在，返回基本的离线响应
    return new Response(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>离线</title></head><body><h1>离线</h1><p>请检查网络连接</p></body></html>',
      {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  }
}

// 处理其他请求（网络优先）
async function handleOtherRequest(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      await cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cache = await caches.open(RUNTIME_CACHE)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// 判断是否为静态资源
function isStaticResource(url) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.mp3'
  ]
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext))
}

// 后台同步（用于离线时保存的操作）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncOfflinePosts())
  }
})

// 同步离线帖子
async function syncOfflinePosts() {
  try {
    // 从 IndexedDB 获取离线保存的帖子
    const offlinePosts = await getOfflinePosts()
    
    for (const post of offlinePosts) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${post.token}`
          },
          body: JSON.stringify(post.data)
        })
        
        if (response.ok) {
          // 同步成功，删除离线记录
          await deleteOfflinePost(post.id)
          console.log('[SW] Synced post:', post.id)
        }
      } catch (error) {
        console.log('[SW] Failed to sync post:', post.id, error)
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error)
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : '您有新消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('云纽论坛', options)
  )
})

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')
  
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})

// IndexedDB 辅助函数
async function getOfflinePosts() {
  // 实现 IndexedDB 操作
  return []
}

async function deleteOfflinePost(id) {
  // 实现 IndexedDB 删除操作
}

// 监听来自客户端的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting and activating new version')
    self.skipWaiting()
  }
})

// 定期清理缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    cleanupOldCaches()
  }
})

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys()
    const currentTime = Date.now()
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const cacheTime = parseInt(response.headers.get('cache-time') || '0')
          const age = currentTime - cacheTime
          
          // 删除超过7天的缓存
          if (age > STATIC_CACHE_DURATION) {
            await cache.delete(request)
            console.log('[SW] Cleaned old cache:', request.url)
          }
        }
      }
    }
  } catch (error) {
    console.log('[SW] Cache cleanup failed:', error)
  }
}

console.log('[SW] Service worker loaded')