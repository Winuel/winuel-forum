/**
 * 用户服务
 * User Service
 * 
 * 负责处理用户相关的业务逻辑，包括：
 * - 用户注册和登录
 * - OAuth 登录（GitHub 等）
 * - 用户信息的创建、查询和更新
 * - JWT 令牌生成和验证
 * 
 * Provides user-related business logic handling:
 * - User registration and login
 * - OAuth login (GitHub, etc.)
 * - User information creation, query, and update
 * - JWT token generation and verification
 * 
 * @package backend/src/services
 */

import type { User } from '../db/models'
import type { GitHubUser } from './oauthService'
import { generateId, hashPassword, verifyPassword } from '../utils/crypto'
import { generateToken, Audience } from '../utils/jwt'
import { createError } from '../utils/errorHandler'

/**
 * 创建用户输入接口
 * Create User Input Interface
 * 定义注册新用户所需的数据结构
 * Defines the data structure required for registering a new user
 */
export interface CreateUserInput {
  /** 用户名 / Username */
  username: string
  /** 邮箱地址 / Email address */
  email: string
  /** 密码 / Password */
  password: string
}

/**
 * 登录输入接口
 * Login Input Interface
 * 定义用户登录所需的数据结构
 * Defines the data structure required for user login
 */
export interface LoginInput {
  /** 邮箱地址 / Email address */
  email: string
  /** 密码 / Password */
  password: string
}

/**
 * OAuth 登录输入接口
 * OAuth Login Input Interface
 * 定义 OAuth 登录所需的数据结构
 * Defines the data structure required for OAuth login
 */
export interface OAuthLoginInput {
  /** OAuth 提供商名称（如 'github'） / OAuth provider name (e.g., 'github') */
  provider: string
  /** OAuth 提供商分配的用户ID / User ID assigned by OAuth provider */
  providerId: string
  /** 用户邮箱 / User email */
  email: string
  /** 用户名 / Username */
  username: string
  /** 用户头像 URL（可选）/ User avatar URL (optional) */
  avatar?: string
  /** OAuth 提供商的额外数据（可选）/ Additional data from OAuth provider (optional) */
  providerData?: any
}

/**
 * 用户服务类
 * User Service Class
 * 
 * 提供用户管理的所有业务逻辑
 * Provides all business logic for user management
 */
export class UserService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param db - D1 数据库实例 / D1 database instance
   */
  constructor(private db: D1Database) {}

  /**
   * 创建新用户
   * Create New User
   * 
   * 创建一个新用户并生成 JWT 令牌
   * Creates a new user and generates a JWT token
   * 
   * @param input - 用户注册信息 / User registration information
   * @returns 包含用户信息（不含密码哈希）和 JWT 令牌的对象 / Object containing user info (without password hash) and JWT token
   * @throws 如果邮箱已被注册 / Throws if email is already registered
   * @throws 如果创建用户失败 / Throws if user creation fails
   */
  async create(input: CreateUserInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // 检查邮箱是否已存在 / Check if email already exists
    const existingUser = await this.findByEmail(input.email)
    if (existingUser) {
      throw new Error('邮箱已被注册 / Email already registered')
    }

    // 生成用户 ID / Generate user ID
    const id = generateId()
    // 哈希用户密码 / Hash user password
    const password_hash = await hashPassword(input.password)

    // 插入用户数据到数据库 / Insert user data into database
    await this.db
      .prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)')
      .bind(id, input.username, input.email, password_hash)
      .run()

    // 获取刚创建的用户 / Get the newly created user
    const user = await this.findById(id)
    if (!user) throw new Error('创建用户失败 / Failed to create user')

    // 生成 JWT 令牌 / Generate JWT token
    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, Audience.USER)

    // 返回用户信息（不含密码哈希）和令牌 / Return user info (without password hash) and token
    const { password_hash: _, ...userWithoutPassword } = user
    return { userWithoutPassword, token }
  }

  /**
   * 用户登录
   * User Login
   * 
   * 验证用户凭据并生成 JWT 令牌
   * Validates user credentials and generates a JWT token
   * 
   * @param input - 登录信息 / Login information
   * @returns 包含用户信息（不含密码哈希）和 JWT 令牌的对象 / Object containing user info (without password hash) and JWT token
   * @throws 如果邮箱或密码错误 / Throws if email or password is incorrect
   */
  async login(input: LoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // 查询用户 / Query user
    const result = await this.db.prepare('SELECT id, username, email, password_hash, avatar, role FROM users WHERE email = ? AND deleted_at IS NULL').bind(input.email).first<User>()

    if (!result) {
      throw createError.unauthorized('邮箱或密码错误 / Invalid email or password')
    }

    // 验证密码 / Verify password
    const isValid = await verifyPassword(input.password, result.password_hash)
    if (!isValid) {
      throw createError.unauthorized('邮箱或密码错误 / Invalid email or password')
    }

    // 生成 JWT 令牌 / Generate JWT token
    const token = await generateToken({
      userId: result.id,
      username: result.username,
      role: result.role,
    }, Audience.USER)

    // 返回用户信息（不含密码哈希）和令牌 / Return user info (without password hash) and token
    const { password_hash: _, ...userWithoutPassword } = result
    return { userWithoutPassword, token }
  }

  /**
   * 管理员登录
   * Admin Login
   * 
   * 验证管理员凭据并生成 JWT 令牌（使用 ADMIN 受众）
   * Validates admin credentials and generates a JWT token (with ADMIN audience)
   * 
   * @param input - 登录信息 / Login information
   * @returns 包含用户信息（不含密码哈希）和 JWT 令牌的对象 / Object containing user info (without password hash) and JWT token
   * @throws 如果邮箱或密码错误 / Throws if email or password is incorrect
   * @throws 如果用户不是管理员或审核员 / Throws if user is not admin or moderator
   */
  async adminLogin(input: LoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // 查询用户 / Query user
    const result = await this.db.prepare('SELECT id, username, email, password_hash, avatar, role FROM users WHERE email = ? AND deleted_at IS NULL').bind(input.email).first<User>()

    if (!result) {
      throw createError.unauthorized('邮箱或密码错误 / Invalid email or password')
    }

    // 验证是否为管理员或审核员 / Verify if user is admin or moderator
    if (result.role !== 'admin' && result.role !== 'moderator') {
      throw createError.forbidden('无权访问管理员后台 / No permission to access admin panel')
    }

    // 验证密码 / Verify password
    const isValid = await verifyPassword(input.password, result.password_hash)
    if (!isValid) {
      throw createError.unauthorized('邮箱或密码错误 / Invalid email or password')
    }

    // 生成 JWT 令牌（使用 ADMIN 受众）/ Generate JWT token (with ADMIN audience)
    const token = await generateToken({
      userId: result.id,
      username: result.username,
      role: result.role,
    }, Audience.ADMIN)

    // 返回用户信息（不含密码哈希）和令牌 / Return user info (without password hash) and token
    const { password_hash: _, ...userWithoutPassword } = result
    return { userWithoutPassword, token }
  }

  /**
   * 根据 ID 查找用户
   * Find User by ID
   * 
   * 根据用户 ID 查询用户信息
   * Query user information by user ID
   * 
   * @param id - 用户 ID / User ID
   * @returns 用户对象或 null / User object or null
   */
  async findById(id: string): Promise<User | null> {
    return this.db.prepare('SELECT id, username, email, password_hash, avatar, role, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL').bind(id).first<User>()
  }

  /**
   * 根据用户名查找用户
   * Find User by Username
   * 
   * 根据用户名查询用户信息
   * Query user information by username
   * 
   * @param username - 用户名 / Username
   * @returns 用户对象或 null / User object or null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.db.prepare('SELECT id, username, email, password_hash, avatar, role, created_at, updated_at FROM users WHERE username = ? AND deleted_at IS NULL').bind(username).first<User>()
  }

  /**
   * 根据邮箱查找用户
   * Find User by Email
   * 
   * 根据邮箱地址查询用户信息
   * Query user information by email address
   * 
   * @param email - 邮箱地址 / Email address
   * @returns 用户对象或 null / User object or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.db.prepare('SELECT id, username, email, password_hash, avatar, role, created_at, updated_at FROM users WHERE email = ? AND deleted_at IS NULL').bind(email).first<User>()
  }

  /**
   * 获取公开用户信息
   * Get Public User Information
   * 
   * 获取用户信息（不包含密码哈希）
   * Get user information (excluding password hash)
   * 
   * @param userId - 用户 ID / User ID
   * @returns 公开用户信息或 null / Public user information or null
   */
  async getPublicUser(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.findById(userId)
    if (!user) return null

    // 移除密码哈希 / Remove password hash
    const { password_hash: _, ...publicUser } = user
    return publicUser
  }

  /**
   * 根据 OAuth 提供者和 ID 查找用户
   * Find User by OAuth Provider and ID
   * 
   * 查找通过 OAuth 登录的用户
   * Find users who logged in via OAuth
   * 
   * @param provider - OAuth 提供商名称 / OAuth provider name
   * @param providerId - OAuth 提供商分配的用户 ID / User ID assigned by OAuth provider
   * @returns 用户对象或 null / User object or null
   */
  async findByOAuth(provider: string, providerId: string): Promise<User | null> {
    return this.db.prepare(
      'SELECT id, username, email, password_hash, avatar, role, provider, provider_id, provider_data, created_at, updated_at FROM users WHERE provider = ? AND provider_id = ? AND deleted_at IS NULL'
    ).bind(provider, providerId).first<User>()
  }

  /**
   * 创建 OAuth 用户
   * Create OAuth User
   * 
   * 创建通过 OAuth 认证的新用户
   * Create a new user authenticated via OAuth
   * 
   * @param input - OAuth 登录信息 / OAuth login information
   * @returns 包含用户信息（不含密码哈希）和 JWT 令牌的对象 / Object containing user info (without password hash) and JWT token
   * @throws 如果 OAuth 用户已存在 / Throws if OAuth user already exists
   * @throws 如果邮箱已被其他账号使用 / Throws if email is already used by another account
   * @throws 如果创建用户失败 / Throws if user creation fails
   */
  async createOAuthUser(input: OAuthLoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // 检查 OAuth 用户是否已存在 / Check if OAuth user already exists
    const existingUser = await this.findByOAuth(input.provider, input.providerId)
    if (existingUser) {
      throw new Error('OAuth用户已存在 / OAuth user already exists')
    }

    // 检查邮箱是否已被其他账号使用 / Check if email is already used by another account
    if (input.email) {
      const emailUser = await this.findByEmail(input.email)
      if (emailUser) {
        throw new Error('邮箱已被其他账号使用 / Email already used by another account')
      }
    }

    // 生成用户 ID / Generate user ID
    const id = generateId()
    // 序列化 OAuth 提供商数据 / Serialize OAuth provider data
    const providerData = input.providerData ? JSON.stringify(input.providerData) : null

    // 插入 OAuth 用户数据 / Insert OAuth user data
    await this.db.prepare(
      'INSERT INTO users (id, username, email, password_hash, avatar, provider, provider_id, provider_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      input.username,
      input.email,
      '', // OAuth 用户没有密码 / OAuth users have no password
      input.avatar,
      input.provider,
      input.providerId,
      providerData
    ).run()

    // 获取刚创建的用户 / Get the newly created user
    const user = await this.findById(id)
    if (!user) throw new Error('创建OAuth用户失败 / Failed to create OAuth user')

    // 生成 JWT 令牌 / Generate JWT token
    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, Audience.USER)

    // 返回用户信息（不含密码哈希）和令牌 / Return user info (without password hash) and token
    const { password_hash: _, ...userWithoutPassword } = user
    return { userWithoutPassword, token }
  }

  /**
   * OAuth 登录
   * OAuth Login
   * 
   * 处理 OAuth 登录流程，支持用户首次登录时自动创建账户
   * Handles OAuth login flow, supports automatic account creation for first-time users
   * 
   * @param input - OAuth 登录信息 / OAuth login information
   * @returns 包含用户信息（不含密码哈希）、JWT 令牌和是否为新用户的对象 / Object containing user info (without password hash), JWT token, and whether it's a new user
   */
  async oauthLogin(input: OAuthLoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string; isNewUser: boolean }> {
    // 先尝试查找已存在的 OAuth 用户 / Try to find existing OAuth user first
    let user = await this.findByOAuth(input.provider, input.providerId)

    if (user) {
      // 用户已存在，更新用户信息 / User exists, update user information
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

      // 重新获取更新后的用户 / Retrieve updated user
      user = await this.findById(user.id)
      if (!user) throw new Error('用户更新失败 / Failed to update user')
    } else {
      // 用户不存在，创建新用户 / User doesn't exist, create new user
      const result = await this.createOAuthUser(input)
      return { ...result, isNewUser: true }
    }

    // 生成 JWT 令牌 / Generate JWT token
    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, Audience.USER)

    // 返回用户信息（不含密码哈希）、令牌和新用户标识 / Return user info (without password hash), token, and new user flag
    const { password_hash: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token, isNewUser: false }
  }
}