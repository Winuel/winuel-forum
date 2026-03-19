#!/bin/bash

# 云纽论坛生产环境端到端测试运行脚本

set -e

echo "========================================="
echo "CloudLink Forum - Production E2E Tests"
echo "========================================="
echo ""

# 进入测试目录
cd "$(dirname "$0")"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install --registry=https://registry.npmmirror.com --legacy-peer-deps
fi

# 创建截图目录
mkdir -p screenshots

echo "开始运行生产环境端到端测试..."
echo ""

# 运行测试
npm run test:run tests/production.test.ts

echo ""
echo "========================================="
echo "测试完成！"
echo "========================================="
echo ""
echo "测试结果已生成，请查看控制台输出。"
echo "截图保存在 screenshots/ 目录中。"