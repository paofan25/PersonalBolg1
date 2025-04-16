import axios from 'axios'
import { getToken } from '@/utils/auth'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

// 创建 axios 实例
const authApi = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
authApi.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
authApi.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          store.dispatch('auth/logout')
          router.push('/login')
          break
        case 403:
          // 权限不足
          Message.error('权限不足')
          break
        case 404:
          Message.error('请求的资源不存在')
          break
        case 500:
          Message.error('服务器错误')
          break
        default:
          Message.error(error.response.data.message || '请求失败')
      }
    } else {
      Message.error('网络错误，请检查您的网络连接')
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email, password) {
    return await authApi.post('/auth/login', { email, password })
  },

  async register(username, email, password) {
    return await authApi.post('/auth/register', { username, email, password })
  },

  async logout() {
    return await authApi.post('/auth/logout')
  },

  async getProfile() {
    return await authApi.get('/auth/profile')
  },

  async updateProfile(profileData) {
    return await authApi.put('/auth/profile', profileData)
  },

  async changePassword(oldPassword, newPassword) {
    return await authApi.put('/auth/password', { oldPassword, newPassword })
  },

  async resetPassword(email) {
    return await authApi.post('/auth/reset-password', { email })
  },

  async verifyEmail(token) {
    return await authApi.post('/auth/verify-email', { token })
  }
}

export default authService 