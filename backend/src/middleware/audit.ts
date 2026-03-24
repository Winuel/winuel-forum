import type { MiddlewareHandler } from 'hono'
import type { Env, Variables } from '../types'
import { DEPENDENCY_TOKENS } from '../utils/di'
import { AuditService } from '../services/auditService'

/**
 * 审计日志中间件
 * 记录所有请求和响应的审计日志
 */
export const auditLog: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const startTime = Date.now()
  const method = c.req.method
  const path = c.req.path
  const userId = c.get('user')?.userId
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  const userAgent = c.req.header('user-agent') || 'unknown'

  // 跳过健康检查和根路径的审计日志
  if (path === '/health' || path === '/') {
    await next()
    return
  }

  const container = c.get('container')
  if (!container) {
    console.warn('Service container not initialized, skipping audit logging')
    await next()
    return
  }

  const auditService = container.resolve<AuditService>(DEPENDENCY_TOKENS.AUDIT_SERVICE)

  try {
    await next()

    // 记录成功的请求
    const duration = Date.now() - startTime

    // 只记录写操作（POST, PUT, DELETE）
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      try {
        await auditService.create({
          user_id: userId,
          action: `${method} ${path}`,
          entity_type: 'api_request',
          entity_id: c.req.path,
          new_values: {
            method,
            path,
            statusCode: c.res.status,
            duration,
          },
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'success',
        })
      } catch (auditError) {
        // 审计日志失败不应该影响 API 响应
        console.error('Failed to create audit log:', auditError)
      }
    }
  } catch (error) {
    // 记录失败的请求
    try {
      await auditService.create({
        user_id: userId,
        action: `${method} ${path}`,
        entity_type: 'api_request',
        entity_id: c.req.path,
        new_values: {
          method,
          path,
        },
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'failure',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
    } catch (auditError) {
      // 审计日志失败不应该影响 API 响应
      console.error('Failed to create audit log for error:', auditError)
    }
    
    // 重新抛出错误以便全局错误处理器处理
    throw error
  }
}