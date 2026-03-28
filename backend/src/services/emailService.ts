/**
 * 邮件服务
 * Email Service
 * 
 * 使用 Resend API 发送邮件，支持：
 * - 验证码邮件
 * - 通知邮件
 * - 自定义邮件
 * 
 * Uses Resend API to send emails, supports:
 * - Verification code emails
 * - Notification emails
 * - Custom emails
 * 
 * @package backend/src/services
 */

import { Resend } from 'resend'
import { generateVerificationEmailTemplate, generateNotificationEmailTemplate } from '../templates/emailTemplates'
import { logger } from '../utils/logger'

/**
 * 邮件服务类
 * Email Service Class
 * 
 * 提供邮件发送的所有业务逻辑
 * Provides all business logic for email sending
 */
export class EmailService {
  /** Resend 客户端实例 / Resend client instance */
  private resend: Resend | null = null
  /** 发件人邮箱 / Sender email */
  private fromEmail: string = 'noreply@mail.winuel.com'
  /** 发件人名称 / Sender name */
  private fromName: string = '云纽论坛'

  /**
   * 构造函数
   * Constructor
   * 
   * @param apiKey - Resend API 密钥 / Resend API key
   * @param fromEmail - 发件人邮箱 / Sender email
   * @param fromName - 发件人名称 / Sender name
   */
  constructor(apiKey: string, fromEmail: string, fromName: string = '云纽论坛') {
    if (!apiKey) {
      logger.warn('Resend API key not provided. Email service will not be available. / 未提供 Resend API 密钥。邮件服务将不可用。')
      return
    }
    this.resend = new Resend(apiKey)
    this.fromEmail = fromEmail
    this.fromName = fromName
  }

  /**
   * 检查邮件服务是否可用
   * Check if Email Service is Available
   * 
   * @returns 是否可用 / Whether available
   */
  isAvailable(): boolean {
    return this.resend !== null
  }

  /**
   * 发送验证码邮件
   * Send Verification Code Email
   * 
   * 向用户发送包含验证码的邮件
   * Sends an email containing verification code to the user
   * 
   * @param to - 收件人邮箱 / Recipient email
   * @param code - 验证码 / Verification code
   * @param appName - 应用名称 / Application name
   * @returns 发送结果 / Send result
   */
  async sendVerificationCode(to: string, code: string, appName: string = '云纽论坛'): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: '邮件服务不可用 / Email service not available'
      }
    }

    try {
      // 生成验证码邮件模板 / Generate verification code email template
      const html = generateVerificationEmailTemplate(code, appName)
      const from = `${this.fromName} <${this.fromEmail}>`

      const result = await this.resend!.emails.send({
        from,
        to,
        subject: '邮箱验证码 / Email Verification Code',
        html
      })

      // 处理 Resend API 响应 / Handle Resend API response
      if (result.error) {
        logger.error('Failed to send verification email / 发送验证码邮件失败', result.error)
        return {
          success: false,
          error: result.error.message || '发送失败 / Send failed'
        }
      }

      // 成功发送 / Successfully sent
      logger.info(`Verification email sent to ${to}, message ID: ${result.data?.id} / 验证码邮件已发送至 ${to}，消息 ID: ${result.data?.id}`)
      return {
        success: true,
        messageId: result.data?.id
      }
    } catch (error: any) {
      logger.error('Error sending verification email / 发送验证码邮件时出错', error)
      return {
        success: false,
        error: error.message || '发送失败 / Send failed'
      }
    }
  }

  /**
   * 发送通知邮件
   * Send Notification Email
   * 
   * 向用户发送通知邮件
   * Sends a notification email to the user
   * 
   * @param to - 收件人邮箱 / Recipient email
   * @param title - 邮件标题 / Email title
   * @param content - 邮件内容 / Email content
   * @param appName - 应用名称 / Application name
   * @returns 发送结果 / Send result
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
        error: '邮件服务不可用 / Email service not available'
      }
    }

    try {
      // 生成通知邮件模板 / Generate notification email template
      const html = generateNotificationEmailTemplate(title, content, appName)
      const from = `${this.fromName} <${this.fromEmail}>`

      const { data, error } = await this.resend!.emails.send({
        from,
        to,
        subject: title,
        html
      })

      if (error) {
        logger.error('Failed to send notification email / 发送通知邮件失败', error)
        return {
          success: false,
          error: error.message || '发送失败 / Send failed'
        }
      }

      logger.info(`Notification email sent to ${to}, message ID: ${data?.id} / 通知邮件已发送至 ${to}，消息 ID: ${data?.id}`)
      return {
        success: true,
        messageId: data?.id
      }
    } catch (error: any) {
      logger.error('Error sending notification email / 发送通知邮件时出错', error)
      return {
        success: false,
        error: error.message || '发送失败 / Send failed'
      }
    }
  }

  /**
   * 发送自定义邮件
   * Send Custom Email
   * 
   * 发送自定义内容的邮件
   * Sends an email with custom content
   * 
   * @param to - 收件人邮箱 / Recipient email
   * @param subject - 邮件主题 / Email subject
   * @param html - 邮件内容（HTML 格式）/ Email content (HTML format)
   * @param text - 邮件内容（纯文本格式，可选）/ Email content (plain text format, optional)
   * @returns 发送结果 / Send result
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
        error: '邮件服务不可用 / Email service not available'
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
        logger.error('Failed to send email / 发送邮件失败', error)
        return {
          success: false,
          error: error.message || '发送失败 / Send failed'
        }
      }

      logger.info(`Email sent to ${to}, message ID: ${data?.id} / 邮件已发送至 ${to}，消息 ID: ${data?.id}`)
      return {
        success: true,
        messageId: data?.id
      }
    } catch (error: any) {
      logger.error('Error sending email / 发送邮件时出错', error)
      return {
        success: false,
        error: error.message || '发送失败 / Send failed'
      }
    }
  }
}