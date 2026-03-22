/**
 * 代码附件API路由
 */

import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { authMiddleware } from '../../middleware/auth'
import { CodeAttachmentModel, CodeReviewModel } from '../../models/codeAttachment'
import { CodeAttachmentService } from '../../services/codeAttachmentService'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 初始化服务中间件
app.use('*', async (c, next) => {
  const attachmentModel = new CodeAttachmentModel(c.env.DB)
  const reviewModel = new CodeReviewModel(c.env.DB)
  const service = new CodeAttachmentService(attachmentModel, reviewModel)
  c.set('codeAttachmentService', service)
  await next()
})

// 上传代码附件
app.post('/upload', authMiddleware, async (c) => {
  const service = c.get('codeAttachmentService') as CodeAttachmentService
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
  const service = c.get('codeAttachmentService') as CodeAttachmentService
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
  const service = c.get('codeAttachmentService') as CodeAttachmentService
  const { postId } = c.req.param()

  const result = await service.getPostAttachments(postId)

  return c.json({
    success: true,
    data: result.attachments || []
  })
})

// 删除代码附件
app.delete('/:id', authMiddleware, async (c) => {
  const service = c.get('codeAttachmentService') as CodeAttachmentService
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
  const service = c.get('codeAttachmentService') as CodeAttachmentService
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
  const service = c.get('codeAttachmentService') as CodeAttachmentService
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
