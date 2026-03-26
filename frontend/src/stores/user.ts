/**
 * 用户状态管理 Store
 * User State Management Store
 * 
 * 管理用户认证和权限相关的状态
 * Manages user authentication and permission-related states
 * 
 * @package frontend/src/stores
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 用户接口
 * User Interface
 * 
 * 定义用户数据的结构
 * Defines the structure of user data
 */
export interface User {
  /** 用户 ID / User ID */
  id: string
  /** 用户名 / Username */
  username: string
  /** 邮箱 / Email */
  email: string
  /** 头像 URL（可选）/ Avatar URL (optional) */
  avatar?: string
  /** 用户角色 / User role */
  role: 'user' | 'admin' | 'moderator'
  /** 创建时间 / Creation time */
  createdAt: string
}

/**
 * 用户 Store
 * User Store
 * 
 * 使用 Pinia 管理用户认证状态
 * Uses Pinia to manage user authentication state
 */
export const useUserStore = defineStore('user', () => {
  // 当前用户信息 / Current user information
  const user = ref<User | null>(null)
  // 认证令牌 / Authentication token
  const token = ref<string | null>(null)

  /**
   * 计算属性：是否已认证
   * Computed Property: Whether authenticated
   */
  const isAuthenticated = computed(() => !!token.value)

  /**
   * 计算属性：是否为管理员
   * Computed Property: Whether is admin
   */
  const isAdmin = computed(() => user.value?.role === 'admin')

  /**
   * 计算属性：是否为管理员或审核员
   * Computed Property: Whether is admin or moderator
   */
  const isModerator = computed(() => user.value?.role === 'moderator' || user.value?.role === 'admin')

  /**
   * 设置用户信息
   * Set User Information
   * 
   * @param userData - 用户数据 / User data
   */
  function setUser(userData: User | null) {
    user.value = userData
  }

  /**
   * 设置认证令牌
   * Set Authentication Token
   * 
   * @param newToken - 新的令牌 / New token
   */
  function setToken(newToken: string | null) {
    token.value = newToken
    // 将令牌保存到 localStorage / Save token to localStorage
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  /**
   * 用户登出
   * User Logout
   * 
   * 清除用户信息和令牌
   * Clears user information and token
   */
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  /**
   * 从本地存储加载令牌
   * Load Token from Local Storage
   * 
   * 从 localStorage 恢复认证令牌
   * Restores authentication token from localStorage
   */
  function loadFromStorage() {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  // 初始化时从本地存储加载令牌 / Load token from local storage on initialization
  loadFromStorage()

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isModerator,
    setUser,
    setToken,
    logout,
    loadFromStorage,
  }
})