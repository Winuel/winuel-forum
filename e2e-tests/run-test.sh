#!/bin/bash

echo "开始运行生产环境端到端测试..."
echo "========================================"

cd /root/projects/cloudlink/e2e-tests

# 运行测试
node --experimental-vm-modules node_modules/vitest/vitest.mjs run tests/production.test.ts --reporter=verbose

echo ""
echo "========================================"
echo "测试执行完成"