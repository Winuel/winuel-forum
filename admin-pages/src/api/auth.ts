import { apiClient } from './client'
import type { User } from '../stores/user'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/login', data)
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/register', data)
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/auth/me')
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/api/auth/logout', {})
  },
}