/**
 * 邮件服务
 * 使用 Resend API 发送邮件
 */

import { Resend } from 'resend'
import { generateVerificationEmailTemplate, generateNotificationEmailTemplate } from '../templates/emailTemplates'

/**
 * 邮件服务类
 */
export class EmailService {
  private resend: Resend | null = null
  private fromEmail: string = 'noreply@mail.winuel.com'
  private fromName: string = '云纽论坛'

  constructor(apiKey: string, fromEmail: string, fromName: string = '云纽论坛') {
    if (!apiKey) {
      console.warn('Resend API key not provided. Email service will not be available.')
      return
    }
    this.resend = new Resend(apiKey)
    this.fromEmail = fromEmail
    this.fromName = fromName
  }

  /**
   * 检查邮件服务是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean {
    return this.resend !== null
  }

  /**
   * 发送验证码邮件
   * @param to 收件人邮箱
   * @param code 验证码
   * @param appName 应用名称
   * @returns 发送结果
   */
  async sendVerificationCode(to: string, code: string, appName: string = '云纽论坛'): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: '邮件服务不可用'
      }
    }

    try {
      const html = generateVerificationEmailTemplate(code, appName)
      const from = `${this.fromName} <${this.fromEmail}>`

      const result = await this.resend!.emails.send({
        from,
        to,
        subject: '邮箱验证码',
        html
      })

      // 处理 Resend API 响应
      if (result.error) {
        console.error('Failed to send verification email:', result.error)
        return {
          success: false,
          error: result.error.message || '发送失败'
        }
      }

      // 成功发送
      console.log(`Verification email sent to ${to}, message ID: ${result.data?.id}`)
      return {
        success: true,
        messageId: result.data?.id
      }
    } catch (error: any) {
      console.error('Error sending verification email:', error)
      return {
        success: false,
        error: error.message || '发送失败'
      }
    }
  }

  /**
   * 发送通知邮件
   * @param to 收件人邮箱
   * @param title 邮件标题
   * @param content 邮件内容
   * @param appName 应用名称
   * @returns 发送结果
   */
  async sendNotification(
    to: string,
    title: string,
    content: string,
    appName: string = '云纽论坛'
  ): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: '邮件服务不可用'
      }
    }

    try {
      const html = generateNotificationEmailTemplate(title, content, appName)
      const from = `${this.fromName} <${this.fromEmail}>`

      const { data, error } = await this.resend!.emails.send({
        from,
        to,
        subject: title,
        html
      })

      if (error) {
        console.error('Failed to send notification email:', error)
        return {
          success: false,
          error: error.message || '发送失败'
        }
      }

      console.log(`Notification email sent to ${to}, message ID: ${data?.id}`)
      return {
        success: true,
        messageId: data?.id
      }
    } catch (error: any) {
      console.error('Error sending notification email:', error)
      return {
        success: false,
        error: error.message || '发送失败'
      }
    }
  }

  /**
   * 发送自定义邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param html 邮件内容（HTML 格式）
   * @param text 邮件内容（纯文本格式，可选）
   * @returns 发送结果
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: '邮件服务不可用'
      }
    }

    try {
      const from = `${this.fromName} <${this.fromEmail}>`

      const { data, error } = await this.resend!.emails.send({
        from,
        to,
        subject,
        html,
        text
      })

      if (error) {
        console.error('Failed to send email:', error)
        return {
          success: false,
          error: error.message || '发送失败'
        }
      }

      console.log(`Email sent to ${to}, message ID: ${data?.id}`)
      return {
        success: true,
        messageId: data?.id
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error.message || '发送失败'
      }
    }
  }
}