import { logger } from "../../utils/logger"
import { Hono } from 'hono'
import type { Env, Variables } from '../../types'
import { requireModeratorOrAdmin } from '../../middleware/permissions'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 获取仪表盘统计数据
app.get('/api/admin/stats', requireModeratorOrAdmin, async (c) => {
  try {
    // 用户统计
    const userStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as last7days,
        COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as last30days,
        COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted
      FROM users
    `).first()

    // 活跃用户统计（30天内有发帖或评论）
    const activeUsers = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      WHERE u.deleted_at IS NULL
      AND (
        EXISTS (SELECT 1 FROM posts p WHERE p.author_id = u.id AND p.created_at >= datetime('now', '-30 days') AND p.deleted_at IS NULL)
        OR EXISTS (SELECT 1 FROM comments c WHERE c.author_id = u.id AND c.created_at >= datetime('now', '-30 days') AND c.deleted_at IS NULL)
      )
    `).first()

    // 帖子统计
    const postStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as last7days,
        COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as last30days,
        COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes
      FROM posts
    `).first()

    // 评论统计
    const commentStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as last7days,
        COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as last30days,
        COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted
      FROM comments
    `).first()

    // 分类统计
    const categoryStats = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM categories WHERE deleted_at IS NULL
    `).first()

    return c.json({
      success: true,
      data: {
        users: {
          total: userStats?.total || 0,
          last7days: userStats?.last7days || 0,
          last30days: userStats?.last30days || 0,
          deleted: userStats?.deleted || 0,
          active: activeUsers?.count || 0,
        },
        posts: {
          total: postStats?.total || 0,
          last7days: postStats?.last7days || 0,
          last30days: postStats?.last30days || 0,
          deleted: postStats?.deleted || 0,
          totalViews: postStats?.total_views || 0,
          totalLikes: postStats?.total_likes || 0,
        },
        comments: {
          total: commentStats?.total || 0,
          last7days: commentStats?.last7days || 0,
          last30days: commentStats?.last30days || 0,
          deleted: commentStats?.deleted || 0,
        },
        categories: {
          total: categoryStats?.total || 0,
        },
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch dashboard stats:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取统计数据失败',
      },
    }, 500)
  }
})

// 获取最近的活动记录
app.get('/api/admin/stats/recent-activity', requireModeratorOrAdmin, async (c) => {
  try {
    const { limit = '10' } = c.req.query()
    const count = parseInt(limit as string)

    // 最近注册的用户
    const recentUsers = await c.env.DB.prepare(`
      SELECT id, username, role, created_at
      FROM users
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(count).all()

    // 最近发布的帖子
    const recentPosts = await c.env.DB.prepare(`
      SELECT 
        p.id, p.title, p.view_count, p.like_count, p.comment_count, p.created_at,
        u.username as author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT ?
    `).bind(count).all()

    // 最近的评论
    const recentComments = await c.env.DB.prepare(`
      SELECT 
        c.id, c.content, c.created_at,
        u.username as author_username,
        p.title as post_title
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT ?
    `).bind(count).all()

    return c.json({
      success: true,
      data: {
        users: recentUsers.results,
        posts: recentPosts.results,
        comments: recentComments.results,
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch recent activity:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取最近活动失败',
      },
    }, 500)
  }
})

// 获取趋势数据（按天统计）
app.get('/api/admin/stats/trends', requireModeratorOrAdmin, async (c) => {
  try {
    const { days = '30' } = c.req.query()
    const dayCount = parseInt(days as string)

    // 用户注册趋势
    const userTrends = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= datetime('now', '-${dayCount} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all()

    // 帖子发布趋势
    const postTrends = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM posts
      WHERE created_at >= datetime('now', '-${dayCount} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all()

    // 评论发布趋势
    const commentTrends = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM comments
      WHERE created_at >= datetime('now', '-${dayCount} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all()

    // 生成日期数组
    const dates: string[] = []
    const today = new Date()
    for (let i = dayCount - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }

    // 填充数据
    const fillData = (trends: any[], dates: string[]) => {
      const trendMap = new Map(trends.map((t: any) => [t.date, t.count]))
      return dates.map(date => trendMap.get(date) || 0)
    }

    return c.json({
      success: true,
      data: {
        dates,
        users: fillData(userTrends.results, dates),
        posts: fillData(postTrends.results, dates),
        comments: fillData(commentTrends.results, dates),
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch trends:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取趋势数据失败',
      },
    }, 500)
  }
})

// 获取热门内容
app.get('/api/admin/stats/popular', requireModeratorOrAdmin, async (c) => {
  try {
    const { limit = '10' } = c.req.query()
    const count = parseInt(limit as string)

    // 热门帖子（按浏览量）
    const popularPostsByViews = await c.env.DB.prepare(`
      SELECT 
        p.id, p.title, p.view_count, p.like_count, p.comment_count, p.created_at,
        u.username as author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.view_count DESC
      LIMIT ?
    `).bind(count).all()

    // 热门帖子（按点赞数）
    const popularPostsByLikes = await c.env.DB.prepare(`
      SELECT 
        p.id, p.title, p.view_count, p.like_count, p.comment_count, p.created_at,
        u.username as author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.like_count DESC
      LIMIT ?
    `).bind(count).all()

    // 活跃用户（按发帖数）
    const activeUsers = await c.env.DB.prepare(`
      SELECT 
        u.id, u.username, u.avatar, u.created_at,
        COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id AND p.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY post_count DESC
      LIMIT ?
    `).bind(count).all()

    return c.json({
      success: true,
      data: {
        popularPostsByViews: popularPostsByViews.results,
        popularPostsByLikes: popularPostsByLikes.results,
        activeUsers: activeUsers.results,
      },
    })
  } catch (error: any) {
    logger.error('Failed to fetch popular content:', error)
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取热门内容失败',
      },
    }, 500)
  }
})

export default app