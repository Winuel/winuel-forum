/**
 * OAuth 认证服务
 * OAuth Authentication Service
 * 
 * 负责 OAuth 认证相关的业务逻辑，支持 GitHub OAuth 登录，包括：
 * - 获取授权 URL
 * - 交换授权码获取访问令牌
 * - 获取用户信息
 * - 令牌验证和撤销
 * - 支持多种存储后端（内存、KV）
 * 
 * Provides OAuth authentication-related business logic, supports GitHub OAuth login, including:
 * - Getting authorization URL
 * - Exchanging authorization code for access token
 * - Getting user information
 * - Token validation and revocation
 * - Supports multiple storage backends (memory, KV)
 * 
 * @package backend/src/services
 */

import type { MarketplaceToken } from '@winuel/plugin-system'

/**
 * OAuth 重定向 URI 白名单
 * OAuth Redirect URI Whitelist
 * 
 * 防止开放重定向攻击，只允许指定的域名作为 OAuth 回调地址
 * Prevents open redirect attacks, only allows specified domains as OAuth callback addresses
 */
const ALLOWED_REDIRECT_URIS: string[] = [
  'https://hub.winuel.com',
  'https://www.winuel.com',
  'https://admin.winuel.com',
  'https://api.winuel.com/api/auth/github/callback',
  'http://localhost:5173', // 开发环境
  'http://localhost:8787', // 开发环境 API
]

/**
 * 验证重定向 URI 是否在白名单中
 * Validate if redirect URI is in whitelist
 * 
 * @param redirectUri - 待验证的重定向 URI / Redirect URI to validate
 * @returns 是否在白名单中 / Whether in whitelist
 */
function isRedirectUriAllowed(redirectUri: string): boolean {
  return ALLOWED_REDIRECT_URIS.some(allowedUri => {
    // 精确匹配或前缀匹配
    return redirectUri === allowedUri || redirectUri.startsWith(allowedUri)
  })
}

/**
 * 市场认证信息接口
 * Marketplace Authentication Interface
 * 定义 OAuth 认证所需的配置信息
 * Defines the configuration required for OAuth authentication
 */
export interface MarketplaceAuth {
  /** OAuth 提供商名称 / OAuth provider name */
  provider: string
  /** 客户端 ID / Client ID */
  clientId: string
  /** 客户端密钥 / Client secret */
  clientSecret: string
  /** 重定向 URI / Redirect URI */
  redirectUri: string
  /** 权限范围列表 / Scope list */
  scope: string[]
}

/**
 * OAuth 认证服务类
 * OAuth Authentication Service Class
 * 
 * 提供 OAuth 认证流程的所有业务逻辑
 * Provides all business logic for OAuth authentication flow
 */
export class OAuthService {
  /**
   * 构造函数
   * Constructor
   * 
   * @param auth - OAuth 认证配置 / OAuth authentication configuration
   * @param tokenStorage - 令牌存储实例 / Token storage instance
   */
  constructor(
    private auth: MarketplaceAuth,
    private tokenStorage: OAuthTokenStorage
  ) {}

  /**
   * 获取授权 URL
   * Get Authorization URL
   * 
   * 生成 GitHub OAuth 授权 URL，包含所有必需的参数
   * Generates GitHub OAuth authorization URL with all required parameters
   * 
   * @param redirectUri - 自定义重定向 URI（可选）/ Custom redirect URI (optional)
   * @returns 授权 URL / Authorization URL
   * @throws 如果重定向 URI 不在白名单中 / Throws if redirect URI is not in whitelist
   */
  async getAuthorizationUrl(redirectUri?: string): Promise<string> {
    // 验证重定向 URI 是否在白名单中
    // Validate if redirect URI is in whitelist
    const finalRedirectUri = redirectUri || this.auth.redirectUri
    
    if (!isRedirectUriAllowed(finalRedirectUri)) {
      throw new Error(
        `Invalid redirect URI: ${finalRedirectUri}. ` +
        `Allowed URIs: ${ALLOWED_REDIRECT_URIS.join(', ')}`
      )
    }

    // 生成随机 state 参数用于防止 CSRF 攻击 / Generate random state parameter to prevent CSRF attacks
    const state = await this.generateState()
    const params = new URLSearchParams({
      client_id: this.auth.clientId,
      redirect_uri: finalRedirectUri,
      scope: this.auth.scope.join(' '),
      state: state,
      response_type: 'code',
      allow_signup: 'true'
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  /**
   * 交换授权码获取令牌
   * Exchange Authorization Code for Token
   * 
   * 使用授权码向 GitHub 请求访问令牌
   * Requests access token from GitHub using authorization code
   * 
   * @param code - 授权码 / Authorization code
   * @param state - 状态参数 / State parameter
   * @returns 访问令牌 / Access token
   * @throws 如果 state 参数无效 / Throws if state parameter is invalid
   * @throws 如果令牌交换失败 / Throws if token exchange fails
   */
  async exchangeCodeForToken(code: string, state: string): Promise<MarketplaceToken> {
    // 验证 state / Validate state
    if (!this.validateState(state)) {
      throw new Error('Invalid state parameter / 无效的 state 参数')
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.auth.clientId,
        client_secret: this.auth.clientSecret,
        code: code,
        redirect_uri: this.auth.redirectUri
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OAuth token exchange failed: ${error} / OAuth 令牌交换失败：${error}`)
    }

    const data = await response.json() as any
    
    if (data.error) {
      throw new Error(`OAuth error: ${data.error} / OAuth 错误：${data.error}`)
    }

    const token: MarketplaceToken = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_in: data.expires_in || 3600,
      token_type: data.token_type || 'bearer'
    }

    // 保存令牌 / Save token
    await this.tokenStorage.saveToken(token)

    return token
  }

  /**
   * 刷新令牌
   * Refresh Token
   * 
   * 使用刷新令牌获取新的访问令牌
   * Uses refresh token to get a new access token
   * 
   * @param refreshToken - 刷新令牌 / Refresh token
   * @returns 新的访问令牌 / New access token
   * @throws GitHub OAuth 不直接支持令牌刷新 / Throws error as GitHub OAuth doesn't support token refresh directly
   */
  async refreshToken(refreshToken: string): Promise<MarketplaceToken> {
    // GitHub OAuth 不直接支持 refresh_token，需要重新授权 / GitHub OAuth doesn't directly support refresh_token, need to re-authenticate
    throw new Error('GitHub OAuth does not support token refresh. Please re-authenticate. / GitHub OAuth 不支持令牌刷新。请重新认证。')
  }

  /**
   * 获取用户信息
   * Get User Information
   * 
   * 使用访问令牌从 GitHub API 获取用户信息
   * Gets user information from GitHub API using access token
   * 
   * @param accessToken - 访问令牌 / Access token
   * @returns GitHub 用户信息 / GitHub user information
   * @throws 如果获取用户信息失败 / Throws if getting user information fails
   */
  async getUserInfo(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info / 获取用户信息失败')
    }

    return await response.json()
  }

  /**
   * 验证令牌有效性
   * Validate Token
   * 
   * 验证访问令牌是否仍然有效
   * Validates if the access token is still valid
   * 
   * @param accessToken - 访问令牌 / Access token
   * @returns 令牌是否有效 / Whether the token is valid
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken)
      return true
    } catch {
      return false
    }
  }

  /**
   * 撤销令牌
   * Revoke Token
   * 
   * 撤销访问令牌（GitHub 没有直接的撤销 API，只删除本地存储）
   * Revokes access token (GitHub doesn't have direct revoke API, only deletes local storage)
   * 
   * @param accessToken - 访问令牌 / Access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    // GitHub 没有直接的撤销 API，可以删除本地存储的令牌 / GitHub doesn't have direct revoke API, can delete locally stored token
    await this.tokenStorage.deleteToken()
  }

  /**
   * 获取存储的令牌
   * Get Stored Token
   * 
   * 从存储中获取访问令牌
   * Gets access token from storage
   * 
   * @returns 访问令牌或 null / Access token or null
   */
  async getStoredToken(): Promise<MarketplaceToken | null> {
    return await this.tokenStorage.getToken()
  }

  /**
   * 生成 state 参数（私有方法）
   * Generate State Parameter (Private Method)
   * 
   * 生成随机字符串用于防止 CSRF 攻击
   * Generates random string to prevent CSRF attacks
   * 
   * @returns state 参数 / State parameter
   */
  private async generateState(): Promise<string> {
    const state = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15)

    // 存储state用于验证 / Store state for validation
    await this.tokenStorage.saveState(state)

    return state
  }

  /**
   * 验证 state 参数（私有方法）
   * Validate State Parameter (Private Method)
   * 
   * 验证回调中的 state 参数是否与存储的一致
   * Validates if the state parameter in the callback matches the stored one
   * 
   * @param state - 回调中的 state 参数 / State parameter in callback
   * @returns 验证是否成功 / Whether validation succeeded
   */
  private async validateState(state: string): Promise<boolean> {
    const storedState = await this.tokenStorage.getState()
    await this.tokenStorage.clearState()
    return state === storedState
  }
}

/**
 * GitHub 用户信息接口
 * GitHub User Information Interface
 * 定义从 GitHub API 获取的用户信息结构
 * Defines the structure of user information retrieved from GitHub API
 */
export interface GitHubUser {
  /** GitHub 用户 ID / GitHub user ID */
  id: number
  /** GitHub 用户名 / GitHub username */
  login: string
  /** 用户显示名称 / User display name */
  name: string
  /** 用户邮箱 / User email */
  email: string
  /** 头像 URL / Avatar URL */
  avatar_url: string
  /** 用户简介 / User bio */
  bio: string
  /** 用户位置 / User location */
  location: string
  /** 用户博客 / User blog */
  blog: string
  /** 用户公司 / User company */
  company: string
  /** 公开仓库数 / Number of public repositories */
  public_repos: number
  /** 关注者数 / Number of followers */
  followers: number
  /** 关注数 / Number of following */
  following: number
  /** 账户创建时间 / Account creation time */
  created_at: string
  /** 账户更新时间 / Account update time */
  updated_at: string
}

/**
 * OAuth 令牌存储接口
 * OAuth Token Storage Interface
 * 定义 OAuth 令牌存储的抽象接口
 * Defines the abstract interface for OAuth token storage
 */
export interface OAuthTokenStorage {
  /**
   * 保存令牌
   * Save Token
   * 
   * @param token - 要保存的令牌 / Token to save
   */
  saveToken(token: MarketplaceToken): Promise<void>
  
  /**
   * 获取令牌
   * Get Token
   * 
   * @returns 存储的令牌或 null / Stored token or null
   */
  getToken(): Promise<MarketplaceToken | null>
  
  /**
   * 删除令牌
   * Delete Token
   */
  deleteToken(): Promise<void>
  
  /**
   * 保存 state 参数
   * Save State Parameter
   * 
   * @param state - state 参数 / State parameter
   */
  saveState(state: string): Promise<void>
  
  /**
   * 获取 state 参数
   * Get State Parameter
   * 
   * @returns 存储的 state 或 null / Stored state or null
   */
  getState(): Promise<string | null>
  
  /**
   * 清除 state 参数
   * Clear State Parameter
   */
  clearState(): Promise<void>
}

/**
 * 内存令牌存储实现
 * Memory Token Storage Implementation
 * 
 * 使用内存存储 OAuth 令牌和 state（仅用于测试或单次请求）
 * Uses memory to store OAuth tokens and state (only for testing or single request)
 */
export class MemoryTokenStorage implements OAuthTokenStorage {
  private token: MarketplaceToken | null = null
  private state: string | null = null

  async saveToken(token: MarketplaceToken): Promise<void> {
    this.token = token
  }

  async getToken(): Promise<MarketplaceToken | null> {
    return this.token
  }

  async deleteToken(): Promise<void> {
    this.token = null
  }

  async saveState(state: string): Promise<void> {
    this.state = state
  }

  async getState(): Promise<string | null> {
    return this.state
  }

  async clearState(): Promise<void> {
    this.state = null
  }
}

/**
 * KV 存储令牌存储实现（Cloudflare Workers）
 * KV Storage Token Storage Implementation (Cloudflare Workers)
 * 
 * 使用 Cloudflare KV 存储 OAuth 令牌和 state，支持过期时间
 * Uses Cloudflare KV to store OAuth tokens and state, supports expiration time
 */
export class KVTokenStorage implements OAuthTokenStorage {
  /**
   * 构造函数
   * Constructor
   * 
   * @param kv - KV 命名空间实例 / KV namespace instance
   * @param prefix - 存储键前缀（默认为 'oauth'）/ Storage key prefix (default is 'oauth')
   */
  constructor(private kv: KVNamespace, private prefix: string = 'oauth') {}

  async saveToken(token: MarketplaceToken): Promise<void> {
    await this.kv.put(`${this.prefix}:token`, JSON.stringify(token), {
      expirationTtl: token.expires_in
    })
  }

  async getToken(): Promise<MarketplaceToken | null> {
    const data = await this.kv.get(`${this.prefix}:token`)
    if (!data) return null
    
    try {
      return JSON.parse(data) as MarketplaceToken
    } catch {
      return null
    }
  }

  async deleteToken(): Promise<void> {
    await this.kv.delete(`${this.prefix}:token`)
  }

  async saveState(state: string): Promise<void> {
    await this.kv.put(`${this.prefix}:state`, state, {
      expirationTtl: 600 // 10分钟过期 / 10 minutes expiration
    })
  }

  async getState(): Promise<string | null> {
    return await this.kv.get(`${this.prefix}:state`)
  }

  async clearState(): Promise<void> {
    await this.kv.delete(`${this.prefix}:state`)
  }
}