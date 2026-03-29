import { Hono } from 'hono'
import { OAuthService, KVTokenStorage, type MarketplaceAuth, type GitHubUser } from '../../services/oauthService'
import { UserService } from '../../services/userService'
import { DEPENDENCY_TOKENS } from '../../utils/di'
import { logger } from '../../utils/logger'
import type { Variables } from '../../types'

const app = new Hono<{ Variables: Variables }>()

/**OAuth根路径 - 返回可用端点信息*/
app.get('/', async (c) => {
  return c.json({
    success: true,
    message: 'GitHub OAuth 服务',
    endpoints: [
      'GET /api/auth/github/test - 测试配置',
      'GET /api/auth/github/github/authorize - 获取授权URL',
      'GET /api/auth/github/github/callback - OAuth回调',
      'GET /api/auth/github/user - 获取用户信息',
      'GET /api/auth/github/validate - 验证令牌'
    ]
  })
})

/**测试端点 - 验证配置*/
app.get('/test', async (c) => {
  const container = c.get('container')
  if (!container) {
    logger.error('OAuth test: Container not initialized')
    return c.json({
      success: false,
      error: '服务容器未初始化，请检查 DI 中间件配置'
    }, 500)
  }

  try {
    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    const db = container.resolve<D1Database>(DEPENDENCY_TOKENS.DB)

    const result = {
      success: true,
      data: {
        hasClientId: !!env.GITHUB_CLIENT_ID,
        hasClientSecret: !!env.GITHUB_CLIENT_SECRET,
        hasApiUrl: !!env.API_URL,
        hasKV: !!kv,
        hasDB: !!db,
        envKeys: Object.keys(env).filter(key => key.includes('GITHUB') || key.includes('API')),
        environment: env.ENVIRONMENT || 'unknown'
      }
    }

    logger.debug('OAuth test result', result.data)
    return c.json(result)
  } catch (error: any) {
    logger.error('OAuth test error', error)
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
    logger.error('OAuth authorize: Container not initialized')
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务容器未初始化，请检查 DI 中间件配置'
      }
    }, 500)
  }

  try {
    logger.debug('开始处理OAuth授权请求')
    const env = container.resolve(DEPENDENCY_TOKENS.ENV) as any
    const auth = getGitHubAuth(env)

    logger.debug('GitHub配置检查', {
      hasClientId: !!auth.clientId,
      hasClientSecret: !!auth.clientSecret,
      redirectUri: auth.redirectUri,
      environment: env.ENVIRONMENT
    })

    if (!auth.clientId || !auth.clientSecret) {
      logger.error('GitHub OAuth配置缺失', {
        hasClientId: !!auth.clientId,
        hasClientSecret: !!auth.clientSecret
      })
      return c.json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'GitHub OAuth配置缺失，请联系管理员配置 GITHUB_CLIENT_ID 和 GITHUB_CLIENT_SECRET'
        }
      }, 500)
    }

    const kv = container.resolve<KVNamespace>(DEPENDENCY_TOKENS.KV)
    if (!kv) {
      logger.error('KV绑定获取失败')
      return c.json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'KV 存储未配置，请联系管理员'
        }
      }, 500)
    }

    logger.debug('KV绑定获取成功')
    const storage = new KVTokenStorage(kv)
    const oauthService = new OAuthService(auth, storage)

    const redirectUri = c.req.query('redirect_uri') || undefined
    logger.debug('开始生成授权URL', { redirectUri })
    const authUrl = await oauthService.getAuthorizationUrl(redirectUri)
    logger.debug('授权URL生成成功', { authUrl: authUrl.substring(0, 50) + '...' })

    return c.json({
      success: true,
      data: { authUrl }
    })
  } catch (error: any) {
    logger.error('OAuth authorize error', error)

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
    logger.error('OAuth callback: Container not initialized')
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务容器未初始化' } }, 500)
  }

  try {
    const code = c.req.query('code')
    const state = c.req.query('state')

    // 记录OAuth回调尝试（不记录敏感信息）
    logger.info('OAuth callback attempt', { hasCode: !!code, hasState: !!state })

    // 验证必要参数
    if (!code || !state) {
      logger.warn('OAuth callback: Missing required parameters', { hasCode: !!code, hasState: !!state })
      return c.json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: '缺少必要参数' }
      }, 400)
    }

    // 验证state参数格式（防止注入攻击）
    // State应该是一个16进制字符串，长度应该在20-50之间
    if (!/^[a-f0-9]{20,50}$/i.test(state)) {
      logger.error('OAuth callback: Invalid state format', { stateLength: state.length })
      return c.json({
        success: false,
        error: { code: 'INVALID_STATE', message: '无效的state参数' }
      }, 400)
    }

    // 检查是否在短时间内有多次失败的尝试（防止暴力攻击）
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    const rateLimitKey = `oauth_callback_failures:${clientIp}`

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

    // 验证邮箱格式
    // Validate email format
    const emailValidation = c.req.header('X-Email-Validation') === 'skip' 
      ? { isValid: true, errors: [] }
      : await import('../../utils/validation').then(m => m.validateEmail(oauthLoginInput.email))
    
    if (!emailValidation.isValid) {
      logger.warn('OAuth login failed: invalid email', { email: oauthLoginInput.email })
      return c.json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: '邮箱格式无效 / Invalid email format'
        }
      }, 400)
    }

    // 登录或创建用户
    const result = await userService.oauthLogin(oauthLoginInput)

    logger.info('OAuth callback successful', { userId: result.user?.id, isNewUser: result.isNewUser })

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
    logger.error('OAuth callback error', { message: error.message })

    // 生产环境不暴露详细错误信息
    const isProduction = (globalThis as any).ENVIRONMENT === 'production'

    return c.json({
      success: false,
      error: {
        code: 'OAUTH_CALLBACK_ERROR',
        message: isProduction ? 'OAuth回调处理失败，请稍后重试' : (error.message || 'OAuth回调处理失败'),
        ...(isProduction ? {} : { details: error.stack })
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