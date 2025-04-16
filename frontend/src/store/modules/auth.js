import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, logout, getInfo, register, updateProfile } from '@/api/user'

// 初始状态
const state = {
  token: getToken(),
  user: null,
  loading: false,
  error: null
}

// getters
const getters = {
  isLoggedIn: state => !!state.token,
  currentUser: state => state.user,
  isLoading: state => state.loading,
  authError: state => state.error
}

// mutations
const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_USER(state, user) {
    state.user = user
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  RESET_STATE(state) {
    state.token = ''
    state.user = null
    state.error = null
    removeToken()
  }
}

// actions
const actions = {
  // 用户登录
  async login({ commit }, { email, password }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      console.log('开始登录请求:', { email })
      const response = await login({ email: email.trim(), password })
      console.log('登录响应:', response)

      const { data } = response.data
      console.log('登录数据:', data)

      if (data && data.token) {
        console.log('设置token:', data.token)
        // 先保存token到localStorage
        setToken(data.token)
        // 再更新store
        commit('SET_TOKEN', data.token)

        // 获取用户信息前确认token已保存
        const savedToken = getToken()
        console.log('已保存的token:', savedToken)

        if (savedToken) {
          // 获取用户信息
          console.log('开始获取用户信息')
          try {
            const userResponse = await getInfo()
            console.log('用户信息响应:', userResponse)
            const userData = userResponse.data.data
            commit('SET_USER', userData)

            // 跳转到个人中心页面
            return {
              success: true,
              data,
              redirectTo: '/profile'
            }
          } catch (error) {
            console.error('获取用户信息失败:', error)
            // 即使获取用户信息失败，登录也算成功
            return {
              success: true,
              data,
              redirectTo: '/profile',
              infoError: error.message
            }
          }
        } else {
          throw new Error('token保存失败')
        }
      } else {
        throw new Error('登录响应中没有token')
      }
    } catch (error) {
      console.error('登录错误:', error)
      const message = error.response?.data?.message || error.message || '登录失败'
      commit('SET_ERROR', message)
      throw new Error(message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 用户注册
  async register({ commit }, userData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      console.log('注册请求数据:', userData)
      const response = await register(userData)
      console.log('注册响应:', response.data)

      // 检查响应中是否有token
      if (response.data && response.data.data && response.data.data.token) {
        const token = response.data.data.token
        setToken(token)
        commit('SET_TOKEN', token)

        // 获取用户信息
        try {
          const userResponse = await getInfo()
          console.log('获取用户信息成功:', userResponse.data)
          commit('SET_USER', userResponse.data.data)
        } catch (userError) {
          console.error('获取用户信息失败:', userError)
          // 创建基础用户信息，确保应用不会崩溃
          commit('SET_USER', {
            username: userData.username,
            email: userData.email,
            id: 'temp-id'
          })
        }

        commit('SET_LOADING', false)
        return { success: true, redirectTo: '/profile' }
      } else {
        throw new Error('注册响应中没有token')
      }
    } catch (error) {
      console.error('注册失败:', error)
      commit('SET_LOADING', false)
      commit('SET_ERROR', error.response?.data?.message || '注册失败，请稍后重试')
      throw error
    }
  },

  // 获取用户信息
  async getInfo({ commit }) {
    try {
      commit('SET_LOADING', true)
      console.log('获取用户信息')
      const response = await getInfo()
      console.log('用户信息响应:', response)
      if (response.data && response.data.data) {
        const userData = response.data.data
        commit('SET_USER', userData)
        return userData
      } else {
        throw new Error('获取用户信息失败: 响应数据格式不正确')
      }
    } catch (error) {
      console.error('获取用户信息错误:', error)
      commit('SET_ERROR', error.message || '获取用户信息失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 更新用户资料
  async updateProfile({ commit }, profileData) {
    try {
      commit('SET_LOADING', true)
      const response = await updateProfile(profileData)
      console.log('更新用户资料响应:', response)

      if (response.data && response.data.data) {
        const userData = response.data.data;
        commit('SET_USER', userData)
        return userData
      } else {
        throw new Error('更新用户资料失败: 响应数据格式不正确')
      }
    } catch (error) {
      console.error('更新用户资料错误:', error)
      commit('SET_ERROR', error.message || '更新用户资料失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 用户登出
  async logout({ commit }) {
    try {
      await logout()
      removeToken()
      commit('RESET_STATE')
    } catch (error) {
      console.error('登出失败:', error)
      // 即使请求失败，也清除本地状态
      removeToken()
      commit('RESET_STATE')
      throw error
    }
  },

  // 重置 Token
  resetToken({ commit }) {
    removeToken()
    commit('RESET_STATE')
  },

  // 初始化认证状态 - 在应用程序启动时调用
  async initAuth({ commit, dispatch }) {
    const token = getToken()

    if (token) {
      commit('SET_TOKEN', token)

      try {
        await dispatch('getInfo')
      } catch (error) {
        console.error('初始化用户信息失败:', error)
        // 如果获取用户信息失败，清除token
        dispatch('resetToken')
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}