import { generateToken, Audience } from '../../utils/jwt'

/**
 * 创建认证头
 */
export async function createAuthHeader(
  userId: string,
  username: string = 'testuser',
  role: string = 'user'
) {
  const token = await generateToken({ userId, username, role }, Audience.USER)
  return {
    'Authorization': `Bearer ${token}`,
  }
}

/**
 * 创建 CSRF 令牌存储
 */
export class CSRFTokenStore {
  private store = new Map<string, string>()

  get(key: string): string | null {
    return this.store.get(key) || null
  }

  put(key: string, value: string): void {
    this.store.set(key, value)
  }

  clear(): void {
    this.store.clear()
  }
}

/**
 * 全局 CSRF 存储
 */
export const csrfStore = new CSRFTokenStore()

/**
 * 创建 CSRF 头
 */
export function createCSRFHeaders(sessionId: string = 'test-session-id') {
  const token = 'test-csrf-token-' + Math.random().toString(36).substring(7)
  csrfStore.put(`csrf:${sessionId}`, token)
  return {
    'x-session-id': sessionId,
    'x-csrf-token': token,
  }
}

/**
 * 合并请求头
 */
export function mergeHeaders(...headers: Record<string, string>[]): Record<string, string> {
  return Object.assign({}, ...headers)
}