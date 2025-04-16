import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import router from '@/router'
import { getToken } from '@/utils/auth'

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || 'http://localhost:5000/api',
  timeout: parseInt(process.env.VUE_APP_API_TIMEOUT) || 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = getToken()
    console.log('Token from localStorage:', token)

    if (token) {
      // 确保 Authorization header 格式正确
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization header set:', config.headers.Authorization)
    } else {
      console.warn('No token found in localStorage')
    }

    // 打印完整请求配置（排除敏感信息）
    const sanitizedConfig = {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? '(token exists)' : '(no token)'
      }
    }
    console.log('Request config:', sanitizedConfig)

    return config
  },
  error => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data

    // 如果响应成功但业务状态码不是 200，说明有错误
    if (res.code && res.code !== 200) {
      ElMessage({
        message: res.message || '错误',
        type: 'error',
        duration: 5 * 1000
      })

      // 处理特定错误码
      if (res.code === 401) {
        // token 过期或无效，清除用户状态并跳转到登录页
        store.dispatch('auth/resetToken')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '错误'))
    }

    return response
  },
  error => {
    console.error('响应错误:', error)
    const message = error.response?.data?.message || error.message || '请求失败'

    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })

    // 处理 401 错误
    if (error.response?.status === 401) {
      store.dispatch('auth/resetToken')
      router.push('/login')
    }

    return Promise.reject(error)
  }
)

export default service 