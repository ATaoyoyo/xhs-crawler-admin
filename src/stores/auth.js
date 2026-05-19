import { defineStore } from 'pinia'
import { login as loginApi, getCurrentUser } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null
  }),
  actions: {
    async login(username, password) {
      const res = await loginApi({ username, password })
      this.token = res.data.token
      localStorage.setItem('token', this.token)
      return res.data
    },
    async fetchCurrentUser() {
      const res = await getCurrentUser()
      this.user = res.data
      return this.user
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
    },
    isLoggedIn() {
      return !!this.token
    }
  }
})