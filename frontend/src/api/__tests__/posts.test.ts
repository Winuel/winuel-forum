import { describe, it, expect, beforeEach, vi } from 'vitest'
import { postsApi } from '../posts'
import { mockPosts, mockPost, mockComments, getAxiosMock, resetAllMocks, mockSuccessResponse, anyValue } from '../../test/helpers'

describe('Posts API', () => {
  beforeEach(() => {
    resetAllMocks()
    vi.clearAllMocks()
  })

  describe('getPosts', () => {
    it('should fetch posts successfully', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse({ posts: mockPosts, total: 1 })
      )

      const result = await postsApi.getPosts()

      expect(result.posts).toEqual(mockPosts)
      expect(result.total).toBe(1)
      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts?page=1&limit=20'),
        anyValue
      )
    })

    it('should fetch posts with pagination', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse({ posts: [], total: 0 })
      )

      await postsApi.getPosts(2, 10)

      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2&limit=10'),
        anyValue
      )
    })

    it('should fetch posts with category filter', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse({ posts: [], total: 0 })
      )

      await postsApi.getPosts(1, 20, 'category-1')

      expect(axiosMock.get).toHaveBeenCalledWith(
        expect.stringContaining('categoryId=category-1'),
        anyValue
      )
    })
  })

  describe('getPost', () => {
    it('should fetch post by id', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse(mockPost)
      )

      const result = await postsApi.getPost('1')

      expect(result).toEqual(mockPost)
      expect(axiosMock.get).toHaveBeenCalledWith('/api/posts/1', anyValue)
    })
  })

  describe('createPost', () => {
    it('should create a new post', async () => {
      const newPostData = {
        title: 'New Post',
        content: 'New content',
        categoryId: '1',
        tags: ['tag1'],
      }

      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({ ...mockPost, ...newPostData })
      )

      const result = await postsApi.createPost(newPostData)

      expect(result.title).toBe(newPostData.title)
      expect(axiosMock.post).toHaveBeenCalledWith('/api/posts', newPostData, anyValue)
    })
  })

  describe('updatePost', () => {
    it('should update a post', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      }

      const axiosMock = getAxiosMock()
      axiosMock.put.mockResolvedValueOnce(
        mockSuccessResponse({ ...mockPost, ...updateData })
      )

      const result = await postsApi.updatePost('1', updateData)

      expect(result.title).toBe(updateData.title)
      expect(axiosMock.put).toHaveBeenCalledWith('/api/posts/1', updateData, anyValue)
    })
  })

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.delete.mockResolvedValueOnce(
        mockSuccessResponse(null)
      )

      await postsApi.deletePost('1')

      expect(axiosMock.delete).toHaveBeenCalledWith('/api/posts/1', anyValue)
    })
  })

  describe('getComments', () => {
    it('should fetch comments for a post', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse(mockComments)
      )

      const result = await postsApi.getComments('1')

      expect(result).toEqual(mockComments)
      expect(axiosMock.get).toHaveBeenCalledWith('/api/posts/1/comments', undefined)
    })

    it('should fetch comments with pagination', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.get.mockResolvedValueOnce(
        mockSuccessResponse([])
      )

      await postsApi.getComments('1')

      expect(axiosMock.get).toHaveBeenCalledWith('/api/posts/1/comments', undefined)
    })
  })

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const newCommentData = {
        postId: '1',
        content: 'New comment',
      }

      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({ ...mockComments[0], ...newCommentData })
      )

      const result = await postsApi.createComment(newCommentData)

      expect(result.content).toBe(newCommentData.content)
      expect(axiosMock.post).toHaveBeenCalledWith('/api/comments', newCommentData, anyValue)
    })
  })

  describe('likePost', () => {
    it('should like a post', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({ message: '点赞成功' })
      )

      await postsApi.likePost('1')

      expect(axiosMock.post).toHaveBeenCalledWith('/api/posts/1/like', {}, anyValue)
    })
  })

  describe('unlikePost', () => {
    it('should unlike a post', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.delete.mockResolvedValueOnce(
        mockSuccessResponse({ message: '取消点赞成功' })
      )

      await postsApi.unlikePost('1')

      expect(axiosMock.delete).toHaveBeenCalledWith('/api/posts/1/like', anyValue)
    })
  })

  describe('likeComment', () => {
    it('should like a comment', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.post.mockResolvedValueOnce(
        mockSuccessResponse({ message: '点赞成功' })
      )

      await postsApi.likeComment('1')

      expect(axiosMock.post).toHaveBeenCalledWith('/api/comments/1/like', {}, anyValue)
    })
  })

  describe('unlikeComment', () => {
    it('should unlike a comment', async () => {
      const axiosMock = getAxiosMock()
      axiosMock.delete.mockResolvedValueOnce(
        mockSuccessResponse({ message: '取消点赞成功' })
      )

      await postsApi.unlikeComment('1')

      expect(axiosMock.delete).toHaveBeenCalledWith('/api/comments/1/like', anyValue)
    })
  })
})