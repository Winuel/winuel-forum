import { apiClient } from './client'
import type { Post, Comment } from '../stores/post'

export interface CreatePostRequest {
  title: string
  content: string
  categoryId: string
  tags?: string[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  categoryId?: string
  tags?: string[]
}

export interface CreateCommentRequest {
  postId: string
  content: string
  parentId?: string
}

export const postsApi = {
  async getPosts(page = 1, limit = 20, categoryId?: string): Promise<{ posts: Post[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (categoryId) {
      params.append('categoryId', categoryId)
    }

    return apiClient.get<{ posts: Post[]; total: number }>(`/api/posts?${params}`)
  },

  async getPost(id: string): Promise<Post> {
    return apiClient.get<Post>(`/api/posts/${id}`)
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    return apiClient.post<Post>('/api/posts', data)
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    return apiClient.put<Post>(`/api/posts/${id}`, data)
  },

  async deletePost(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/posts/${id}`)
  },

  async getComments(postId: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/api/posts/${postId}/comments`)
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return apiClient.post<Comment>('/api/comments', data)
  },

  async updateComment(id: string, content: string): Promise<Comment> {
    return apiClient.put<Comment>(`/api/comments/${id}`, { content })
  },

  async deleteComment(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/comments/${id}`)
  },

  async likePost(id: string): Promise<void> {
    return apiClient.post<void>(`/api/posts/${id}/like`, {})
  },

  async unlikePost(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/posts/${id}/like`)
  },

  async likeComment(id: string): Promise<void> {
    return apiClient.post<void>(`/api/comments/${id}/like`, {})
  },

  async unlikeComment(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/comments/${id}/like`)
  },
}