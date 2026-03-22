/**
 * 代码审查API路由
 * 使用依赖注入容器
 */

import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { DEPENDENCY_TOKENS } from '../../utils/di'
import { authMiddleware } from '../../middleware/auth'
import { CodeAttachmentService } from '../../services/codeAttachmentService'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 提交审查提议
app.post('/submit', authMiddleware, async (c) => {
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
    const { attachment_id, proposed_content, review_comment } = body

    if (!attachment_id || !proposed_content) {
      return c.json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '缺少必要参数' }
      }, 400)
    }

    const result = await service.submitReview({
      attachment_id,
      proposed_content,
      review_comment
    }, userId)

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'SUBMIT_FAILED', message: result.error }
      }, 400)
    }

    return c.json({
      success: true,
      data: result.review
    })
  } catch (error) {
    console.error('Submit review error:', error)
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '提交失败' }
    }, 500)
  }
})

// 接受审查提议
app.post('/:reviewId/accept', authMiddleware, async (c) => {
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
    const { comment } = body

    const { reviewId } = c.req.param()

    const result = await service.acceptReview({
      review_id: reviewId,
      accepted: true,
      comment
    }, userId)

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'ACCEPT_FAILED', message: result.error }
      }, 400)
    }

    return c.json({
      success: true,
      data: {
        attachment: result.attachment,
        review: result.review
      },
      message: '已接受审查提议并更新代码'
    })
  } catch (error) {
    console.error('Accept review error:', error)
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '接受失败' }
    }, 500)
  }
})

// 拒绝审查提议
app.post('/:reviewId/reject', authMiddleware, async (c) => {
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
    const { comment } = body

    const { reviewId } = c.req.param()

    const result = await service.rejectReview({
      review_id: reviewId,
      accepted: false,
      comment
    }, userId)

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'REJECT_FAILED', message: result.error }
      }, 400)
    }

    return c.json({
      success: true,
      data: result.review,
      message: '已拒绝审查提议'
    })
  } catch (error) {
    console.error('Reject review error:', error)
    return c.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '拒绝失败' }
    }, 500)
  }
})

// 获取用户的审查提议
app.get('/user/:userId', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  const service = container.resolve<CodeAttachmentService>(DEPENDENCY_TOKENS.CODE_ATTACHMENT_SERVICE)
  const { userId } = c.req.param()

  const result = await service.getUserReviews(userId)

  if (!result.success) {
    return c.json({
      success: false,
      error: { code: 'GET_USER_REVIEWS_FAILED', message: result.error }
    }, 400)
  }

  return c.json({
    success: true,
    data: result.reviews || []
  })
})

export default app