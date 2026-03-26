import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { PostService } from '../services/postService'
import { NotificationService } from '../services/notificationService'
import { authMiddleware } from '../middleware/auth'
import { csrfProtectionMiddleware } from '../middleware/csrf'

const commentsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// 获取所有评论（需要管理员权限）或特定帖子的评论
commentsRouter.get('/', async (c) => {
  try {
    const postId = c.req.query('postId')
    const postService = new PostService(c.env.DB)

    if (postId) {
      // 获取特定帖子的评论
      const comments = await postService.findCommentsByPostId(postId)
      return c.json(comments)
    } else {
      // 获取所有评论（需要管理员权限，这里暂时返回空）
      return c.json([])
    }
  } catch (error: any) {
    return c.json({ error: error.message || '获取评论失败' }, 500)
  }
})

commentsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')!
    const postService = new PostService(c.env.DB)
    const comment = await postService.findCommentById(id)
    
    if (!comment) {
      return c.json({ error: '评论不存在' }, 404)
    }
    
    return c.json(comment)
  } catch (error: any) {
    return c.json({ error: error.message || '获取评论失败' }, 500)
  }
})

commentsRouter.post('/', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { postId, content, parentId } = await c.req.json()

    if (!postId || !content) {
      return c.json({ error: '缺少必要字段' }, 400)
    }

    const postService = new PostService(c.env.DB)
    const notificationService = new NotificationService(c.env.DB)

    const comment = await postService.createComment({
      post_id: postId,
      author_id: user.userId,
      content,
      parent_id: parentId,
    })

    const author = await c.env.DB.prepare('SELECT id, username, avatar FROM users WHERE id = ?')
      .bind(comment.author_id)
      .first()

    let notifyUserId = null
    let notifyType = 'comment'
    let notifyTitle = '新评论通知'
    let notifyMessage = ''
    let notifyLink = `/posts/${postId}`

    if (parentId) {
      const parentComment = await postService.findCommentById(parentId)
      if (parentComment && parentComment.author_id !== user.userId) {
        notifyUserId = parentComment.author_id
        notifyType = 'reply'
        notifyTitle = '新回复通知'
        notifyMessage = `${author?.username || '用户'} 回复了你的评论`
      }
    } else {
      const post = await postService.findById(postId)
      if (post && post.author_id !== user.userId) {
        notifyUserId = post.author_id
        notifyType = 'comment'
        notifyTitle = '新评论通知'
        notifyMessage = `${author?.username || '用户'} 评论了你的帖子`
      }
    }

    if (notifyUserId) {
      await notificationService.create({
        user_id: notifyUserId,
        type: notifyType,
        title: notifyTitle,
        message: notifyMessage,
        link: notifyLink,
      })
    }

    return c.json({
      ...comment,
      authorUsername: author?.username || '',
      authorAvatar: author?.avatar,
    })
  } catch (error: any) {
    return c.json({ error: error.message || '创建评论失败' }, 500)
  }
})

commentsRouter.put('/:id', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!!
    const user = c.get('user')
    const { content } = await c.req.json()

    const postService = new PostService(c.env.DB)
    const existingComment = await postService.findCommentById(id)

    if (!existingComment) {
      return c.json({ error: '评论不存在' }, 404)
    }

    if (existingComment.author_id !== user.userId) {
      return c.json({ error: '无权编辑此评论' }, 403)
    }

    const updatedComment = await postService.updateComment(id, content)
    return c.json(updatedComment)
  } catch (error: any) {
    return c.json({ error: error.message || '更新评论失败' }, 500)
  }
})

commentsRouter.delete('/:id', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const postService = new PostService(c.env.DB)
    const existingComment = await postService.findCommentById(id)

    if (!existingComment) {
      return c.json({ error: '评论不存在' }, 404)
    }

    if (existingComment.author_id !== user.userId) {
      return c.json({ error: '无权删除此评论' }, 403)
    }

    await postService.deleteComment(id)
    return c.json({ message: '删除成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '删除评论失败' }, 500)
  }
})

commentsRouter.post('/:id/like', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    const existingLike = await c.env.DB
      .prepare('SELECT 1 FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
      .bind(user.userId, id, 'comment')
      .first()

    if (existingLike) {
      return c.json({ error: '已经点赞过' }, 400)
    }

    const likeId = crypto.randomUUID()
    await c.env.DB
      .prepare('INSERT INTO likes (id, user_id, target_id, target_type) VALUES (?, ?, ?, ?)')
      .bind(likeId, user.userId, id, 'comment')
      .run()

    const postService = new PostService(c.env.DB)
    const notificationService = new NotificationService(c.env.DB)

    await postService.incrementCommentLikeCount(id)

    const comment = await postService.findCommentById(id)
    if (comment && comment.author_id !== user.userId) {
      const currentUser = await c.env.DB.prepare('SELECT username FROM users WHERE id = ?')
        .bind(user.userId)
        .first<{ username: string }>()

      const post = await postService.findById(comment.post_id)

      if (post && currentUser) {
        await notificationService.create({
          user_id: comment.author_id,
          type: 'like',
          title: '点赞通知',
          message: `${currentUser.username} 点赞了你的评论`,
          link: `/posts/${comment.post_id}`,
        })
      }
    }

    return c.json({ message: '点赞成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '点赞失败' }, 500)
  }
})

commentsRouter.delete('/:id/like', authMiddleware, csrfProtectionMiddleware, async (c) => {
  try {
    const id = c.req.param('id')!
    const user = c.get('user')

    await c.env.DB
      .prepare('DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?')
      .bind(user.userId, id, 'comment')
      .run()

    const postService = new PostService(c.env.DB)
    await postService.decrementCommentLikeCount(id)

    return c.json({ message: '取消点赞成功' })
  } catch (error: any) {
    return c.json({ error: error.message || '取消点赞失败' }, 500)
  }
})

export default commentsRouter