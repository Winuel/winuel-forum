/**
 * CloudLink 依赖注入中间件
 * 为每个请求初始化服务容器
 */

import type { MiddlewareHandler } from 'hono'
import type { Env, Variables } from '../types'
import { DIContainer } from '../utils/di'
import { initializeServices } from '../utils/serviceRegistry'

/**
 * 依赖注入中间件
 * 在每个请求开始时初始化服务容器，并将其添加到上下文中
 */
export const diMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  // 初始化服务容器
  const container = initializeServices(c.env)
  
  // 将容器添加到上下文中
  c.set('container', container)
  
  await next()
}