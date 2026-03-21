const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

class ApiClient {
  private baseURL: string
  private csrfToken: string | null = null
  private sessionId: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getHeaders(includeCsrf: boolean = false): HeadersInit {
    const token = localStorage.getItem('auth_token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (includeCsrf && this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken
    }

    if (this.sessionId) {
      headers['X-Session-ID'] = this.sessionId
    }

    return headers
  }

  private extractCsrfInfo(response: Response): void {
    if (!response || !response.headers) {
      return
    }
    
    const csrfToken = response.headers.get('X-CSRF-Token')
    const sessionId = response.headers.get('X-Session-ID')

    if (csrfToken) {
      this.csrfToken = csrfToken
    }

    if (sessionId) {
      this.sessionId = sessionId
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    // 提取 CSRF 信息
    this.extractCsrfInfo(response)

    return response.json()
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const requestData = typeof data === 'object' && data !== null 
      ? { ...data, csrfToken: this.csrfToken }
      : { csrfToken: this.csrfToken, data }
      
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(requestData),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    // 提取 CSRF 信息
    this.extractCsrfInfo(response)

    return response.json()
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const requestData = typeof data === 'object' && data !== null 
      ? { ...data, csrfToken: this.csrfToken }
      : { csrfToken: this.csrfToken, data }
      
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(requestData),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    // 提取 CSRF 信息
    this.extractCsrfInfo(response)

    return response.json()
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    let body: string | undefined
    if (data !== undefined) {
      const requestData = typeof data === 'object' && data !== null 
        ? { ...data, csrfToken: this.csrfToken }
        : { csrfToken: this.csrfToken, data }
      body = JSON.stringify(requestData)
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body,
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    // 提取 CSRF 信息
    this.extractCsrfInfo(response)

    return response.json()
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    // 提取 CSRF 信息
    this.extractCsrfInfo(response)

    return response.json()
  }

  async upload<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const headers: HeadersInit = {}
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (this.sessionId) {
      headers['X-Session-ID'] = this.sessionId
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    // 提取 CSRF 信息
    this.extractCsrfInfo(response)

    return response.json()
  }
}

export const apiClient = new ApiClient(API_BASE_URL)