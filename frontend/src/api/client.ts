/**
 * Winuel 前端 API 客户端
 * 使用共享 API 包
 */

import { getApiClient } from '@winuel/shared-api'

export const apiClient = getApiClient()

export async function get<T>(url: string): Promise<T> {
  return apiClient.get<T>(url)
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  return apiClient.post<T>(url, data)
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  return apiClient.put<T>(url, data)
}

export async function del<T>(url: string): Promise<T> {
  return apiClient.delete<T>(url)
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  return apiClient.patch<T>(url, data)
}

export { getApiClient, ApiClient } from '@winuel/shared-api'
  export type { ApiError, ApiClientConfig } from '@winuel/shared-api'