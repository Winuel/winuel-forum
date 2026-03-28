#!/bin/bash

# Winuel Backend 环境变量配置脚本
# Winuel Backend Environment Variables Setup Script

set -e

echo "🚀 开始配置 Winuel Backend 环境变量..."
echo "🚀 Starting Winuel Backend environment variables configuration..."
echo ""

# 检查是否在正确的目录
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 错误：请在 backend 目录中运行此脚本"
    echo "❌ Error: Please run this script in the backend directory"
    exit 1
fi

echo "📋 配置列表 / Configuration List:"
echo "  1. GitHub OAuth Client ID"
echo "  2. GitHub OAuth Client Secret"
echo "  3. Resend API Key"
echo "  4. JWT Secret"
echo ""

# 检查 Cloudflare API Token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  警告：未设置 CLOUDFLARE_API_TOKEN 环境变量"
    echo "⚠️  Warning: CLOUDFLARE_API_TOKEN environment variable is not set"
    echo ""
    echo "请先设置 Cloudflare API Token："
    echo "Please set Cloudflare API Token first:"
    echo ""
    echo "  export CLOUDFLARE_API_TOKEN=your_api_token_here"
    echo ""
    echo "或者使用 wrangler login 进行交互式登录："
    echo "Or use wrangler login for interactive login:"
    echo ""
    echo "  wrangler login"
    echo ""
    exit 1
fi

echo "✅ Cloudflare API Token 已设置"
echo "✅ Cloudflare API Token is set"
echo ""

# 配置 GitHub OAuth Client ID
echo "📝 配置 GitHub OAuth Client ID..."
echo "📝 Setting GitHub OAuth Client ID..."
echo "Ov23li5PPV5WgnJfyrAy" | wrangler secret put GITHUB_CLIENT_ID
echo "✅ GitHub OAuth Client ID 已设置"
echo "✅ GitHub OAuth Client ID is set"
echo ""

# 配置 GitHub OAuth Client Secret
echo "📝 配置 GitHub OAuth Client Secret..."
echo "📝 Setting GitHub OAuth Client Secret..."
echo "93c624f412a75816871b18e7fa0dd9c2c2be070a" | wrangler secret put GITHUB_CLIENT_SECRET
echo "✅ GitHub OAuth Client Secret 已设置"
echo "✅ GitHub OAuth Client Secret is set"
echo ""

# 配置 Resend API Key
echo "📝 配置 Resend API Key..."
echo "📝 Setting Resend API Key..."
echo "re_ZV61fiio_22oGjD2S63tE3UcTgC53bWXs" | wrangler secret put RESEND_API_KEY
echo "✅ Resend API Key 已设置"
echo "✅ Resend API Key is set"
echo ""

# 配置 JWT Secret
echo "📝 配置 JWT Secret..."
echo "📝 Setting JWT Secret..."
echo "IhL9sxZuzoGAEijmRq3A39+zWJUaWXkEDxvaqg2VYx8=" | wrangler secret put JWT_SECRET
echo "✅ JWT Secret 已设置"
echo "✅ JWT Secret is set"
echo ""

echo "🎉 所有环境变量配置完成！"
echo "🎉 All environment variables have been configured!"
echo ""
echo "下一步 / Next Steps:"
echo "  1. 构建项目: npm run build"
echo "  2. 部署到 Cloudflare: wrangler deploy"
echo "  3. 验证服务: curl https://api.winuel.com/health"
echo ""