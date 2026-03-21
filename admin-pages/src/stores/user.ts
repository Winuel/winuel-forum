import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  createdAt: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isModerator = computed(() => user.value?.role === 'moderator' || user.value?.role === 'admin')

  function setUser(userData: User | null) {
    user.value = userData
  }

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  function loadFromStorage() {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      token.value = savedToken
    }
  }

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