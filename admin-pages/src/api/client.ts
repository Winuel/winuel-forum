/**
 * CloudLink 管理员后台 API 客户端
 * 使用共享 API 包
 */

import { getApiClient } from '@cloudlink/shared-api'
import type { ApiResponse } from '@cloudlink/shared-core'

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

// 文件上传方法
export async function upload<T>(endpoint: string, file: File): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)

  // 使用 axios 上传文件
  const axiosInstance = apiClient.getAxiosInstance()
  const response = await axiosInstance.post<ApiResponse<T>>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  if (!response.data.success) {
    throw new Error(response.data.error?.message || '上传失败')
  }

  return response.data.data as T
}

export { getApiClient, ApiClient } from '@cloudlink/shared-api'
export type { ApiError, ApiClientConfig } from '@cloudlink/shared-api'