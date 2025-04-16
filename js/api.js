/**
 * API客户端
 * 用于与后端服务器通信
 */

// API基础URL
const API_URL = 'http://localhost:5000/api';

// 存储令牌的键
const TOKEN_KEY = 'blog_auth_token';

/**
 * 获取存储的令牌
 */
const getToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * 设置令牌
 */
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * 创建带有授权头的请求选项
 */
const createAuthHeader = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * 发送API请求
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  // 默认选项
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...createAuthHeader(),
      ...options.headers
    }
  };

  // 合并选项
  const fetchOptions = {
    ...defaultOptions,
    ...options
  };

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

/**
 * 认证API
 */
const authAPI = {
  /**
   * 用户注册
   */
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.token) {
      setToken(response.token);
    }

    return response;
  },

  /**
   * 用户登录
   */
  login: async (username, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (response.token) {
      setToken(response.token);
    }

    return response;
  },

  /**
   * 获取当前用户
   */
  getCurrentUser: async () => {
    if (!getToken()) {
      throw new Error('未登录');
    }

    return await apiRequest('/auth/me');
  },

  /**
   * 更新用户资料
   */
  updateProfile: async (profileData) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  /**
   * 更改密码
   */
  updatePassword: async (passwordData) => {
    const response = await apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });

    if (response.token) {
      setToken(response.token);
    }

    return response;
  },

  /**
   * 注销
   */
  logout: () => {
    setToken(null);
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn: () => {
    return !!getToken();
  }
};

/**
 * 博客API
 */
const blogAPI = {
  /**
   * 获取所有文章
   */
  getPosts: async (page = 1, limit = 10) => {
    return await apiRequest(`/posts?page=${page}&limit=${limit}`);
  },

  /**
   * 获取单篇文章
   */
  getPost: async (id) => {
    return await apiRequest(`/posts/${id}`);
  },

  /**
   * 创建文章
   */
  createPost: async (postData) => {
    return await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },

  /**
   * 更新文章
   */
  updatePost: async (id, postData) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    });
  },

  /**
   * 删除文章
   */
  deletePost: async (id) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * 点赞/取消点赞文章
   */
  likePost: async (id) => {
    return await apiRequest(`/posts/${id}/like`, {
      method: 'PUT'
    });
  },

  /**
   * 添加评论
   */
  addComment: async (postId, content) => {
    return await apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }
};

// 导出API
export const api = {
  auth: authAPI,
  blog: blogAPI
};