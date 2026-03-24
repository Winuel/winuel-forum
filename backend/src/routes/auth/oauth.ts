import { Hono } from 'hono'
import { OAuthService, KVTokenStorage, type MarketplaceAuth } from '../../services/oauthService'
import type { Variables } from '../../types'

const app = new Hono<{ Variables: Variables }>()

/**GitHub OAuth配置（从环境变量获取）*/
function getGitHubAuth(env: any): MarketplaceAuth {
  return {
    provider: 'github',
    clientId: env.GITHUB_CLIENT_ID || '',
    clientSecret: env.GITHUB_CLIENT_SECRET || '',
    redirectUri: env.GITHUB_REDIRECT_URI || `${env.API_URL}/api/auth/github/callback`,
    scope: ['read:user', 'user:email', 'repo']
  }
}

/**获取授权URL*/
app.get('/github/authorize', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  try {
    const env = container.resolve('ENV') as any
    const auth = getGitHubAuth(env)
    
    if (!auth.clientId || !auth.clientSecret) {
      return c.json({ 
        success: false, 
        error: { code: 'CONFIG_ERROR', message: 'GitHub OAuth配置缺失' } 
      }, 500)
    }

    const storage = new KVTokenStorage(env.KV)
    const oauthService = new OAuthService(auth, storage)
    
    const redirectUri = c.req.query('redirect_uri') || undefined
    const authUrl = oauthService.getAuthorizationUrl(redirectUri)

    return c.json({
      success: true,
      data: { authUrl }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'OAUTH_ERROR',
        message: error.message || '获取授权URL失败'
      }
    }, 500)
  }
})

/**OAuth回调处理*/
app.get('/github/callback', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  try {
    const code = c.req.query('code')
    const state = c.req.query('state')

    if (!code || !state) {
      return c.json({ 
        success: false, 
        error: { code: 'INVALID_REQUEST', message: '缺少必要参数' } 
      }, 400)
    }

    const env = container.resolve('ENV') as any
    const auth = getGitHubAuth(env)
    const storage = new KVTokenStorage(env.KV)
    const oauthService = new OAuthService(auth, storage)

    // 交换授权码获取令牌
    const token = await oauthService.exchangeCodeForToken(code, state)

    // 获取用户信息
    const userInfo = await oauthService.getUserInfo(token.access_token)

    return c.json({
      success: true,
      data: {
        token: {
          access_token: token.access_token,
          expires_in: token.expires_in,
          token_type: token.token_type
        },
        user: {
          id: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url
        }
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: error.message || 'OAuth回调处理失败'
      }
    }, 500)
  }
})

/**获取当前用户信息*/
app.get('/user', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  try {
    const env = container.resolve('ENV') as any
    const auth = getGitHubAuth(env)
    const storage = new KVTokenStorage(env.KV)
    const oauthService = new OAuthService(auth, storage)

    const token = await oauthService.getStoredToken()
    if (!token) {
      return c.json({ 
        success: false, 
        error: { code: 'NO_TOKEN', message: '未找到访问令牌' } 
      }, 401)
    }

    const userInfo = await oauthService.getUserInfo(token.access_token)

    return c.json({
      success: true,
      data: {
        id: userInfo.id,
        login: userInfo.login,
        name: userInfo.name,
        email: userInfo.email,
        avatar_url: userInfo.avatar_url,
        bio: userInfo.bio,
        location: userInfo.location,
        blog: userInfo.blog,
        company: userInfo.company,
        public_repos: userInfo.public_repos,
        followers: userInfo.followers,
        following: userInfo.following
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: error.message || '获取用户信息失败'
      }
    }, 500)
  }
})

/**验证令牌*/
app.get('/validate', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  try {
    const env = container.resolve('ENV') as any
    const auth = getGitHubAuth(env)
    const storage = new KVTokenStorage(env.KV)
    const oauthService = new OAuthService(auth, storage)

    const token = await oauthService.getStoredToken()
    if (!token) {
      return c.json({ 
        success: false, 
        error: { code: 'NO_TOKEN', message: '未找到访问令牌' } 
      }, 401)
    }

    const isValid = await oauthService.validateToken(token.access_token)

    return c.json({
      success: true,
      data: { valid: isValid }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATE_ERROR',
        message: error.message || '验证令牌失败'
      }
    }, 500)
  }
})

/**撤销令牌（登出）*/
app.post('/logout', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  try {
    const env = container.resolve('ENV') as any
    const auth = getGitHubAuth(env)
    const storage = new KVTokenStorage(env.KV)
    const oauthService = new OAuthService(auth, storage)

    const token = await oauthService.getStoredToken()
    if (token) {
      await oauthService.revokeToken(token.access_token)
    }

    return c.json({
      success: true,
      message: '成功登出'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: error.message || '登出失败'
      }
    }, 500)
  }
})

export default app