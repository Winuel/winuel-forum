/**
 * 帖子状态管理 Store
 * Post State Management Store
 * 
 * 管理帖子和评论相关的状态
 * Manages post and comment-related states
 * 
 * @package frontend/src/stores
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 帖子接口
 * Post Interface
 * 
 * 定义帖子的数据结构
 * Defines the data structure of a post
 */
export interface Post {
  /** 帖子 ID / Post ID */
  id: string
  /** 帖子标题 / Post title */
  title: string
  /** 帖子内容 / Post content */
  content: string
  /** 作者 ID / Author ID */
  authorId: string
  /** 作者用户名 / Author username */
  authorUsername: string
  /** 作者头像（可选）/ Author avatar (optional) */
  authorAvatar?: string
  /** 分类 ID / Category ID */
  categoryId: string
  /** 分类名称 / Category name */
  categoryName: string
  /** 标签列表 / Tag list */
  tags: string[]
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
  /** 浏览量 / View count */
  viewCount: number
  /** 点赞数 / Like count */
  likeCount: number
  /** 评论数 / Comment count */
  commentCount: number
}

/**
 * 评论接口
 * Comment Interface
 * 
 * 定义评论的数据结构
 * Defines the data structure of a comment
 */
export interface Comment {
  /** 评论 ID / Comment ID */
  id: string
  /** 帖子 ID / Post ID */
  postId: string
  /** 作者 ID / Author ID */
  authorId: string
  /** 作者用户名 / Author username */
  authorUsername: string
  /** 作者头像（可选）/ Author avatar (optional) */
  authorAvatar?: string
  /** 评论内容 / Comment content */
  content: string
  /** 父评论 ID（可选）/ Parent comment ID (optional) */
  parentId?: string
  /** 父评论作者用户名（可选）/ Parent comment author username (optional) */
  parentAuthorUsername?: string
  /** 创建时间 / Creation time */
  createdAt: string
  /** 更新时间 / Update time */
  updatedAt: string
  /** 点赞数 / Like count */
  likeCount: number
  /** 回复列表（可选）/ Reply list (optional) */
  replies?: Comment[]
  /** 代码审查信息（可选）/ Code review info (optional) */
  codeReview?: {
    /** 审查 ID / Review ID */
    id: string
    /** 附件所有者 ID / Attachment owner ID */
    attachmentOwnerId: string
    /** 审查状态 / Review status */
    status: 'pending' | 'accepted' | 'rejected'
    /** 旧内容 / Old content */
    oldContent: string
    /** 新内容 / New content */
    newContent: string
    /** 文件名 / File name */
    fileName: string
  }
}

/**
 * 帖子 Store
 * Post Store
 * 
 * 使用 Pinia 管理帖子和评论状态
 * Uses Pinia to manage post and comment states
 */
export const usePostStore = defineStore('post', () => {
  // 帖子列表 / Post list
  const posts = ref<Post[]>([])
  // 当前查看的帖子 / Currently viewed post
  const currentPost = ref<Post | null>(null)
  // 评论列表 / Comment list
  const comments = ref<Comment[]>([])
  // 加载状态 / Loading state
  const loading = ref(false)

  /**
   * 设置帖子列表
   * Set Post List
   * 
   * @param newPosts - 新的帖子列表 / New post list
   */
  function setPosts(newPosts: Post[]) {
    posts.value = newPosts
  }

  /**
   * 设置当前帖子
   * Set Current Post
   * 
   * @param post - 帖子对象 / Post object
   */
  function setCurrentPost(post: Post | null) {
    currentPost.value = post
  }

  /**
   * 设置评论列表
   * Set Comment List
   * 
   * @param newComments - 新的评论列表 / New comment list
   */
  function setComments(newComments: Comment[]) {
    comments.value = newComments
  }

  /**
   * 添加帖子
   * Add Post
   * 
   * @param post - 要添加的帖子 / Post to add
   */
  function addPost(post: Post) {
    posts.value.unshift(post)
  }

  /**
   * 更新帖子
   * Update Post
   * 
   * @param postId - 帖子 ID / Post ID
   * @param updates - 更新内容 / Updates
   */
  function updatePost(postId: string, updates: Partial<Post>) {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index !== -1) {
      posts.value[index] = { ...posts.value[index], ...updates }
    }
    if (currentPost.value?.id === postId) {
      currentPost.value = { ...currentPost.value, ...updates }
    }
  }

  /**
   * 删除帖子
   * Delete Post
   * 
   * @param postId - 帖子 ID / Post ID
   */
  function deletePost(postId: string) {
    posts.value = posts.value.filter(p => p.id !== postId)
    if (currentPost.value?.id === postId) {
      currentPost.value = null
    }
  }

  /**
   * 添加评论
   * Add Comment
   * 
   * @param comment - 要添加的评论 / Comment to add
   */
  function addComment(comment: Comment) {
    comments.value.push(comment)
  }

  /**
   * 更新评论
   * Update Comment
   * 
   * @param commentId - 评论 ID / Comment ID
   * @param updates - 更新内容 / Updates
   */
  function updateComment(commentId: string, updates: Partial<Comment>) {
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value[index] = { ...comments.value[index], ...updates }
    }
  }

  /**
   * 删除评论
   * Delete Comment
   * 
   * @param commentId - 评论 ID / Comment ID
   */
  function deleteComment(commentId: string) {
    comments.value = comments.value.filter(c => c.id !== commentId)
  }

  return {
    posts,
    currentPost,
    comments,
    loading,
    setPosts,
    setCurrentPost,
    setComments,
    addPost,
    updatePost,
    deletePost,
    addComment,
    updateComment,
    deleteComment,
  }
})