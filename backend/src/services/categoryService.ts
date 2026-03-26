/**
 * 分类服务
 * Category Service
 * 
 * 负责处理论坛分类相关的业务逻辑，包括：
 * - 分类的查询
 * 
 * Provides forum category-related business logic handling:
 * - Category query
 * 
 * @package backend/src/services
 */

import type { Category } from '../db/models'
import { generateId } from '../utils/crypto'

/**
 * 分类服务类
 * Category Service Class
 * 
 * 提供分类管理的所有业务逻辑
 * Provides all business logic for category management
 */
export class CategoryService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param db - D1 数据库实例 / D1 database instance
   */
  constructor(private db: D1Database) {}

  /**
   * 查找所有分类
   * Find All Categories
   * 
   * 获取所有分类列表，按名称排序
   * Get all category list, sorted by name
   * 
   * @returns 分类列表 / Category list
   */
  async findAll(): Promise<Category[]> {
    const result = await this.db.prepare('SELECT id, name, description FROM categories ORDER BY name').all<Category>()
    return result.results || []
  }

  /**
   * 根据 ID 查找分类
   * Find Category by ID
   * 
   * @param id - 分类 ID / Category ID
   * @returns 分类对象或 null / Category object or null
   */
  async findById(id: string): Promise<Category | null> {
    return this.db.prepare('SELECT id, name, description FROM categories WHERE id = ?').bind(id).first<Category>()
  }
}