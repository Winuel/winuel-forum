/**
 * CloudLink 服务注册器
 * 负责注册所有服务和依赖
 */

import { DIContainer, DEPENDENCY_TOKENS } from './di'
import { UserService } from '../services/userService'
import { PostService } from '../services/postService'
import { CategoryService } from '../services/categoryService'
import { NotificationService } from '../services/notificationService'
import { AuditService } from '../services/auditService'
import { CodeAttachmentService } from '../services/codeAttachmentService'
import { PluginService } from '../services/pluginService'
import { CodeAttachmentModel, CodeReviewModel } from '../models/codeAttachment'
import { PluginLoader } from '@cloudlink/plugin-system'

export type Env = {
  DB: D1Database
  KV: KVNamespace
  R2?: R2Bucket
  JWT_SECRET?: string
  ENVIRONMENT?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
  RESEND_FROM_NAME?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  GITHUB_REDIRECT_URI?: string
  API_URL?: string
}

/**
 * 初始化服务容器
 */
export function initializeServices(env: Env): DIContainer {
  const container = new DIContainer()

  // 注册环境依赖（瞬态，每次请求都获取最新的环境）
  container.registerTransient(DEPENDENCY_TOKENS.DB, () => env.DB)
  container.registerTransient(DEPENDENCY_TOKENS.KV, () => env.KV)
  container.registerTransient(DEPENDENCY_TOKENS.R2, () => env.R2)
  container.registerTransient(DEPENDENCY_TOKENS.ENV, () => env)

  // 注册 JWT 密钥（瞬态，允许动态更新）
  container.registerTransient(DEPENDENCY_TOKENS.JWT_SECRET, () => env.JWT_SECRET)

  // 注册服务（瞬态，每次请求创建新实例以避免状态污染）
  container.registerTransient(DEPENDENCY_TOKENS.USER_SERVICE, (c) => {
    const db = c.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    return new UserService(db)
  })

  container.registerTransient(DEPENDENCY_TOKENS.POST_SERVICE, (c) => {
    const db = c.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    return new PostService(db)
  })

  container.registerTransient(DEPENDENCY_TOKENS.CATEGORY_SERVICE, (c) => {
    const db = c.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    return new CategoryService(db)
  })

  container.registerTransient(DEPENDENCY_TOKENS.NOTIFICATION_SERVICE, (c) => {
    const db = c.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    return new NotificationService(db)
  })

  container.registerTransient(DEPENDENCY_TOKENS.AUDIT_SERVICE, (c) => {
    const db = c.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    return new AuditService(db)
  })

  container.registerTransient(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE, (c) => {
    const db = c.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    const attachmentModel = new CodeAttachmentModel(db)
    const reviewModel = new CodeReviewModel(db)
    return new CodeAttachmentService(attachmentModel, reviewModel)
  })

  container.registerTransient(DEPENDENCY_TOKENS.PLUGIN_SERVICE, (c) => {
    const db = c.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    const loader = new PluginLoader({
      autoResolveDependencies: true,
      strictVersionValidation: false
    })
    return new PluginService(db, loader)
  })

  return container
}

/**
 * 获取服务（辅助函数）
 */
export function getService<T>(container: DIContainer, token: string): T {
  return container.resolve<T>(token)
}

/**
 * 获取用户服务
 */
export function getUserService(container: DIContainer): UserService {
  return getService<UserService>(container, DEPENDENCY_TOKENS.USER_SERVICE)
}

/**
 * 获取帖子服务
 */
export function getPostService(container: DIContainer): PostService {
  return getService<PostService>(container, DEPENDENCY_TOKENS.POST_SERVICE)
}

/**
 * 获取分类服务
 */
export function getCategoryService(container: DIContainer): CategoryService {
  return getService<CategoryService>(container, DEPENDENCY_TOKENS.CATEGORY_SERVICE)
}

/**
 * 获取通知服务
 */
export function getNotificationService(container: DIContainer): NotificationService {
  return getService<NotificationService>(container, DEPENDENCY_TOKENS.NOTIFICATION_SERVICE)
}

/**
 * 获取审计服务
 */
export function getAuditService(container: DIContainer): AuditService {
  return getService<AuditService>(container, DEPENDENCY_TOKENS.AUDIT_SERVICE)
}

/**
 * 获取代码附件服务
 */
export function getCodeAttachmentService(container: DIContainer): CodeAttachmentService {
  return getService<CodeAttachmentService>(container, DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
}

/**
 * 获取插件服务
 */
export function getPluginService(container: DIContainer): PluginService {
  return getService<PluginService>(container, DEPENDENCY_TOKENS.PLUGIN_SERVICE)
}