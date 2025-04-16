import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

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
  CLEAR_AUTH(state) {
    state.token = null
    state.user = null
    state.error = null
    removeToken()
  }
}

// actions
const actions = {
  // 用户登录
  async login({ commit, dispatch }, userInfo) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const { data } = await login(userInfo)
      
      commit('SET_TOKEN', data.token)
      setToken(data.token)
      
      // 获取用户信息
      await dispatch('getInfo')
      
      return data
    } catch (error) {
      commit('SET_ERROR', error.message || '登录失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取用户信息
  async getInfo({ commit, state }) {
    try {
      const { data } = await getInfo(state.token)
      commit('SET_USER', data)
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 用户登出
  async logout({ commit }) {
    try {
      await logout()
      commit('CLEAR_AUTH')
    } catch (error) {
      console.error('登出失败:', error)
      // 即使请求失败，也清除本地状态
      commit('CLEAR_AUTH')
      throw error
    }
  },

  // 清除认证状态
  resetToken({ commit }) {
    commit('CLEAR_AUTH')
  },
  
  async register({ commit }, { username, email, password }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const { token, user } = await authApi.register(username, email, password)
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async fetchUserProfile({ commit }) {
    try {
      commit('SET_LOADING', true)
      const user = await authApi.getProfile()
      commit('SET_USER', user)
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateProfile({ commit }, profileData) {
    try {
      commit('SET_LOADING', true)
      const updatedUser = await authApi.updateProfile(profileData)
      commit('SET_USER', updatedUser)
      return updatedUser
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
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