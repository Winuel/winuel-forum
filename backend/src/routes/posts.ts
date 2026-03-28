import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { DEPENDENCY_TOKENS } from '../utils/di'
import { PostService } from '../services/postService'
import { NotificationService } from '../services/notificationService'
import { authMiddleware } from '../middleware/auth'
import { csrfProtectionMiddleware } from '../middleware/csrf'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  paginatedResponse,
  ErrorCode
} from '../utils/response'
import { logger } from '../utils/logger'

const postsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

postsRouter.get('/', async (c) => {
  try {
    const container = c.get('container')
    if (!container) {
      return errorResponse(c, ErrorCode.INTERNAL_ERROR, '服务容器未初始化 / Service container not initialized', 500)
    }

    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const categoryId = c.req.query('categoryId')
    const authorId = c.req.query('authorId')

    // 获取当前用户ID（如果已登录）/ Get current user ID (if logged in)
    const user = c.get('user')
    const userId = user?.userId

    const postService = container.resolve<PostService>(DEPENDENCY_TOKENS.POST_SERVICE)
    const result = await postService.findAllWithDetails({ page, limit, category_id: categoryId, author_id: authorId, user_id: userId })

    return paginatedResponse(c, result.posts, result.total, page, limit)
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '获取帖子列表失败 / Failed to get posts', 500)
  }
})

postsRouter.get('/:id', async (c) => {
  try {
    const container = c.get('container')
    if (!container) {
      return errorResponse(c, ErrorCode.INTERNAL_ERROR, '服务容器未初始化 / Service container not initialized', 500)
    }

    const id = c.req.param('id')!
    const postService = container.resolve<PostService>(DEPENDENCY_TOKENS.POST_SERVICE)

    await postService.incrementViewCount(id)

    const post = await postService.findByIdWithDetails(id)
    if (!post) {
      return notFoundResponse(c, '帖子 / Post')
    }

    return successResponse(c, post)
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '获取帖子失败 / Failed to get post', 500)
  }
})

postsRouter.post('/', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { title, content, categoryId, tags } = await c.req.json()

    if (!title || !content || !categoryId) {
      return errorResponse(c, ErrorCode.INVALID_INPUT, '缺少必要字段 / Missing required fields', 400)
    }

    const postService = new PostService(c.env.DB)
    const post = await postService.create({
      title,
      content,
      author_id: user.userId,
      category_id: categoryId,
      tags,
    })

    return successResponse(c, post, '帖子创建成功 / Post created successfully', 201)
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '创建帖子失败 / Failed to create post', 500)
  }
})

postsRouter.put('/:id', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')
    const { title, content, categoryId, tags } = await c.req.json()

    const postService = new PostService(c.env.DB)
    const existingPost = await postService.findById(id)

    if (!existingPost) {
      return notFoundResponse(c, '帖子 / Post')
    }

    if (existingPost.author_id !== user.userId) {
      return forbiddenResponse(c, '无权编辑此帖子 / No permission to edit this post')
    }

    const updatedPost = await postService.update(id, { title, content, category_id: categoryId, tags })
    return successResponse(c, updatedPost, '帖子更新成功 / Post updated successfully')
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '更新帖子失败 / Failed to update post', 500)
  }
})

postsRouter.delete('/:id', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const postService = new PostService(c.env.DB)
    const existingPost = await postService.findById(id)

    if (!existingPost) {
      return notFoundResponse(c, '帖子 / Post')
    }

    if (existingPost.author_id !== user.userId) {
      return forbiddenResponse(c, '无权删除此帖子 / No permission to delete this post')
    }

    await postService.delete(id)
    return successResponse(c, null, '删除成功 / Deleted successfully')
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '删除帖子失败 / Failed to delete post', 500)
  }
})

postsRouter.post('/:id/like', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    // 使用事务处理点赞操作，减少查询次数
    // Use transaction to process like operation, reduce query count
    const result = await c.env.DB.batch([
      // 检查是否已经点赞
      c.env.DB.prepare('SELECT 1 FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
        .bind(user.userId, id, 'post'),
      // 获取帖子信息（如果需要创建通知）
      c.env.DB.prepare('SELECT id, author_id, title FROM posts WHERE id = ?')
        .bind(id)
    ])

    const existingLike = result[0].results?.[0]
    if (existingLike) {
      return errorResponse(c, ErrorCode.ALREADY_EXISTS, '已经点赞过 / Already liked', 400)
    }

    const post = result[1].results?.[0] as { id: string; author_id: string; title: string } | undefined
    if (!post) {
      return errorResponse(c, ErrorCode.NOT_FOUND, '帖子不存在 / Post not found', 404)
    }

    // 插入点赞记录并增加点赞数
    const likeId = crypto.randomUUID()
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO likes (id, user_id, target_id, target_type) VALUES (?, ?, ?, ?)')
        .bind(likeId, user.userId, id, 'post'),
      c.env.DB.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?')
        .bind(id)
    ])

    // 异步创建通知（不阻塞响应）
    // Asynchronously create notification (does not block response)
    if (post.author_id !== user.userId) {
      setImmediate(async () => {
        try {
          const notificationService = new NotificationService(c.env.DB)
          // 假设用户名在JWT payload中，如果不在则查询
          const username = user.username || '用户'
          await notificationService.create({
            user_id: post.author_id,
            type: 'like',
            title: '点赞通知',
            message: `${username} 点赞了你的帖子`,
            link: `/posts/${id}`,
          })
        } catch (error) {
          // 通知创建失败不影响点赞结果
          logger.error('Failed to create like notification', error)
        }
      })
    }

    return successResponse(c, null, '点赞成功 / Liked successfully')
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '点赞失败 / Failed to like', 500)
  }
})

postsRouter.delete('/:id/like', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    await c.env.DB
      .prepare('DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
      .bind(user.userId, id, 'post')
      .run()

    const postService = new PostService(c.env.DB)
    await postService.decrementLikeCount(id)

    return successResponse(c, null, '取消点赞成功 / Unliked successfully')
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '取消点赞失败 / Failed to unlike', 500)
  }
})

postsRouter.get('/:id/comments', async (c) => {
  try {
    const id = c.req.param('id')!
    const postService = new PostService(c.env.DB)
    const comments = await postService.findCommentsWithReplies(id)

    return successResponse(c, comments)
  } catch (error: any) {
    return errorResponse(c, ErrorCode.INTERNAL_ERROR, error.message || '获取评论失败 / Failed to get comments', 500)
  }
})

export default postsRouter