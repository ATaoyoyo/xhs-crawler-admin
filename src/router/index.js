import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue')
      },
      {
        path: 'posts',
        name: 'Posts',
        component: () => import('@/views/posts/PostListView.vue')
      },
      {
        path: 'posts/:id',
        name: 'PostDetail',
        component: () => import('@/views/posts/PostDetailView.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserListView.vue')
      },
      {
        path: 'admin-accounts',
        name: 'AdminAccounts',
        component: () => import('@/views/users/AdminAccountView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn()) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn()) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router