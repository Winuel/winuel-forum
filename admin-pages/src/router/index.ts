import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/Users.vue'),
        },
        {
          path: 'posts',
          name: 'posts',
          component: () => import('../views/Posts.vue'),
        },
        {
          path: 'comments',
          name: 'comments',
          component: () => import('../views/Comments.vue'),
        },
        {
          path: 'audit-logs',
          name: 'audit-logs',
          component: () => import('../views/AuditLogs.vue'),
        },
        {
          path: 'plugins',
          name: 'plugins',
          component: () => import('../views/Plugins.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresAdmin && userStore.user?.role !== 'admin' && userStore.user?.role !== 'moderator') {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router