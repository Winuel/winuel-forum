import type { User } from '../db/models'
import type { GitHubUser } from './oauthService'
import { generateId, hashPassword, verifyPassword } from '../utils/crypto'
import { generateToken, Audience } from '../utils/jwt'
import { createError } from '../utils/errorHandler'

export interface CreateUserInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface OAuthLoginInput {
  provider: string
  providerId: string
  email: string
  username: string
  avatar?: string
  providerData?: any
}

export class UserService {
  constructor(private db: D1Database) {}

  async create(input: CreateUserInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // 检查邮箱是否已存在
    const existingUser = await this.findByEmail(input.email)
    if (existingUser) {
      throw new Error('邮箱已被注册')
    }

    const id = generateId()
    const password_hash = await hashPassword(input.password)

    await this.db
      .prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)')
      .bind(id, input.username, input.email, password_hash)
      .run()

    const user = await this.findById(id)
    if (!user) throw new Error('创建用户失败')

    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, Audience.USER)

    const { password_hash: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  async login(input: LoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const result = await this.db.prepare('SELECT id, username, email, password_hash, avatar, role FROM users WHERE email = ? AND deleted_at IS NULL').bind(input.email).first<User>()

    if (!result) {
      throw createError.unauthorized('邮箱或密码错误')
    }

    const isValid = await verifyPassword(input.password, result.password_hash)
    if (!isValid) {
      throw createError.unauthorized('邮箱或密码错误')
    }

    const token = await generateToken({
      userId: result.id,
      username: result.username,
      role: result.role,
    }, Audience.USER)

    const { password_hash: _, ...userWithoutPassword } = result
    return { user: userWithoutPassword, token }
  }

  /**
   * 管理员登录 - 使用 ADMIN 受众
   */
  async adminLogin(input: LoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const result = await this.db.prepare('SELECT id, username, email, password_hash, avatar, role FROM users WHERE email = ? AND deleted_at IS NULL').bind(input.email).first<User>()

    if (!result) {
      throw createError.unauthorized('邮箱或密码错误')
    }

    // 验证是否为管理员或审核员
    if (result.role !== 'admin' && result.role !== 'moderator') {
      throw createError.forbidden('无权访问管理员后台')
    }

    const isValid = await verifyPassword(input.password, result.password_hash)
    if (!isValid) {
      throw createError.unauthorized('邮箱或密码错误')
    }

    const token = await generateToken({
      userId: result.id,
      username: result.username,
      role: result.role,
    }, Audience.ADMIN)

    const { password_hash: _, ...userWithoutPassword } = result
    return { user: userWithoutPassword, token }
  }

  async findById(id: string): Promise<User | null> {
    return this.db.prepare('SELECT id, username, email, password_hash, avatar, role, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL').bind(id).first<User>()
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.db.prepare('SELECT id, username, email, password_hash, avatar, role, created_at, updated_at FROM users WHERE username = ? AND deleted_at IS NULL').bind(username).first<User>()
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.prepare('SELECT id, username, email, password_hash, avatar, role, created_at, updated_at FROM users WHERE email = ? AND deleted_at IS NULL').bind(email).first<User>()
  }

  async getPublicUser(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.findById(userId)
    if (!user) return null

    const { password_hash: _, ...publicUser } = user
    return publicUser
  }

  /**
   * 根据OAuth提供者和ID查找用户
   */
  async findByOAuth(provider: string, providerId: string): Promise<User | null> {
    return this.db.prepare(
      'SELECT id, username, email, password_hash, avatar, role, provider, provider_id, provider_data, created_at, updated_at FROM users WHERE provider = ? AND provider_id = ? AND deleted_at IS NULL'
    ).bind(provider, providerId).first<User>()
  }

  /**
   * 创建OAuth用户
   */
  async createOAuthUser(input: OAuthLoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // 检查OAuth用户是否已存在
    const existingUser = await this.findByOAuth(input.provider, input.providerId)
    if (existingUser) {
      throw new Error('OAuth用户已存在')
    }

    // 检查邮箱是否已被其他账号使用
    if (input.email) {
      const emailUser = await this.findByEmail(input.email)
      if (emailUser) {
        throw new Error('邮箱已被其他账号使用')
      }
    }

    const id = generateId()
    const providerData = input.providerData ? JSON.stringify(input.providerData) : null

    await this.db.prepare(
      'INSERT INTO users (id, username, email, password_hash, avatar, provider, provider_id, provider_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      input.username,
      input.email,
      '', // OAuth用户没有密码
      input.avatar,
      input.provider,
      input.providerId,
      providerData
    ).run()

    const user = await this.findById(id)
    if (!user) throw new Error('创建OAuth用户失败')

    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, Audience.USER)

    const { password_hash: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  /**
   * OAuth登录
   */
  async oauthLogin(input: OAuthLoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string; isNewUser: boolean }> {
    // 先尝试查找已存在的OAuth用户
    let user = await this.findByOAuth(input.provider, input.providerId)

    if (user) {
      // 用户已存在，更新用户信息
      const providerData = input.providerData ? JSON.stringify(input.providerData) : null
      await this.db.prepare(
        'UPDATE users SET username = ?, email = ?, avatar = ?, provider_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(
        input.username,
        input.email,
        input.avatar,
        providerData,
        user.id
      ).run()

      user = await this.findById(user.id)
      if (!user) throw new Error('用户更新失败')
    } else {
      // 用户不存在，创建新用户
      const result = await this.createOAuthUser(input)
      return { ...result, isNewUser: true }
    }

    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, Audience.USER)

    const { password_hash: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token, isNewUser: false }
  }
}