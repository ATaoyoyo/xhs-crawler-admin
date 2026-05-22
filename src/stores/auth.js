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
      const hashPassword = async (pwd) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(pwd)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      }

      const hashedPassword = await hashPassword(password)
      const res = await loginApi({ username, password: hashedPassword })
      this.token = res.data.accessToken.replace('Bearer ', '')
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