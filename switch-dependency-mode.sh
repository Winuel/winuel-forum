#!/bin/bash
################################################################################
# 依赖模式切换脚本
# 用于在workspace模式和npm包模式之间切换
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "$1"
    print_message "$BLUE" "=========================================="
    echo ""
}

show_help() {
    echo "用法: $0 [workspace|npm]"
    echo ""
    echo "选项:"
    echo "  workspace    使用本地workspace模式（推荐用于开发）"
    echo "  npm          使用npm包模式（用于验证发布）"
    echo ""
    echo "示例:"
    echo "  $0 workspace"
    echo "  $0 npm"
    exit 0
}

switch_to_workspace() {
    print_header "切换到Workspace模式"
    
    # 恢复pnpm-workspace.yaml
    if [ -f "pnpm-workspace.yaml.backup" ]; then
        mv pnpm-workspace.yaml.backup pnpm-workspace.yaml
        print_message "$GREEN" "✅ 已恢复 pnpm-workspace.yaml"
    else
        print_message "$YELLOW" "⚠️  未找到备份文件，跳过"
    fi
    
    # 删除.npmrc
    if [ -f ".npmrc" ]; then
        rm .npmrc
        print_message "$GREEN" "✅ 已删除 .npmrc"
    fi
    
    print_message "$BLUE" "📦 重新安装依赖..."
    pnpm install
    
    print_message "$GREEN" "✅ 已切换到Workspace模式"
    print_message "$BLUE" "💡 现在使用本地packages，修改代码立即生效"
}

switch_to_npm() {
    print_header "切换到NPM包模式"
    
    # 备份pnpm-workspace.yaml
    if [ -f "pnpm-workspace.yaml" ] && [ ! -f "pnpm-workspace.yaml.backup" ]; then
        cp pnpm-workspace.yaml pnpm-workspace.yaml.backup
        print_message "$GREEN" "✅ 已备份 pnpm-workspace.yaml"
    fi
    
    # 创建新的pnpm-workspace.yaml（只包含应用）
    cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'frontend'
  - 'backend'
  - 'official-website'
EOF
    print_message "$GREEN" "✅ 已更新 pnpm-workspace.yaml"
    
    # 创建.npmrc
    cat > .npmrc << 'EOF'
registry=https://registry.npmjs.org/
@winuel:registry=https://registry.npmjs.org/
EOF
    print_message "$GREEN" "✅ 已创建 .npmrc"
    
    print_message "$BLUE" "📦 重新安装依赖（从npm获取@winuel包）..."
    pnpm install
    
    print_message "$GREEN" "✅ 已切换到NPM包模式"
    print_message "$BLUE" "💡 现在使用npm发布的包，可以验证发布是否正确"
}

# 主逻辑
case "$1" in
    workspace)
        switch_to_workspace
        ;;
    npm)
        switch_to_npm
        ;;
    *)
        show_help
        ;;
esac