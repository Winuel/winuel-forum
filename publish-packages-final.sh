#!/bin/bash

################################################################################
# Winuel 共享包自动发布脚本 (最终版本)
# 用于发布所有共享包到npm
################################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 包列表（按依赖顺序）
PACKAGES=(
    "shared-core"
    "shared-config"
    "shared-api"
    "shared-stores"
    "shared-ui"
    "plugin-system"
)

# 基础目录
BASE_DIR="/root/projects/cloudlink/packages"

# 发布标签
NPM_TAG=${NPM_TAG:-beta}

################################################################################
# 函数定义
################################################################################

# 打印消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 打印标题
print_header() {
    print_message "$BLUE" "=============================================="
    print_message "$BLUE" "$1"
    print_message "$BLUE" "=============================================="
}

# 检查npm登录状态
check_npm_login() {
    print_header "检查npm登录状态"
    
    if ! npm whoami &> /dev/null; then
        print_message "$RED" "❌ 未登录npm，请先运行: npm login"
        exit 1
    fi
    
    local user=$(npm whoami)
    print_message "$GREEN" "✅ npm登录用户: $user"
}

# 检查包文件
check_package_files() {
    local pkg=$1
    local pkg_dir="$BASE_DIR/$pkg"
    
    # 检查必要文件
    local required_files=("package.json" "README.md" "LICENSE")
    for file in "${required_files[@]}"; do
        if [ ! -f "$pkg_dir/$file" ]; then
            print_message "$RED" "❌ $pkg 缺少必要文件: $file"
            return 1
        fi
    done
    
    # 检查构建输出
    if [ ! -d "$pkg_dir/dist" ]; then
        print_message "$RED" "❌ $pkg 未构建，请先运行构建"
        return 1
    fi
    
    return 0
}

# 检查包是否已发布
check_published() {
    local pkg=$1
    local pkg_name="@winuel/$pkg"
    
    if npm view "$pkg_name@$NPM_TAG" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 发布单个包
publish_package() {
    local pkg=$1
    local pkg_dir="$BASE_DIR/$pkg"
    local pkg_name="@winuel/$pkg"
    
    print_header "发布 $pkg_name"
    
    # 检查包文件
    if ! check_package_files "$pkg"; then
        return 1
    fi
    
    # 检查是否已发布
    if check_published "$pkg"; then
        print_message "$YELLOW" "⚠️  $pkg_name@$NPM_TAG 已存在，将覆盖发布"
    fi
    
    # 进入包目录
    cd "$pkg_dir" || return 1
    
    # 显示包信息
    print_message "$BLUE" "📦 包信息:"
    echo "  - 名称: $pkg_name"
    echo "  - 版本: $(grep '"version"' package.json | head -1 | cut -d'"' -f4)"
    echo "  - 标签: $NPM_TAG"
    
    # Dry-run测试
    print_message "$BLUE" "🔍 进行dry-run测试..."
    if npm publish --dry-run --tag "$NPM_TAG" 2>&1; then
        print_message "$GREEN" "✅ Dry-run测试通过"
    else
        print_message "$RED" "❌ Dry-run测试失败"
        return 1
    fi
    
    # 实际发布
    print_message "$BLUE" "🚀 开始发布 $pkg_name..."
    if npm publish --tag "$NPM_TAG" 2>&1; then
        print_message "$GREEN" "✅ $pkg_name 发布成功!"
        return 0
    else
        print_message "$RED" "❌ $pkg_name 发布失败"
        return 1
    fi
}

# 验证发布
verify_publish() {
    local pkg=$1
    local pkg_name="@winuel/$pkg"
    
    print_message "$BLUE" "🔍 验证 $pkg_name 发布..."
    
    if npm view "$pkg_name@$NPM_TAG" &> /dev/null; then
        local version=$(npm view "$pkg_name@$NPM_TAG" version)
        print_message "$GREEN" "✅ $pkg_name@$NPM_TAG 发布成功 (版本: $version)"
        return 0
    else
        print_message "$RED" "❌ $pkg_name@$NPM_TAG 验证失败"
        return 1
    fi
}

################################################################################
# 主流程
################################################################################

main() {
    print_header "Winuel 共享包自动发布工具"
    print_message "$BLUE" "发布标签: $NPM_TAG"
    print_message "$BLUE" "包数量: ${#PACKAGES[@]}"
    echo ""
    
    # 检查npm登录
    check_npm_login
    echo ""
    
    # 统计信息
    local total=${#PACKAGES[@]}
    local success=0
    local failed=0
    
    # 发布所有包
    for pkg in "${PACKAGES[@]}"; do
        echo ""
        
        if publish_package "$pkg"; then
            ((success++))
            
            # 验证发布
            if ! verify_publish "$pkg"; then
                ((failed++))
            fi
        else
            ((failed++))
        fi
        
        echo ""
    done
    
    # 打印总结
    print_header "发布总结"
    print_message "$BLUE" "总数: $total"
    print_message "$GREEN" "成功: $success"
    print_message "$RED" "失败: $failed"
    
    if [ $failed -eq 0 ]; then
        print_message "$GREEN" "🎉 所有包发布完成!"
        return 0
    else
        print_message "$RED" "❌ 部分包发布失败，请检查日志"
        return 1
    fi
}

# 运行主流程
main "$@"