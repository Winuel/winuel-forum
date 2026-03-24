/**
 * 代码附件API路由
 * 使用依赖注入容器
 */

import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { DEPENDENCY_TOKENS } from '../../utils/di'
import { authMiddleware } from '../../middleware/auth'
import { CodeAttachmentService } from '../../services/codeAttachmentService'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 上传代码附件
app.post('/upload', authMiddleware, async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '需要登录' }
    }, 401)
  }

  try {
    const body = await c.req.json()
    const { post_id, file_name, language, content } = body

    if (!post_id || !file_name || !language || !content) {
      return c.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '缺少必要参数' }
      }, 400)
    }

    const result = await service.upload({
      post_id,
      file_name,
      language,
      content
    })

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: result.error }
      }, 400)
    }

    return c.json({
      success: true,
      data: result.attachment
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '上传失败' }
    }, 500)
  }
})

// 获取代码附件详情
app.get('/:id', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()

  const result = await service.getAttachment(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: result.error }
    }, 404)
  }

  return c.json({
    success: true,
    data: result.attachment
  })
})

// 获取帖子的所有代码附件
app.get('/post/:postId', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { postId } = c.req.param()

  const result = await service.getPostAttachments(postId)

  return c.json({
    success: true,
    data: result.attachments || []
  })
})

// 删除代码附件
app.delete('/:id', authMiddleware, async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()
  const userId = c.get('user')?.userId

  if (!userId) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '需要登录' }
    }, 401)
  }

  // 验证权限（附件的作者才能删除）
  const attachment = await service.getAttachment(id)
  if (attachment.success && attachment.attachment) {
    // TODO: 添加权限检查
  }

  const result = await service.deleteAttachment(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'DELETE_FAILED', message: result.error }
    }, 400)
  }

  return c.json({
    success: true,
    message: '附件已删除'
  })
})

// 获取版本历史
app.get('/:id/versions', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()

  const result = await service.getVersionHistory(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'GET_VERSIONS_FAILED', message: result.error }
    }, 400)
  }

  return c.json({
    success: true,
    data: result.versions || []
  })
})

// 获取审查提议
app.get('/:id/reviews', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { id } = c.req.param()

  const result = await service.getReviews(id)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'GET_REVIEWS_FAILED', message: result.error }
    }, 400)
  }

  return c.json({
    success: true,
    data: result.reviews || []
  })
})

export default app