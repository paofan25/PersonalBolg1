import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 store 获取 token
    const token = store.state.auth.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果响应状态码不是 200，说明有错误
    if (response.status !== 200) {
      ElMessage({
        message: res.message || '错误',
        type: 'error',
        duration: 5 * 1000
      })

      // 处理特定错误码
      if (response.status === 401) {
        // token 过期或无效
        store.dispatch('auth/logout')
      }
      return Promise.reject(new Error(res.message || '错误'))
    } else {
      return res
    }
  },
  error => {
    console.error('响应错误:', error)
    ElMessage({
      message: error.message || '请求失败',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 