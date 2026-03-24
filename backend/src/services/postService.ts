import type { Post, Comment } from '../db/models'
import { generateId } from '../utils/crypto'

export interface CreatePostInput {
  title: string
  content: string
  author_id: string
  category_id: string
  tags?: string[]
}

export interface UpdatePostInput {
  title?: string
  content?: string
  category_id?: string
  tags?: string[]
}

export interface AppealPostInput {
  post_id: string
  user_id: string
  reason: string
}

export interface CreateCommentInput {
  post_id: string
  author_id: string
  content: string
  parent_id?: string
}

export class PostService {
  constructor(private db: D1Database) {}

  async create(input: CreatePostInput): Promise<Post> {
    // 导入敏感词检测服务
    const { getSensitiveWordService } = await import('./sensitiveWordService')
    const sensitiveWordService = getSensitiveWordService()

    // 检测标题和内容中的敏感词
    const titleMatches = sensitiveWordService.detect(input.title)
    const contentMatches = sensitiveWordService.detect(input.content)

    const id = generateId()
    let auditStatus: 'pending' | 'rejected' = 'pending'
    let auditReason = ''

    // 如果发现敏感词，标记为 rejected，并提供模糊化告警
    if (titleMatches.length > 0 || contentMatches.length > 0) {
      const allMatches = [...titleMatches, ...contentMatches]
      const uniqueWords = [...new Set(allMatches.map(m => m.word))]
      const filteredWords = uniqueWords.map(word => '*'.repeat(word.length))
      
      auditStatus = 'rejected'
      auditReason = `帖子包含敏感词：${filteredWords.join(', ')}（实际敏感词：${uniqueWords.join(', ')}）`
    }

    await this.db
      .prepare(
        'INSERT INTO posts (id, title, content, author_id, category_id, audit_status, audit_reason) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, input.title, input.content, input.author_id, input.category_id, auditStatus, auditReason)
      .run()

    if (input.tags && input.tags.length > 0) {
      await this.addTagsToPost(id, input.tags)
    }

    return this.findById(id) as Promise<Post>
  }

  async findById(id: string): Promise<Post | null> {
    return this.db.prepare('SELECT id, title, content, author_id, category_id, view_count, like_count, comment_count, created_at, updated_at FROM posts WHERE id = ? AND deleted_at IS NULL').bind(id).first<Post>()
  }

  async findAll(options: {
    page?: number
    limit?: number
    category_id?: string
    author_id?: string
  } = {}): Promise<{ posts: Post[]; total: number }> {
    const { page = 1, limit = 20, category_id, author_id } = options
    const offset = (page - 1) * limit

    let query = 'SELECT id, title, content, author_id, category_id, view_count, like_count, comment_count, created_at, updated_at FROM posts WHERE deleted_at IS NULL'
    const params: any[] = []

    if (category_id) {
      query += ' AND category_id = ?'
      params.push(category_id)
    }

    if (author_id) {
      query += ' AND author_id = ?'
      params.push(author_id)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const posts = await this.db.prepare(query).bind(...params).all<Post>()

    let countQuery = 'SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL'
    const countParams: any[] = []

    if (category_id) {
      countQuery += ' AND category_id = ?'
      countParams.push(category_id)
    }

    if (author_id) {
      countQuery += ' AND author_id = ?'
      countParams.push(author_id)
    }

    const countResult = await this.db.prepare(countQuery).bind(...countParams).first<{ count: number }>()

    return {
      posts: posts.results || [],
      total: countResult?.count || 0,
    }
  }

  async findAllWithDetails(options: {
    page?: number
    limit?: number
    category_id?: string
    author_id?: string
  } = {}): Promise<{ posts: any[]; total: number }> {
    const { page = 1, limit = 20, category_id, author_id } = options
    const offset = (page - 1) * limit

    // 使用 JOIN 查询一次性获取帖子、作者和分类信息
    let query = `
      SELECT 
        p.*,
        u.username as author_username,
        u.avatar as author_avatar,
        c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id AND u.deleted_at IS NULL
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
    `
    const params: any[] = []

    if (category_id) {
      query += ' AND p.category_id = ?'
      params.push(category_id)
    }

    if (author_id) {
      query += ' AND p.author_id = ?'
      params.push(author_id)
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const postsResult = await this.db.prepare(query).bind(...params).all()

    // 获取所有帖子ID
    const postIds = postsResult.results?.map((p: any) => p.id) || []

    // 一次性获取所有标签
    let tagsMap: Record<string, string[]> = {}
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',')
      const tagsQuery = `
        SELECT pt.post_id, t.name 
        FROM post_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE pt.post_id IN (${placeholders})
      `
      const tagsResult = await this.db.prepare(tagsQuery).bind(...postIds).all()
      
      tagsResult.results?.forEach((tag: any) => {
        if (!tagsMap[tag.post_id]) {
          tagsMap[tag.post_id] = []
        }
        tagsMap[tag.post_id].push(tag.name)
      })
    }

    // 组装结果
    const posts = postsResult.results?.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author_id: post.author_id,
      category_id: post.category_id,
      view_count: post.view_count,
      like_count: post.like_count,
      comment_count: post.comment_count,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: {
        id: post.author_id,
        username: post.author_username,
        avatar: post.author_avatar
      },
      category: {
        id: post.category_id,
        name: post.category_name
      },
      tags: tagsMap[post.id] || []
    })) || []

    // 计算总数
    let countQuery = 'SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL'
    const countParams: any[] = []

    if (category_id) {
      countQuery += ' AND category_id = ?'
      countParams.push(category_id)
    }

    if (author_id) {
      countQuery += ' AND author_id = ?'
      countParams.push(author_id)
    }

    const countResult = await this.db.prepare(countQuery).bind(...countParams).first<{ count: number }>()

    return {
      posts,
      total: countResult?.count || 0,
    }
  }

  async findByIdWithDetails(id: string): Promise<any | null> {
    // 使用 JOIN 查询一次性获取帖子、作者、分类和标签信息
    const query = `
      SELECT 
        p.*,
        u.username as author_username,
        u.avatar as author_avatar,
        c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id AND u.deleted_at IS NULL
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `
    
    const post = await this.db.prepare(query).bind(id).first()
    
    if (!post) {
      return null
    }

    // 获取标签
    const tagsQuery = `
      SELECT t.name 
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = ?
    `
    const tagsResult = await this.db.prepare(tagsQuery).bind(id).all()
    
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author_id: post.author_id,
      category_id: post.category_id,
      view_count: post.view_count,
      like_count: post.like_count,
      comment_count: post.comment_count,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: {
        id: post.author_id,
        username: post.author_username,
        avatar: post.author_avatar
      },
      category: {
        id: post.category_id,
        name: post.category_name
      },
      tags: tagsResult.results?.map((t: any) => t.name) || []
    }
  }

  async update(id: string, input: UpdatePostInput): Promise<Post | null> {
    const updates: string[] = []
    const params: any[] = []

    if (input.title) {
      updates.push('title = ?')
      params.push(input.title)
    }
    if (input.content) {
      updates.push('content = ?')
      params.push(input.content)
    }
    if (input.category_id) {
      updates.push('category_id = ?')
      params.push(input.category_id)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    await this.db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

    if (input.tags) {
      await this.updatePostTags(id, input.tags)
    }

    return this.findById(id)
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run()
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async decrementLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET like_count = like_count - 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async incrementCommentCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').bind(id).run()
  }

  async decrementCommentCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET comment_count = comment_count - 1 WHERE id = ?').bind(id).run()
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const id = generateId()

    await this.db
      .prepare(
        'INSERT INTO comments (id, post_id, author_id, content, parent_id) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, input.post_id, input.author_id, input.content, input.parent_id || null)
      .run()

    await this.incrementCommentCount(input.post_id)

    return this.findCommentById(id) as Promise<Comment>
  }

  async findCommentById(id: string): Promise<Comment | null> {
    return this.db.prepare('SELECT id, post_id, author_id, content, parent_id, like_count, created_at, updated_at FROM comments WHERE id = ? AND deleted_at IS NULL').bind(id).first<Comment>()
  }

  async findCommentsByPostId(postId: string): Promise<Comment[]> {
    const result = await this.db
      .prepare('SELECT id, post_id, author_id, content, parent_id, like_count, created_at, updated_at FROM comments WHERE post_id = ? AND deleted_at IS NULL ORDER BY created_at ASC')
      .bind(postId)
      .all<Comment>()

    return result.results || []
  }

  async findCommentsWithReplies(postId: string): Promise<any[]> {
    // 获取所有评论，包括回复
    const allComments = await this.db
      .prepare(`
        SELECT 
          c.*,
          u.username as author_username,
          u.avatar as author_avatar,
          pc.author_id as parent_author_id,
          pu.username as parent_author_username
        FROM comments c
        LEFT JOIN users u ON c.author_id = u.id AND u.deleted_at IS NULL
        LEFT JOIN comments pc ON c.parent_id = pc.id AND pc.deleted_at IS NULL
        LEFT JOIN users pu ON pc.author_id = pu.id AND pu.deleted_at IS NULL
        WHERE c.post_id = ? AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC
      `)
      .bind(postId)
      .all()

    if (!allComments.results || allComments.results.length === 0) {
      return []
    }

    // 构建评论树
    const commentMap: Record<string, any> = {}
    const rootComments: any[] = []

    // 第一遍：创建所有评论节点
    allComments.results.forEach((comment: any) => {
      commentMap[comment.id] = {
        id: comment.id,
        content: comment.content,
        author_id: comment.author_id,
        post_id: comment.post_id,
        parent_id: comment.parent_id,
        like_count: comment.like_count,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author: {
          id: comment.author_id,
          username: comment.author_username,
          avatar: comment.author_avatar
        },
        parentAuthorUsername: comment.parent_author_username,
        replies: []
      }
    })

    // 第二遍：构建父子关系
    Object.values(commentMap).forEach((comment: any) => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        // 这是一个回复，添加到父评论的回复列表
        commentMap[comment.parent_id].replies.push(comment)
      } else {
        // 这是一个顶级评论
        rootComments.push(comment)
      }
    })

    return rootComments
  }

  async updateComment(id: string, content: string): Promise<Comment | null> {
    await this.db
      .prepare('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(content, id)
      .run()

    return this.findCommentById(id)
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.findCommentById(id)
    if (comment) {
      await this.db.prepare('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run()
      await this.decrementCommentCount(comment.post_id)
    }
  }

  async incrementCommentLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  async decrementCommentLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE comments SET like_count = like_count - 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  private async addTagsToPost(postId: string, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      const tagId = generateId()
      await this.db.prepare('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)').bind(tagId, tagName).run()

      const tag = await this.db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName).first<{ id: string }>()
      if (tag) {
        await this.db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(postId, tag.id).run()
      }
    }
  }

  /**
   * 申诉帖子
   */
  async appeal(postId: string, userId: string, reason: string): Promise<Post> {
    const post = await this.findById(postId)
    
    if (!post) {
      throw new Error('帖子不存在')
    }

    // 检查是否可以申诉（只有被敏感词检测拒绝的帖子可以申诉）
    if (post.audit_status !== 'rejected') {
      throw new Error('该帖子不能申诉')
    }

    // 检查是否已经申诉过
    if (post.appealed_by) {
      throw new Error('该帖子已经申诉过')
    }

    // 更新帖子状态为申诉中
    await this.db.prepare(
      'UPDATE posts SET audit_status = ?, appealed_by = ?, appealed_at = ?, appeal_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('appealed', userId, new Date().toISOString(), reason, postId).run()

    // 记录审核日志
    await this.db.prepare(
      'INSERT INTO audit_logs (id, post_id, user_id, action, old_status, new_status, reason) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(generateId(), postId, userId, 'appeal', 'rejected', 'appealed', reason).run()

    return this.findById(postId) as Promise<Post>
  }

  private async updatePostTags(postId: string, tagNames: string[]): Promise<void> {
    await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId).run()
    await this.addTagsToPost(postId, tagNames)
  }
}