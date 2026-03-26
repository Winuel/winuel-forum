import { Hono } from 'hono'
import { OAuthService, KVTokenStorage, type MarketplaceAuth, type GitHubUser } from '../../services/oauthService'
import { UserService } from '../../services/userService'
import { DEPENDENCY_TOKENS } from '../../utils/di'
import type { Variables } from '../../types'

const app = new Hono<{ Variables: Variables }>()

/**测试端点 - 验证配置*/
app.get('/test', async (c) => {
  const container = c.get('container')
  if (!container) {
    return c.json({ success: false, error: '容器未初始化' }, 500)
  }

  try {
    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    const db = container.resolve<D1Database>(DEPENDENCY_TOKENS.DB)

    return c.json({
      success: true,
      data: {
        hasClientId: !!env.GITHUB_CLIENT_ID,
        hasClientSecret: !!env.GITHUB_CLIENT_SECRET,
        hasApiUrl: !!env.API_URL,
        hasKV: !!kv,
        hasDB: !!db,
        envKeys: Object.keys(env).filter(key => key.includes('GITHUB') || key.includes('API'))
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || '测试失败'
    }, 500)
  }
})

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
    console.log('开始处理OAuth授权请求')
    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const auth = getGitHubAuth(env)

    console.log('GitHub配置:', {
      hasClientId: !!auth.clientId,
      hasClientSecret: !!auth.clientSecret,
      redirectUri: auth.redirectUri
    })

    if (!auth.clientId || !auth.clientSecret) {
      return c.json({
        success: false,
        error: { code: 'CONFIG_ERROR', message: 'GitHub OAuth配置缺失' }
      }, 500)
    }

    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    console.log('KV绑定获取成功')
    const storage = new KVTokenStorage(kv)
    const oauthService = new OAuthService(auth, storage)

    const redirectUri = c.req.query('redirect_uri') || undefined
    console.log('开始生成授权URL, redirectUri:', redirectUri)
    const authUrl = await oauthService.getAuthorizationUrl(redirectUri)
    console.log('授权URL生成成功:', authUrl.substring(0, 50) + '...')

    return c.json({
      success: true,
      data: { authUrl }
    })
  } catch (error: any) {
    console.error('OAuth authorize error:', error)
    console.error('Error stack:', error.stack)
    
    // 生产环境不暴露详细错误信息
    const isProduction = (globalThis as any).ENVIRONMENT === 'production'
    
    return c.json({
      success: false,
      error: {
        code: 'OAUTH_ERROR',
        message: isProduction ? '获取授权URL失败，请稍后重试' : (error.message || '获取授权URL失败'),
        ...(isProduction ? {} : { details: error.stack })
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

    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const auth = getGitHubAuth(env)
    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    const storage = new KVTokenStorage(kv)
    const oauthService = new OAuthService(auth, storage)
    const db = container.resolve<D1Database>(DEPENDENCY_TOKENS.DB)
    const userService = new UserService(db)

    // 交换授权码获取令牌
    const token = await oauthService.exchangeCodeForToken(code, state)

    // 获取GitHub用户信息
    const githubUser = await oauthService.getUserInfo(token.access_token)

    // 准备用户数据
    const oauthLoginInput = {
      provider: 'github',
      providerId: githubUser.id.toString(),
      email: githubUser.email || `${githubUser.login}@github.local`,
      username: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
      providerData: {
        github_id: githubUser.id,
        login: githubUser.login,
        bio: githubUser.bio,
        location: githubUser.location,
        blog: githubUser.blog,
        company: githubUser.company,
        public_repos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following
      }
    }

    // 登录或创建用户
    const result = await userService.oauthLogin(oauthLoginInput)

    return c.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
        isNewUser: result.isNewUser,
        githubUser: {
          id: githubUser.id,
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url
        }
      }
    })
  } catch (error: any) {
    console.error('OAuth callback error:', error)
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
    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const auth = getGitHubAuth(env)
    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    const storage = new KVTokenStorage(kv)
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
    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const auth = getGitHubAuth(env)
    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    const storage = new KVTokenStorage(kv)
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
    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const auth = getGitHubAuth(env)
    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    const storage = new KVTokenStorage(kv)
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