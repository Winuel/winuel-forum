/**
 * 帖子服务
 * Post Service
 * 
 * 负责处理论坛帖子相关的业务逻辑，包括：
 * - 帖子的创建、查询、更新和删除
 * - 评论的创建、查询、更新和删除
 * - 标签管理
 * - 帖子统计数据（浏览量、点赞数、评论数）
 * - 帖子申诉功能
 * 
 * Provides forum post-related business logic handling:
 * - Post creation, query, update, and deletion
 * - Comment creation, query, update, and deletion
 * - Tag management
 * - Post statistics (view count, like count, comment count)
 * - Post appeal functionality
 * 
 * @package backend/src/services
 */

import type { Post, Comment } from '../db/models'
import type { KVCache } from '../utils/cache'
import { generateId } from '../utils/crypto'

/**
 * 创建帖子输入接口
 * Create Post Input Interface
 * 定义创建新帖子所需的数据结构
 * Defines the data structure required for creating a new post
 */
export interface CreatePostInput {
  /** 帖子标题 / Post title */
  title: string
  /** 帖子内容 / Post content */
  content: string
  /** 作者 ID / Author ID */
  author_id: string
  /** 分类 ID / Category ID */
  category_id: string
  /** 标签列表（可选）/ Tag list (optional) */
  tags?: string[]
}

/**
 * 更新帖子输入接口
 * Update Post Input Interface
 * 定义更新帖子所需的数据结构
 * Defines the data structure required for updating a post
 */
export interface UpdatePostInput {
  /** 帖子标题（可选）/ Post title (optional) */
  title?: string
  /** 帖子内容（可选）/ Post content (optional) */
  content?: string
  /** 分类 ID（可选）/ Category ID (optional) */
  category_id?: string
  /** 标签列表（可选）/ Tag list (optional) */
  tags?: string[]
}

/**
 * 申诉帖子输入接口
 * Appeal Post Input Interface
 * 定义申诉帖子所需的数据结构
 * Defines the data structure required for appealing a post
 */
export interface AppealPostInput {
  /** 帖子 ID / Post ID */
  post_id: string
  /** 用户 ID / User ID */
  user_id: string
  /** 申诉原因 / Appeal reason */
  reason: string
}

/**
 * 创建评论输入接口
 * Create Comment Input Interface
 * 定义创建评论所需的数据结构
 * Defines the data structure required for creating a comment
 */
export interface CreateCommentInput {
  /** 帖子 ID / Post ID */
  post_id: string
  /** 作者 ID / Author ID */
  author_id: string
  /** 评论内容 / Comment content */
  content: string
  /** 父评论 ID（可选，用于回复）/ Parent comment ID (optional, for replies) */
  parent_id?: string
}

/**
 * 帖子服务类
 * Post Service Class
 * 
 * 提供帖子管理的所有业务逻辑
 * Provides all business logic for post management
 */
export class PostService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param db - D1 数据库实例 / D1 database instance
   * @param cache - 可选的 KV 缓存实例 / Optional KV cache instance
   */
  constructor(private db: D1Database, private cache?: KVCache) {}

  /**
   * 创建帖子
   * Create Post
   * 
   * 创建一个新帖子，并进行敏感词检测
   * Creates a new post and performs sensitive word detection
   * 
   * @param input - 帖子创建信息 / Post creation information
   * @returns 创建的帖子对象 / Created post object
   */
  async create(input: CreatePostInput): Promise<Post> {
    // 导入敏感词检测服务 / Import sensitive word detection service
    const { getSensitiveWordService } = await import('./sensitiveWordService')
    const sensitiveWordService = getSensitiveWordService()

    // 检测标题和内容中的敏感词 / Detect sensitive words in title and content
    const titleMatches = sensitiveWordService.detect(input.title)
    const contentMatches = sensitiveWordService.detect(input.content)

    const id = generateId()
    let auditStatus: 'pending' | 'rejected' = 'pending'
    let auditReason = ''

    // 如果发现敏感词，标记为 rejected，并提供模糊化告警 / If sensitive words are found, mark as rejected and provide masked warning
    if (titleMatches.length > 0 || contentMatches.length > 0) {
      const allMatches = [...titleMatches, ...contentMatches]
      const uniqueWords = [...new Set(allMatches.map(m => m.word))]
      const filteredWords = uniqueWords.map(word => '*'.repeat(word.length))
      
      auditStatus = 'rejected'
      auditReason = `帖子包含敏感词：${filteredWords.join(', ')}（实际敏感词：${uniqueWords.join(', ')}）`
    }

    // 插入帖子数据 / Insert post data
    await this.db
      .prepare(
        'INSERT INTO posts (id, title, content, author_id, category_id, audit_status, audit_reason) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, input.title, input.content, input.author_id, input.category_id, auditStatus, auditReason)
      .run()

    // 添加标签 / Add tags
    if (input.tags && input.tags.length > 0) {
      await this.addTagsToPost(id, input.tags)
    }

    // 如果帖子被拒绝，返回错误信息而不是帖子对象 / If post is rejected, return error instead of post object
    if (auditStatus === 'rejected') {
      throw new Error(auditReason)
    }

    return this.findById(id) as Promise<Post>
  }

  /**
   * 根据 ID 查找帖子
   * Find Post by ID
   * 
   * @param id - 帖子 ID / Post ID
   * @returns 帖子对象或 null / Post object or null
   */
  async findById(id: string): Promise<Post | null> {
    if (this.cache) {
      return this.cache.getOrSet(
        `post:${id}`,
        async () => {
          return this.db.prepare('SELECT id, title, content, author_id, category_id, view_count, like_count, comment_count, created_at, updated_at FROM posts WHERE id = ? AND deleted_at IS NULL').bind(id).first<Post>()
        },
        300 // 5分钟缓存 / 5 minute cache
      )
    }
    return this.db.prepare('SELECT id, title, content, author_id, category_id, view_count, like_count, comment_count, created_at, updated_at FROM posts WHERE id = ? AND deleted_at IS NULL').bind(id).first<Post>()
  }

  /**
   * 查找所有帖子
   * Find All Posts
   * 
   * 支持分页、分类筛选和作者筛选
   * Supports pagination, category filtering, and author filtering
   * 
   * @param options - 查询选项 / Query options
   * @param options.page - 页码 / Page number
   * @param options.limit - 每页数量 / Items per page
   * @param options.category_id - 分类 ID / Category ID
   * @param options.author_id - 作者 ID / Author ID
   * @returns 包含帖子列表和总数的对象 / Object containing post list and total count
   */
  async findAll(options: {
    page?: number
    limit?: number
    category_id?: string
    author_id?: string
  } = {}): Promise<{ posts: Post[]; total: number }> {
    const { page = 1, limit = 20, category_id, author_id } = options
    const offset = (page - 1) * limit

    // 构建查询语句 / Build query statement
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

    // 计算总数 / Calculate total count
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

  /**
   * 查找所有帖子（包含详细信息）
   * Find All Posts with Details
   * 
   * 支持分页、分类筛选和作者筛选，返回包含作者、分类和标签的详细信息
   * Supports pagination, category filtering, and author filtering, returns detailed info including author, category, and tags
   * 
   * @param options - 查询选项 / Query options
   * @returns 包含帖子列表（含详细信息）和总数的对象 / Object containing post list (with details) and total count
   */
  async findAllWithDetails(options: {
    page?: number
    limit?: number
    category_id?: string
    author_id?: string
    user_id?: string  // 添加用户ID参数，用于查询点赞状态 / Add user_id parameter for querying like status
  } = {}): Promise<{ posts: any[]; total: number }> {
    const { page = 1, limit = 20, category_id, author_id, user_id } = options
    const offset = (page - 1) * limit

    // 使用 JOIN 查询一次性获取帖子、作者和分类信息 / Use JOIN query to get post, author, and category info at once
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

    // 获取所有帖子ID / Get all post IDs
    const postIds = postsResult.results?.map((p: any) => p.id) || []

    // 一次性获取所有标签 / Get all tags at once
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

    // 一次性获取当前用户的点赞状态（避免 N+1 查询）/ Get current user's like status at once (avoid N+1 queries)
    let likesMap: Record<string, boolean> = {}
    if (postIds.length > 0 && user_id) {
      const placeholders = postIds.map(() => '?').join(',')
      const likesQuery = `
        SELECT target_id 
        FROM likes 
        WHERE user_id = ? AND target_type = 'post' AND target_id IN (${placeholders})
      `
      const likesResult = await this.db.prepare(likesQuery).bind(user_id, ...postIds).all()
      
      likesResult.results?.forEach((like: any) => {
        likesMap[like.target_id] = true
      })
    }

    // 组装结果 / Assemble results
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
      tags: tagsMap[post.id] || [],
      is_liked: likesMap[post.id] || false  // 添加用户点赞状态 / Add user like status
    })) || []

    // 计算总数 / Calculate total count
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

  /**
     * 根据 ID 查找帖子（包含详细信息）
     * Find Post by ID with Details
     * 
     * 返回包含作者、分类和标签的详细信息
     * Returns detailed info including author, category, and tags
     * 
     * @param id - 帖子 ID / Post ID
     * @returns 帖子对象（含详细信息）或 null / Post object (with details) or null
     */
    async findByIdWithDetails(id: string): Promise<any | null> {
      if (this.cache) {
        return this.cache.getOrSet(
          `post:${id}:details`,
          async () => {
            // 使用 JOIN 查询一次性获取帖子、作者、分类和标签信息 / Use JOIN query to get post, author, category, and tag info at once
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
            
            // 获取标签 / Get tags
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
          },
          300 // 5分钟缓存 / 5 minute cache
        )
      }
      
      // 使用 JOIN 查询一次性获取帖子、作者、分类和标签信息 / Use JOIN query to get post, author, category, and tag info at once
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
      
      // 获取标签 / Get tags
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
  /**
   * 更新帖子
   * Update Post
   * 
   * @param id - 帖子 ID / Post ID
   * @param input - 更新信息 / Update information
   * @returns 更新后的帖子对象或 null / Updated post object or null
   */
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

    // 清除相关缓存 / Clear related caches
    if (this.cache) {
      await this.cache.delete(`post:${id}`)
      await this.cache.delete(`post:${id}:comments`)
    }

    if (input.tags) {
      await this.updatePostTags(id, input.tags)
    }

    return this.findById(id)
  }

  /**
   * 删除帖子（软删除）
   * Delete Post (Soft Delete)
   * 
   * @param id - 帖子 ID / Post ID
   */
  async delete(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run()
  }

  /**
   * 增加帖子浏览量
   * Increment Post View Count
   * 
   * @param id - 帖子 ID / Post ID
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  /**
   * 增加帖子点赞数
   * Increment Post Like Count
   * 
   * @param id - 帖子 ID / Post ID
   */
  async incrementLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  /**
   * 减少帖子点赞数
   * Decrement Post Like Count
   * 
   * @param id - 帖子 ID / Post ID
   */
  async decrementLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET like_count = like_count - 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  /**
   * 增加帖子评论数
   * Increment Post Comment Count
   * 
   * @param id - 帖子 ID / Post ID
   */
  async incrementCommentCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').bind(id).run()
  }

  /**
   * 减少帖子评论数
   * Decrement Post Comment Count
   * 
   * @param id - 帖子 ID / Post ID
   */
  async decrementCommentCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE posts SET comment_count = comment_count - 1 WHERE id = ?').bind(id).run()
  }

  /**
   * 创建评论
   * Create Comment
   * 
   * @param input - 评论创建信息 / Comment creation information
   * @returns 创建的评论对象 / Created comment object
   */
  async createComment(input: CreateCommentInput): Promise<Comment> {
    const id = generateId()

    // 插入评论数据 / Insert comment data
    await this.db
      .prepare(
        'INSERT INTO comments (id, post_id, author_id, content, parent_id) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, input.post_id, input.author_id, input.content, input.parent_id || null)
      .run()

    // 增加帖子评论数 / Increment post comment count
    await this.incrementCommentCount(input.post_id)

    // 清除相关缓存 / Clear related caches
    if (this.cache) {
      await this.cache.delete(`post:${input.post_id}:comments`)
      await this.cache.delete(`post:${input.post_id}`)
    }

    return this.findCommentById(id) as Promise<Comment>
  }

  /**
   * 根据 ID 查找评论
   * Find Comment by ID
   * 
   * @param id - 评论 ID / Comment ID
   * @returns 评论对象或 null / Comment object or null
   */
  async findCommentById(id: string): Promise<Comment | null> {
    return this.db.prepare('SELECT id, post_id, author_id, content, parent_id, like_count, created_at, updated_at FROM comments WHERE id = ? AND deleted_at IS NULL').bind(id).first<Comment>()
  }

  /**
   * 根据帖子 ID 查找评论
   * Find Comments by Post ID
   * 
   * @param postId - 帖子 ID / Post ID
   * @returns 评论列表 / Comment list
   */
  async findCommentsByPostId(postId: string): Promise<Comment[]> {
    if (this.cache) {
      return this.cache.getOrSet(
        `post:${postId}:comments`,
        async () => {
          const result = await this.db
            .prepare('SELECT id, post_id, author_id, content, parent_id, like_count, created_at, updated_at FROM comments WHERE post_id = ? AND deleted_at IS NULL ORDER BY created_at ASC')
            .bind(postId)
            .all<Comment>()
          return result.results || []
        },
        180 // 3分钟缓存 / 3 minute cache
      )
    }

    const result = await this.db
      .prepare('SELECT id, post_id, author_id, content, parent_id, like_count, created_at, updated_at FROM comments WHERE post_id = ? AND deleted_at IS NULL ORDER BY created_at ASC')
      .bind(postId)
      .all<Comment>()

    return result.results || []
  }

  /**
   * 根据帖子 ID 查找评论（包含回复）
   * Find Comments with Replies by Post ID
   * 
   * 返回评论树结构，包含所有回复
   * Returns comment tree structure with all replies
   * 
   * @param postId - 帖子 ID / Post ID
   * @returns 评论树列表 / Comment tree list
   */
  async findCommentsWithReplies(postId: string): Promise<any[]> {
    // 获取所有评论，包括回复 / Get all comments including replies
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

    // 构建评论树 / Build comment tree
    const commentMap: Record<string, any> = {}
    const rootComments: any[] = []

    // 第一遍：创建所有评论节点 / First pass: create all comment nodes
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

    // 第二遍：构建父子关系 / Second pass: build parent-child relationships
    Object.values(commentMap).forEach((comment: any) => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        // 这是一个回复，添加到父评论的回复列表 / This is a reply, add to parent comment's reply list
        commentMap[comment.parent_id].replies.push(comment)
      } else {
        // 这是一个顶级评论 / This is a top-level comment
        rootComments.push(comment)
      }
    })

    return rootComments
  }

  /**
   * 更新评论
   * Update Comment
   * 
   * @param id - 评论 ID / Comment ID
   * @param content - 评论内容 / Comment content
   * @returns 更新后的评论对象或 null / Updated comment object or null
   */
  async updateComment(id: string, content: string): Promise<Comment | null> {
    await this.db
      .prepare('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(content, id)
      .run()

    return this.findCommentById(id)
  }

  /**
   * 删除评论（软删除）
   * Delete Comment (Soft Delete)
   * 
   * @param id - 评论 ID / Comment ID
   */
  async deleteComment(id: string): Promise<void> {
    const comment = await this.findCommentById(id)
    if (comment) {
      await this.db.prepare('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run()
      await this.decrementCommentCount(comment.post_id)
    }
  }

  /**
   * 增加评论点赞数
   * Increment Comment Like Count
   * 
   * @param id - 评论 ID / Comment ID
   */
  async incrementCommentLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  /**
   * 减少评论点赞数
   * Decrement Comment Like Count
   * 
   * @param id - 评论 ID / Comment ID
   */
  async decrementCommentLikeCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE comments SET like_count = like_count - 1 WHERE id = ? AND deleted_at IS NULL').bind(id).run()
  }

  /**
   * 为帖子添加标签（私有方法）
   * Add Tags to Post (Private Method)
   * 
   * @param postId - 帖子 ID / Post ID
   * @param tagNames - 标签名称列表 / Tag name list
   */
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
   * Appeal Post
   * 
   * 将被敏感词检测拒绝的帖子提交申诉
   * Submits an appeal for a post rejected by sensitive word detection
   * 
   * @param postId - 帖子 ID / Post ID
   * @param userId - 用户 ID / User ID
   * @param reason - 申诉原因 / Appeal reason
   * @returns 更新后的帖子对象 / Updated post object
   * @throws 如果帖子不存在 / Throws if post doesn't exist
   * @throws 如果帖子不能申诉 / Throws if post cannot be appealed
   * @throws 如果帖子已经申诉过 / Throws if post has already been appealed
   */
  async appeal(postId: string, userId: string, reason: string): Promise<Post> {
    const post = await this.findById(postId)
    
    if (!post) {
      throw new Error('帖子不存在 / Post does not exist')
    }

    // 检查是否可以申诉（只有被敏感词检测拒绝的帖子可以申诉） / Check if appeal is allowed (only posts rejected by sensitive word detection can be appealed)
    if (post.audit_status !== 'rejected') {
      throw new Error('该帖子不能申诉 / This post cannot be appealed')
    }

    // 检查是否已经申诉过 / Check if already appealed
    if (post.appealed_by) {
      throw new Error('该帖子已经申诉过 / This post has already been appealed')
    }

    // 更新帖子状态为申诉中 / Update post status to appealed
    await this.db.prepare(
      'UPDATE posts SET audit_status = ?, appealed_by = ?, appealed_at = ?, appeal_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('appealed', userId, new Date().toISOString(), reason, postId).run()

    // 记录审核日志 / Record audit log
    await this.db.prepare(
      'INSERT INTO audit_logs (id, post_id, user_id, action, old_status, new_status, reason) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(generateId(), postId, userId, 'appeal', 'rejected', 'appealed', reason).run()

    return this.findById(postId) as Promise<Post>
  }

  /**
   * 更新帖子标签（私有方法）
   * Update Post Tags (Private Method)
   * 
   * @param postId - 帖子 ID / Post ID
   * @param tagNames - 标签名称列表 / Tag name list
   */
  private async updatePostTags(postId: string, tagNames: string[]): Promise<void> {
    await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId).run()
    await this.addTagsToPost(postId, tagNames)
  }
}