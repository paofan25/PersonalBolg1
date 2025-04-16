import axios from 'axios'

// 创建一个axios实例
const API = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token到请求头
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 身份验证错误
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // 可以在这里添加重定向到登录页面的逻辑
      }
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (userData) => API.put('/auth/profile', userData)
}

// 博客文章相关API
export const blogAPI = {
  getPosts: () => API.get('/posts'),
  getPost: (id) => API.get(`/posts/${id}`),
  createPost: (postData) => API.post('/posts', postData),
  updatePost: (id, postData) => API.put(`/posts/${id}`, postData),
  deletePost: (id) => API.delete(`/posts/${id}`),
  
  // 评论相关API
  addComment: (postId, commentData) => API.post(`/posts/${postId}/comments`, commentData),
  deleteComment: (postId, commentId) => API.delete(`/posts/${postId}/comments/${commentId}`)
}

// 类别相关API
export const categoryAPI = {
  getCategories: () => API.get('/categories'),
  getCategory: (id) => API.get(`/categories/${id}`),
  createCategory: (categoryData) => API.post('/categories', categoryData),
  updateCategory: (id, categoryData) => API.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/categories/${id}`)
}

export default API