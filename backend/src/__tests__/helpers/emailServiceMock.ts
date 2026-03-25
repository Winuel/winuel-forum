/**
 * Mock Email Service for tests
 */
export const mockEmailService = {
  isAvailable: () => false, // 在测试环境中不可用，跳过验证码验证
  sendVerificationCode: async () => { return { success: true, messageId: 'test-id' } },
  verifyCode: async () => { return true }
}

/**
 * Setup mock email service
 */
export function setupMockEmailService() {
  ;(globalThis as any).emailService = mockEmailService
}
