/**
 * 验证码相关 API
 */

import { post } from './client'

export interface SendVerificationCodeRequest {
  email: string
  type?: 'register' | 'reset_password' | 'change_email' | 'verify_email'
}

export interface SendVerificationCodeResponse {
  success: boolean
  message?: string
  error?: {
    code: string
    message: string
    details?: string
  }
}

export interface VerifyCodeRequest {
  email: string
  code: string
  type?: 'register' | 'reset_password' | 'change_email' | 'verify_email'
}

export interface VerifyCodeResponse {
  success: boolean
  error?: {
    code: string
    message: string
  }
}

/**
 * 发送验证码
 */
export async function sendVerificationCode(data: SendVerificationCodeRequest): Promise<SendVerificationCodeResponse> {
  return post<SendVerificationCodeResponse>('/api/auth/send-verification-code', data)
}

/**
 * 验证验证码
 */
export async function verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
  return post<VerifyCodeResponse>('/api/auth/verify-code', data)
}