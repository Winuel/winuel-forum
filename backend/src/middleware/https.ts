import type { MiddlewareHandler } from 'hono'

/**
 * HTTPS 强制中间件
 * 将所有 HTTP 请求重定向到 HTTPS
 */
export const httpsRedirect: MiddlewareHandler = async (c, next) => {
  // 检查当前请求是否已经是 HTTPS
  const currentUrl = c.req.url
  if (currentUrl.startsWith('https://')) {
    // 已经是 HTTPS，直接继续
    await next()
    return
  }

  // 检查是否通过 Cloudflare 代理
  const cfVisitor = c.req.header('cf-visitor')
  
  // 如果通过 Cloudflare 代理且是 HTTP 请求，则重定向到 HTTPS
  if (cfVisitor && cfVisitor.includes('"scheme":"http"')) {
    const protocol = 'https://'
    const host = c.req.header('host') || ''
    const path = c.req.url
    const url = new URL(path)
    const redirectUrl = `${protocol}${host}${url.pathname}${url.search}`
    
    return c.redirect(redirectUrl, 301)
  }
  
  // 检查 X-Forwarded-Proto 头（用于其他代理）
  const forwardedProto = c.req.header('x-forwarded-proto')
  if (forwardedProto === 'http') {
    const protocol = 'https://'
    const host = c.req.header('host') || ''
    const path = c.req.url
    const url = new URL(path)
    const redirectUrl = `${protocol}${host}${url.pathname}${url.search}`
    
    return c.redirect(redirectUrl, 301)
  }
  
  await next()
}

/**
 * HSTS 中间件
 * 添加 Strict-Transport-Security 响应头
 */
export const hsts: MiddlewareHandler = async (c, next) => {
  await next()
  
  // 添加 HSTS 响应头
  // max-age=31536000: 1年
  // includeSubDomains: 包含所有子域名
  // preload: 允许预加载到浏览器的 HSTS 列表
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
}