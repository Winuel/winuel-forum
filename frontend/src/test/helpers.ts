/**
 * 测试辅助工具
 * 提供 API mock 和其他测试辅助函数
 */

import { getApiClient } from '@winuel/shared-api'
import type { Post, Comment } from '../stores/post'
import type { User } from '../stores/user'
import { expect } from 'vitest'

// 获取ApiClient实例
const apiClient = getApiClient()

// 模拟数据
export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'Content 1',
    authorId: '1',
    authorUsername: 'user1',
    authorAvatar: '/avatar1.png',
    categoryId: '1',
    categoryName: '技术讨论',
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ['tag1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Post 2',
    content: 'Content 2',
    authorId: '2',
    authorUsername: 'user2',
    authorAvatar: '/avatar2.png',
    categoryId: '2',
    categoryName: '生活分享',
    viewCount: 10,
    likeCount: 5,
    commentCount: 3,
    tags: ['tag2', 'tag3'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
]

export const mockPost: Post = {
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  authorId: '1',
  authorUsername: 'user1',
  authorAvatar: '/avatar1.png',
  categoryId: '1',
  categoryName: '技术讨论',
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  tags: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    authorId: '1',
    authorUsername: 'user1',
    authorAvatar: '/avatar1.png',
    content: 'Test comment',
    parentId: undefined,
    likeCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  avatar: '/avatar.png',
  createdAt: '2024-01-01T00:00:00Z',
}

// 自定义匹配器：接受任何值（包括undefined）
class AnyValueMatcher {
  asymmetricMatch(actual: unknown) {
    return true // 接受任何值
  }
  toString() {
    return 'AnyValue'
  }
}

export const anyValue = new AnyValueMatcher()

// Mock API 响应函数 - 符合 ApiResponse 格式
export function mockApiResponse<T>(data: T): any {
  return {
    data: {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    },
  }
}

// Mock 成功响应
export function mockSuccessResponse<T>(data: T): any {
  return {
    data: {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    },
  }
}

// Mock 错误响应
export function mockErrorResponse(message: string, code: string = 'INTERNAL_ERROR'): any {
  return {
    data: {
      success: false,
      error: {
        code: code,
        message: message,
      },
      timestamp: new Date().toISOString(),
    },
  }
}

// 获取 axios instance 的 mock
export function getAxiosMock() {
  return (apiClient as any).axiosInstance
}

// 重置所有 mocks
export function resetAllMocks() {
  const axiosMock = getAxiosMock()
  if (axiosMock.get) axiosMock.get.mockReset()
  if (axiosMock.post) axiosMock.post.mockReset()
  if (axiosMock.put) axiosMock.put.mockReset()
  if (axiosMock.delete) axiosMock.delete.mockReset()
  if (axiosMock.patch) axiosMock.patch.mockReset()
}