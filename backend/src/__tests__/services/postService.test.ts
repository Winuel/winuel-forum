import { describe, it, expect, beforeEach } from 'vitest'
import { PostService } from '../../services/postService'
import { createMockD1Database } from '../helpers/db'

describe('PostService', () => {
  let mockDb: any
  let postService: PostService

  beforeEach(() => {
    mockDb = createMockD1Database()
    postService = new PostService(mockDb)
  })

  describe('create', () => {
    it('should create a new post', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('tags', [])
      mockDb.tables.set('post_tags', [])

      const post = await postService.create({
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        tags: ['tag1', 'tag2'],
      })

      expect(post).toBeDefined()
      expect(post.title).toBe('Test Post')
      expect(post.content).toBe('Test content')
    })
  })

  describe('findById', () => {
    it('should find post by id', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      const post = await postService.findById('1')

      expect(post).toBeDefined()
      expect(post?.id).toBe('1')
      expect(post?.title).toBe('Test Post')
    })

    it('should return null for non-existent post', async () => {
      mockDb.tables = new Map()
      mockDb.tables.set('posts', [])

      const post = await postService.findById('999')

      expect(post).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const mockPosts = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + 1),
        title: `Post ${i + 1}`,
        content: `Content ${i + 1}`,
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      mockDb.tables = new Map()
      mockDb.tables.set('posts', mockPosts)

      const result = await postService.findAll({ page: 1, limit: 20 })

      expect(result.posts).toBeDefined()
      expect(result.posts.length).toBe(20)
      expect(result.total).toBe(25)
    })

    it('should filter by category_id', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Content 1',
          author_id: 'user1',
          category_id: 'cat1',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Post 2',
          content: 'Content 2',
          author_id: 'user1',
          category_id: 'cat2',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('posts', mockPosts)

      const result = await postService.findAll({ page: 1, limit: 20, category_id: 'cat1' })

      expect(result.posts.length).toBe(1)
      expect(result.posts[0].category_id).toBe('cat1')
    })

    it('should filter by author_id', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          content: 'Content 1',
          author_id: 'user1',
          category_id: 'cat1',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Post 2',
          content: 'Content 2',
          author_id: 'user2',
          category_id: 'cat1',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('posts', mockPosts)

      const result = await postService.findAll({ page: 1, limit: 20, author_id: 'user1' })

      expect(result.posts.length).toBe(1)
      expect(result.posts[0].author_id).toBe('user1')
    })
  })

  describe('update', () => {
    it('should update post', async () => {
      const mockPost = {
        id: '1',
        title: 'Old Title',
        content: 'Old content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      const updatedPost = await postService.update('1', {
        title: 'New Title',
        content: 'New content',
      })

      expect(updatedPost).toBeDefined()
      expect(updatedPost?.title).toBe('New Title')
      expect(updatedPost?.content).toBe('New content')
    })
  })

  describe('delete', () => {
    it('should delete post', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      await postService.delete('1')

      expect(mockDb.tables.get('posts')[0].deleted_at).toBeDefined();
    })
  })

  describe('incrementViewCount', () => {
    it('should increment view count', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 5,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      await postService.incrementViewCount('1')

      const updatedPost = mockDb.tables.get('posts')[0]
      expect(updatedPost.view_count).toBe(6)
    })
  })

  describe('incrementLikeCount', () => {
    it('should increment like count', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 5,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      await postService.incrementLikeCount('1')

      const updatedPost = mockDb.tables.get('posts')[0]
      expect(updatedPost.like_count).toBe(6)
    })
  })

  describe('decrementLikeCount', () => {
    it('should decrement like count', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 5,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])

      await postService.decrementLikeCount('1')

      const updatedPost = mockDb.tables.get('posts')[0]
      expect(updatedPost.like_count).toBe(4)
    })
  })

  describe('createComment', () => {
    it('should create a comment', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author_id: 'user1',
        category_id: 'cat1',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockComment = {
        id: '1',
        post_id: '1',
        author_id: 'user1',
        content: 'Test comment',
        parent_id: null,
        like_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.tables = new Map()
      mockDb.tables.set('posts', [mockPost])
      mockDb.tables.set('comments', [mockComment])

      const comment = await postService.createComment({
        post_id: '1',
        author_id: 'user1',
        content: 'Test comment',
      })

      expect(comment).toBeDefined()
      expect(comment.content).toBe('Test comment')
      expect(comment.post_id).toBe('1')
    })
  })

  describe('findCommentsByPostId', () => {
    it('should return comments for a post', async () => {
      const mockComments = [
        {
          id: '1',
          post_id: '1',
          author_id: 'user1',
          content: 'Comment 1',
          parent_id: null,
          like_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          post_id: '1',
          author_id: 'user2',
          content: 'Comment 2',
          parent_id: null,
          like_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDb.tables = new Map()
      mockDb.tables.set('comments', mockComments)

      const comments = await postService.findCommentsByPostId('1')

      expect(comments).toBeDefined()
      expect(comments.length).toBe(2)
      expect(comments[0].post_id).toBe('1')
    })
  })
})