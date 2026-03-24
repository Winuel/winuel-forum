import type { Category } from '../db/models'
import { generateId } from '../utils/crypto'

export class CategoryService {
  constructor(private db: D1Database) {}

  async findAll(): Promise<Category[]> {
    const result = await this.db.prepare('SELECT id, name, description FROM categories ORDER BY name').all<Category>()
    return result.results || []
  }

  async findById(id: string): Promise<Category | null> {
    return this.db.prepare('SELECT id, name, description FROM categories WHERE id = ?').bind(id).first<Category>()
  }
}