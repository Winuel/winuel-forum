import { apiClient } from './client'

export interface UploadResponse {
  url: string
  filename: string
}

export const uploadApi = {
  async uploadImage(file: File): Promise<UploadResponse> {
    return apiClient.upload<UploadResponse>('/api/upload/image', file)
  },

  async uploadAvatar(file: File): Promise<UploadResponse> {
    return apiClient.upload<UploadResponse>('/api/upload/avatar', file)
  },
}