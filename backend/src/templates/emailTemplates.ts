/**
 * 邮件模板
 * 用于生成 HTML 格式的邮件内容
 */

/**
 * 生成验证码邮件模板
 * @param code 验证码（6位数字）
 * @param appName 应用名称
 * @returns HTML 格式的邮件内容
 */
export function generateVerificationEmailTemplate(code: string, appName: string = '云纽论坛'): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邮箱验证码</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f7;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }
    .code-box {
      background-color: #f8f9fa;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #667eea;
      font-family: 'Courier New', monospace;
    }
    .info {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #856404;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .code {
        font-size: 28px;
        letter-spacing: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <div class="title">邮箱验证码</div>
      <p class="info">您好！</p>
      <p class="info">您正在进行注册操作，以下是您的验证码：</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      
      <p class="info">请在 <strong>5 分钟</strong> 内完成验证。</p>
      
      <div class="warning">
        ⚠️ 重要提示：<br>
        1. 验证码仅供您本人使用，请勿泄露给他人<br>
        2. 验证码有效期为 5 分钟，过期后需要重新获取<br>
        3. 如果您没有进行此操作，请忽略此邮件
      </div>
      
      <p class="info">如有任何问题，请联系我们的客服团队。</p>
    </div>
    <div class="footer">
      <p>此邮件由系统自动发送，请勿回复。</p>
      <p>&copy; 2026 ${appName}. 保留所有权利。</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * 生成通知邮件模板（预留）
 * @param title 邮件标题
 * @param content 邮件内容
 * @param appName 应用名称
 * @returns HTML 格式的邮件内容
 */
export function generateNotificationEmailTemplate(
  title: string,
  content: string,
  appName: string = '云纽论坛'
): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f7;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }
    .message {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <div class="title">${title}</div>
      <div class="message">${content}</div>
    </div>
    <div class="footer">
      <p>此邮件由系统自动发送，请勿回复。</p>
      <p>&copy; 2026 ${appName}. 保留所有权利。</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}