/**
 * CloudLink 共享 API 客户端
 * 提供统一的 API 调用接口
 */

import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import type { ApiResponse, ErrorCode } from '@cloudlink/shared-core'

// ============================================================================
// 配置接口
// ============================================================================

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig
  onRequestError?: (error: AxiosError) => void
  onResponse?: (response: AxiosResponse) => AxiosResponse
  onResponseError?: (error: AxiosError) => void
}

// ============================================================================
// 错误类
// ============================================================================

export class ApiError extends Error {
  public code: ErrorCode
  public statusCode: number
  public details?: string
  public timestamp: string

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: string,
    timestamp: string = new Date().toISOString()
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = timestamp
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const response = error.response?.data as ApiResponse

    if (response?.error) {
      return new ApiError(
        response.error.code as ErrorCode,
        response.error.message,
        error.response?.status || 500,
        response.error.details,
        response.timestamp
      )
    }

    if (error.code === 'ECONNABORTED') {
      return new ApiError('INTERNAL_ERROR', '请求超时，请重试', 408)
    }

    if (error.response) {
      return new ApiError('INTERNAL_ERROR', '服务器错误', error.response.status)
    }

    if (error.request) {
      return new ApiError('INTERNAL_ERROR', '网络错误，请检查网络连接', 0)
    }

    return new ApiError('INTERNAL_ERROR', '未知错误', 500)
  }
}

// ============================================================================
// API 客户端类
// ============================================================================

export class ApiClient {
  private axiosInstance: AxiosInstance
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    }

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      withCredentials: this.config.withCredentials,
      // @ts-ignore - Axios headers type issue
      headers: this.config.headers,
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }

        // 添加 CSRF token
        const csrfToken = localStorage.getItem('csrf_token')
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken
        }

        // 调用自定义请求处理
        if (this.config.onRequest) {
          config = this.config.onRequest(config)
        }

        return config
      },
      (error) => {
        if (this.config.onRequestError) {
          this.config.onRequestError(error)
        }
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // 保存 CSRF token
        const csrfToken = response.headers['x-csrf-token']
        if (csrfToken) {
          localStorage.setItem('csrf_token', csrfToken as string)
        }

        // 调用自定义响应处理
        if (this.config.onResponse) {
          response = this.config.onResponse(response)
        }

        return response
      },
      (error: AxiosError) => {
        const apiError = ApiError.fromAxiosError(error)

        // 处理 401 未授权错误
        if (apiError.code === 'UNAUTHORIZED' || apiError.code === 'INVALID_TOKEN' || apiError.code === 'TOKEN_EXPIRED') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('csrf_token')
          // 可以在这里触发重新登录逻辑
        }

        if (this.config.onResponseError) {
          this.config.onResponseError(apiError as unknown as AxiosError)
        }

        return Promise.reject(apiError)
      }
    )
  }

  // ============================================================================
  // HTTP 方法
  // ============================================================================

  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config)
    return this.handleResponse(response)
  }

  public async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config)
    return this.handleResponse(response)
  }

  public async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config)
    return this.handleResponse(response)
  }

  public async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config)
    return this.handleResponse(response)
  }

  public async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config)
    return this.handleResponse(response)
  }

  public async upload<T = unknown>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    }

    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, uploadConfig)
    return this.handleResponse(response)
  }

  // ============================================================================
  // 响应处理
  // ============================================================================

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    const { data } = response

    if (!data.success) {
      throw new ApiError(
        data.error?.code as ErrorCode,
        data.error?.message || '请求失败',
        response.status,
        data.error?.details,
        data.timestamp
      )
    }

    return data.data as T
  }

  // ============================================================================
  // Token 管理
  // ============================================================================

  public setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  public clearToken(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('csrf_token')
  }

  // ============================================================================
  // 实例方法
  // ============================================================================

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }

  public updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config }
    this.axiosInstance.defaults.baseURL = config.baseURL || this.config.baseURL
    this.axiosInstance.defaults.timeout = config.timeout || this.config.timeout
    if (config.headers) {
      Object.assign(this.axiosInstance.defaults.headers, config.headers)
    }
  }
}

// ============================================================================
// 默认客户端实例
// ============================================================================

let defaultClient: ApiClient | null = null

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}

export function getApiClient(): ApiClient {
  if (!defaultClient) {
    const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
                      'http://localhost:8787'
    defaultClient = new ApiClient({ baseURL })
  }
  return defaultClient
}

export function setDefaultClient(client: ApiClient): void {
  defaultClient = client
}

// ============================================================================
// 导出
// ============================================================================

export { ApiClient as default }