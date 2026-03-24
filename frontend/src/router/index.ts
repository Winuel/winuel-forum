import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/post/:id',
      name: 'post-detail',
      component: () => import('../pages/PostDetailPage.vue'),
    },
    {
      path: '/post/create',
      name: 'create-post',
      component: () => import('../pages/CreatePostPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/post/:id/edit',
      name: 'edit-post',
      component: () => import('../pages/EditPostPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/category/:id',
      name: 'category',
      component: () => import('../pages/CategoryPage.vue'),
    },
    {
      path: '/user/:username',
      name: 'user-profile',
      component: () => import('../pages/UserProfilePage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../pages/TermsPage.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../pages/PrivacyPage.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../pages/ContactPage.vue'),
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/Users.vue'),
        },
        {
          path: 'posts',
          name: 'admin-posts',
          component: () => import('../views/admin/Posts.vue'),
        },
        {
          path: 'comments',
          name: 'admin-comments',
          component: () => import('../views/admin/Comments.vue'),
        },
        {
          path: 'audit-logs',
          name: 'admin-audit-logs',
          component: () => import('../views/admin/AuditLogs.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundPage.vue'),
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && userStore.user?.role !== 'admin' && userStore.user?.role !== 'moderator') {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router