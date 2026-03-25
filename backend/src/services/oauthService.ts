import type { MarketplaceToken } from '@cloudlink/plugin-system'

/**市场认证信息*/
export interface MarketplaceAuth {
  provider: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
}

/**OAuth认证服务*/
export class OAuthService {
  constructor(
    private auth: MarketplaceAuth,
    private tokenStorage: OAuthTokenStorage
  ) {}

  /**获取授权URL*/
  async getAuthorizationUrl(redirectUri?: string): Promise<string> {
    const state = await this.generateState()
    const params = new URLSearchParams({
      client_id: this.auth.clientId,
      redirect_uri: redirectUri || this.auth.redirectUri,
      scope: this.auth.scope.join(' '),
      state: state,
      response_type: 'code',
      allow_signup: 'true'
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  /**交换授权码获取令牌*/
  async exchangeCodeForToken(code: string, state: string): Promise<MarketplaceToken> {
    // 验证state
    if (!this.validateState(state)) {
      throw new Error('Invalid state parameter')
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
      throw new Error(`OAuth token exchange failed: ${error}`)
    }

    const data = await response.json() as any
    
    if (data.error) {
      throw new Error(`OAuth error: ${data.error}`)
    }

    const token: MarketplaceToken = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_in: data.expires_in || 3600,
      token_type: data.token_type || 'bearer'
    }

    // 保存令牌
    await this.tokenStorage.saveToken(token)

    return token
  }

  /**刷新令牌*/
  async refreshToken(refreshToken: string): Promise<MarketplaceToken> {
    // GitHub OAuth不直接支持refresh_token，需要重新授权
    throw new Error('GitHub OAuth does not support token refresh. Please re-authenticate.')
  }

  /**获取用户信息*/
  async getUserInfo(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    return await response.json()
  }

  /**验证令牌有效性*/
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken)
      return true
    } catch {
      return false
    }
  }

  /**撤销令牌*/
  async revokeToken(accessToken: string): Promise<void> {
    // GitHub没有直接的撤销API，可以删除本地存储的令牌
    await this.tokenStorage.deleteToken()
  }

  /**获取存储的令牌*/
  async getStoredToken(): Promise<MarketplaceToken | null> {
    return await this.tokenStorage.getToken()
  }

  /**生成state参数*/
  private async generateState(): Promise<string> {
    const state = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15)

    // 存储state用于验证
    await this.tokenStorage.saveState(state)

    return state
  }

  /**验证state参数*/
  private async validateState(state: string): Promise<boolean> {
    const storedState = await this.tokenStorage.getState()
    await this.tokenStorage.clearState()
    return state === storedState
  }
}

/**GitHub用户信息*/
export interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
  bio: string
  location: string
  blog: string
  company: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

/**OAuth令牌存储接口*/
export interface OAuthTokenStorage {
  saveToken(token: MarketplaceToken): Promise<void>
  getToken(): Promise<MarketplaceToken | null>
  deleteToken(): Promise<void>
  saveState(state: string): Promise<void>
  getState(): Promise<string | null>
  clearState(): Promise<void>
}

/**内存令牌存储实现*/
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

/**KV存储令牌存储实现（Cloudflare Workers）*/
export class KVTokenStorage implements OAuthTokenStorage {
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
      expirationTtl: 600 // 10分钟过期
    })
  }

  async getState(): Promise<string | null> {
    return await this.kv.get(`${this.prefix}:state`)
  }

  async clearState(): Promise<void> {
    await this.kv.delete(`${this.prefix}:state`)
  }
}